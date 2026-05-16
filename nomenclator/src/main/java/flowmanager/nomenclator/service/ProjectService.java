package flowmanager.nomenclator.service;

import flowmanager.nomenclator.dto.*;
import flowmanager.nomenclator.exception.NotFoundException;
import flowmanager.nomenclator.mapper.ProjectMapper;
import flowmanager.nomenclator.mapper.WorkItemMapper;
import flowmanager.nomenclator.model.Project;
import flowmanager.nomenclator.model.Team;
import flowmanager.nomenclator.model.User;
import flowmanager.nomenclator.repository.ProjectRepository;
import flowmanager.nomenclator.repository.TeamRepository;
import flowmanager.nomenclator.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProjectService {
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final TeamRepository teamRepository;
    private final ProjectMapper projectMapper;
    private final WorkItemMapper workItemMapper;
    private final WorkItemService workItemService;

    private Project getProject(Integer projectId) {
        return projectRepository.findById(projectId).orElseThrow(
                () -> new NotFoundException(String.format("Project with id %d not found", projectId))
        );
    }

    public List<ProjectSummaryDto> findAllProjects() {
        return projectRepository
                .findAll()
                .stream()
                .map(projectMapper::toSummaryDto)
                .toList();
    }

    public List<WorkItemSummaryDto> findAllWorkItemsByProjectId(Integer projectId) {
        Project project = getProject(projectId);

        return project.getWorkItems().stream()
                .map(workItemMapper::toSummaryDto)
                .toList();
    }

    public ProjectResponseDto findProjectById(Integer projectId) {
        return projectMapper.toResponseDto(getProject(projectId));
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
        User user = userRepository.findByKeycloakId(keycloakId).orElseThrow(
                () -> new NotFoundException("User not found")
        );
        Project project = projectMapper.toEntity(projectCreateDto, user);

        if (projectCreateDto.getTeamsIds() != null && !projectCreateDto.getTeamsIds().isEmpty()) {
            List<Team> teams = getTeams(projectCreateDto.getTeamsIds());
            project.setTeams(teams);
        }

        return projectMapper.toResponseDto(projectRepository.save(project));
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

        if(projectUpdateDto.getTeamsIds() != null && !projectUpdateDto.getTeamsIds().isEmpty()) {
            List<Team> previousTeams = project.getTeams();
            List<Team> newTeams = getTeams(projectUpdateDto.getTeamsIds());

            previousTeams.forEach(team -> {
                if (!newTeams.contains(team)) {
                    team.getProjects().remove(project);
                }
            });

            newTeams.forEach(team -> {
                if (!team.getProjects().contains(project)) {
                    team.getProjects().add(project);
                }
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