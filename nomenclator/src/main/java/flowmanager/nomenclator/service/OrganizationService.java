package flowmanager.nomenclator.service;

import flowmanager.nomenclator.dto.*;
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

    public OrganizationResponseDto createOrganization(OrganizationCreateDto dto) {
        Organization organization = organizationMapper.toEntity(dto);
        return organizationMapper.toResponseDto(organizationRepository.save(organization));
    }

    public OrganizationResponseDto updateOrganization(Integer organizationId, OrganizationUpdateDto dto) {
        Organization organization = organizationRepository.findById(organizationId).orElseThrow(
                () -> new NotFoundException(String.format("Organization with id %d not found", organizationId))
        );

        User manager = organization.getManager();
        if (dto.getManagerId() != null) {
            manager = userRepository.findById(dto.getManagerId()).orElseThrow(
                    () -> new NotFoundException(String.format("User with id %d not found", dto.getManagerId()))
            );
        }

        organizationMapper.updateEntityFromDto(dto, manager, organization);
        return organizationMapper.toResponseDto(organizationRepository.save(organization));
    }

    public void deleteOrganization(Integer organizationId) {
        organizationRepository.findById(organizationId).orElseThrow(
                () -> new NotFoundException(String.format("Organization with id %d not found", organizationId))
        );
        organizationRepository.deleteById(organizationId);
    }
}