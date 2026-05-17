package flowmanager.nomenclator.service;

import flowmanager.nomenclator.dto.*;
import flowmanager.nomenclator.exception.NotFoundException;
import flowmanager.nomenclator.mapper.*;
import flowmanager.nomenclator.model.*;
import flowmanager.nomenclator.repository.OrganizationRepository;
import flowmanager.nomenclator.repository.UserRepository;
import flowmanager.nomenclator.utils.BuildDtos;
import flowmanager.nomenclator.utils.BuildInstances;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

public class OrganizationServiceTests {
    @Mock
    private OrganizationRepository organizationRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private OrganizationMapper organizationMapper;

    @Mock
    private TeamService teamService;

    @Mock
    private TeamMapper teamMapper;

    @Mock
    private UserMapper userMapper;

    @Mock
    private ProjectMapper projectMapper;

    @Mock
    private WorkItemMapper workItemMapper;

    @InjectMocks
    private OrganizationService organizationService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testFindAllOrganization_Valid() {
        List<Organization> organizations = BuildInstances.buildOrganizations();
        List<OrganizationSummaryDto> organizationsDto = organizations.stream()
                .map(BuildDtos::buildOrganizationSummaryDto)
                .toList();

        when(organizationRepository.findAll()).thenReturn(organizations);
        when(organizationMapper.toSummaryDto(organizations.get(0))).thenReturn(organizationsDto.get(0));
        when(organizationMapper.toSummaryDto(organizations.get(1))).thenReturn(organizationsDto.get(1));

        List<OrganizationSummaryDto> result = organizationService.findAllOrganizations();

        assertEquals(2, result.size());
        assertEquals(organizationsDto.get(0), result.get(0));
        assertEquals(organizationsDto.get(1), result.get(1));
        verify(organizationRepository, times(1)).findAll();
        verify(organizationMapper, times(1)).toSummaryDto(organizations.get(0));
        verify(organizationMapper, times(1)).toSummaryDto(organizations.get(1));
    }

    @Test
    void testFindAllOrganizations_EmptyList() {
        when(organizationRepository.findAll()).thenReturn(List.of());

        List<OrganizationSummaryDto> result = organizationService.findAllOrganizations();

        assertEquals(0, result.size());
        verify(organizationRepository, times(1)).findAll();
        verify(organizationMapper, never()).toSummaryDto(any());
    }

    @Test
    void testFindAllTeamsByOrganizationId_Valid() {
        Organization organization = BuildInstances.buildOrganization();
        List<Team> teams = BuildInstances.buildTeams();
        List<TeamSummaryOrganizationDto> teamsDto = teams.stream()
                .map(BuildDtos::buildTeamSummaryOrganizationDto)
                .toList();
        organization.setTeams(teams);

        when(organizationRepository.findById(organization.getId())).thenReturn(Optional.of(organization));
        when(teamMapper.toSummaryOrganizationDto(teams.get(0))).thenReturn(teamsDto.get(0));
        when(teamMapper.toSummaryOrganizationDto(teams.get(1))).thenReturn(teamsDto.get(1));

        List<TeamSummaryOrganizationDto> result = organizationService.findAllTeamsByOrganizationId(organization.getId());

        assertEquals(2, result.size());
        assertEquals(teamsDto.get(0), result.get(0));
        assertEquals(teamsDto.get(1), result.get(1));
        verify(organizationRepository, times(1)).findById(organization.getId());
        verify(teamMapper, times(1)).toSummaryOrganizationDto(teams.get(0));
        verify(teamMapper, times(1)).toSummaryOrganizationDto(teams.get(1));
    }

    @Test
    void testFindAllTeamsByOrganizationId_Empty() {
        Organization organization = BuildInstances.buildOrganization();

        when(organizationRepository.findById(organization.getId())).thenReturn(Optional.of(organization));

        List<TeamSummaryOrganizationDto> result = organizationService.findAllTeamsByOrganizationId(organization.getId());

        assertEquals(0, result.size());
        verify(organizationRepository, times(1)).findById(organization.getId());
        verify(teamMapper, never()).toSummaryOrganizationDto(any());
    }

