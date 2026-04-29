package flowmanager.nomenclator.service;

import flowmanager.nomenclator.dto.*;
import flowmanager.nomenclator.exception.NotFoundException;
import flowmanager.nomenclator.mapper.ProjectMapper;
import flowmanager.nomenclator.model.Project;
import flowmanager.nomenclator.model.Team;
import flowmanager.nomenclator.model.User;
import flowmanager.nomenclator.repository.ProjectRepository;
import flowmanager.nomenclator.repository.TeamRepository;
import flowmanager.nomenclator.repository.UserRepository;
import flowmanager.nomenclator.repository.WorkItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProjectService {
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final WorkItemRepository workItemRepository;
    private final TeamRepository teamRepository;
    private final ProjectMapper projectMapper;

    public List<ProjectSummaryDto> findAllProjects() {
        return projectRepository
                .findAll()
                .stream()
                .map(projectMapper::toSummaryDto)
                .toList();
    }

    public ProjectResponseDto findProjectById(Integer projectId) {
        return projectMapper.toResponseDto(projectRepository.findById(projectId).orElseThrow(
                () -> new NotFoundException(String.format("Project with id %d not found", projectId))
        ));
    }

    public ProjectResponseDto createProject(ProjectCreateDto projectCreateDto) {
        Project project = projectMapper.toEntity(projectCreateDto);

        return projectMapper.toResponseDto(projectRepository.save(project));
    }

    public ProjectResponseDto updateProject(Integer projectId, ProjectUpdateDto projectUpdateDto) {
        Project project = projectRepository.findById(projectId).orElseThrow(
                () -> new NotFoundException(String.format("Project with id %d not found", projectId))
        );
        User manager = project.getManager();
        if(projectUpdateDto.getManagerId() != null) {
            manager = userRepository.findById(projectUpdateDto.getManagerId()).orElseThrow(
                    () -> new NotFoundException(String.format("Manager with id %d not found", projectUpdateDto.getManagerId()))
            );
        }
        projectMapper.updateEntityFromDto(projectUpdateDto, project, manager);

        return projectMapper.toResponseDto(projectRepository.save(project));
    }

    @Transactional
    public ProjectResponseDto assignTeams(Integer projectId, ProjectAssignDto projectAssignDto) {
        Project project = projectRepository.findById(projectId).orElseThrow(
                () -> new NotFoundException(String.format("Project with id %d not found", projectId))
        );

        List<Team> teams = teamRepository.findAllById(projectAssignDto.getAssignedTeamsIds());
        if(teams.size() != projectAssignDto.getAssignedTeamsIds().size()) {
            throw new NotFoundException("One or more teams were not found");
        }

        project.setTeams(teams);
        teams.forEach(team -> {
            if(!team.getProjects().contains(project)) {
                team.getProjects().add(project);
            }
        });

        return projectMapper.toResponseDto(projectRepository.save(project));
    }

    @Transactional
    public void deleteProject(Integer projectId) {
        workItemRepository.deleteByProjectId(projectId);
        projectRepository.deleteById(projectId);
    }
}