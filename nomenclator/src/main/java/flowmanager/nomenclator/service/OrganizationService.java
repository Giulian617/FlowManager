package flowmanager.nomenclator.service;

import flowmanager.nomenclator.dto.*;
import flowmanager.nomenclator.exception.NotFoundException;
import flowmanager.nomenclator.mapper.*;
import flowmanager.nomenclator.model.Organization;
import flowmanager.nomenclator.model.Role;
import flowmanager.nomenclator.model.User;
import flowmanager.nomenclator.repository.OrganizationRepository;
import flowmanager.nomenclator.repository.UserRepository;
import flowmanager.nomenclator.repository.spec.OrganizationSpecifications;
import flowmanager.nomenclator.repository.spec.UserSpecifications;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.stream.Stream;

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
    private final ProjectService projectService;

    private Organization getOrganization(Integer organizationId) {
        return organizationRepository.findById(organizationId).orElseThrow(
                () -> new NotFoundException(String.format("Organization with id %d not found", organizationId))
        );
    }

    private static final List<String> COUNT_SORTS = List.of("members", "projects", "teams");

    public PageResponseDto<OrganizationResponseDto> findAllOrganizations(
            String search, String industry, Integer managerId, Pageable pageable) {
        List<Specification<Organization>> specs = new ArrayList<>(Stream.of(
                OrganizationSpecifications.search(search),
                OrganizationSpecifications.industryEquals(industry),
                OrganizationSpecifications.managerIdEquals(managerId)
        ).filter(Objects::nonNull).toList());

        Pageable effective = pageable;
        for (String countField : COUNT_SORTS) {
            Sort.Order order = pageable.getSort().getOrderFor(countField);
            if (order != null) {
                specs.add(OrganizationSpecifications.orderBySize(countField, order.getDirection()));
                effective = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize());
                break;
            }
        }

        return PageResponseDto.from(
                organizationRepository.findAll(Specification.allOf(specs), effective),
                organizationMapper::toResponseDto);
    }

    public PageResponseDto<TeamSummaryOrganizationDto> findAllTeamsByOrganizationId(
            Integer organizationId, String keycloakId, String search, Integer managerId, String teamSize, Pageable pageable) {
        return teamService.findTeamsByOrganization(organizationId, keycloakId, search, managerId, teamSize, pageable);
    }

    public PageResponseDto<UserResponseDto> findAllUsersByOrganizationId(
            Integer organizationId, String search, Role role, Boolean active, Pageable pageable) {
        Specification<User> spec = Specification.allOf(
                Stream.of(
                        UserSpecifications.memberOfOrganization(organizationId),
                        UserSpecifications.search(search),
                        UserSpecifications.roleEquals(role),
                        UserSpecifications.activeEquals(active)
                ).filter(Objects::nonNull).toList()
        );
        return PageResponseDto.from(userRepository.findAll(spec, pageable), userMapper::toResponseDto);
    }

    public PageResponseDto<ProjectResponseDto> findAllProjectsByOrganizationId(
            Integer organizationId, String keycloakId, String search, Integer managerId, String deadline, Pageable pageable) {
        return projectService.findProjectsByOrganization(organizationId, keycloakId, search, managerId, deadline, pageable);
    }

    public List<WorkItemSummaryDto> findAllWorkItemsByOrganizationId(Integer organizationId) {
        return getOrganization(organizationId)
                .getProjects()
                .stream()
                .flatMap(project -> project.getWorkItems().stream())
                .distinct()
                .map(workItemMapper::toSummaryDto)
                .toList();
    }

    public OrganizationResponseDto findOrganizationById(Integer organizationId) {
        return organizationMapper.toResponseDto(getOrganization(organizationId));
    }

    @Transactional
    protected List<User> getMembers(List<Integer> membersIds) {
        List<User> users = userRepository.findAllById(membersIds);
        if(users.size() != membersIds.size()) {
            throw new NotFoundException("One or more users were not found");
        }
        return users;
    }

    @Transactional
    public OrganizationResponseDto createOrganization(OrganizationCreateDto organizationCreateDto) {
        User manager = userRepository.findById(organizationCreateDto.getManagerId()).orElseThrow(
                () -> new NotFoundException(String.format("User with id %d not found", organizationCreateDto.getManagerId()))
        );
        Organization organization = organizationMapper.toEntity(organizationCreateDto, manager);

        List<User> members = new ArrayList<>();
        members.add(manager);
        if (organizationCreateDto.getMembersIds() != null && !organizationCreateDto.getMembersIds().isEmpty()) {
            getMembers(organizationCreateDto.getMembersIds()).forEach(user -> {
                if (!members.contains(user)) {
                    members.add(user);
                }
            });
        }
        members.forEach(user -> {
            if (!user.getMemberOrganizations().contains(organization)) {
                user.getMemberOrganizations().add(organization);
            }
        });
        organization.setMembers(members);

        return organizationMapper.toResponseDto(organizationRepository.save(organization));
    }

    @Transactional
    public OrganizationResponseDto updateOrganization(Integer organizationId, OrganizationUpdateDto organizationUpdateDto) {
        Organization organization = getOrganization(organizationId);

        User manager = organization.getManager();
        if (organizationUpdateDto.getManagerId() != null) {
            manager = userRepository.findById(organizationUpdateDto.getManagerId()).orElseThrow(
                    () -> new NotFoundException(String.format("User with id %d not found", organizationUpdateDto.getManagerId()))
            );
        }

        if (organizationUpdateDto.getMembersIds() != null) {
            List<User> previousMembers = organization.getMembers();
            List<User> newMembers = getMembers(organizationUpdateDto.getMembersIds());

            previousMembers.forEach(user -> {
                if (!newMembers.contains(user)) {
                    user.getMemberOrganizations().remove(organization);
                }
            });

            newMembers.forEach(user -> {
                if (!user.getMemberOrganizations().contains(organization)) {
                    user.getMemberOrganizations().add(organization);
                }
            });

            organization.setMembers(newMembers);
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

        organization.getMembers()
                .forEach(user -> user.getMemberOrganizations().remove(organization));
        organization.getTeams()
                .forEach(team -> teamService.deleteTeam(team.getId()));
        organization.getProjects()
                .forEach(project -> projectService.deleteProject(project.getId()));
        organizationRepository.deleteById(organizationId);
    }
}