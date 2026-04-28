package flowmanager.nomenclator.service;

import flowmanager.nomenclator.dto.OrganizationCreateDto;
import flowmanager.nomenclator.dto.OrganizationResponseDto;
import flowmanager.nomenclator.dto.OrganizationSummaryDto;
import flowmanager.nomenclator.dto.OrganizationUpdateDto;
import flowmanager.nomenclator.exception.NotFoundException;
import flowmanager.nomenclator.mapper.OrganizationMapper;
import flowmanager.nomenclator.model.Organization;
import flowmanager.nomenclator.model.User;
import flowmanager.nomenclator.repository.OrganizationRepository;
import flowmanager.nomenclator.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OrganizationService {
    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;
    private final OrganizationMapper organizationMapper;

    public List<OrganizationSummaryDto> findAllOrganizations() {
        return organizationRepository.findAll()
                .stream()
                .map(organizationMapper::toSummaryDto)
                .toList();
    }

    public OrganizationResponseDto findOrganizationById(Integer organizationId) {
        return organizationMapper.toResponseDto(
                organizationRepository.findById(organizationId).orElseThrow(
                        () -> new NotFoundException(String.format("Organization with id %d not found", organizationId))
                )
        );
    }

    public OrganizationResponseDto createOrganization(OrganizationCreateDto organizationCreateDto) {
        User manager = userRepository.findById(organizationCreateDto.getManagerId()).orElseThrow(
                () -> new NotFoundException(String.format("User with id %d not found", organizationCreateDto.getManagerId()))
        );
        Organization organization = organizationMapper.toEntity(organizationCreateDto, manager);

        return organizationMapper.toResponseDto(organizationRepository.save(organization));
    }

    public OrganizationResponseDto updateOrganization(Integer organizationId, OrganizationUpdateDto organizationUpdateDto) {
        Organization organization = organizationRepository.findById(organizationId).orElseThrow(
                () -> new NotFoundException(String.format("Organization with id %d not found", organizationId))
        );

        User manager = organization.getManager();
        if (organizationUpdateDto.getManagerId() != null) {
            manager = userRepository.findById(organizationUpdateDto.getManagerId()).orElseThrow(
                    () -> new NotFoundException(String.format("User with id %d not found", organizationUpdateDto.getManagerId()))
            );
        }

        organizationMapper.updateEntityFromDto(organizationUpdateDto, manager, organization);
        return organizationMapper.toResponseDto(organizationRepository.save(organization));
    }

    public void deleteOrganization(Integer organizationId) {
        organizationRepository.findById(organizationId).orElseThrow(
                () -> new NotFoundException(String.format("Organization with id %d not found", organizationId))
        );
        organizationRepository.deleteById(organizationId);
    }
}