package flowmanager.nomenclator.service;

import flowmanager.nomenclator.dto.*;
import flowmanager.nomenclator.exception.NotFoundException;
import flowmanager.nomenclator.mapper.OrganizationMapper;
import flowmanager.nomenclator.mapper.TeamMapper;
import flowmanager.nomenclator.model.Organization;
import flowmanager.nomenclator.model.User;
import flowmanager.nomenclator.repository.OrganizationRepository;
import flowmanager.nomenclator.repository.TeamRepository;
import flowmanager.nomenclator.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OrganizationService {
    private final OrganizationRepository organizationRepository;
    private final TeamRepository teamRepository;
    private final UserRepository userRepository;
    private final OrganizationMapper organizationMapper;
    private final TeamMapper teamMapper;

    public List<OrganizationSummaryDto> findAllOrganizations() {
        return organizationRepository.findAll()
                .stream()
                .map(organizationMapper::toSummaryDto)
                .toList();
    }

    public List<TeamSummaryOrganizationDto> findAllTeamsByOrganizationId(Integer organizationId) {
        Organization organization = organizationRepository.findById(organizationId).orElseThrow(
                () -> new NotFoundException(String.format("Organization with id %d not found", organizationId))
        );

        return organization.getTeams()
                .stream()
                .map(teamMapper::toSummaryOrganizationDto)
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

    @Transactional
    public void deleteOrganization(Integer organizationId) {
        teamRepository.deleteByOrganizationId(organizationId);
        organizationRepository.deleteById(organizationId);
    }
}