    @Test
    void testFindAllTeamsByOrganizationId_NotFound() {
        when(organizationRepository.findById(1)).thenReturn(Optional.empty());

        NotFoundException exception = assertThrows(NotFoundException.class,
                () -> organizationService.findAllTeamsByOrganizationId(1));

        assertEquals("Organization with id 1 not found", exception.getMessage());
    }

    @Test
    void testFindAllUsersByOrganizationId_Valid() {
        Organization organization = BuildInstances.buildOrganization();
        List<Team> teams = BuildInstances.buildTeams();
        List<User> members = BuildInstances.buildUsers();
        List<UserSummaryDto> membersDto = members.stream()
                .map(BuildDtos::buildUserSummaryDto)
                .toList();
        teams.get(0).setMembers(List.of(members.get(0)));
        teams.get(1).setMembers(List.of(members.get(1)));
        organization.setTeams(teams);

        when(organizationRepository.findById(organization.getId())).thenReturn(Optional.of(organization));
        when(userMapper.toSummaryDto(members.get(0))).thenReturn(membersDto.get(0));
        when(userMapper.toSummaryDto(members.get(1))).thenReturn(membersDto.get(1));

        List<UserSummaryDto> result = organizationService.findAllUsersByOrganizationId(organization.getId());

        assertEquals(2, result.size());
        assertEquals(membersDto.get(0), result.get(0));
        assertEquals(membersDto.get(1), result.get(1));
        verify(organizationRepository, times(1)).findById(organization.getId());
        verify(userMapper, times(1)).toSummaryDto(members.get(0));
        verify(userMapper, times(1)).toSummaryDto(members.get(1));
    }

    @Test
    void testFindAllUsersByOrganizationId_Distinct() {
        Organization organization = BuildInstances.buildOrganization();
        List<Team> teams = BuildInstances.buildTeams();
        User user = BuildInstances.buildUser();
        UserSummaryDto memberDto = BuildDtos.buildUserSummaryDto(user);
        teams.get(0).setMembers(List.of(user));
        teams.get(1).setMembers(List.of(user));
        organization.setTeams(teams);

        when(organizationRepository.findById(organization.getId())).thenReturn(Optional.of(organization));
        when(userMapper.toSummaryDto(user)).thenReturn(memberDto);

        List<UserSummaryDto> result = organizationService.findAllUsersByOrganizationId(organization.getId());

        assertEquals(1, result.size());
        assertEquals(memberDto, result.getFirst());
        verify(organizationRepository, times(1)).findById(organization.getId());
        verify(userMapper, times(1)).toSummaryDto(user);
    }

    @Test
    void testFindAllUsersByOrganizationId_Empty() {
        Organization organization = BuildInstances.buildOrganization();
        List<Team> teams = BuildInstances.buildTeams();
        teams.get(0).setMembers(List.of());
        teams.get(1).setMembers(List.of());
        organization.setTeams(teams);

        when(organizationRepository.findById(organization.getId())).thenReturn(Optional.of(organization));

        List<UserSummaryDto> result = organizationService.findAllUsersByOrganizationId(organization.getId());

        assertEquals(0, result.size());
        verify(organizationRepository, times(1)).findById(organization.getId());
        verify(userMapper, never()).toSummaryDto(any());
    }

    @Test
    void testFindAllUsersByOrganizationId_NotFound() {
        when(organizationRepository.findById(1)).thenReturn(Optional.empty());

        NotFoundException exception = assertThrows(NotFoundException.class,
                () -> organizationService.findAllUsersByOrganizationId(1));

        assertEquals("Organization with id 1 not found", exception.getMessage());
    }

