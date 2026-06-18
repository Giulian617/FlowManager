package flowmanager.nomenclator.service;

import flowmanager.nomenclator.dto.*;
import flowmanager.nomenclator.exception.NotFoundException;
import flowmanager.nomenclator.mapper.ProjectMapper;
import flowmanager.nomenclator.mapper.TeamMapper;
import flowmanager.nomenclator.mapper.UserMapper;
import flowmanager.nomenclator.mapper.WorkItemMapper;
import flowmanager.nomenclator.model.ItemType;
import flowmanager.nomenclator.model.Organization;
import flowmanager.nomenclator.model.Project;
import flowmanager.nomenclator.model.Severity;
import flowmanager.nomenclator.model.Status;
import flowmanager.nomenclator.model.Team;
import flowmanager.nomenclator.model.User;
import flowmanager.nomenclator.repository.OrganizationRepository;
import flowmanager.nomenclator.repository.ProjectRepository;
import flowmanager.nomenclator.repository.TeamRepository;
import flowmanager.nomenclator.repository.UserRepository;
import flowmanager.nomenclator.repository.spec.ProjectSpecifications;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class ProjectService {
    private final ProjectRepository projectRepository;
    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;
    private final TeamRepository teamRepository;
    private final ProjectMapper projectMapper;
    private final WorkItemMapper workItemMapper;
    private final TeamMapper teamMapper;
    private final UserMapper userMapper;
    private final WorkItemService workItemService;
    private final TeamService teamService;

    private Project getProject(Integer projectId) {
        return projectRepository.findById(projectId).orElseThrow(
                () -> new NotFoundException(String.format("Project with id %d not found", projectId))
        );
    }

    public PageResponseDto<ProjectResponseDto> findAllProjects(String search, Integer managerId, String deadline, Pageable pageable) {
        return findProjects(null, search, managerId, deadline, pageable);
    }

    public PageResponseDto<ProjectResponseDto> findProjectsByOrganization(
            Integer organizationId, String keycloakId, String search, Integer managerId, String deadline, Pageable pageable) {
        User user = userRepository.findByKeycloakId(keycloakId).orElseThrow(
                () -> new NotFoundException("User not found")
        );
        Specification<Project> scope = Specification.allOf(
                Stream.of(
                        ProjectSpecifications.organizationIdEquals(organizationId),
                        ProjectSpecifications.visibleTo(user.getRole(), user.getId())
                ).filter(Objects::nonNull).toList()
        );
        return findProjects(scope, search, managerId, deadline, pageable);
    }

    private PageResponseDto<ProjectResponseDto> findProjects(
            Specification<Project> scope, String search, Integer managerId, String deadline, Pageable pageable) {
        Specification<Project> spec = Specification.allOf(
                Stream.of(
                        scope,
                        ProjectSpecifications.search(search),
                        ProjectSpecifications.managerIdEquals(managerId),
                        ProjectSpecifications.deadline(deadline)
                ).filter(Objects::nonNull).toList()
        );
        return PageResponseDto.from(projectRepository.findAll(spec, pageable), projectMapper::toResponseDto);
    }

    public PageResponseDto<WorkItemSummaryDto> findWorkItemsByProject(
            Integer projectId, String search, List<ItemType> itemTypes, List<Status> statuses,
            List<Severity> severities, List<Integer> reporterIds, List<Integer> assigneeIds,
            Boolean unassigned, Pageable pageable) {
        return workItemService.findAllWorkItems(
                search, itemTypes, statuses, severities, reporterIds, assigneeIds, unassigned, projectId, pageable);
    }

    public PageResponseDto<TeamSummaryOrganizationDto> findTeamsByProject(
            Integer projectId, String search, Integer managerId, String size, Pageable pageable) {
        return teamService.findTeamsByProject(projectId, search, managerId, size, pageable);
    }

    public List<UserSummaryDto> findAllMembersByProjectId(Integer projectId) {
        return getProject(projectId)
                .getTeams()
                .stream()
                .flatMap(team -> Stream.concat(
                        team.getMembers().stream(),
                        Stream.of(team.getManager())
                ))
                .distinct()
                .map(userMapper::toSummaryDto)
                .toList();
    }

    public ProjectSummaryDto findProjectById(Integer projectId) {
        return projectMapper.toSummaryDto(getProject(projectId));
    }

    @Transactional
    protected List<Team> getTeams(List<Integer> teamsIds) {
        List<Team> teams = teamRepository.findAllById(teamsIds);
        if(teams.size() != teamsIds.size()) {
            throw new NotFoundException("One or more teams were not found");
        }
        return teams;
    }

    @Transactional
    public ProjectResponseDto createProject(ProjectCreateDto projectCreateDto, String keycloakId) {
        Organization organization = organizationRepository.findById(projectCreateDto.getOrganizationId()).orElseThrow(
                () -> new NotFoundException(String.format("Organization with id %d not found", projectCreateDto.getOrganizationId()))
        );
        User user = userRepository.findByKeycloakId(keycloakId).orElseThrow(
                () -> new NotFoundException("User not found")
        );
        Project project = projectMapper.toEntity(projectCreateDto, organization, user);
        Project savedProject = projectRepository.save(project);

        if (projectCreateDto.getTeamsIds() != null && !projectCreateDto.getTeamsIds().isEmpty()) {
            List<Team> teams = getTeams(projectCreateDto.getTeamsIds());
            teams.forEach(team -> {
                if (!team.getProjects().contains(savedProject)) {
                    team.getProjects().add(savedProject);
                }
                teamRepository.save(team);
            });
            savedProject.setTeams(teams);
        }

        return projectMapper.toResponseDto(savedProject);
    }

    @Transactional
    public ProjectResponseDto updateProject(Integer projectId, ProjectUpdateDto projectUpdateDto) {
        Project project = getProject(projectId);

        User manager = project.getManager();
        if(projectUpdateDto.getManagerId() != null) {
            manager = userRepository.findById(projectUpdateDto.getManagerId()).orElseThrow(
                    () -> new NotFoundException(String.format("Manager with id %d not found", projectUpdateDto.getManagerId()))
            );
        }

        if(projectUpdateDto.getTeamsIds() != null) {
            List<Team> previousTeams = project.getTeams();
            List<Team> newTeams = getTeams(projectUpdateDto.getTeamsIds());

            previousTeams.forEach(team -> {
                if (!newTeams.contains(team)) {
                    team.getProjects().remove(project);
                }
                teamRepository.save(team);
            });

            newTeams.forEach(team -> {
                if (!team.getProjects().contains(project)) {
                    team.getProjects().add(project);
                }
                teamRepository.save(team);
            });
            project.setTeams(newTeams);
        }

        projectMapper.updateEntityFromDto(projectUpdateDto, project, manager);
        return projectMapper.toResponseDto(projectRepository.save(project));
    }

    @Transactional
    public void deleteProject(Integer projectId) {
        Project project = projectRepository.findById(projectId).orElse(null);
        if(project == null) {
            return;
        }

        project.getWorkItems()
                .forEach(workItem -> workItemService.deleteWorkItem(workItem.getId()));
        projectRepository.deleteById(projectId);
    }
}