package flowmanager.nomenclator.service;

import flowmanager.nomenclator.dto.PageResponseDto;
import flowmanager.nomenclator.dto.TeamCreateDto;
import flowmanager.nomenclator.dto.TeamResponseDto;
import flowmanager.nomenclator.dto.TeamSummaryOrganizationDto;
import flowmanager.nomenclator.dto.TeamUpdateDto;
import flowmanager.nomenclator.exception.NotFoundException;
import flowmanager.nomenclator.mapper.ProjectMapper;
import flowmanager.nomenclator.mapper.TeamMapper;
import flowmanager.nomenclator.mapper.UserMapper;
import flowmanager.nomenclator.mapper.WorkItemMapper;
import flowmanager.nomenclator.model.Organization;
import flowmanager.nomenclator.model.Project;
import flowmanager.nomenclator.model.Team;
import flowmanager.nomenclator.model.User;
import flowmanager.nomenclator.repository.OrganizationRepository;
import flowmanager.nomenclator.repository.TeamRepository;
import flowmanager.nomenclator.repository.UserRepository;
import flowmanager.nomenclator.utils.BuildDtos;
import flowmanager.nomenclator.utils.BuildInstances;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentMatchers;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
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
        List<TeamResponseDto> teamsDto = teams.stream()
                .map(BuildDtos::buildTeamResponseDto)
                .toList();

        when(teamRepository.findAll(ArgumentMatchers.<Specification<Team>>any(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(teams));
        when(teamMapper.toResponseDto(teams.get(0))).thenReturn(teamsDto.get(0));
        when(teamMapper.toResponseDto(teams.get(1))).thenReturn(teamsDto.get(1));

        PageResponseDto<TeamResponseDto> result = teamService.findAllTeams(null, null, null, Pageable.unpaged());

        assertEquals(2, result.content().size());
        assertEquals(teamsDto.get(0), result.content().get(0));
        assertEquals(teamsDto.get(1), result.content().get(1));
        verify(teamRepository, times(1)).findAll(ArgumentMatchers.<Specification<Team>>any(), any(Pageable.class));
        verify(teamMapper, times(1)).toResponseDto(teams.get(0));
        verify(teamMapper, times(1)).toResponseDto(teams.get(1));
    }

    @Test
    void testFindAllTeams_EmptyList() {
        when(teamRepository.findAll(ArgumentMatchers.<Specification<Team>>any(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of()));

        PageResponseDto<TeamResponseDto> result = teamService.findAllTeams(null, null, null, Pageable.unpaged());

        assertEquals(0, result.content().size());
        verify(teamRepository, times(1)).findAll(ArgumentMatchers.<Specification<Team>>any(), any(Pageable.class));
        verify(teamMapper, never()).toSummaryDto(any());
    }

    @Test
    void testFindAllTeams_MemberCountSort() {
        List<Team> teams = BuildInstances.buildTeams();
        List<TeamResponseDto> teamsDto = teams.stream()
                .map(BuildDtos::buildTeamResponseDto)
                .toList();

        when(teamRepository.findAll(ArgumentMatchers.<Specification<Team>>any(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(teams));
        when(teamMapper.toResponseDto(teams.get(0))).thenReturn(teamsDto.get(0));
        when(teamMapper.toResponseDto(teams.get(1))).thenReturn(teamsDto.get(1));

        Pageable pageable = PageRequest.of(0, 6, Sort.by(Sort.Direction.DESC, "members"));
        PageResponseDto<TeamResponseDto> result = teamService.findAllTeams(null, null, null, pageable);

        assertEquals(2, result.content().size());
        verify(teamRepository, times(1)).findAll(ArgumentMatchers.<Specification<Team>>any(), any(Pageable.class));
    }

    @Test
    void testFindTeamsByOrganization_Valid() {
        User user = BuildInstances.buildUser();
        List<Team> teams = BuildInstances.buildTeams();
        List<TeamSummaryOrganizationDto> teamsDto = teams.stream()
                .map(BuildDtos::buildTeamSummaryOrganizationDto)
                .toList();

        when(userRepository.findByKeycloakId(user.getKeycloakId())).thenReturn(Optional.of(user));
        when(teamRepository.findAll(ArgumentMatchers.<Specification<Team>>any(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(teams));
        when(teamMapper.toSummaryOrganizationDto(teams.get(0))).thenReturn(teamsDto.get(0));
        when(teamMapper.toSummaryOrganizationDto(teams.get(1))).thenReturn(teamsDto.get(1));

        PageResponseDto<TeamSummaryOrganizationDto> result = teamService.findTeamsByOrganization(
                1, user.getKeycloakId(), null, null, null, Pageable.unpaged());

        assertEquals(2, result.content().size());
        assertEquals(teamsDto.get(0), result.content().get(0));
        assertEquals(teamsDto.get(1), result.content().get(1));
        verify(userRepository, times(1)).findByKeycloakId(user.getKeycloakId());
        verify(teamRepository, times(1)).findAll(ArgumentMatchers.<Specification<Team>>any(), any(Pageable.class));
    }

    @Test
    void testFindTeamsByOrganization_UserNotFound() {
        when(userRepository.findByKeycloakId("kc-x")).thenReturn(Optional.empty());

        NotFoundException exception = assertThrows(NotFoundException.class,
                () -> teamService.findTeamsByOrganization(1, "kc-x", null, null, null, Pageable.unpaged()));

        assertEquals("User not found", exception.getMessage());
        verify(teamRepository, never()).findAll(ArgumentMatchers.<Specification<Team>>any(), any(Pageable.class));
    }

    @Test
    void testFindTeamsByProject_Valid() {
        List<Team> teams = BuildInstances.buildTeams();
        List<TeamSummaryOrganizationDto> teamsDto = teams.stream()
                .map(BuildDtos::buildTeamSummaryOrganizationDto)
                .toList();

        when(teamRepository.findAll(ArgumentMatchers.<Specification<Team>>any(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(teams));
        when(teamMapper.toSummaryOrganizationDto(teams.get(0))).thenReturn(teamsDto.get(0));
        when(teamMapper.toSummaryOrganizationDto(teams.get(1))).thenReturn(teamsDto.get(1));

        PageResponseDto<TeamSummaryOrganizationDto> result =
                teamService.findTeamsByProject(1, null, null, null, Pageable.unpaged());

        assertEquals(2, result.content().size());
        assertEquals(teamsDto.get(0), result.content().get(0));
        assertEquals(teamsDto.get(1), result.content().get(1));
        verify(teamRepository, times(1)).findAll(ArgumentMatchers.<Specification<Team>>any(), any(Pageable.class));
    }

    @Test
    void testFindTeamsByProject_Empty() {
        when(teamRepository.findAll(ArgumentMatchers.<Specification<Team>>any(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of()));

        PageResponseDto<TeamSummaryOrganizationDto> result =
                teamService.findTeamsByProject(1, null, null, null, Pageable.unpaged());

        assertEquals(0, result.content().size());
        verify(teamMapper, never()).toSummaryOrganizationDto(any());
    }

    @Test
    void testCreateTeam_Valid_WithMembers() {
        Organization organization = BuildInstances.buildOrganization();
        User manager = User.builder()
                .id(3)
                .keycloakId("keycloak-uuid-3")
                .email("user3@example.com")
                .username("User3")
                .firstName("Example3")
                .lastName("User")
                .phoneNumber("+409999999999")
                .active(true)
                .createdAt(LocalDateTime.of(2025, 11, 25, 13, 25, 13))
                .build();
        List<User> users = BuildInstances.buildUsers();
        List<Integer> membersIds = List.of(users.get(0).getId(), users.get(1).getId());

        Team team = Team.builder()
                .name("Echipa 1")
                .description("Descriere 1")
                .organization(organization)
                .createdAt(LocalDate.of(2026, 5, 1))
                .manager(manager)
                .members(new ArrayList<>())
                .projects(new ArrayList<>())
                .build();
        users.get(0).getAssignedTeams().add(team);
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
        assertTrue(team.getMembers().contains(manager));
        assertTrue(team.getMembers().containsAll(users));
        assertEquals(1, users.get(0).getAssignedTeams().stream()
                .filter(t -> t.equals(team)).count());
        assertTrue(users.get(1).getAssignedTeams().contains(team));
        assertTrue(manager.getAssignedTeams().contains(team));
        verify(organizationRepository, times(1)).findById(organization.getId());
        verify(userRepository, times(1)).findByKeycloakId(manager.getKeycloakId());
        verify(teamMapper, times(1)).toEntity(createDto, organization, manager);
        verify(userRepository, times(1)).findAllById(membersIds);
        verify(teamRepository, times(1)).save(team);
        verify(teamMapper, times(1)).toResponseDto(savedTeam);
    }

    @Test
    void testCreateTeam_Valid_EmptyMembers() {
        Organization organization = BuildInstances.buildOrganization();
        User manager = BuildInstances.buildUser();

        Team team = Team.builder()
                .name("Echipa 1")
                .description("Descriere 1")
                .organization(organization)
                .createdAt(LocalDate.of(2026, 5, 1))
                .manager(manager)
                .members(new ArrayList<>())
                .projects(new ArrayList<>())
                .build();
        Team savedTeam = BuildInstances.buildTeam();
        TeamCreateDto createDto = new TeamCreateDto(
                "Echipa 1",
                "Descriere 1",
                1,
                List.of()
        );
        TeamResponseDto responseDto = BuildDtos.buildTeamResponseDto(savedTeam);

        when(organizationRepository.findById(organization.getId())).thenReturn(Optional.of(organization));
        when(userRepository.findByKeycloakId(manager.getKeycloakId())).thenReturn(Optional.of(manager));
        when(teamMapper.toEntity(createDto, organization, manager)).thenReturn(team);
        when(teamRepository.save(team)).thenReturn(savedTeam);
        when(teamMapper.toResponseDto(savedTeam)).thenReturn(responseDto);

        TeamResponseDto result = teamService.createTeam(createDto, manager.getKeycloakId());

        assertEquals(responseDto, result);
        assertEquals(List.of(manager), team.getMembers());
        assertTrue(manager.getAssignedTeams().contains(team));
        verify(organizationRepository, times(1)).findById(organization.getId());
        verify(userRepository, times(1)).findByKeycloakId(manager.getKeycloakId());
        verify(teamMapper, times(1)).toEntity(createDto, organization, manager);
        verify(userRepository, never()).findAllById(any());
        verify(teamRepository, times(1)).save(team);
        verify(teamMapper, times(1)).toResponseDto(savedTeam);
    }

    @Test
    void testCreateTeam_Valid_ManagerIsAlsoMember() {
        Organization organization = BuildInstances.buildOrganization();
        User manager = BuildInstances.buildUser();

        Team team = Team.builder()
                .name("Echipa 1")
                .description("Descriere 1")
                .organization(organization)
                .createdAt(LocalDate.of(2026, 5, 1))
                .manager(manager)
                .members(new ArrayList<>())
                .projects(new ArrayList<>())
                .build();
        Team savedTeam = BuildInstances.buildTeam();
        TeamCreateDto createDto = new TeamCreateDto(
                "Echipa 1",
                "Descriere 1",
                1,
                List.of(manager.getId())
        );
        TeamResponseDto responseDto = BuildDtos.buildTeamResponseDto(savedTeam);

        when(organizationRepository.findById(organization.getId())).thenReturn(Optional.of(organization));
        when(userRepository.findByKeycloakId(manager.getKeycloakId())).thenReturn(Optional.of(manager));
        when(teamMapper.toEntity(createDto, organization, manager)).thenReturn(team);
        when(userRepository.findAllById(List.of(manager.getId()))).thenReturn(List.of(manager));
        when(teamRepository.save(team)).thenReturn(savedTeam);
        when(teamMapper.toResponseDto(savedTeam)).thenReturn(responseDto);

        TeamResponseDto result = teamService.createTeam(createDto, manager.getKeycloakId());

        assertEquals(responseDto, result);
        assertEquals(1, team.getMembers().stream().filter(u -> u.equals(manager)).count());
        assertTrue(manager.getAssignedTeams().contains(team));
        verify(organizationRepository, times(1)).findById(organization.getId());
        verify(userRepository, times(1)).findByKeycloakId(manager.getKeycloakId());
        verify(teamMapper, times(1)).toEntity(createDto, organization, manager);
        verify(userRepository, times(1)).findAllById(List.of(manager.getId()));
        verify(teamRepository, times(1)).save(team);
        verify(teamMapper, times(1)).toResponseDto(savedTeam);
    }

    @Test
    void testCreateTeam_Valid_MemberAlreadyAssigned() {
        Organization organization = BuildInstances.buildOrganization();
        User manager = BuildInstances.buildUser();
        List<User> users = BuildInstances.buildUsers();
        List<Integer> membersIds = List.of(users.get(0).getId(), users.get(1).getId());

        Team team = Team.builder()
                .name("Echipa 1")
                .description("Descriere 1")
                .organization(organization)
                .createdAt(LocalDate.of(2026, 5, 1))
                .manager(manager)
                .members(new ArrayList<>())
                .projects(new ArrayList<>())
                .build();

        users.get(0).getAssignedTeams().add(team);

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
        assertEquals(1, users.get(0).getAssignedTeams().stream()
                .filter(t -> t.equals(team)).count());
        assertTrue(users.get(1).getAssignedTeams().contains(team));
        assertTrue(manager.getAssignedTeams().contains(team));
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
                .createdAt(LocalDate.of(2026, 5, 1))
                .manager(manager)
                .members(new ArrayList<>())
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
        assertEquals(List.of(manager), team.getMembers());
        assertTrue(manager.getAssignedTeams().contains(team));
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
        List<User> users = BuildInstances.buildUsers();
        User retainedUser = users.get(0);
        User removedUser = users.get(1);
        User addedUser = User.builder()
                .id(3)
                .keycloakId("keycloak-uuid-3")
                .email("user3@example.com")
                .username("User3")
                .firstName("Example3")
                .lastName("User")
                .phoneNumber("+409999999999")
                .active(false)
                .createdAt(LocalDateTime.of(2025, 11, 25, 13, 25, 13))
                .build();
        Organization organization = BuildInstances.buildOrganization();
        User manager = BuildInstances.buildUser();

        Team team = BuildInstances.buildTeam();
        team.setMembers(users);
        retainedUser.getAssignedTeams().add(team);
        removedUser.getAssignedTeams().add(team);

        List<Integer> newMemberIds = List.of(retainedUser.getId(), addedUser.getId());
        Team updatedTeam = Team.builder()
                .name("Echipa 1 actualizata")
                .description("Descriere 1")
                .organization(organization)
                .manager(manager)
                .projects(new ArrayList<>())
                .members(List.of(retainedUser, addedUser))
                .build();
        TeamUpdateDto updateDto = new TeamUpdateDto(
                "Echipa 1 actualizata",
                "Descriere 1",
                1,
                newMemberIds
        );
        TeamResponseDto responseDto = BuildDtos.buildTeamResponseDto(updatedTeam);

        when(teamRepository.findById(team.getId())).thenReturn(Optional.of(team));
        when(userRepository.findById(manager.getId())).thenReturn(Optional.of(manager));
        when(userRepository.findAllById(newMemberIds)).thenReturn(List.of(retainedUser, addedUser));
        doNothing().when(teamMapper).updateEntityFromDto(updateDto, team, manager);
        when(teamRepository.save(team)).thenReturn(updatedTeam);
        when(teamMapper.toResponseDto(updatedTeam)).thenReturn(responseDto);

        TeamResponseDto result = teamService.updateTeam(team.getId(), updateDto);

        assertEquals(responseDto, result);
        assertFalse(removedUser.getAssignedTeams().contains(team));
        assertTrue(retainedUser.getAssignedTeams().contains(team));
        assertEquals(1, retainedUser.getAssignedTeams().stream()
                .filter(t -> t.equals(team)).count());
        assertTrue(addedUser.getAssignedTeams().contains(team));
        assertEquals(List.of(retainedUser, addedUser), team.getMembers());
        verify(teamRepository, times(1)).findById(team.getId());
        verify(userRepository, times(1)).findById(manager.getId());
        verify(userRepository, times(1)).findAllById(newMemberIds);
        verify(teamMapper, times(1)).updateEntityFromDto(updateDto, team, manager);
        verify(teamRepository, times(1)).save(team);
        verify(teamMapper, times(1)).toResponseDto(updatedTeam);
    }

    @Test
    void testUpdateTeam_NoManagerChange() {
        List<User> users = BuildInstances.buildUsers();
        User retainedUser = users.get(0);
        User removedUser = users.get(1);
        User addedUser = User.builder()
                .id(3)
                .keycloakId("keycloak-uuid-3")
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

        List<Integer> newMemberIds = List.of(retainedUser.getId(), addedUser.getId());
        Team updatedTeam = Team.builder()
                .name("Echipa 1 actualizata")
                .description("Descriere 1")
                .organization(team.getOrganization())
                .manager(team.getManager())
                .projects(new ArrayList<>())
                .members(List.of(retainedUser, addedUser))
                .build();
        TeamUpdateDto updateDto = new TeamUpdateDto(
                "Echipa 1 actualizata",
                "Descriere 1",
                null,
                newMemberIds
        );
        TeamResponseDto responseDto = BuildDtos.buildTeamResponseDto(updatedTeam);

        when(teamRepository.findById(team.getId())).thenReturn(Optional.of(team));
        when(userRepository.findAllById(newMemberIds)).thenReturn(List.of(retainedUser, addedUser));
        doNothing().when(teamMapper).updateEntityFromDto(updateDto, team, team.getManager());
        when(teamRepository.save(team)).thenReturn(updatedTeam);
        when(teamMapper.toResponseDto(updatedTeam)).thenReturn(responseDto);

        TeamResponseDto result = teamService.updateTeam(1, updateDto);

        assertEquals(responseDto, result);
        assertFalse(removedUser.getAssignedTeams().contains(team));
        assertTrue(retainedUser.getAssignedTeams().contains(team));
        assertEquals(1, retainedUser.getAssignedTeams().stream()
                .filter(t -> t.equals(team)).count());
        assertTrue(addedUser.getAssignedTeams().contains(team));
        assertEquals(List.of(retainedUser, addedUser), team.getMembers());
        verify(teamRepository, times(1)).findById(team.getId());
        verify(userRepository, never()).findById(any());
        verify(userRepository, times(1)).findAllById(newMemberIds);
        verify(teamMapper, times(1)).updateEntityFromDto(updateDto, team, team.getManager());
        verify(teamRepository, times(1)).save(team);
        verify(teamMapper, times(1)).toResponseDto(updatedTeam);
    }

    @Test
    void testUpdateTeam_MembersIdsNull() {
        Organization organization = BuildInstances.buildOrganization();
        User manager = BuildInstances.buildUser();
        Team team = BuildInstances.buildTeam();

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
                null
        );
        TeamResponseDto responseDto = BuildDtos.buildTeamResponseDto(updatedTeam);

        when(teamRepository.findById(team.getId())).thenReturn(Optional.of(team));
        when(userRepository.findById(manager.getId())).thenReturn(Optional.of(manager));
        doNothing().when(teamMapper).updateEntityFromDto(updateDto, team, manager);
        when(teamRepository.save(team)).thenReturn(updatedTeam);
        when(teamMapper.toResponseDto(updatedTeam)).thenReturn(responseDto);

        TeamResponseDto result = teamService.updateTeam(team.getId(), updateDto);

        assertEquals(responseDto, result);
        verify(teamRepository, times(1)).findById(team.getId());
        verify(userRepository, times(1)).findById(manager.getId());
        verify(userRepository, never()).findAllById(any());
        verify(teamMapper, times(1)).updateEntityFromDto(updateDto, team, team.getManager());
        verify(teamRepository, times(1)).save(team);
        verify(teamMapper, times(1)).toResponseDto(updatedTeam);
    }

    @Test
    void testUpdateTeam_MembersIdsEmpty() {
        Organization organization = BuildInstances.buildOrganization();
        User manager = BuildInstances.buildUser();
        Team team = BuildInstances.buildTeam();
        team.setMembers(new ArrayList<>());
        manager.setAssignedTeams(new ArrayList<>());

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
                List.of()
        );
        TeamResponseDto responseDto = BuildDtos.buildTeamResponseDto(updatedTeam);

        when(teamRepository.findById(team.getId())).thenReturn(Optional.of(team));
        when(userRepository.findById(manager.getId())).thenReturn(Optional.of(manager));
        when(userRepository.findAllById(List.of())).thenReturn(new ArrayList<>());
        doNothing().when(teamMapper).updateEntityFromDto(updateDto, team, manager);
        when(teamRepository.save(team)).thenReturn(updatedTeam);
        when(teamMapper.toResponseDto(updatedTeam)).thenReturn(responseDto);

        TeamResponseDto result = teamService.updateTeam(team.getId(), updateDto);

        assertEquals(responseDto, result);
        assertTrue(team.getMembers().contains(manager));
        verify(teamRepository, times(1)).findById(team.getId());
        verify(userRepository, times(1)).findById(manager.getId());
        verify(userRepository, times(1)).findAllById(List.of());
        verify(teamRepository, times(1)).save(team);
        verify(teamMapper, times(1)).toResponseDto(updatedTeam);
    }

    @Test
    void testUpdateTeam_TeamNotFound() {
        TeamUpdateDto updateDto = new TeamUpdateDto(
                "Echipa 1 actualizata",
                "Descriere 1",
                1,
                null
        );

        when(teamRepository.findById(1)).thenReturn(Optional.empty());

        NotFoundException exception = assertThrows(NotFoundException.class,
                () -> teamService.updateTeam(1, updateDto));

        assertEquals("Team with id 1 not found", exception.getMessage());
    }

    @Test
    void testUpdateTeam_ManagerNotFound() {
        Team team = BuildInstances.buildTeam();
        TeamUpdateDto updateDto = new TeamUpdateDto(
                "Echipa 1 actualizat",
                "Descriere 1",
                1,
                null
        );

        when(teamRepository.findById(1)).thenReturn(Optional.of(team));
        when(userRepository.findById(1)).thenReturn(Optional.empty());

        NotFoundException exception = assertThrows(NotFoundException.class,
                () -> teamService.updateTeam(1, updateDto));

        assertEquals("Manager with id 1 not found", exception.getMessage());
    }

    @Test
    void testUpdateTeam_MembersNotFound() {
        Team team = BuildInstances.buildTeam();
        User user = BuildInstances.buildUser();
        List<Integer> memberIds = List.of(1, 2);
        TeamUpdateDto updateDto = new TeamUpdateDto(
                "Echipa 1 actualizata",
                "Descriere 1",
                null,
                memberIds
        );

        when(teamRepository.findById(team.getId())).thenReturn(Optional.of(team));
        when(userRepository.findAllById(memberIds)).thenReturn(List.of(user));

        NotFoundException exception = assertThrows(NotFoundException.class,
                () -> teamService.updateTeam(team.getId(), updateDto));

        assertEquals("One or more users were not found", exception.getMessage());
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
    void testDeleteTeam_WithMembersAndProjects() {
        Team team = BuildInstances.buildTeam();
        List<User> members = BuildInstances.buildUsers();
        List<Project> projects = BuildInstances.buildProjects();

        members.forEach(m -> m.getAssignedTeams().add(team));
        projects.forEach(p -> p.getTeams().add(team));
        team.setMembers(new ArrayList<>(members));
        team.setProjects(new ArrayList<>(projects));
        team.getManager().getManagedTeams().add(team);

        when(teamRepository.findById(team.getId())).thenReturn(Optional.of(team));

        teamService.deleteTeam(team.getId());

        assertFalse(team.getManager().getManagedTeams().contains(team));
        members.forEach(m -> assertFalse(m.getAssignedTeams().contains(team)));
        projects.forEach(p -> assertFalse(p.getTeams().contains(team)));
        verify(teamRepository, times(1)).findById(team.getId());
        verify(teamRepository, times(1)).deleteById(team.getId());
    }

    @Test
    void testDeleteTeam_NotFound() {
        when(teamRepository.findById(1)).thenReturn(Optional.empty());

        teamService.deleteTeam(1);

        verify(teamRepository, never()).deleteById(any());
    }
}