    @Test
    void testFindAllProjectsByOrganizationId_Valid() {
        Organization organization = BuildInstances.buildOrganization();
        List<Team> teams = BuildInstances.buildTeams();
        List<Project> projects = BuildInstances.buildProjects();
        List<ProjectSummaryDto> projectsDto = projects.stream()
                .map(BuildDtos::buildProjectSummaryDto)
                .toList();
        teams.get(0).setProjects(List.of(projects.get(0)));
        teams.get(1).setProjects(List.of(projects.get(1)));
        organization.setTeams(teams);

        when(organizationRepository.findById(organization.getId())).thenReturn(Optional.of(organization));
        when(projectMapper.toSummaryDto(projects.get(0))).thenReturn(projectsDto.get(0));
        when(projectMapper.toSummaryDto(projects.get(1))).thenReturn(projectsDto.get(1));

        List<ProjectSummaryDto> result = organizationService.findAllProjectsByOrganizationId(organization.getId());

        assertEquals(2, result.size());
        assertEquals(projectsDto.get(0), result.get(0));
        assertEquals(projectsDto.get(1), result.get(1));
        verify(organizationRepository, times(1)).findById(organization.getId());
        verify(projectMapper, times(1)).toSummaryDto(projects.get(0));
        verify(projectMapper, times(1)).toSummaryDto(projects.get(1));
    }

    @Test
    void testFindAllProjectsByOrganizationId_Distinct() {
        Organization organization = BuildInstances.buildOrganization();
        List<Team> teams = BuildInstances.buildTeams();
        Project project = BuildInstances.buildProject();
        ProjectSummaryDto projectDto = BuildDtos.buildProjectSummaryDto(project);
        teams.get(0).setProjects(List.of(project));
        teams.get(1).setProjects(List.of(project));
        organization.setTeams(teams);

        when(organizationRepository.findById(organization.getId())).thenReturn(Optional.of(organization));
        when(projectMapper.toSummaryDto(project)).thenReturn(projectDto);

        List<ProjectSummaryDto> result = organizationService.findAllProjectsByOrganizationId(organization.getId());

        assertEquals(1, result.size());
        assertEquals(projectDto, result.getFirst());
        verify(organizationRepository, times(1)).findById(organization.getId());
        verify(projectMapper, times(1)).toSummaryDto(project);
    }

    @Test
    void testFindAllProjectsByOrganizationId_Empty() {
        Organization organization = BuildInstances.buildOrganization();
        List<Team> teams = BuildInstances.buildTeams();
        teams.get(0).setProjects(List.of());
        teams.get(1).setProjects(List.of());
        organization.setTeams(teams);

        when(organizationRepository.findById(organization.getId())).thenReturn(Optional.of(organization));

        List<ProjectSummaryDto> result = organizationService.findAllProjectsByOrganizationId(organization.getId());

        assertEquals(0, result.size());
        verify(organizationRepository, times(1)).findById(organization.getId());
        verify(projectMapper, never()).toSummaryDto(any());
    }

    @Test
    void testFindAllProjectsByOrganizationId_NotFound() {
        when(organizationRepository.findById(1)).thenReturn(Optional.empty());

        NotFoundException exception = assertThrows(NotFoundException.class,
                () -> organizationService.findAllProjectsByOrganizationId(1));

        assertEquals("Organization with id 1 not found", exception.getMessage());
    }

