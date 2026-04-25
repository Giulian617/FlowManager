package flowmanager.nomenclator.service;

import flowmanager.nomenclator.dto.*;
import flowmanager.nomenclator.exception.DuplicateAttributeException;
import flowmanager.nomenclator.exception.NotFoundException;
import flowmanager.nomenclator.mapper.CommentMapper;
import flowmanager.nomenclator.mapper.ProjectMapper;
import flowmanager.nomenclator.model.Project;
import flowmanager.nomenclator.model.User;
import flowmanager.nomenclator.repository.CommentRepository;
import flowmanager.nomenclator.repository.ProjectRepository;
import flowmanager.nomenclator.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProjectService {
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
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
        projectMapper.updateEntityFromDto(projectUpdateDto, manager, project);

        return projectMapper.toResponseDto(projectRepository.save(project));
    }

    public void deleteProject(Integer projectId) {
        projectRepository.deleteById(projectId);
    }
}