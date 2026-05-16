package flowmanager.nomenclator.service;

import flowmanager.nomenclator.dto.*;
import flowmanager.nomenclator.exception.NotFoundException;
import flowmanager.nomenclator.mapper.ProjectMapper;
import flowmanager.nomenclator.mapper.WorkItemMapper;
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
    private WorkItemMapper workItemMapper;

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
    void testFindAllWorkItemsByProjectId_Valid() {
        Project project = BuildInstances.buildProject();
        List<WorkItem> workItems = BuildInstances.buildWorkItems();
        List<WorkItemSummaryDto> workItemsDto = workItems.stream()
                .map(BuildDtos::buildWorkItemSummaryDto)
                .toList();
        project.setWorkItems(workItems);

        when(projectRepository.findById(project.getId())).thenReturn(Optional.of(project));
        when(workItemMapper.toSummaryDto(workItems.get(0))).thenReturn(workItemsDto.get(0));
        when(workItemMapper.toSummaryDto(workItems.get(1))).thenReturn(workItemsDto.get(1));

        List<WorkItemSummaryDto> result = projectService.findAllWorkItemsByProjectId(project.getId());

        assertEquals(2, result.size());
        assertEquals(workItemsDto.get(0), result.get(0));
        assertEquals(workItemsDto.get(1), result.get(1));
        verify(projectRepository, times(1)).findById(project.getId());
        verify(workItemMapper, times(1)).toSummaryDto(workItems.get(0));
        verify(workItemMapper, times(1)).toSummaryDto(workItems.get(1));
    }

    @Test
    void testFindAllWorkItemsByProjectId_Empty() {
        Project project = BuildInstances.buildProject();
        project.setWorkItems(List.of());

        when(projectRepository.findById(project.getId())).thenReturn(Optional.of(project));

        List<WorkItemSummaryDto> result = projectService.findAllWorkItemsByProjectId(project.getId());

        assertEquals(0, result.size());
        verify(projectRepository, times(1)).findById(project.getId());
        verify(workItemMapper, never()).toSummaryDto(any());
    }

    @Test
    void testFindAllWorkItemsByProjectId_NotFound() {
        when(projectRepository.findById(1)).thenReturn(Optional.empty());

        NotFoundException exception = assertThrows(NotFoundException.class,
                () -> projectService.findAllWorkItemsByProjectId(1));

        assertEquals("Project with id 1 not found", exception.getMessage());
    }

    @Test
    void testFindProjectById_Valid() {
        Project project = BuildInstances.buildProject();
        ProjectResponseDto responseDto = BuildDtos.buildProjectResponseDto(project);

        when(projectRepository.findById(project.getId())).thenReturn(Optional.of(project));
        when(projectMapper.toResponseDto(project)).thenReturn(responseDto);

        ProjectResponseDto result = projectService.findProjectById(project.getId());

        assertEquals(responseDto, result);
        verify(projectRepository, times(1)).findById(project.getId());
        verify(projectMapper, times(1)).toResponseDto(project);
    }

    @Test
    void testFindProjectById_NotFound() {
        when(projectRepository.findById(1)).thenReturn(Optional.empty());

        NotFoundException exception = assertThrows(NotFoundException.class,
                () -> projectService.findProjectById(1));

        assertEquals("Project with id 1 not found", exception.getMessage());
    }

    @Test
    void testCreateProject_Valid_WithTeams() {
        User manager = BuildInstances.buildUser();
        List<Team> teams = BuildInstances.buildTeams();
        List<Integer> teamsIds = List.of(teams.get(0).getId(), teams.get(1).getId());

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
                LocalDate.of(2026, 12, 31),
                teamsIds
        );
        ProjectResponseDto responseDto = BuildDtos.buildProjectResponseDto(savedProject);

        when(userRepository.findByKeycloakId(manager.getKeycloakId())).thenReturn(Optional.of(manager));
        when(projectMapper.toEntity(createDto, manager)).thenReturn(project);
        when(teamRepository.findAllById(teamsIds)).thenReturn(teams);
        when(projectRepository.save(project)).thenReturn(savedProject);
        when(projectMapper.toResponseDto(savedProject)).thenReturn(responseDto);

        ProjectResponseDto result = projectService.createProject(createDto, manager.getKeycloakId());

        assertEquals(responseDto, result);
        verify(userRepository, times(1)).findByKeycloakId(manager.getKeycloakId());
        verify(projectMapper, times(1)).toEntity(createDto, manager);
        verify(teamRepository, times(1)).findAllById(teamsIds);
        verify(projectRepository, times(1)).save(project);
        verify(projectMapper, times(1)).toResponseDto(savedProject);
    }

    @Test
    void testCreateProject_Valid_NoTeams() {
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
                LocalDate.of(2026, 12, 31),
                null
        );
        ProjectResponseDto responseDto = BuildDtos.buildProjectResponseDto(savedProject);

        when(userRepository.findByKeycloakId(manager.getKeycloakId())).thenReturn(Optional.of(manager));
        when(projectMapper.toEntity(createDto, manager)).thenReturn(project);
        when(projectRepository.save(project)).thenReturn(savedProject);
        when(projectMapper.toResponseDto(savedProject)).thenReturn(responseDto);

        ProjectResponseDto result = projectService.createProject(createDto,manager.getKeycloakId());

        assertEquals(responseDto, result);
        verify(userRepository, times(1)).findByKeycloakId(manager.getKeycloakId());
        verify(projectMapper, times(1)).toEntity(createDto, manager);
        verify(teamRepository, never()).findAllById(any());
        verify(projectRepository, times(1)).save(project);
        verify(projectMapper, times(1)).toResponseDto(savedProject);
    }

    @Test
    void testCreateProject_Valid_EmptyTeams() {
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
                LocalDate.of(2026, 12, 31),
                List.of()
        );
        ProjectResponseDto responseDto = BuildDtos.buildProjectResponseDto(savedProject);

        when(userRepository.findByKeycloakId(manager.getKeycloakId())).thenReturn(Optional.of(manager));
        when(projectMapper.toEntity(createDto, manager)).thenReturn(project);
        when(projectRepository.save(project)).thenReturn(savedProject);
        when(projectMapper.toResponseDto(savedProject)).thenReturn(responseDto);

        ProjectResponseDto result = projectService.createProject(createDto, manager.getKeycloakId());

        assertEquals(responseDto, result);
        verify(userRepository, times(1)).findByKeycloakId(manager.getKeycloakId());
        verify(projectMapper, times(1)).toEntity(createDto, manager);
        verify(teamRepository, never()).findAllById(any());
        verify(projectRepository, times(1)).save(project);
        verify(projectMapper, times(1)).toResponseDto(savedProject);
    }

    @Test
    void testCreateProject_UserNotFound() {
        String keycloakId = "keycloak-uuid-1";
        ProjectCreateDto createDto = new ProjectCreateDto(
                "Proiectul 1",
                "Descriere 1",
                LocalDate.of(2026, 1, 1),
                LocalDate.of(2026, 12, 31),
                null
        );

        when(userRepository.findByKeycloakId(keycloakId)).thenReturn(Optional.empty());

        NotFoundException exception = assertThrows(NotFoundException.class,
                () -> projectService.createProject(createDto, keycloakId));

        assertEquals("User not found", exception.getMessage());
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
        ProjectUpdateDto updateDto = new ProjectUpdateDto(
                "Proiectul 1 actualizat",
                "Descriere 1",
                LocalDate.of(2026, 6, 1),
                LocalDate.of(2026, 12, 31),
                1
        );
        ProjectResponseDto responseDto = BuildDtos.buildProjectResponseDto(updatedProject);

        when(projectRepository.findById(project.getId())).thenReturn(Optional.of(project));
        when(userRepository.findById(manager.getId())).thenReturn(Optional.of(manager));
        doNothing().when(projectMapper).updateEntityFromDto(updateDto, project, manager);
        when(projectRepository.save(project)).thenReturn(updatedProject);
        when(projectMapper.toResponseDto(updatedProject)).thenReturn(responseDto);

        ProjectResponseDto result = projectService.updateProject(project.getId(), updateDto);

        assertEquals(responseDto, result);
        verify(projectRepository, times(1)).findById(project.getId());
        verify(userRepository, times(1)).findById(manager.getId());
        verify(projectMapper, times(1)).updateEntityFromDto(updateDto, project, manager);
        verify(projectRepository, times(1)).save(project);
        verify(projectMapper, times(1)).toResponseDto(updatedProject);
    }

    @Test
    void testUpdateProject_ManagerIdNull() {
        Project project = BuildInstances.buildProject();
        User existingManager = project.getManager();

        Project updatedProject = Project.builder()
                .id(1)
                .name("Proiectul 1 actualizat")
                .description("Descriere 1")
                .startDate(LocalDate.of(2026, 6, 1))
                .endDate(LocalDate.of(2026, 12, 31))
                .manager(existingManager)
                .teams(new ArrayList<>())
                .workItems(new ArrayList<>())
                .build();
        ProjectUpdateDto updateDto = new ProjectUpdateDto(
                "Proiectul 1 actualizat",
                "Descriere 1",
                project.getStartDate(),
                project.getEndDate(),
                null
        );
        ProjectResponseDto responseDto = BuildDtos.buildProjectResponseDto(updatedProject);

        when(projectRepository.findById(project.getId())).thenReturn(Optional.of(project));
        doNothing().when(projectMapper).updateEntityFromDto(updateDto, project, existingManager);
        when(projectRepository.save(project)).thenReturn(updatedProject);
        when(projectMapper.toResponseDto(updatedProject)).thenReturn(responseDto);

        ProjectResponseDto result = projectService.updateProject(project.getId(), updateDto);

        assertEquals(responseDto, result);
        verify(projectRepository, times(1)).findById(project.getId());
        verify(userRepository, never()).findById(any());
        verify(projectMapper).updateEntityFromDto(updateDto, project, project.getManager());
        verify(projectRepository, times(1)).save(project);
        verify(projectMapper, times(1)).toResponseDto(updatedProject);
    }

    @Test
    void testUpdateProject_ManagerNotFound() {
        Project project = BuildInstances.buildProject();
        ProjectUpdateDto updateDto = new ProjectUpdateDto(
                "Proiectul 1 actualizat",
                "Descriere 1",
                project.getStartDate(),
                project.getEndDate(),
                1
        );

        when(projectRepository.findById(project.getId())).thenReturn(Optional.of(project));
        when(userRepository.findById(1)).thenReturn(Optional.empty());

        NotFoundException exception = assertThrows(NotFoundException.class,
                () -> projectService.updateProject(project.getId(), updateDto));

        assertEquals("Manager with id 1 not found", exception.getMessage());
        verify(projectRepository, times(1)).findById(project.getId());
        verify(userRepository, times(1)).findById(1);
    }

    @Test
    void testUpdateProject_ProjectNotFound() {
        ProjectUpdateDto updateDto = new ProjectUpdateDto(
                "Proiectul 1 actualizat",
                "Descriere 1",
                LocalDate.of(2026, 6, 1),
                LocalDate.of(2026, 12, 31),
                1
        );

        when(projectRepository.findById(1)).thenReturn(Optional.empty());

        NotFoundException exception = assertThrows(NotFoundException.class,
                () -> projectService.updateProject(1, updateDto));

        assertEquals("Project with id 1 not found", exception.getMessage());
    }

    @Test
    void testAssignTeams_Valid() {
        List<Team> teams = BuildInstances.buildTeams();
        Team retainedTeam = teams.get(0);
        Team removedTeam = teams.get(1);
        Team addedTeam = Team.builder()
                .id(3)
                .name("Echipa 3")
                .description("Descriere 3")
                .organization(BuildInstances.buildOrganization())
                .manager(BuildInstances.buildUser())
                .build();

        Project project = BuildInstances.buildProject();
        project.setTeams(teams);
        retainedTeam.getProjects().add(project);
        removedTeam.getProjects().add(project);

        List<Integer> newTeamIds = List.of(retainedTeam.getId(), addedTeam.getId());
        ProjectAssignDto assignDto = new ProjectAssignDto(newTeamIds);
        ProjectResponseDto responseDto = BuildDtos.buildProjectResponseDto(project);

        when(projectRepository.findById(project.getId())).thenReturn(Optional.of(project));
        when(teamRepository.findAllById(newTeamIds)).thenReturn(List.of(retainedTeam, addedTeam));
        when(projectRepository.save(project)).thenReturn(project);
        when(projectMapper.toResponseDto(project)).thenReturn(responseDto);

        ProjectResponseDto result = projectService.assignTeams(project.getId(), assignDto);

        assertEquals(responseDto, result);
        assertFalse(removedTeam.getProjects().contains(project));
        assertTrue(retainedTeam.getProjects().contains(project));
        assertEquals(1, retainedTeam.getProjects().stream()
                .filter(p -> p.equals(project)).count());
        assertTrue(addedTeam.getProjects().contains(project));
        assertEquals(List.of(retainedTeam, addedTeam), project.getTeams());
        verify(projectRepository, times(1)).findById(project.getId());
        verify(teamRepository, times(1)).findAllById(newTeamIds);
        verify(projectRepository, times(1)).save(project);
        verify(projectMapper, times(1)).toResponseDto(project);
    }

    @Test
    void testAssignTeams_WhenNotAlreadyPresent() {
        Project project = BuildInstances.buildProject();
        List<Team> teams = BuildInstances.buildTeams();

        teams.get(0).setProjects(new ArrayList<>());
        teams.get(1).setProjects(new ArrayList<>(List.of(project)));
        project.setTeams(new ArrayList<>(List.of(teams.get(1))));

        List<Integer> teamIds = List.of(teams.get(0).getId(), teams.get(1).getId());
        ProjectAssignDto assignDto = new ProjectAssignDto(teamIds);
        ProjectResponseDto responseDto = BuildDtos.buildProjectResponseDto(project);

        when(projectRepository.findById(project.getId())).thenReturn(Optional.of(project));
        when(teamRepository.findAllById(teamIds)).thenReturn(teams);
        when(projectRepository.save(project)).thenReturn(project);
        when(projectMapper.toResponseDto(project)).thenReturn(responseDto);

        ProjectResponseDto result = projectService.assignTeams(1, assignDto);

        assertEquals(responseDto, result);
        assertEquals(teams, project.getTeams());
        assertTrue(teams.get(0).getProjects().contains(project));
        assertEquals(1, teams.get(1).getProjects().size());
        verify(projectRepository, times(1)).findById(project.getId());
        verify(teamRepository, times(1)).findAllById(teamIds);
        verify(projectRepository, times(1)).save(project);
        verify(projectMapper, times(1)).toResponseDto(project);
    }

    @Test
    void testAssignTeams_TeamsNotFound() {
        Project project = BuildInstances.buildProject();
        Team team = BuildInstances.buildTeam();
        List<Integer> teamIds = List.of(1, 2);
        ProjectAssignDto assignDto = new ProjectAssignDto(teamIds);

        when(projectRepository.findById(project.getId())).thenReturn(Optional.of(project));
        when(teamRepository.findAllById(teamIds)).thenReturn(List.of(team));

        NotFoundException exception = assertThrows(NotFoundException.class,
                () -> projectService.assignTeams(1, assignDto));

        assertEquals("One or more teams were not found", exception.getMessage());
    }

    @Test
    void testAssignTeams_ProjectNotFound() {
        ProjectAssignDto assignDto = new ProjectAssignDto(List.of(1, 2));

        when(projectRepository.findById(1)).thenReturn(Optional.empty());

        NotFoundException exception = assertThrows(NotFoundException.class,
                () -> projectService.assignTeams(1, assignDto));

        assertEquals("Project with id 1 not found", exception.getMessage());
    }

    @Test
    void testDeleteProject_Valid() {
        Project project = BuildInstances.buildProject();
        List<WorkItem> workItems = BuildInstances.buildWorkItems();
        project.setWorkItems(workItems);

        when(projectRepository.findById(project.getId())).thenReturn(Optional.of(project));
        workItems.forEach(wi -> doNothing().when(workItemService).deleteWorkItem(wi.getId()));

        projectService.deleteProject(project.getId());

        verify(projectRepository, times(1)).findById(project.getId());
        workItems.forEach(wi -> verify(workItemService).deleteWorkItem(wi.getId()));
        verify(projectRepository, times(1)).deleteById(project.getId());
    }

    @Test
    void testDeleteProject_NotFound() {
        when(projectRepository.findById(1)).thenReturn(Optional.empty());

        projectService.deleteProject(1);

        verify(projectRepository, times(1)).findById(1);
        verify(workItemService, never()).deleteWorkItem(any());
        verify(projectRepository, never()).deleteById(any());
    }
}