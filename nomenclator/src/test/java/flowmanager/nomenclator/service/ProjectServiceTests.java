package flowmanager.nomenclator.service;

import flowmanager.nomenclator.dto.*;
import flowmanager.nomenclator.exception.NotFoundException;
import flowmanager.nomenclator.mapper.ProjectMapper;
import flowmanager.nomenclator.model.Project;
import flowmanager.nomenclator.model.Team;
import flowmanager.nomenclator.model.User;
import flowmanager.nomenclator.model.WorkItem;
import flowmanager.nomenclator.repository.ProjectRepository;
import flowmanager.nomenclator.repository.TeamRepository;
import flowmanager.nomenclator.repository.UserRepository;
import flowmanager.nomenclator.utils.BuildDtos;
import flowmanager.nomenclator.utils.BuildInstances;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class ProjectServiceTests {

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private TeamRepository teamRepository;

    @Mock
    private ProjectMapper projectMapper;

    @Mock
    private WorkItemService workItemService;

    @InjectMocks
    private ProjectService projectService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }


    @Test
    void testFindAllProjects_Valid() {
        List<Project> projects = BuildInstances.buildProjects();
        List<ProjectSummaryDto> projectsDto = projects.stream()
                .map(BuildDtos::buildProjectSummaryDto)
                .toList();

        when(projectRepository.findAll()).thenReturn(projects);
        when(projectMapper.toSummaryDto(projects.get(0))).thenReturn(projectsDto.get(0));
        when(projectMapper.toSummaryDto(projects.get(1))).thenReturn(projectsDto.get(1));

        List<ProjectSummaryDto> result = projectService.findAllProjects();

        assertEquals(2, result.size());
        assertEquals(projectsDto.get(0), result.get(0));
        assertEquals(projectsDto.get(1), result.get(1));

        verify(projectRepository, times(1)).findAll();
        verify(projectMapper, times(1)).toSummaryDto(projects.get(0));
        verify(projectMapper, times(1)).toSummaryDto(projects.get(1));
    }

    @Test
    void testFindAllProjects_EmptyList() {
        when(projectRepository.findAll()).thenReturn(List.of());

        List<ProjectSummaryDto> result = projectService.findAllProjects();

        assertEquals(0, result.size());
        verify(projectRepository, times(1)).findAll();
        verify(projectMapper, never()).toSummaryDto(any());
    }


    @Test
    void testFindProjectById_Valid() {
        Project project = BuildInstances.buildProject();
        ProjectResponseDto responseDto = BuildDtos.buildProjectResponseDto(project);

        when(projectRepository.findById(1)).thenReturn(Optional.of(project));
        when(projectMapper.toResponseDto(project)).thenReturn(responseDto);

        ProjectResponseDto result = projectService.findProjectById(1);

        assertEquals(responseDto, result);

        verify(projectRepository, times(1)).findById(1);
        verify(projectMapper, times(1)).toResponseDto(project);
    }

    @Test
    void testFindProjectById_NotFound() {
        when(projectRepository.findById(1)).thenReturn(Optional.empty());

        NotFoundException ex = assertThrows(NotFoundException.class,
                () -> projectService.findProjectById(1));

        assertEquals("Project with id 1 not found", ex.getMessage());
    }

    @Test
    void testCreateProject_Valid() {
        User manager = BuildInstances.buildUser();

        Project project = Project.builder()
                .name("Proiectul 1")
                .description("Descriere 1")
                .startDate(LocalDate.of(2026, 7, 1))
                .endDate(LocalDate.of(2026, 12, 31))
                .manager(manager)
                .teams(new ArrayList<>())
                .workItems(new ArrayList<>())
                .build();

        Project savedProject = BuildInstances.buildProject();

        ProjectCreateDto createDto = new ProjectCreateDto(
                "Proiectul 1",
                "Descriere 1",
                LocalDate.of(2026, 1, 1),
                LocalDate.of(2026, 12, 31)
        );

            ProjectResponseDto responseDto = BuildDtos.buildProjectResponseDto(savedProject);

            when(projectMapper.toEntity(createDto)).thenReturn(project);
            when(projectRepository.save(project)).thenReturn(savedProject);
            when(projectMapper.toResponseDto(savedProject)).thenReturn(responseDto);

            ProjectResponseDto result = projectService.createProject(createDto);

            assertEquals(responseDto, result);

            verify(projectMapper, times(1)).toEntity(createDto);
            verify(projectRepository, times(1)).save(project);
            verify(projectMapper, times(1)).toResponseDto(savedProject);
        }


    @Test
    void testUpdateProject_Valid() {
        User manager = BuildInstances.buildUser();

        Project project = BuildInstances.buildProject();
        Project updatedProject = Project.builder()
                .id(1)
                .name("Proiectul 1 actualizat")
                .description("Descriere 1")
                .startDate(LocalDate.of(2026, 6, 1))
                .endDate(LocalDate.of(2026, 12, 31))
                .manager(manager)
                .teams(new ArrayList<>())
                .workItems(new ArrayList<>())
                .build();

        ProjectUpdateDto updateDto = new ProjectUpdateDto("Proiectul 1 actualizat", "Descriere 1", LocalDate.of(2026, 6, 1), LocalDate.of(2026, 12, 31), 1
        );

        ProjectResponseDto responseDto = BuildDtos.buildProjectResponseDto(updatedProject);

        when(projectRepository.findById(1)).thenReturn(Optional.of(project));
        when(userRepository.findById(1)).thenReturn(Optional.of(manager));
        doNothing().when(projectMapper).updateEntityFromDto(updateDto, project, manager);
        when(projectRepository.save(project)).thenReturn(updatedProject);
        when(projectMapper.toResponseDto(updatedProject)).thenReturn(responseDto);

        ProjectResponseDto result = projectService.updateProject(1, updateDto);

        assertEquals(responseDto, result);

        verify(projectRepository, times(1)).findById(1);
        verify(userRepository, times(1)).findById(1);
        verify(projectMapper, times(1)).updateEntityFromDto(updateDto, project, manager);
        verify(projectRepository, times(1)).save(project);
        verify(projectMapper, times(1)).toResponseDto(updatedProject);
    }

    @Test
    void testUpdateProject_NoManagerChange() {
        Project project = BuildInstances.buildProject();

        ProjectUpdateDto updateDto = new ProjectUpdateDto(
                "Proiectul 1 actualizat",
                "Descriere 1",
                project.getStartDate(),
                project.getEndDate(),
                null
        );

        when(projectRepository.findById(1)).thenReturn(Optional.of(project));
        when(projectRepository.save(project)).thenReturn(project);
        when(projectMapper.toResponseDto(project)).thenReturn(BuildDtos.buildProjectResponseDto(project));

        ProjectResponseDto result = projectService.updateProject(1, updateDto);

        assertNotNull(result);

        verify(userRepository, never()).findById(any());
        verify(projectMapper).updateEntityFromDto(updateDto, project, project.getManager());
    }

    @Test
    void testUpdateProject_ProjectNotFound() {
        when(projectRepository.findById(1)).thenReturn(Optional.empty());

        NotFoundException ex = assertThrows(NotFoundException.class,
                () -> projectService.updateProject(1, new ProjectUpdateDto()));

        assertEquals("Project with id 1 not found", ex.getMessage());
    }

    @Test
    void testUpdateProject_ManagerNotFound() {
        Project project = BuildInstances.buildProject();

        ProjectUpdateDto updateDto = new ProjectUpdateDto(
                "Proiectul 1 actualizat",
                "Descriere 1",
                project.getStartDate(),
                project.getEndDate(),
                99
        );

        when(projectRepository.findById(1)).thenReturn(Optional.of(project));
        when(userRepository.findById(99)).thenReturn(Optional.empty());

        NotFoundException ex = assertThrows(NotFoundException.class,
                () -> projectService.updateProject(1, updateDto));

        assertEquals("Manager with id 99 not found", ex.getMessage());

        verify(projectRepository, never()).save(any());
    }



    @Test
    void testAssignTeams_Valid() {
        Project project = BuildInstances.buildProject();
        List<Team> teams = BuildInstances.buildTeams();
        List<Integer> teamIds = List.of(1, 2);

        ProjectAssignDto assignDto = new ProjectAssignDto(teamIds);

        when(projectRepository.findById(1)).thenReturn(Optional.of(project));
        when(teamRepository.findAllById(teamIds)).thenReturn(teams);
        when(projectRepository.save(project)).thenReturn(project);
        when(projectMapper.toResponseDto(project)).thenReturn(BuildDtos.buildProjectResponseDto(project));

        ProjectResponseDto result = projectService.assignTeams(1, assignDto);

        assertNotNull(result);

        verify(projectRepository, times(1)).findById(1);
        verify(teamRepository, times(1)).findAllById(teamIds);
        verify(projectRepository, times(1)).save(project);
    }

    @Test
    void testAssignTeams_WhenNotAlreadyPresent() {
        Project project = BuildInstances.buildProject();

        Team team1 = BuildInstances.buildTeams().get(0);
        team1.setProjects(new ArrayList<>());

        Team team2 = BuildInstances.buildTeams().get(1);
        team2.setProjects(new ArrayList<>(List.of(project)));

        List<Integer> teamIds = List.of(1, 2);
        ProjectAssignDto assignDto = new ProjectAssignDto(teamIds);

        when(projectRepository.findById(1)).thenReturn(Optional.of(project));
        when(teamRepository.findAllById(teamIds)).thenReturn(List.of(team1, team2));
        when(projectRepository.save(project)).thenReturn(project);
        when(projectMapper.toResponseDto(project)).thenReturn(BuildDtos.buildProjectResponseDto(project));

        projectService.assignTeams(1, assignDto);

        assertTrue(team1.getProjects().contains(project));
        assertEquals(1, team2.getProjects().size());

        verify(projectRepository).save(project);
    }


    @Test
    void testAssignTeams_TeamsNotFound() {
        Project project = BuildInstances.buildProject();
        List<Integer> teamIds = List.of(1, 2);

        ProjectAssignDto assignDto = new ProjectAssignDto(teamIds);

        when(projectRepository.findById(1)).thenReturn(Optional.of(project));
        when(teamRepository.findAllById(teamIds)).thenReturn(List.of(BuildInstances.buildTeam()));

        NotFoundException ex = assertThrows(NotFoundException.class,
                () -> projectService.assignTeams(1, assignDto));

        assertEquals("One or more teams were not found", ex.getMessage());

        verify(projectRepository, never()).save(any());
    }

    @Test
    void testAssignTeams_ProjectNotFound() {
        ProjectAssignDto assignDto = new ProjectAssignDto(List.of(1, 2));

        when(projectRepository.findById(1)).thenReturn(Optional.empty());

        NotFoundException ex = assertThrows(NotFoundException.class,
                () -> projectService.assignTeams(1, assignDto));

        assertEquals("Project with id 1 not found", ex.getMessage());
    }

    @Test
    void testDeleteProject_Valid() {
        Project project = BuildInstances.buildProject();
        project.setWorkItems(new ArrayList<>());

        when(projectRepository.findById(1)).thenReturn(Optional.of(project));

        projectService.deleteProject(1);

        verify(projectRepository, times(1)).deleteById(1);
    }

    @Test
    void testDeleteProject_DeletesWorkItems() {
        Project project = BuildInstances.buildProject();
        List<WorkItem> workItems = new ArrayList<>(BuildInstances.buildWorkItems());
        project.setWorkItems(workItems);

        when(projectRepository.findById(1)).thenReturn(Optional.of(project));
        workItems.forEach(wi -> doNothing().when(workItemService).deleteWorkItem(wi.getId()));

        projectService.deleteProject(1);

        workItems.forEach(wi -> verify(workItemService).deleteWorkItem(wi.getId()));
        verify(projectRepository, times(1)).deleteById(1);
    }

    @Test
    void testDeleteProject_NotFound() {
        when(projectRepository.findById(1)).thenReturn(Optional.empty());

        projectService.deleteProject(1);

        verify(projectRepository, never()).deleteById(anyInt());
        verify(workItemService, never()).deleteWorkItem(anyInt());
    }
}