    @Test
    void testFindAllWorkItemsByOrganizationId_Valid() {
        Organization organization = BuildInstances.buildOrganization();
        List<Team> teams = BuildInstances.buildTeams();
        List<Project> projects = BuildInstances.buildProjects();
        List<WorkItem> workItems = BuildInstances.buildWorkItems();
        List<WorkItemSummaryDto> workItemsDto = workItems.stream()
                .map(BuildDtos::buildWorkItemSummaryDto)
                .toList();
        projects.get(0).setWorkItems(List.of(workItems.get(0)));
        projects.get(1).setWorkItems(List.of(workItems.get(1)));
        teams.get(0).setProjects(List.of(projects.get(0)));
        teams.get(1).setProjects(List.of(projects.get(1)));
        organization.setTeams(teams);

        when(organizationRepository.findById(organization.getId())).thenReturn(Optional.of(organization));
        when(workItemMapper.toSummaryDto(workItems.get(0))).thenReturn(workItemsDto.get(0));
        when(workItemMapper.toSummaryDto(workItems.get(1))).thenReturn(workItemsDto.get(1));

        List<WorkItemSummaryDto> result = organizationService.findAllWorkItemsByOrganizationId(organization.getId());

        assertEquals(2, result.size());
        assertEquals(workItemsDto.get(0), result.get(0));
        assertEquals(workItemsDto.get(1), result.get(1));
        verify(organizationRepository, times(1)).findById(organization.getId());
        verify(workItemMapper, times(1)).toSummaryDto(workItems.get(0));
        verify(workItemMapper, times(1)).toSummaryDto(workItems.get(1));
    }

    @Test
    void testFindAllWorkItemsByOrganizationId_Distinct() {
        Organization organization = BuildInstances.buildOrganization();
        List<Team> teams = BuildInstances.buildTeams();
        List<Project> projects = BuildInstances.buildProjects();
        WorkItem workItem = BuildInstances.buildWorkItem();
        WorkItemSummaryDto workItemDto = BuildDtos.buildWorkItemSummaryDto(workItem);
        projects.get(0).setWorkItems(List.of(workItem));
        projects.get(1).setWorkItems(List.of(workItem));
        teams.get(0).setProjects(List.of(projects.get(0)));
        teams.get(1).setProjects(List.of(projects.get(1)));
        organization.setTeams(teams);

        when(organizationRepository.findById(organization.getId())).thenReturn(Optional.of(organization));
        when(workItemMapper.toSummaryDto(workItem)).thenReturn(workItemDto);

        List<WorkItemSummaryDto> result = organizationService.findAllWorkItemsByOrganizationId(organization.getId());

        assertEquals(1, result.size());
        assertEquals(workItemDto, result.getFirst());
        verify(organizationRepository, times(1)).findById(organization.getId());
        verify(workItemMapper, times(1)).toSummaryDto(workItem);
    }

    @Test
    void testFindAllWorkItemsByOrganizationId_Empty() {
        Organization organization = BuildInstances.buildOrganization();
        List<Team> teams = BuildInstances.buildTeams();
        List<Project> projects = BuildInstances.buildProjects();
        projects.get(0).setWorkItems(List.of());
        projects.get(1).setWorkItems(List.of());
        teams.get(0).setProjects(List.of(projects.get(0)));
        teams.get(1).setProjects(List.of(projects.get(1)));
        organization.setTeams(teams);

        when(organizationRepository.findById(organization.getId())).thenReturn(Optional.of(organization));

        List<WorkItemSummaryDto> result = organizationService.findAllWorkItemsByOrganizationId(organization.getId());

        assertEquals(0, result.size());
        verify(organizationRepository, times(1)).findById(organization.getId());
        verify(workItemMapper, never()).toSummaryDto(any());
    }

    @Test
    void testFindAllWorkItemsByOrganizationId_NotFound() {
        when(organizationRepository.findById(1)).thenReturn(Optional.empty());

        NotFoundException exception = assertThrows(NotFoundException.class,
                () -> organizationService.findAllWorkItemsByOrganizationId(1));

        assertEquals("Organization with id 1 not found", exception.getMessage());
    }

    @Test
    void testFindOrganizationById_Valid() {
        Organization organization = BuildInstances.buildOrganization();
        OrganizationResponseDto responseDto = BuildDtos.buildOrganizationResponseDto(organization);

        when(organizationRepository.findById(organization.getId())).thenReturn(Optional.of(organization));
        when(organizationMapper.toResponseDto(organization)).thenReturn(responseDto);

        OrganizationResponseDto result = organizationService.findOrganizationById(organization.getId());

        assertEquals(responseDto, result);
        verify(organizationRepository, times(1)).findById(organization.getId());
        verify(organizationMapper, times(1)).toResponseDto(organization);
    }

