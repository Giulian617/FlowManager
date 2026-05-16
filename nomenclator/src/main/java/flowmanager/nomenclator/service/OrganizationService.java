package flowmanager.nomenclator.service;

import flowmanager.nomenclator.dto.*;
import flowmanager.nomenclator.exception.NotFoundException;
import flowmanager.nomenclator.mapper.*;
import flowmanager.nomenclator.model.Organization;
import flowmanager.nomenclator.model.User;
import flowmanager.nomenclator.repository.OrganizationRepository;
import flowmanager.nomenclator.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OrganizationService {
    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;
    private final OrganizationMapper organizationMapper;
    private final TeamMapper teamMapper;
    private final UserMapper userMapper;
    private final ProjectMapper projectMapper;
    private final WorkItemMapper workItemMapper;
    private final TeamService teamService;

    private Organization getOrganization(Integer organizationId) {
        return organizationRepository.findById(organizationId).orElseThrow(
                () -> new NotFoundException(String.format("Organization with id %d not found", organizationId))
        );
    }

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

    public List<UserSummaryDto> findAllUsersByOrganizationId(Integer organizationId) {
        Organization organization = organizationRepository.findById(organizationId).orElseThrow(
                () -> new NotFoundException(String.format("Organization with id %d not found", organizationId))
        );

        return organization.getTeams()
                .stream()
                .flatMap(team -> team.getMembers().stream())
                .distinct()
                .map(userMapper::toSummaryDto)
                .toList();
    }

    public List<ProjectSummaryDto> findAllProjectsByOrganizationId(Integer organizationId) {
        Organization organization = organizationRepository.findById(organizationId).orElseThrow(
                () -> new NotFoundException(String.format("Organization with id %d not found", organizationId))
        );

        return organization.getTeams().stream()
                .flatMap(team -> team.getProjects().stream())
                .distinct()
                .map(projectMapper::toSummaryDto)
                .toList();
    }

    public List<WorkItemSummaryDto> findAllWorkItemsByOrganizationId(Integer organizationId) {
        Organization organization = organizationRepository.findById(organizationId).orElseThrow(
                () -> new NotFoundException(String.format("Organization with id %d not found", organizationId))
        );

        return organization.getTeams().stream()
                .flatMap(team -> team.getProjects().stream())
                .flatMap(project -> project.getWorkItems().stream())
                .distinct()
                .map(workItemMapper::toSummaryDto)
                .toList();
    }

    public OrganizationResponseDto findOrganizationById(Integer organizationId) {
        return organizationMapper.toResponseDto(getOrganization(organizationId));
    }

    public OrganizationResponseDto createOrganization(OrganizationCreateDto organizationCreateDto) {
        User manager = userRepository.findById(organizationCreateDto.getManagerId()).orElseThrow(
                () -> new NotFoundException(String.format("User with id %d not found", organizationCreateDto.getManagerId()))
        );
        Organization organization = organizationMapper.toEntity(organizationCreateDto, manager);

        return organizationMapper.toResponseDto(organizationRepository.save(organization));
    }

    public OrganizationResponseDto updateOrganization(Integer organizationId, OrganizationUpdateDto organizationUpdateDto) {
        Organization organization = getOrganization(organizationId);

        User manager = organization.getManager();
        if (organizationUpdateDto.getManagerId() != null) {
            manager = userRepository.findById(organizationUpdateDto.getManagerId()).orElseThrow(
                    () -> new NotFoundException(String.format("User with id %d not found", organizationUpdateDto.getManagerId()))
            );
        }

        organizationMapper.updateEntityFromDto(organizationUpdateDto, organization, manager);
        return organizationMapper.toResponseDto(organizationRepository.save(organization));
    }

    @Transactional
    public void deleteOrganization(Integer organizationId) {
        Organization organization = organizationRepository.findById(organizationId).orElse(null);
        if(organization == null) {
            return;
        }

        organization.getTeams()
                .forEach(team -> teamService.deleteTeam(team.getId()));
        organizationRepository.deleteById(organizationId);
    }
}