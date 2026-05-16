package flowmanager.nomenclator.service;

import flowmanager.nomenclator.dto.*;
import flowmanager.nomenclator.exception.NotFoundException;
import flowmanager.nomenclator.mapper.ProjectMapper;
import flowmanager.nomenclator.mapper.TeamMapper;
import flowmanager.nomenclator.mapper.UserMapper;
import flowmanager.nomenclator.mapper.WorkItemMapper;
import flowmanager.nomenclator.model.*;
import flowmanager.nomenclator.repository.OrganizationRepository;
import flowmanager.nomenclator.repository.TeamRepository;
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

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class TeamServiceTests {
    @Mock
    private TeamRepository teamRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private OrganizationRepository organizationRepository;

    @Mock
    private TeamMapper teamMapper;

    @Mock
    private UserMapper userMapper;

    @Mock
    private ProjectMapper projectMapper;

    @Mock
    private WorkItemMapper workItemMapper;

    @InjectMocks
    private TeamService teamService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testFindAllTeams_Valid() {
        List<Team> teams = BuildInstances.buildTeams();
        List<TeamSummaryDto> teamsDto = teams.stream()
                .map(BuildDtos::buildTeamSummaryDto)
                .toList();

        when(teamRepository.findAll()).thenReturn(teams);
        when(teamMapper.toSummaryDto(teams.get(0))).thenReturn(teamsDto.get(0));
        when(teamMapper.toSummaryDto(teams.get(1))).thenReturn(teamsDto.get(1));

        List<TeamSummaryDto> result = teamService.findAllTeams();

        assertEquals(2, result.size());
        assertEquals(teamsDto.get(0), result.get(0));
        assertEquals(teamsDto.get(1), result.get(1));
        verify(teamRepository, times(1)).findAll();
        verify(teamMapper, times(1)).toSummaryDto(teams.get(0));
        verify(teamMapper, times(1)).toSummaryDto(teams.get(1));
    }

    @Test
    void testFindAllTeams_EmptyList() {
        when(teamRepository.findAll()).thenReturn(List.of());

        List<TeamSummaryDto> result = teamService.findAllTeams();

        assertEquals(0, result.size());
        verify(teamRepository, times(1)).findAll();
        verify(teamMapper, never()).toSummaryDto(any());
    }

    @Test
    void testFindAllMembersByTeamId_Valid() {
        Team team = BuildInstances.buildTeam();
        List<User> members = BuildInstances.buildUsers();
        List<UserSummaryDto> membersDto = members.stream()
                .map(BuildDtos::buildUserSummaryDto)
                .toList();
        team.setMembers(members);

        when(teamRepository.findById(team.getId())).thenReturn(Optional.of(team));
        when(userMapper.toSummaryDto(members.get(0))).thenReturn(membersDto.get(0));
        when(userMapper.toSummaryDto(members.get(1))).thenReturn(membersDto.get(1));

        List<UserSummaryDto> result = teamService.findAllMembersByTeamId(team.getId());

        assertEquals(2, result.size());
        assertEquals(membersDto.get(0), result.get(0));
        assertEquals(membersDto.get(1), result.get(1));
        verify(teamRepository, times(1)).findById(team.getId());
        verify(userMapper, times(1)).toSummaryDto(members.get(0));
        verify(userMapper, times(1)).toSummaryDto(members.get(1));
    }

    @Test
    void testFindAllMembersByTeamId_Empty() {
        Team team = BuildInstances.buildTeam();
        team.setMembers(List.of());

        when(teamRepository.findById(team.getId())).thenReturn(Optional.of(team));

        List<UserSummaryDto> result = teamService.findAllMembersByTeamId(team.getId());

        assertEquals(0, result.size());
        verify(teamRepository, times(1)).findById(team.getId());
        verify(userMapper, never()).toSummaryDto(any());
    }

    @Test
    void testFindAllMembersByTeamId_NotFound() {
        when(teamRepository.findById(1)).thenReturn(Optional.empty());

        NotFoundException exception = assertThrows(NotFoundException.class,
                () -> teamService.findAllMembersByTeamId(1));

        assertEquals("Team with id 1 not found", exception.getMessage());
    }

    @Test
    void testFindAllProjectsByTeamId_Valid() {
        Team team = BuildInstances.buildTeam();
        List<Project> projects = BuildInstances.buildProjects();
        List<ProjectSummaryDto> projectsDto = projects.stream()
                .map(BuildDtos::buildProjectSummaryDto)
                .toList();
        team.setProjects(projects);

        when(teamRepository.findById(team.getId())).thenReturn(Optional.of(team));
        when(projectMapper.toSummaryDto(projects.get(0))).thenReturn(projectsDto.get(0));
        when(projectMapper.toSummaryDto(projects.get(1))).thenReturn(projectsDto.get(1));

        List<ProjectSummaryDto> result = teamService.findAllProjectsByTeamId(team.getId());

        assertEquals(2, result.size());
        assertEquals(projectsDto.get(0), result.get(0));
        assertEquals(projectsDto.get(1), result.get(1));
        verify(teamRepository, times(1)).findById(team.getId());
        verify(projectMapper, times(1)).toSummaryDto(projects.get(0));
        verify(projectMapper, times(1)).toSummaryDto(projects.get(1));
    }

    @Test
    void testFindAllProjectsByTeamId_Empty() {
        Team team = BuildInstances.buildTeam();
        team.setProjects(List.of());

        when(teamRepository.findById(team.getId())).thenReturn(Optional.of(team));

        List<ProjectSummaryDto> result = teamService.findAllProjectsByTeamId(team.getId());

        assertEquals(0, result.size());
        verify(teamRepository, times(1)).findById(team.getId());
        verify(projectMapper, never()).toSummaryDto(any());
    }

    @Test
    void testFindAllProjectsByTeamId_NotFound() {
        when(teamRepository.findById(1)).thenReturn(Optional.empty());

        NotFoundException exception = assertThrows(NotFoundException.class,
                () -> teamService.findAllProjectsByTeamId(1));

        assertEquals("Team with id 1 not found", exception.getMessage());
    }

    @Test
    void testFindAllWorkItemsByTeamId_Valid() {
        Team team = BuildInstances.buildTeam();
        List<User> members = BuildInstances.buildUsers();
        List<WorkItem> workItems = BuildInstances.buildWorkItems();
        List<WorkItemSummaryDto> workItemsDto = workItems.stream()
                .map(BuildDtos::buildWorkItemSummaryDto)
                .toList();
        members.get(0).setAssignedWorkItems(List.of(workItems.get(0)));
        members.get(1).setAssignedWorkItems(List.of(workItems.get(1)));
        team.setMembers(members);

        when(teamRepository.findById(team.getId())).thenReturn(Optional.of(team));
        when(workItemMapper.toSummaryDto(workItems.get(0))).thenReturn(workItemsDto.get(0));
        when(workItemMapper.toSummaryDto(workItems.get(1))).thenReturn(workItemsDto.get(1));

        List<WorkItemSummaryDto> result = teamService.findAllWorkItemsByTeamId(team.getId());

        assertEquals(2, result.size());
        assertEquals(workItemsDto.get(0), result.get(0));
        assertEquals(workItemsDto.get(1), result.get(1));
        verify(teamRepository, times(1)).findById(team.getId());
        verify(workItemMapper, times(1)).toSummaryDto(workItems.get(0));
        verify(workItemMapper, times(1)).toSummaryDto(workItems.get(1));
    }

    @Test
    void testFindAllWorkItemsByTeamId_Distinct() {
        Team team = BuildInstances.buildTeam();
        List<User> members = BuildInstances.buildUsers();
        WorkItem workItem = BuildInstances.buildWorkItem();
        WorkItemSummaryDto workItemDto = BuildDtos.buildWorkItemSummaryDto(workItem);
        members.get(0).setAssignedWorkItems(List.of(workItem));
        members.get(1).setAssignedWorkItems(List.of(workItem));
        team.setMembers(members);

        when(teamRepository.findById(team.getId())).thenReturn(Optional.of(team));
        when(workItemMapper.toSummaryDto(workItem)).thenReturn(workItemDto);

        List<WorkItemSummaryDto> result = teamService.findAllWorkItemsByTeamId(team.getId());

        assertEquals(1, result.size());
        assertEquals(workItemDto, result.getFirst());
        verify(teamRepository, times(1)).findById(team.getId());
        verify(workItemMapper, times(1)).toSummaryDto(workItem);
    }

    @Test
    void testFindAllWorkItemsByTeamId_Empty() {
        Team team = BuildInstances.buildTeam();
        List<User> members = BuildInstances.buildUsers();
        members.get(0).setAssignedWorkItems(List.of());
        members.get(1).setAssignedWorkItems(List.of());
        team.setMembers(members);

        when(teamRepository.findById(team.getId())).thenReturn(Optional.of(team));

        List<WorkItemSummaryDto> result = teamService.findAllWorkItemsByTeamId(team.getId());

        assertEquals(0, result.size());
        verify(teamRepository, times(1)).findById(team.getId());
        verify(workItemMapper, never()).toSummaryDto(any());
    }

    @Test
    void testFindAllWorkItemsByTeamId_NotFound() {
        when(teamRepository.findById(1)).thenReturn(Optional.empty());

        NotFoundException exception = assertThrows(NotFoundException.class,
                () -> teamService.findAllWorkItemsByTeamId(1));

        assertEquals("Team with id 1 not found", exception.getMessage());
    }

    @Test
    void testFindTeamById_Valid() {
        Team team = BuildInstances.buildTeam();
        TeamResponseDto responseDto = BuildDtos.buildTeamResponseDto(team);

        when(teamRepository.findById(team.getId())).thenReturn(Optional.of(team));
        when(teamMapper.toResponseDto(team)).thenReturn(responseDto);

        TeamResponseDto result = teamService.findTeamById(team.getId());

        assertEquals(responseDto, result);
        verify(teamRepository, times(1)).findById(team.getId());
        verify(teamMapper, times(1)).toResponseDto(team);
    }

    @Test
    void testFindTeamById_NotFound() {
        when(teamRepository.findById(1)).thenReturn(Optional.empty());

        NotFoundException exception = assertThrows(NotFoundException.class,
                () -> teamService.findTeamById(1));

        assertEquals("Team with id 1 not found", exception.getMessage());
    }

    @Test
    void testCreateTeam_Valid_WithMembers() {
        Organization organization = BuildInstances.buildOrganization();
        User manager = BuildInstances.buildUser();
        List<User> users = BuildInstances.buildUsers();
        List<Integer> membersIds = List.of(users.get(0).getId(), users.get(1).getId());

        Team team = Team.builder()
                .name("Echipa 1")
                .description("Descriere 1")
                .organization(organization)
                .createdAt(LocalDateTime.of(2026, 5, 1, 15, 23, 30))
                .manager(manager)
                .members(users)
                .projects(new ArrayList<>())
                .build();
        Team savedTeam = BuildInstances.buildTeam();
        TeamCreateDto createDto = new TeamCreateDto(
                "Echipa 1",
                "Descriere 1",
                1,
                membersIds
        );

        TeamResponseDto responseDto = BuildDtos.buildTeamResponseDto(savedTeam);

        when(organizationRepository.findById(organization.getId())).thenReturn(Optional.of(organization));
        when(userRepository.findByKeycloakId(manager.getKeycloakId())).thenReturn(Optional.of(manager));
        when(teamMapper.toEntity(createDto, organization, manager)).thenReturn(team);
        when(userRepository.findAllById(membersIds)).thenReturn(users);
        when(teamRepository.save(team)).thenReturn(savedTeam);
        when(teamMapper.toResponseDto(savedTeam)).thenReturn(responseDto);

        TeamResponseDto result = teamService.createTeam(createDto, manager.getKeycloakId());

        assertEquals(responseDto, result);
        verify(organizationRepository, times(1)).findById(organization.getId());
        verify(userRepository, times(1)).findByKeycloakId(manager.getKeycloakId());
        verify(teamMapper, times(1)).toEntity(createDto, organization, manager);
        verify(userRepository, times(1)).findAllById(membersIds);
        verify(teamRepository, times(1)).save(team);
        verify(teamMapper, times(1)).toResponseDto(savedTeam);
    }

    @Test
    void testCreateTeam_Valid_NoMembers() {
        Organization organization = BuildInstances.buildOrganization();
        User manager = BuildInstances.buildUser();

        Team team = Team.builder()
                .name("Echipa 1")
                .description("Descriere 1")
                .organization(organization)
                .createdAt(LocalDateTime.of(2026, 5, 1, 15, 23, 30))
                .manager(manager)
                .members(null)
                .projects(new ArrayList<>())
                .build();
        Team savedTeam = BuildInstances.buildTeam();
        TeamCreateDto createDto = new TeamCreateDto(
                "Echipa 1",
                "Descriere 1",
                1,
                null
        );
        TeamResponseDto responseDto = BuildDtos.buildTeamResponseDto(savedTeam);

        when(organizationRepository.findById(organization.getId())).thenReturn(Optional.of(organization));
        when(userRepository.findByKeycloakId(manager.getKeycloakId())).thenReturn(Optional.of(manager));
        when(teamMapper.toEntity(createDto, organization, manager)).thenReturn(team);
        when(teamRepository.save(team)).thenReturn(savedTeam);
        when(teamMapper.toResponseDto(savedTeam)).thenReturn(responseDto);

        TeamResponseDto result = teamService.createTeam(createDto, manager.getKeycloakId());

        assertEquals(responseDto, result);
        verify(organizationRepository, times(1)).findById(organization.getId());
        verify(userRepository, times(1)).findByKeycloakId(manager.getKeycloakId());
        verify(teamMapper, times(1)).toEntity(createDto, organization, manager);
        verify(userRepository, never()).findAllById(any());
        verify(teamRepository, times(1)).save(team);
        verify(teamMapper, times(1)).toResponseDto(savedTeam);
    }

    @Test
    void testCreateTeam_EmptyMembersList() {
        Organization organization = BuildInstances.buildOrganization();
        User manager = BuildInstances.buildUser();

        Team team = Team.builder()
                .name("Echipa 1")
                .description("Descriere 1")
                .organization(organization)
                .createdAt(LocalDateTime.of(2026, 5, 1, 15, 23, 30))
                .manager(manager)
                .members(new ArrayList<>())
                .projects(new ArrayList<>())
                .build();
        Team savedTeam = BuildInstances.buildTeam();
        TeamCreateDto createDto = new TeamCreateDto(
                "Echipa 1",
                "Descriere 1",
                1,
                new ArrayList<>()
        );
        TeamResponseDto responseDto = BuildDtos.buildTeamResponseDto(savedTeam);

        when(organizationRepository.findById(organization.getId())).thenReturn(Optional.of(organization));
        when(userRepository.findByKeycloakId(manager.getKeycloakId())).thenReturn(Optional.of(manager));
        when(teamMapper.toEntity(createDto, organization, manager)).thenReturn(team);
        when(teamRepository.save(team)).thenReturn(savedTeam);
        when(teamMapper.toResponseDto(savedTeam)).thenReturn(responseDto);

        TeamResponseDto result = teamService.createTeam(createDto, manager.getKeycloakId());

        assertEquals(responseDto, result);
        verify(organizationRepository, times(1)).findById(organization.getId());
        verify(userRepository, times(1)).findByKeycloakId(manager.getKeycloakId());
        verify(teamMapper, times(1)).toEntity(createDto, organization, manager);
        verify(userRepository, never()).findAllById(any());
        verify(teamRepository, times(1)).save(team);
        verify(teamMapper, times(1)).toResponseDto(savedTeam);
    }

    @Test
    void testCreateTeam_UserNotFound() {
        Organization organization = BuildInstances.buildOrganization();
        String keycloakId = "keycloak-uuid-1";
        TeamCreateDto createDto = new TeamCreateDto(
                "Echipa 1",
                "Descriere 1",
                1,
                null
        );

        when(organizationRepository.findById(organization.getId())).thenReturn(Optional.of(organization));
        when(userRepository.findByKeycloakId(keycloakId)).thenReturn(Optional.empty());

        NotFoundException exception = assertThrows(NotFoundException.class,
                () -> teamService.createTeam(createDto, keycloakId));

        assertEquals("User not found", exception.getMessage());
    }

    @Test
    void testCreateTeam_OrganizationNotFound() {
        String keycloakId = "keycloak-uuid-1";
        TeamCreateDto createDto = new TeamCreateDto(
                "Echipa 1",
                "Descriere 1",
                1,
                null
        );

        when(organizationRepository.findById(1)).thenReturn(Optional.empty());

        NotFoundException exception = assertThrows(NotFoundException.class,
                () -> teamService.createTeam(createDto, keycloakId));

        assertEquals("Organization with id 1 not found", exception.getMessage());
    }

    @Test
    void testCreateTeam_MembersNotFound() {
        Organization organization = BuildInstances.buildOrganization();
        User manager = BuildInstances.buildUser();

        Team team = Team.builder()
                .name("Echipa 1")
                .description("Descriere 1")
                .organization(organization)
                .members(new ArrayList<>())
                .projects(new ArrayList<>())
                .build();
        TeamCreateDto createDto = new TeamCreateDto(
                "Echipa 1",
                "Descriere 1",
                1,
                List.of(1, 2)
        );

        when(organizationRepository.findById(organization.getId())).thenReturn(Optional.of(organization));
        when(userRepository.findByKeycloakId(manager.getKeycloakId())).thenReturn(Optional.of(manager));
        when(teamMapper.toEntity(createDto, organization, manager)).thenReturn(team);
        when(userRepository.findAllById(List.of(1, 2))).thenReturn(List.of(BuildInstances.buildUser()));

        NotFoundException exception = assertThrows(NotFoundException.class,
                () -> teamService.createTeam(createDto, manager.getKeycloakId()));

        assertEquals("One or more users were not found", exception.getMessage());
        verify(organizationRepository, times(1)).findById(organization.getId());
        verify(userRepository, times(1)).findByKeycloakId(manager.getKeycloakId());
        verify(teamMapper, times(1)).toEntity(createDto, organization, manager);
        verify(userRepository, times(1)).findAllById(List.of(1, 2));
        verify(teamRepository, never()).save(any());
    }

    @Test
    void testUpdateTeam_Valid() {
        Team team = BuildInstances.buildTeam();
        Organization organization = BuildInstances.buildOrganization();
        User manager = BuildInstances.buildUser();

        Team updatedTeam = Team.builder()
                .name("Echipa 1 actualizata")
                .description("Descriere 1")
                .organization(organization)
                .manager(manager)
                .projects(new ArrayList<>())
                .members(new ArrayList<>())
                .build();
        TeamUpdateDto updateDto = new TeamUpdateDto(
                "Echipa 1 actualizata",
                "Descriere 1",
                1,
                1
        );
        TeamResponseDto responseDto = BuildDtos.buildTeamResponseDto(updatedTeam);

        when(teamRepository.findById(team.getId())).thenReturn(Optional.of(team));
        when(organizationRepository.findById(organization.getId())).thenReturn(Optional.of(organization));
        when(userRepository.findById(manager.getId())).thenReturn(Optional.of(manager));
        doNothing().when(teamMapper).updateEntityFromDto(updateDto, team, organization, manager);
        when(teamRepository.save(team)).thenReturn(updatedTeam);
        when(teamMapper.toResponseDto(updatedTeam)).thenReturn(responseDto);

        TeamResponseDto result = teamService.updateTeam(team.getId(), updateDto);

        assertEquals(responseDto, result);
        verify(teamRepository, times(1)).findById(team.getId());
        verify(organizationRepository, times(1)).findById(organization.getId());
        verify(userRepository, times(1)).findById(manager.getId());
        verify(teamMapper, times(1)).updateEntityFromDto(updateDto, team, organization, manager);
        verify(teamRepository, times(1)).save(team);
        verify(teamMapper, times(1)).toResponseDto(updatedTeam);
    }

    @Test
    void testUpdateTeam_NoOrganizationChange() {
        Team team = BuildInstances.buildTeam();
        User manager = BuildInstances.buildUser();

        Team updatedTeam = Team.builder()
                .name("Echipa 1 actualizata")
                .description("Descriere 1")
                .organization(team.getOrganization())
                .manager(manager)
                .projects(new ArrayList<>())
                .members(new ArrayList<>())
                .build();
        TeamUpdateDto updateDto = new TeamUpdateDto(
                "Echipa 1 actualizata",
                "Descriere 1",
                null,
                1
        );
        TeamResponseDto responseDto = BuildDtos.buildTeamResponseDto(updatedTeam);

        when(teamRepository.findById(team.getId())).thenReturn(Optional.of(team));
        when(userRepository.findById(manager.getId())).thenReturn(Optional.of(manager));
        doNothing().when(teamMapper).updateEntityFromDto(updateDto, team, team.getOrganization(), manager);
        when(teamRepository.save(team)).thenReturn(updatedTeam);
        when(teamMapper.toResponseDto(updatedTeam)).thenReturn(responseDto);

        TeamResponseDto result = teamService.updateTeam(team.getId(), updateDto);

        assertEquals(responseDto, result);
        verify(teamRepository, times(1)).findById(team.getId());
        verify(organizationRepository, never()).findById(any());
        verify(userRepository, times(1)).findById(manager.getId());
        verify(teamMapper, times(1)).updateEntityFromDto(updateDto, team, team.getOrganization(), manager);
        verify(teamRepository, times(1)).save(team);
        verify(teamMapper, times(1)).toResponseDto(updatedTeam);
    }

    @Test
    void testUpdateTeam_NoManagerChange() {
        Team team = BuildInstances.buildTeam();
        Organization organization = BuildInstances.buildOrganization();

        Team updatedTeam = Team.builder()
                .name("Echipa 1 actualizata")
                .description("Descriere 1")
                .organization(team.getOrganization())
                .manager(team.getManager())
                .projects(new ArrayList<>())
                .members(new ArrayList<>())
                .build();
        TeamUpdateDto updateDto = new TeamUpdateDto(
                "Echipa 1 actualizata",
                "Descriere 1",
                1,
                null
        );
        TeamResponseDto responseDto = BuildDtos.buildTeamResponseDto(updatedTeam);

        when(teamRepository.findById(team.getId())).thenReturn(Optional.of(team));
        when(organizationRepository.findById(organization.getId())).thenReturn(Optional.of(organization));
        doNothing().when(teamMapper).updateEntityFromDto(updateDto, team, organization, team.getManager());
        when(teamRepository.save(team)).thenReturn(updatedTeam);
        when(teamMapper.toResponseDto(updatedTeam)).thenReturn(responseDto);

        TeamResponseDto result = teamService.updateTeam(1, updateDto);

        assertEquals(responseDto, result);
        verify(teamRepository, times(1)).findById(team.getId());
        verify(organizationRepository, times(1)).findById(organization.getId());
        verify(userRepository, never()).findById(any());
        verify(teamMapper, times(1)).updateEntityFromDto(updateDto, team, organization, team.getManager());
        verify(teamRepository, times(1)).save(team);
        verify(teamMapper, times(1)).toResponseDto(updatedTeam);
    }

    @Test
    void testUpdateTeam_TeamNotFound() {
        TeamUpdateDto updateDto = new TeamUpdateDto(
                "Echipa 1 actualizata",
                "Descriere 1",
                1,
                1
        );

        when(teamRepository.findById(1)).thenReturn(Optional.empty());

        NotFoundException exception = assertThrows(NotFoundException.class,
                () -> teamService.updateTeam(1, updateDto));

        assertEquals("Team with id 1 not found", exception.getMessage());
    }

    @Test
    void testUpdateTeam_OrganizationNotFound() {
        Team team = BuildInstances.buildTeam();
        TeamUpdateDto updateDto = new TeamUpdateDto(
                "Echipa 1 actualizata",
                "Descriere 1",
                1,
                null
        );

        when(teamRepository.findById(1)).thenReturn(Optional.of(team));
        when(organizationRepository.findById(1)).thenReturn(Optional.empty());

        NotFoundException exception = assertThrows(NotFoundException.class,
                () -> teamService.updateTeam(1, updateDto));
        
        assertEquals("Organization with id 1 not found", exception.getMessage());
    }

    @Test
    void testUpdateTeam_ManagerNotFound() {
        Team team = BuildInstances.buildTeam();
        TeamUpdateDto updateDto = new TeamUpdateDto(
                "Echipa 1 actualizat",
                "Descriere 1",
                null,
                1
        );

        when(teamRepository.findById(1)).thenReturn(Optional.of(team));
        when(userRepository.findById(1)).thenReturn(Optional.empty());

        NotFoundException exception = assertThrows(NotFoundException.class,
                () -> teamService.updateTeam(1, updateDto));

        assertEquals("Manager with id 1 not found", exception.getMessage());
    }

    @Test
    void testAssignUsers_Valid() {
        List<User> users = BuildInstances.buildUsers();
        User retainedUser = users.get(0);
        User removedUser = users.get(1);
        User addedUser = User.builder()
                .id(3)
                .email("user3@example.com")
                .username("User3")
                .firstName("Example3")
                .lastName("User")
                .phoneNumber("+409999999999")
                .active(false)
                .createdAt(LocalDateTime.of(2025, 11, 25, 13, 25, 13))
                .build();

        Team team = BuildInstances.buildTeam();
        team.setMembers(users);
        retainedUser.getAssignedTeams().add(team);
        removedUser.getAssignedTeams().add(team);

        List<Integer> newUserIds = List.of(retainedUser.getId(), addedUser.getId());
        TeamAssignDto assignDto = new TeamAssignDto(newUserIds);
        TeamResponseDto responseDto = BuildDtos.buildTeamResponseDto(team);

        when(teamRepository.findById(team.getId())).thenReturn(Optional.of(team));
        when(userRepository.findAllById(newUserIds)).thenReturn(List.of(retainedUser, addedUser));
        when(teamRepository.save(team)).thenReturn(team);
        when(teamMapper.toResponseDto(team)).thenReturn(responseDto);

        TeamResponseDto result = teamService.assignUsers(team.getId(), assignDto);

        assertEquals(responseDto, result);
        assertFalse(removedUser.getAssignedTeams().contains(team));
        assertTrue(retainedUser.getAssignedTeams().contains(team));
        assertEquals(1, retainedUser.getAssignedTeams().stream()
                .filter(t -> t.equals(team)).count());
        assertTrue(addedUser.getAssignedTeams().contains(team));
        assertEquals(List.of(retainedUser, addedUser), team.getMembers());
        verify(teamRepository, times(1)).findById(team.getId());
        verify(userRepository, times(1)).findAllById(newUserIds);
        verify(teamRepository, times(1)).save(team);
        verify(teamMapper, times(1)).toResponseDto(team);
    }

    @Test
    void testAssignUsers_WhenNotAlreadyPresent() {
        Team team = BuildInstances.buildTeam();
        List<User> users = BuildInstances.buildUsers();

        users.get(0).setAssignedTeams(new ArrayList<>());
        users.get(1).setAssignedTeams(new ArrayList<>(List.of(team)));
        team.setMembers(new ArrayList<>(List.of(users.get(1))));

        List<Integer> userIds = List.of(users.get(0).getId(), users.get(1).getId());
        TeamAssignDto assignDto = new TeamAssignDto(userIds);
        TeamResponseDto responseDto = BuildDtos.buildTeamResponseDto(team);

        when(teamRepository.findById(team.getId())).thenReturn(Optional.of(team));
        when(userRepository.findAllById(userIds)).thenReturn(users);
        when(teamRepository.save(team)).thenReturn(team);
        when(teamMapper.toResponseDto(team)).thenReturn(responseDto);

        TeamResponseDto result = teamService.assignUsers(team.getId(), assignDto);

        assertEquals(responseDto, result);
        assertEquals(users, team.getMembers());
        assertTrue(users.get(0).getAssignedTeams().contains(team));
        assertEquals(1, users.get(1).getAssignedTeams().size());
        verify(teamRepository, times(1)).findById(team.getId());
        verify(userRepository, times(1)).findAllById(userIds);
        verify(teamRepository, times(1)).save(team);
        verify(teamMapper, times(1)).toResponseDto(team);
    }

    @Test
    void testAssignUsers_UsersNotFound() {
        Team team = BuildInstances.buildTeam();
        User user = BuildInstances.buildUser();
        List<Integer> userIds = List.of(1, 2);
        TeamAssignDto assignDto = new TeamAssignDto(userIds);

        when(teamRepository.findById(team.getId())).thenReturn(Optional.of(team));
        when(userRepository.findAllById(userIds)).thenReturn(List.of(user));

        NotFoundException exception = assertThrows(NotFoundException.class,
                () -> teamService.assignUsers(1, assignDto));

        assertEquals("One or more users were not found", exception.getMessage());
    }

    @Test
    void testAssignUsers_TeamNotFound() {
        TeamAssignDto assignDto = new TeamAssignDto(List.of(1, 2));

        when(teamRepository.findById(1)).thenReturn(Optional.empty());

        NotFoundException exception = assertThrows(NotFoundException.class,
                () -> teamService.assignUsers(1, assignDto));

        assertEquals("Team with id 1 not found", exception.getMessage());
    }

    @Test
    void testDeleteTeam_Valid() {
        Team team = BuildInstances.buildTeam();

        when(teamRepository.findById(team.getId())).thenReturn(Optional.of(team));

        teamService.deleteTeam(1);

        assertFalse(team.getManager().getManagedTeams().contains(team));
        team.getMembers().forEach(m -> assertFalse(m.getAssignedTeams().contains(team)));
        team.getProjects().forEach(project -> project.getTeams().remove(team));
        verify(teamRepository, times(1)).deleteById(team.getId());
    }

    @Test
    void testDeleteTeam_NotFound() {
        when(teamRepository.findById(1)).thenReturn(Optional.empty());

        teamService.deleteTeam(1);

        verify(teamRepository, never()).deleteById(any());
    }
}