    @Test
    void testFindOrganizationById_NotFound() {
        when(organizationRepository.findById(1)).thenReturn(Optional.empty());

        NotFoundException exception = assertThrows(NotFoundException.class,
                () -> organizationService.findOrganizationById(1));

        assertEquals("Organization with id 1 not found", exception.getMessage());
    }

    @Test
    void testCreateOrganization_Valid() {
        User manager = BuildInstances.buildUser();

        Organization organization = Organization.builder()
                .name("Organizatia 1")
                .description("Descriere 1")
                .industry("IT")
                .createdAt(LocalDateTime.of(2026, 5, 1, 15, 23, 30))
                .manager(manager)
                .build();
        Organization savedOrganization = BuildInstances.buildOrganization();
        OrganizationCreateDto createDto = new OrganizationCreateDto(
                "Organizatia 1",
                "Descriere 1",
                "IT",
                1
        );
        OrganizationResponseDto responseDto = BuildDtos.buildOrganizationResponseDto(savedOrganization);

        when(userRepository.findById(manager.getId())).thenReturn(Optional.of(manager));
        when(organizationMapper.toEntity(createDto, manager)).thenReturn(organization);
        when(organizationRepository.save(organization)).thenReturn(savedOrganization);
        when(organizationMapper.toResponseDto(savedOrganization)).thenReturn(responseDto);

        OrganizationResponseDto result = organizationService.createOrganization(createDto);

        assertEquals(responseDto, result);
        verify(userRepository, times(1)).findById(manager.getId());
        verify(organizationMapper, times(1)).toEntity(createDto, manager);
        verify(organizationRepository, times(1)).save(organization);
        verify(organizationMapper, times(1)).toResponseDto(savedOrganization);
    }

    @Test
    void testCreateOrganization_UserNotFound() {
        OrganizationCreateDto createDto = new OrganizationCreateDto(
                "Organizatia 1",
                "Descriere 1",
                "IT",
                1
        );

        when(userRepository.findById(1)).thenReturn(Optional.empty());

        NotFoundException exception = assertThrows(NotFoundException.class,
                () -> organizationService.createOrganization(createDto));

        assertEquals("User with id 1 not found", exception.getMessage());
    }

    @Test
    void testUpdateOrganization_Valid() {
        User manager = BuildInstances.buildUser();

        Organization organization = BuildInstances.buildOrganization();
        Organization updatedOrganization = Organization.builder()
                .name("Organizatia 1 actualizata")
                .description("Descriere 1")
                .industry("IT")
                .manager(manager)
                .teams(new ArrayList<>())
                .build();
        OrganizationUpdateDto updateDto = new OrganizationUpdateDto(
                "Organizatia 1 actualizata",
                "Descriere 1",
                "IT",
                1
        );
        OrganizationResponseDto responseDto = BuildDtos.buildOrganizationResponseDto(updatedOrganization);

        when(organizationRepository.findById(organization.getId())).thenReturn(Optional.of(organization));
        when(userRepository.findById(1)).thenReturn(Optional.of(manager));
        doNothing().when(organizationMapper).updateEntityFromDto(updateDto, organization, manager);
        when(organizationRepository.save(organization)).thenReturn(updatedOrganization);
        when(organizationMapper.toResponseDto(updatedOrganization)).thenReturn(responseDto);

        OrganizationResponseDto result = organizationService.updateOrganization(organization.getId(), updateDto);

        assertEquals(responseDto, result);
        verify(organizationRepository, times(1)).findById(organization.getId());
        verify(userRepository, times(1)).findById(1);
        verify(organizationMapper, times(1)).updateEntityFromDto(updateDto, organization, manager);
        verify(organizationRepository, times(1)).save(organization);
        verify(organizationMapper, times(1)).toResponseDto(updatedOrganization);
    }

