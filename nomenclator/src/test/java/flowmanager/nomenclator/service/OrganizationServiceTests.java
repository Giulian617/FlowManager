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

import static org.junit.jupiter.api.Assertions.*;
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
    private ProjectService projectService;

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
        List<User> members = BuildInstances.buildUsers();
        List<UserSummaryDto> membersDto = members.stream()
                .map(BuildDtos::buildUserSummaryDto)
                .toList();
        organization.setMembers(members);

        when(organizationRepository.findById(organization.getId())).thenReturn(Optional.of(organization));
        when(userMapper.toSummaryDto(members.get(0))).thenReturn(membersDto.get(0));
        when(userMapper.toSummaryDto(members.get(1))).thenReturn(membersDto.get(1));

        List<UserSummaryDto> result = organizationService.findAllUsersByOrganizationId(organization.getId(), null);

        assertEquals(2, result.size());
        assertEquals(membersDto.get(0), result.get(0));
        assertEquals(membersDto.get(1), result.get(1));
        verify(organizationRepository, times(1)).findById(organization.getId());
        verify(userMapper, times(1)).toSummaryDto(members.get(0));
        verify(userMapper, times(1)).toSummaryDto(members.get(1));
    }

    @Test
    void testFindAllUsersByOrganizationId_WithRole() {
        Organization organization = BuildInstances.buildOrganization();
        List<User> members = BuildInstances.buildUsers();
        List<UserSummaryDto> membersDto = members.stream()
                .map(BuildDtos::buildUserSummaryDto)
                .toList();
        organization.setMembers(members);

        when(organizationRepository.findById(organization.getId())).thenReturn(Optional.of(organization));
        when(userMapper.toSummaryDto(members.getFirst())).thenReturn(membersDto.getFirst());

        List<UserSummaryDto> result = organizationService.findAllUsersByOrganizationId(organization.getId(), Role.MANAGER);

        assertEquals(1, result.size());
        assertEquals(membersDto.getFirst(), result.getFirst());
        verify(organizationRepository, times(1)).findById(organization.getId());
        verify(userMapper, times(1)).toSummaryDto(members.get(0));
        verify(userMapper, never()).toSummaryDto(members.get(1));
    }

    @Test
    void testFindAllUsersByOrganizationId_Empty() {
        Organization organization = BuildInstances.buildOrganization();
        organization.setMembers(List.of());

        when(organizationRepository.findById(organization.getId())).thenReturn(Optional.of(organization));

        List<UserSummaryDto> result = organizationService.findAllUsersByOrganizationId(organization.getId(), null);

        assertEquals(0, result.size());
        verify(organizationRepository, times(1)).findById(organization.getId());
        verify(userMapper, never()).toSummaryDto(any());
    }

    @Test
    void testFindAllUsersByOrganizationId_NotFound() {
        when(organizationRepository.findById(1)).thenReturn(Optional.empty());

        NotFoundException exception = assertThrows(NotFoundException.class,
                () -> organizationService.findAllUsersByOrganizationId(1, null));

        assertEquals("Organization with id 1 not found", exception.getMessage());
    }

    @Test
    void testFindAllProjectsByOrganizationId_Valid() {
        Organization organization = BuildInstances.buildOrganization();
        List<Project> projects = BuildInstances.buildProjects();
        List<ProjectResponseDto> projectsDto = projects.stream()
                .map(BuildDtos::buildProjectResponseDto)
                .toList();
        organization.setProjects(projects);

        when(organizationRepository.findById(organization.getId())).thenReturn(Optional.of(organization));
        when(projectMapper.toResponseDto(projects.get(0))).thenReturn(projectsDto.get(0));
        when(projectMapper.toResponseDto(projects.get(1))).thenReturn(projectsDto.get(1));

        List<ProjectResponseDto> result = organizationService.findAllProjectsByOrganizationId(organization.getId());

        assertEquals(2, result.size());
        assertEquals(projectsDto.get(0), result.get(0));
        assertEquals(projectsDto.get(1), result.get(1));
        verify(organizationRepository, times(1)).findById(organization.getId());
        verify(projectMapper, times(1)).toResponseDto(projects.get(0));
        verify(projectMapper, times(1)).toResponseDto(projects.get(1));
    }

    @Test
    void testFindAllProjectsByOrganizationId_Empty() {
        Organization organization = BuildInstances.buildOrganization();
        organization.setProjects(List.of());

        when(organizationRepository.findById(organization.getId())).thenReturn(Optional.of(organization));

        List<ProjectResponseDto> result = organizationService.findAllProjectsByOrganizationId(organization.getId());

        assertEquals(0, result.size());
        verify(organizationRepository, times(1)).findById(organization.getId());
        verify(projectMapper, never()).toResponseDto(any());
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
        List<Project> projects = BuildInstances.buildProjects();
        List<WorkItem> workItems = BuildInstances.buildWorkItems();
        List<WorkItemSummaryDto> workItemsDto = workItems.stream()
                .map(BuildDtos::buildWorkItemSummaryDto)
                .toList();
        projects.get(0).setWorkItems(List.of(workItems.get(0)));
        projects.get(1).setWorkItems(List.of(workItems.get(1)));
        organization.setProjects(projects);

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
        List<Project> projects = BuildInstances.buildProjects();
        WorkItem workItem = BuildInstances.buildWorkItem();
        WorkItemSummaryDto workItemDto = BuildDtos.buildWorkItemSummaryDto(workItem);
        projects.get(0).setWorkItems(List.of(workItem));
        projects.get(1).setWorkItems(List.of(workItem));
        organization.setProjects(projects);

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
        List<Project> projects = BuildInstances.buildProjects();
        projects.get(0).setWorkItems(List.of());
        projects.get(1).setWorkItems(List.of());
        organization.setProjects(projects);

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
    void testCreateOrganization_Valid_ManagerIsAlsoMember() {
        List<User> users = BuildInstances.buildUsers();
        User manager = users.getFirst();

        Organization organization = Organization.builder()
                .name("Organizatia 1")
                .description("Descriere 1")
                .industry("IT")
                .createdAt(LocalDateTime.of(2026, 5, 1, 15, 23, 30))
                .manager(manager)
                .members(new ArrayList<>())
                .build();

        Organization savedOrganization = BuildInstances.buildOrganization();
        OrganizationCreateDto createDto = new OrganizationCreateDto(
                "Organizatia 1",
                "Descriere 1",
                "IT",
                1,
                List.of(manager.getId())
        );
        OrganizationResponseDto responseDto = BuildDtos.buildOrganizationResponseDto(savedOrganization);

        when(userRepository.findById(manager.getId())).thenReturn(Optional.of(manager));
        when(userRepository.findAllById(List.of(manager.getId()))).thenReturn(List.of(manager));
        when(organizationMapper.toEntity(createDto, manager)).thenReturn(organization);
        when(organizationRepository.save(organization)).thenReturn(savedOrganization);
        when(organizationMapper.toResponseDto(savedOrganization)).thenReturn(responseDto);

        OrganizationResponseDto result = organizationService.createOrganization(createDto);

        assertEquals(responseDto, result);
        assertEquals(1, organization.getMembers().stream()
                .filter(u -> u.equals(manager)).count());
        assertTrue(manager.getMemberOrganizations().contains(organization));
        verify(userRepository, times(1)).findById(manager.getId());
        verify(userRepository, times(1)).findAllById(List.of(manager.getId()));
        verify(organizationMapper, times(1)).toEntity(createDto, manager);
        verify(organizationRepository, times(1)).save(organization);
        verify(organizationMapper, times(1)).toResponseDto(savedOrganization);
    }

    @Test
    void testCreateOrganization_Valid_ManagerAlreadyHasOrganizationInMemberOrganizations() {
        User manager = BuildInstances.buildUser();

        Organization organization = Organization.builder()
                .name("Organizatia 1")
                .description("Descriere 1")
                .industry("IT")
                .createdAt(LocalDateTime.of(2026, 5, 1, 15, 23, 30))
                .manager(manager)
                .members(new ArrayList<>())
                .build();

        manager.getMemberOrganizations().add(organization);

        Organization savedOrganization = BuildInstances.buildOrganization();
        OrganizationCreateDto createDto = new OrganizationCreateDto(
                "Organizatia 1",
                "Descriere 1",
                "IT",
                1,
                List.of()
        );
        OrganizationResponseDto responseDto = BuildDtos.buildOrganizationResponseDto(savedOrganization);

        when(userRepository.findById(manager.getId())).thenReturn(Optional.of(manager));
        when(organizationMapper.toEntity(createDto, manager)).thenReturn(organization);
        when(organizationRepository.save(organization)).thenReturn(savedOrganization);
        when(organizationMapper.toResponseDto(savedOrganization)).thenReturn(responseDto);

        OrganizationResponseDto result = organizationService.createOrganization(createDto);

        assertEquals(responseDto, result);
        assertEquals(1, manager.getMemberOrganizations().stream()
                .filter(o -> o.equals(organization)).count());
        assertEquals(List.of(manager), organization.getMembers());
        verify(userRepository, times(1)).findById(manager.getId());
        verify(userRepository, never()).findAllById(any());
        verify(organizationMapper, times(1)).toEntity(createDto, manager);
        verify(organizationRepository, times(1)).save(organization);
        verify(organizationMapper, times(1)).toResponseDto(savedOrganization);
    }

    @Test
    void testCreateOrganization_Valid_MembersNotIncludingManager() {
        List<User> users = BuildInstances.buildUsers();
        User manager = users.get(0);
        User member = users.get(1);

        Organization organization = Organization.builder()
                .name("Organizatia 1")
                .description("Descriere 1")
                .industry("IT")
                .createdAt(LocalDateTime.of(2026, 5, 1, 15, 23, 30))
                .manager(manager)
                .members(new ArrayList<>())
                .build();

        Organization savedOrganization = BuildInstances.buildOrganization();
        OrganizationCreateDto createDto = new OrganizationCreateDto(
                "Organizatia 1",
                "Descriere 1",
                "IT",
                manager.getId(),
                List.of(member.getId())
        );
        OrganizationResponseDto responseDto = BuildDtos.buildOrganizationResponseDto(savedOrganization);

        when(userRepository.findById(manager.getId())).thenReturn(Optional.of(manager));
        when(userRepository.findAllById(List.of(member.getId()))).thenReturn(List.of(member));
        when(organizationMapper.toEntity(createDto, manager)).thenReturn(organization);
        when(organizationRepository.save(organization)).thenReturn(savedOrganization);
        when(organizationMapper.toResponseDto(savedOrganization)).thenReturn(responseDto);

        OrganizationResponseDto result = organizationService.createOrganization(createDto);

        assertEquals(responseDto, result);
        assertEquals(List.of(manager, member), organization.getMembers());
        assertTrue(manager.getMemberOrganizations().contains(organization));
        assertTrue(member.getMemberOrganizations().contains(organization));
        verify(userRepository, times(1)).findById(manager.getId());
        verify(userRepository, times(1)).findAllById(List.of(member.getId()));
        verify(organizationMapper, times(1)).toEntity(createDto, manager);
        verify(organizationRepository, times(1)).save(organization);
        verify(organizationMapper, times(1)).toResponseDto(savedOrganization);
    }

    @Test
    void testCreateOrganization_Valid_EmptyMembers() {
        User manager = BuildInstances.buildUser();

        Organization organization = Organization.builder()
                .name("Organizatia 1")
                .description("Descriere 1")
                .industry("IT")
                .createdAt(LocalDateTime.of(2026, 5, 1, 15, 23, 30))
                .manager(manager)
                .members(new ArrayList<>())
                .build();
        Organization savedOrganization = BuildInstances.buildOrganization();
        OrganizationCreateDto createDto = new OrganizationCreateDto(
                "Organizatia 1",
                "Descriere 1",
                "IT",
                1,
                List.of()
        );
        OrganizationResponseDto responseDto = BuildDtos.buildOrganizationResponseDto(savedOrganization);

        when(userRepository.findById(manager.getId())).thenReturn(Optional.of(manager));
        when(organizationMapper.toEntity(createDto, manager)).thenReturn(organization);
        when(organizationRepository.save(organization)).thenReturn(savedOrganization);
        when(organizationMapper.toResponseDto(savedOrganization)).thenReturn(responseDto);

        OrganizationResponseDto result = organizationService.createOrganization(createDto);

        assertEquals(responseDto, result);
        assertEquals(List.of(manager), organization.getMembers());
        assertTrue(manager.getMemberOrganizations().contains(organization));
        verify(userRepository, times(1)).findById(manager.getId());
        verify(userRepository, never()).findAllById(any());
        verify(organizationMapper, times(1)).toEntity(createDto, manager);
        verify(organizationRepository, times(1)).save(organization);
        verify(organizationMapper, times(1)).toResponseDto(savedOrganization);
    }

    @Test
    void testCreateOrganization_Valid_NoMembers() {
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
                1,
                null
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
    void testCreateOrganization_MembersNotFound() {
        User manager = BuildInstances.buildUser();
        Organization organization = Organization.builder()
                .name("Organizatia 1")
                .description("Descriere 1")
                .industry("IT")
                .createdAt(LocalDateTime.of(2026, 5, 1, 15, 23, 30))
                .manager(manager)
                .members(new ArrayList<>())
                .build();
        OrganizationCreateDto createDto = new OrganizationCreateDto(
                "Organizatia 1",
                "Descriere 1",
                "IT",
                1,
                List.of(1, 2)
        );

        when(userRepository.findById(manager.getId())).thenReturn(Optional.of(manager));
        when(organizationMapper.toEntity(createDto, manager)).thenReturn(organization);
        when(userRepository.findAllById(List.of(1, 2))).thenReturn(List.of(BuildInstances.buildUser()));

        NotFoundException exception = assertThrows(NotFoundException.class,
                () -> organizationService.createOrganization(createDto));

        assertEquals("One or more users were not found", exception.getMessage());
        verify(userRepository, times(1)).findById(manager.getId());
        verify(userRepository, times(1)).findAllById(List.of(1, 2));
        verify(organizationRepository, never()).save(any());
    }

    @Test
    void testCreateOrganization_UserNotFound() {
        OrganizationCreateDto createDto = new OrganizationCreateDto(
                "Organizatia 1",
                "Descriere 1",
                "IT",
                1,
                null
        );

        when(userRepository.findById(1)).thenReturn(Optional.empty());

        NotFoundException exception = assertThrows(NotFoundException.class,
                () -> organizationService.createOrganization(createDto));

        assertEquals("User with id 1 not found", exception.getMessage());
    }

    @Test
    void testUpdateOrganization_Valid_WithMembers() {
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
        User existingManager = organization.getManager();
        organization.setMembers(new ArrayList<>(users));
        retainedUser.getMemberOrganizations().add(organization);
        removedUser.getMemberOrganizations().add(organization);

        List<Integer> newMemberIds = List.of(retainedUser.getId(), addedUser.getId());
        Organization updatedOrganization = BuildInstances.buildOrganization();
        OrganizationUpdateDto updateDto = new OrganizationUpdateDto(
                "Organizatia 1 actualizata",
                "Descriere 1",
                "IT",
                null,
                newMemberIds
        );
        OrganizationResponseDto responseDto = BuildDtos.buildOrganizationResponseDto(updatedOrganization);

        when(organizationRepository.findById(organization.getId())).thenReturn(Optional.of(organization));
        when(userRepository.findAllById(newMemberIds)).thenReturn(List.of(retainedUser, addedUser));
        doNothing().when(organizationMapper).updateEntityFromDto(updateDto, organization, existingManager);
        when(organizationRepository.save(organization)).thenReturn(updatedOrganization);
        when(organizationMapper.toResponseDto(updatedOrganization)).thenReturn(responseDto);

        OrganizationResponseDto result = organizationService.updateOrganization(organization.getId(), updateDto);

        assertEquals(responseDto, result);
        assertFalse(removedUser.getMemberOrganizations().contains(organization));
        assertTrue(retainedUser.getMemberOrganizations().contains(organization));
        assertEquals(1, retainedUser.getMemberOrganizations().stream()
                .filter(o -> o.equals(organization)).count());
        assertTrue(addedUser.getMemberOrganizations().contains(organization));
        assertEquals(List.of(retainedUser, addedUser), organization.getMembers());
        verify(organizationRepository, times(1)).findById(organization.getId());
        verify(userRepository, never()).findById(any());
        verify(userRepository, times(1)).findAllById(newMemberIds);
        verify(organizationMapper, times(1)).updateEntityFromDto(updateDto, organization, existingManager);
        verify(organizationRepository, times(1)).save(organization);
        verify(organizationMapper, times(1)).toResponseDto(updatedOrganization);
    }

    @Test
    void testUpdateOrganization_Valid_MemberAlreadyInOrganization() {
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
        User existingManager = organization.getManager();
        organization.setMembers(new ArrayList<>(users));
        retainedUser.getMemberOrganizations().add(organization);
        removedUser.getMemberOrganizations().add(organization);

        List<Integer> newMemberIds = List.of(retainedUser.getId(), addedUser.getId());
        Organization updatedOrganization = BuildInstances.buildOrganization();
        OrganizationUpdateDto updateDto = new OrganizationUpdateDto(
                "Organizatia 1 actualizata",
                "Descriere 1",
                "IT",
                null,
                newMemberIds
        );
        OrganizationResponseDto responseDto = BuildDtos.buildOrganizationResponseDto(updatedOrganization);

        when(organizationRepository.findById(organization.getId())).thenReturn(Optional.of(organization));
        when(userRepository.findAllById(newMemberIds)).thenReturn(List.of(retainedUser, addedUser));
        doNothing().when(organizationMapper).updateEntityFromDto(updateDto, organization, existingManager);
        when(organizationRepository.save(organization)).thenReturn(updatedOrganization);
        when(organizationMapper.toResponseDto(updatedOrganization)).thenReturn(responseDto);

        OrganizationResponseDto result = organizationService.updateOrganization(organization.getId(), updateDto);

        assertEquals(responseDto, result);
        assertFalse(removedUser.getMemberOrganizations().contains(organization));
        assertEquals(1, retainedUser.getMemberOrganizations().stream()
                .filter(o -> o.equals(organization)).count());
        assertTrue(addedUser.getMemberOrganizations().contains(organization));
        assertEquals(List.of(retainedUser, addedUser), organization.getMembers());
        verify(organizationRepository, times(1)).findById(organization.getId());
        verify(userRepository, never()).findById(any());
        verify(userRepository, times(1)).findAllById(newMemberIds);
        verify(organizationMapper, times(1)).updateEntityFromDto(updateDto, organization, existingManager);
        verify(organizationRepository, times(1)).save(organization);
        verify(organizationMapper, times(1)).toResponseDto(updatedOrganization);
    }

    @Test
    void testUpdateOrganization_Valid_EmptyMembers() {
        List<User> users = BuildInstances.buildUsers();
        Organization otherOrganization = BuildInstances.buildOrganizations().get(1);
        users.forEach(u -> u.getMemberOrganizations().add(otherOrganization));

        Organization organization = BuildInstances.buildOrganization();
        User existingManager = organization.getManager();
        organization.setMembers(new ArrayList<>(users));
        users.forEach(u -> u.getMemberOrganizations().add(organization));

        Organization updatedOrganization = BuildInstances.buildOrganization();
        OrganizationUpdateDto updateDto = new OrganizationUpdateDto(
                "Organizatia 1 actualizata",
                "Descriere 1",
                "IT",
                null,
                List.of()
        );
        OrganizationResponseDto responseDto = BuildDtos.buildOrganizationResponseDto(updatedOrganization);

        when(organizationRepository.findById(organization.getId())).thenReturn(Optional.of(organization));
        when(userRepository.findAllById(List.of())).thenReturn(List.of());
        doNothing().when(organizationMapper).updateEntityFromDto(updateDto, organization, existingManager);
        when(organizationRepository.save(organization)).thenReturn(updatedOrganization);
        when(organizationMapper.toResponseDto(updatedOrganization)).thenReturn(responseDto);

        OrganizationResponseDto result = organizationService.updateOrganization(organization.getId(), updateDto);

        assertEquals(responseDto, result);
        users.forEach(u -> assertFalse(u.getMemberOrganizations().contains(organization)));
        assertEquals(List.of(), organization.getMembers());
        verify(organizationRepository, times(1)).findById(organization.getId());
        verify(userRepository, never()).findById(any());
        verify(userRepository, times(1)).findAllById(List.of());
        verify(organizationMapper, times(1)).updateEntityFromDto(updateDto, organization, existingManager);
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
                null,
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
    void testUpdateOrganization_MembersIdsNull() {
        Organization organization = BuildInstances.buildOrganization();
        List<User> existingMembers = BuildInstances.buildUsers();
        existingMembers.forEach(u -> u.getMemberOrganizations().add(organization));
        organization.setMembers(new ArrayList<>(existingMembers));

        OrganizationUpdateDto updateDto = new OrganizationUpdateDto(
                "Organizatia 1 actualizata",
                "Descriere 1",
                "IT",
                null,
                null
        );
        Organization updatedOrganization = BuildInstances.buildOrganization();
        OrganizationResponseDto responseDto = BuildDtos.buildOrganizationResponseDto(updatedOrganization);

        when(organizationRepository.findById(organization.getId())).thenReturn(Optional.of(organization));
        doNothing().when(organizationMapper).updateEntityFromDto(updateDto, organization, organization.getManager());
        when(organizationRepository.save(organization)).thenReturn(updatedOrganization);
        when(organizationMapper.toResponseDto(updatedOrganization)).thenReturn(responseDto);

        OrganizationResponseDto result = organizationService.updateOrganization(organization.getId(), updateDto);

        assertEquals(responseDto, result);
        existingMembers.forEach(u -> assertTrue(u.getMemberOrganizations().contains(organization)));
        assertEquals(existingMembers, organization.getMembers());
        verify(userRepository, never()).findAllById(any());
        verify(organizationRepository, times(1)).save(organization);
    }

    @Test
    void testUpdateOrganization_MembersNotFound() {
        Organization organization = BuildInstances.buildOrganization();
        organization.setMembers(new ArrayList<>());

        OrganizationUpdateDto updateDto = new OrganizationUpdateDto(
                "Organizatia 1 actualizata",
                "Descriere 1",
                "IT",
                null,
                List.of(1)
        );

        when(organizationRepository.findById(organization.getId())).thenReturn(Optional.of(organization));
        when(userRepository.findAllById(List.of(1))).thenReturn(List.of());

        NotFoundException exception = assertThrows(NotFoundException.class,
                () -> organizationService.updateOrganization(organization.getId(), updateDto));

        assertEquals("One or more users were not found", exception.getMessage());
        verify(organizationRepository, times(1)).findById(organization.getId());
        verify(userRepository, times(1)).findAllById(List.of(1));
        verify(organizationRepository, never()).save(any());
    }

    @Test
    void testUpdateOrganization_ManagerNotFound() {
        Organization organization = BuildInstances.buildOrganization();
        OrganizationUpdateDto updateDto = new OrganizationUpdateDto(
                "Organizatia 1 actualizata",
                "Descriere",
                "IT",
                1,
                null
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
                1,
                null
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
        List<Project> projects = BuildInstances.buildProjects();
        List<User> members =  BuildInstances.buildUsers();
        organization.setTeams(teams);
        organization.setProjects(projects);

        members.forEach(u -> u.getMemberOrganizations().add(organization));
        organization.setMembers(members);

        when(organizationRepository.findById(organization.getId())).thenReturn(Optional.of(organization));
        teams.forEach(t -> doNothing().when(teamService).deleteTeam(t.getId()));
        projects.forEach(p -> doNothing().when(projectService).deleteProject(p.getId()));
        doNothing().when(organizationRepository).deleteById(organization.getId());

        organizationService.deleteOrganization(organization.getId());

        members.forEach(u -> assertFalse(u.getMemberOrganizations().contains(organization)));
        verify(organizationRepository, times(1)).findById(organization.getId());
        teams.forEach(t -> verify(teamService).deleteTeam(t.getId()));
        projects.forEach(p -> verify(projectService).deleteProject(p.getId()));
        verify(organizationRepository, times(1)).deleteById(organization.getId());
    }

    @Test
    void testDeleteOrganization_NotFound() {
        when(organizationRepository.findById(1)).thenReturn(Optional.empty());

        organizationService.deleteOrganization(1);

        verify(organizationRepository, times(1)).findById(1);
        verify(teamService, never()).deleteTeam(any());
        verify(projectService, never()).deleteProject(any());
        verify(organizationRepository, never()).deleteById(any());
    }
}