    @Test
    void testUpdateOrganization_ManagerIdNull() {
        Organization organization = BuildInstances.buildOrganization();
        User existingManager = organization.getManager();

        Organization updatedOrganization = Organization.builder()
                .name("Organizatia 1 actualizata")
                .description("Descriere 1")
                .industry("IT")
                .manager(existingManager)
                .teams(new ArrayList<>())
                .build();
        OrganizationUpdateDto updateDto = new OrganizationUpdateDto(
                "Organizatia 1 actualizata",
                "Descriere 1",
                "IT",
                null
        );
        OrganizationResponseDto responseDto = BuildDtos.buildOrganizationResponseDto(updatedOrganization);

        when(organizationRepository.findById(organization.getId())).thenReturn(Optional.of(organization));
        doNothing().when(organizationMapper).updateEntityFromDto(updateDto, organization, existingManager);
        when(organizationRepository.save(organization)).thenReturn(updatedOrganization);
        when(organizationMapper.toResponseDto(updatedOrganization)).thenReturn(responseDto);

        OrganizationResponseDto result = organizationService.updateOrganization(organization.getId(), updateDto);

        assertEquals(responseDto, result);
        verify(organizationRepository, times(1)).findById(organization.getId());
        verify(userRepository, never()).findById(any());
        verify(organizationMapper, times(1)).updateEntityFromDto(updateDto, organization, existingManager);
        verify(organizationRepository, times(1)).save(organization);
        verify(organizationMapper, times(1)).toResponseDto(updatedOrganization);
    }

    @Test
    void testUpdateOrganization_ManagerNotFound() {
        Organization organization = BuildInstances.buildOrganization();
        OrganizationUpdateDto updateDto = new OrganizationUpdateDto(
                "Organizatia 1 actualizata",
                "Descriere",
                "IT",
                1
        );

        when(organizationRepository.findById(organization.getId())).thenReturn(Optional.of(organization));
        when(userRepository.findById(1)).thenReturn(Optional.empty());

        NotFoundException exception = assertThrows(NotFoundException.class,
                () -> organizationService.updateOrganization(organization.getId(), updateDto));

        assertEquals("User with id 1 not found", exception.getMessage());
        verify(organizationRepository, times(1)).findById(organization.getId());
        verify(userRepository, times(1)).findById(1);
    }

    @Test
    void testUpdateOrganization_OrganizationNotFound() {
        OrganizationUpdateDto updateDto = new OrganizationUpdateDto(
                "Organizatia 1 actualizata",
                "Descriere 1",
                "IT",
                1
        );

        when(organizationRepository.findById(1)).thenReturn(Optional.empty());

        NotFoundException exception = assertThrows(NotFoundException.class,
                () -> organizationService.updateOrganization(1, updateDto));

        assertEquals("Organization with id 1 not found", exception.getMessage());
    }

    @Test
    void testDeleteOrganization_Valid() {
        Organization organization = BuildInstances.buildOrganization();
        List<Team> teams = BuildInstances.buildTeams();
        organization.setTeams(teams);

        when(organizationRepository.findById(organization.getId())).thenReturn(Optional.of(organization));
        teams.forEach(t -> doNothing().when(teamService).deleteTeam(t.getId()));
        doNothing().when(organizationRepository).deleteById(organization.getId());

        organizationService.deleteOrganization(organization.getId());

        verify(organizationRepository, times(1)).findById(organization.getId());
        teams.forEach(t -> verify(teamService).deleteTeam(t.getId()));
        verify(organizationRepository, times(1)).deleteById(organization.getId());
    }

    @Test
    void testDeleteOrganization_NotFound() {
        when(organizationRepository.findById(1)).thenReturn(Optional.empty());

        organizationService.deleteOrganization(1);

        verify(organizationRepository, times(1)).findById(1);
        verify(teamService, never()).deleteTeam(any());
        verify(organizationRepository, never()).deleteById(any());
    }
}
