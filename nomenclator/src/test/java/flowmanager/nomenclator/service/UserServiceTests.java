package flowmanager.nomenclator.service;

import flowmanager.nomenclator.dto.*;
import flowmanager.nomenclator.exception.DuplicateAttributeException;
import flowmanager.nomenclator.exception.NotFoundException;
import flowmanager.nomenclator.mapper.*;
import flowmanager.nomenclator.model.*;
import flowmanager.nomenclator.repository.CommentRepository;
import flowmanager.nomenclator.repository.OrganizationRepository;
import flowmanager.nomenclator.repository.UserRepository;
import flowmanager.nomenclator.security.KeycloakAdminService;
import flowmanager.nomenclator.utils.BuildDtos;
import flowmanager.nomenclator.utils.BuildInstances;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentMatchers;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

public class UserServiceTests {
    @Mock
    private UserRepository userRepository;

    @Mock
    private CommentRepository commentRepository;

    @Mock
    private OrganizationRepository organizationRepository;

    @Mock
    private UserMapper userMapper;

    @Mock
    private CommentMapper commentMapper;

    @Mock
    private ProjectMapper projectMapper;

    @Mock
    private OrganizationMapper organizationMapper;

    @Mock
    private TeamMapper teamMapper;

    @Mock
    private WorkItemMapper workItemMapper;

    @Mock
    private WorkItemService workItemService;

    @Mock
    private ProjectService projectService;

    @Mock
    private TeamService teamService;

    @Mock
    private OrganizationService organizationService;

    @Mock
    private KeycloakAdminService keycloakAdminService;

    @InjectMocks
    private UserService userService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testFindAllUsers_NoRoleFilter() {
        List<User> users = BuildInstances.buildUsers();
        List<UserResponseDto> usersDto = users.stream()
                .map(BuildDtos::buildUserResponseDto)
                .toList();

        when(userRepository.findAll(ArgumentMatchers.<Specification<User>>any())).thenReturn(users);
        when(userMapper.toResponseDto(users.get(0))).thenReturn(usersDto.get(0));
        when(userMapper.toResponseDto(users.get(1))).thenReturn(usersDto.get(1));

        List<UserResponseDto> result = userService.findAllUsers(null);

        assertEquals(2, result.size());
        assertEquals(usersDto.get(0), result.get(0));
        assertEquals(usersDto.get(1), result.get(1));
        verify(userRepository, times(1)).findAll(ArgumentMatchers.<Specification<User>>any());
        verify(userMapper, times(1)).toResponseDto(users.get(0));
        verify(userMapper, times(1)).toResponseDto(users.get(1));
    }

    @Test
    void testFindAllUsers_WithRoleFilter() {
        List<User> users = BuildInstances.buildUsers();
        List<UserResponseDto> usersDto = users.stream()
                .map(BuildDtos::buildUserResponseDto)
                .toList();

        when(userRepository.findAll(ArgumentMatchers.<Specification<User>>any())).thenReturn(List.of(users.getFirst()));
        when(userMapper.toResponseDto(users.getFirst())).thenReturn(usersDto.getFirst());

        List<UserResponseDto> result = userService.findAllUsers(Role.MANAGER);

        assertEquals(1, result.size());
        assertEquals(usersDto.getFirst(), result.getFirst());
        verify(userRepository, times(1)).findAll(ArgumentMatchers.<Specification<User>>any());
        verify(userMapper, times(1)).toResponseDto(users.get(0));
        verify(userMapper, never()).toResponseDto(users.get(1));
    }

    @Test
    void testFindAllUsers_EmptyList() {
        when(userRepository.findAll(ArgumentMatchers.<Specification<User>>any())).thenReturn(List.of());

        List<UserResponseDto> result = userService.findAllUsers(null);

        assertEquals(0, result.size());
        verify(userRepository, times(1)).findAll(ArgumentMatchers.<Specification<User>>any());
        verify(userMapper, never()).toSummaryDto(any());
    }

    @Test
    void testGetCurrentUser_Valid() {
        User user = BuildInstances.buildUser();
        UserResponseDto responseDto = BuildDtos.buildUserResponseDto(user);

        Authentication auth = mock(Authentication.class);
        Jwt jwt = mock(Jwt.class);

        when(auth.getPrincipal()).thenReturn(jwt);
        when(jwt.getSubject()).thenReturn(user.getKeycloakId());
        when(userRepository.findByKeycloakId(user.getKeycloakId())).thenReturn(Optional.of(user));
        when(userMapper.toResponseDto(user)).thenReturn(responseDto);

        UserResponseDto result = userService.getCurrentUser(auth);

        assertEquals(responseDto, result);
        verify(userRepository, times(1)).findByKeycloakId(user.getKeycloakId());
        verify(userMapper, times(1)).toResponseDto(user);
    }

    @Test
    void testGetCurrentUser_UserNotFound() {
        User user = BuildInstances.buildUser();

        Authentication auth = mock(Authentication.class);
        Jwt jwt = mock(Jwt.class);

        when(auth.getPrincipal()).thenReturn(jwt);
        when(jwt.getSubject()).thenReturn(user.getKeycloakId());
        when(userRepository.findByKeycloakId(user.getKeycloakId())).thenReturn(Optional.empty());

        NotFoundException exception = assertThrows(NotFoundException.class,
                () -> userService.getCurrentUser(auth));

        assertEquals("User not found", exception.getMessage());
        verify(userRepository, times(1)).findByKeycloakId(user.getKeycloakId());
        verify(userMapper, never()).toSummaryDto(any());
    }

    @Test
    void findAllCommentsByUserId_Valid() {
        User user = BuildInstances.buildUser();
        List<Comment> comments = BuildInstances.buildComments();
        List<CommentResponseUserDto> commentsDto = comments.stream()
                .map(BuildDtos::buildCommentResponseUserDto)
                .toList();
        user.setComments(comments);

        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));
        when(commentMapper.toResponseUserDto(comments.get(0))).thenReturn(commentsDto.get(0));
        when(commentMapper.toResponseUserDto(comments.get(1))).thenReturn(commentsDto.get(1));

        List<CommentResponseUserDto> result = userService.findAllCommentsByUserId(1);

        assertEquals(2, result.size());
        assertEquals(commentsDto.get(0), result.get(0));
        assertEquals(commentsDto.get(1), result.get(1));
        verify(userRepository, times(1)).findById(user.getId());
        verify(commentMapper, times(1)).toResponseUserDto(comments.get(0));
        verify(commentMapper, times(1)).toResponseUserDto(comments.get(1));
    }

    @Test
    void testFindAllCommentsByUserId_UserNotFound() {
        when(userRepository.findById(1)).thenReturn(Optional.empty());

        NotFoundException exception = assertThrows(NotFoundException.class,
                () -> userService.findAllCommentsByUserId(1));

        assertEquals("User with id 1 not found", exception.getMessage());
    }

    @Test
    void findAllManagedProjectsByUserId_Valid() {
        User user = BuildInstances.buildUser();
        List<Project> projects = BuildInstances.buildProjects();
        List<ProjectResponseDto> projectsDto = projects.stream()
                .map(BuildDtos::buildProjectResponseDto)
                .toList();
        user.setProjects(projects);

        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));
        when(projectMapper.toResponseDto(projects.get(0))).thenReturn(projectsDto.get(0));
        when(projectMapper.toResponseDto(projects.get(1))).thenReturn(projectsDto.get(1));

        List<ProjectResponseDto> result = userService.findAllManagedProjectsByUserId(1);

        assertEquals(2, result.size());
        assertEquals(projectsDto.get(0), result.get(0));
        assertEquals(projectsDto.get(1), result.get(1));
        verify(userRepository, times(1)).findById(user.getId());
        verify(projectMapper, times(1)).toResponseDto(projects.get(0));
        verify(projectMapper, times(1)).toResponseDto(projects.get(1));
    }

    @Test
    void testFindAllManagedProjectsByUserId_UserNotFound() {
        when(userRepository.findById(1)).thenReturn(Optional.empty());

        NotFoundException exception = assertThrows(NotFoundException.class,
                () -> userService.findAllManagedProjectsByUserId(1));

        assertEquals("User with id 1 not found", exception.getMessage());
    }

    @Test
    void findAllAssignedProjectsByUserId_Valid() {
        User user = BuildInstances.buildUser();
        List<Project> projects = BuildInstances.buildProjects();
        List<ProjectResponseDto> projectsDto = projects.stream()
                .map(BuildDtos::buildProjectResponseDto)
                .toList();

        Team team = new Team();
        team.setProjects(projects);
        user.setAssignedTeams(List.of(team));

        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));
        when(projectMapper.toResponseDto(projects.get(0))).thenReturn(projectsDto.get(0));
        when(projectMapper.toResponseDto(projects.get(1))).thenReturn(projectsDto.get(1));

        List<ProjectResponseDto> result = userService.findAllAssignedProjectsByUserId(user.getId());

        assertEquals(2, result.size());
        assertEquals(projectsDto.get(0), result.get(0));
        assertEquals(projectsDto.get(1), result.get(1));
        verify(userRepository, times(1)).findById(user.getId());
        verify(projectMapper, times(1)).toResponseDto(projects.get(0));
        verify(projectMapper, times(1)).toResponseDto(projects.get(1));
    }

    @Test
    void findAllAssignedProjects_UserNotFound() {
        when(userRepository.findById(1)).thenReturn(Optional.empty());

        NotFoundException exception = assertThrows(NotFoundException.class,
                () -> userService.findAllAssignedProjectsByUserId(1));

        assertEquals("User with id 1 not found", exception.getMessage());
    }

    @Test
    void findAllAssignedProjects_NoTeams() {
        User user = BuildInstances.buildUser();
        user.setAssignedTeams(List.of());

        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));

        List<ProjectResponseDto> result = userService.findAllAssignedProjectsByUserId(user.getId());

        assertEquals(0, result.size());
        verify(userRepository, times(1)).findById(user.getId());
        verify(projectMapper, never()).toResponseDto(any());
    }

    @Test
    void findAllAssignedProjects_TeamWithNoProjects() {
        User user = BuildInstances.buildUser();
        Team team = new Team();
        team.setProjects(List.of());
        user.setAssignedTeams(List.of(team));

        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));

        List<ProjectResponseDto> result = userService.findAllAssignedProjectsByUserId(user.getId());

        assertEquals(0, result.size());
        verify(userRepository, times(1)).findById(user.getId());
        verify(projectMapper, never()).toResponseDto(any());
    }

    @Test
    void findAllManagedOrganizationsByUserId_Valid() {
        User user = BuildInstances.buildUser();
        List<Organization> organizations = BuildInstances.buildOrganizations();
        List<OrganizationSummaryDto> organizationsDto = organizations.stream()
                .map(BuildDtos::buildOrganizationSummaryDto)
                .toList();
        user.setOrganizations(organizations);

        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));
        when(organizationMapper.toSummaryDto(organizations.get(0))).thenReturn(organizationsDto.get(0));
        when(organizationMapper.toSummaryDto(organizations.get(1))).thenReturn(organizationsDto.get(1));

        List<OrganizationSummaryDto> result = userService.findAllManagedOrganizationsByUserId(1);

        assertEquals(2, result.size());
        assertEquals(organizationsDto.get(0), result.get(0));
        assertEquals(organizationsDto.get(1), result.get(1));
        verify(userRepository, times(1)).findById(user.getId());
        verify(organizationMapper, times(1)).toSummaryDto(organizations.get(0));
        verify(organizationMapper, times(1)).toSummaryDto(organizations.get(1));
    }

    @Test
    void testFindAllManagedOrganizationsByUserId_UserNotFound() {
        when(userRepository.findById(1)).thenReturn(Optional.empty());

        NotFoundException exception = assertThrows(NotFoundException.class,
                () -> userService.findAllManagedOrganizationsByUserId(1));

        assertEquals("User with id 1 not found", exception.getMessage());
    }

    @Test
    void testFindAllAssignedOrganizationsByUserId_Valid() {
        User user = BuildInstances.buildUser();

        List<Organization> orgs = BuildInstances.buildOrganizations();
        Organization managedOrg = orgs.get(0);
        Organization memberOrg = orgs.get(1);

        List<OrganizationSummaryDto> orgsDto = orgs.stream()
                .map(BuildDtos::buildOrganizationSummaryDto)
                .toList();

        user.setOrganizations(List.of(managedOrg));
        user.setMemberOrganizations(List.of(memberOrg));

        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));
        when(organizationMapper.toSummaryDto(managedOrg)).thenReturn(orgsDto.get(0));
        when(organizationMapper.toSummaryDto(memberOrg)).thenReturn(orgsDto.get(1));

        List<OrganizationSummaryDto> result = userService.findAllMemberOrganizationsByUserId(user.getId());

        assertEquals(2, result.size());
        verify(userRepository, times(1)).findById(user.getId());
        verify(organizationMapper, times(1)).toSummaryDto(managedOrg);
        verify(organizationMapper, times(1)).toSummaryDto(memberOrg);
    }

    @Test
    void testFindAllAssignedOrganizationsByUserId_Distinct() {
        User user = BuildInstances.buildUser();

        List<Organization> orgs = BuildInstances.buildOrganizations();
        Organization managedOrg = orgs.getFirst();

        OrganizationSummaryDto managedOrgDto = BuildDtos.buildOrganizationSummaryDto(managedOrg);

        user.setOrganizations(List.of(managedOrg));
        user.setMemberOrganizations(List.of(managedOrg));

        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));
        when(organizationMapper.toSummaryDto(managedOrg)).thenReturn(managedOrgDto);

        List<OrganizationSummaryDto> result = userService.findAllMemberOrganizationsByUserId(user.getId());

        assertEquals(1, result.size());
        verify(userRepository, times(1)).findById(user.getId());
        verify(organizationMapper, times(1)).toSummaryDto(managedOrg);
    }

    @Test
    void testFindAllAssignedOrganizationsByUserId_UserNotFound() {
        when(userRepository.findById(1)).thenReturn(Optional.empty());

        NotFoundException exception = assertThrows(NotFoundException.class,
                () -> userService.findAllMemberOrganizationsByUserId(1));

        assertEquals("User with id 1 not found", exception.getMessage());

        verify(organizationMapper, never()).toSummaryDto(any());
    }

    @Test
    void testFindAllAssignedOrganizationsByUserId_EmptyLists() {
        User user = BuildInstances.buildUser();

        user.setOrganizations(List.of());
        user.setAssignedTeams(List.of());
        user.setManagedTeams(List.of());

        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));

        List<OrganizationSummaryDto> result =
                userService.findAllMemberOrganizationsByUserId(user.getId());

        assertTrue(result.isEmpty());
        verify(userRepository, times(1)).findById(user.getId());
        verify(organizationMapper, never()).toSummaryDto(any());
    }


    @Test
    void testFindAllManagedTeamsByUserId_Valid() {
        User user = BuildInstances.buildUser();
        List<Team> teams = BuildInstances.buildTeams();
        List<TeamResponseDto> teamsDto = teams.stream()
                .map(BuildDtos::buildTeamResponseDto)
                .toList();
        user.setManagedTeams(teams);

        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));
        when(teamMapper.toResponseDto(teams.get(0))).thenReturn(teamsDto.get(0));
        when(teamMapper.toResponseDto(teams.get(1))).thenReturn(teamsDto.get(1));

        List<TeamResponseDto> result = userService.findAllManagedTeamsByUserId(1);

        assertEquals(2, result.size());
        assertEquals(teamsDto.get(0), result.get(0));
        assertEquals(teamsDto.get(1), result.get(1));
        verify(userRepository, times(1)).findById(user.getId());
        verify(teamMapper, times(1)).toResponseDto(teams.get(0));
        verify(teamMapper, times(1)).toResponseDto(teams.get(1));
    }

    @Test
    void testFindAllManagedTeamsByUserId_UserNotFound() {
        when(userRepository.findById(1)).thenReturn(Optional.empty());

        NotFoundException exception = assertThrows(NotFoundException.class,
                () -> userService.findAllManagedTeamsByUserId(1));

        assertEquals("User with id 1 not found", exception.getMessage());
    }

    @Test
    void testFindAllAssignedTeamsByUserId_Valid() {
        User user = BuildInstances.buildUser();
        List<Team> teams = BuildInstances.buildTeams();
        List<TeamResponseDto> teamsDto = teams.stream()
                .map(BuildDtos::buildTeamResponseDto)
                .toList();
        user.setAssignedTeams(teams);

        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));
        when(teamMapper.toResponseDto(teams.get(0))).thenReturn(teamsDto.get(0));
        when(teamMapper.toResponseDto(teams.get(1))).thenReturn(teamsDto.get(1));

        List<TeamResponseDto> result = userService.findAllAssignedTeamsByUserId(1);

        assertEquals(2, result.size());
        assertEquals(teamsDto.get(0), result.get(0));
        assertEquals(teamsDto.get(1), result.get(1));
        verify(userRepository, times(1)).findById(user.getId());
        verify(teamMapper, times(1)).toResponseDto(teams.get(0));
        verify(teamMapper, times(1)).toResponseDto(teams.get(1));
    }

    @Test
    void testFindAllAssignedTeamsByUserId_UserNotFound() {
        when(userRepository.findById(1)).thenReturn(Optional.empty());

        NotFoundException exception = assertThrows(NotFoundException.class,
                () -> userService.findAllAssignedTeamsByUserId(1));

        assertEquals("User with id 1 not found", exception.getMessage());
    }

    @Test
    void testFindAllReportedWorkItemsByUserId_Valid() {
        User user = BuildInstances.buildUser();
        List<WorkItem> workItems = BuildInstances.buildWorkItems();
        List<WorkItemSummaryDto> workItemsDto = workItems.stream()
                .map(BuildDtos::buildWorkItemSummaryDto)
                .toList();
        user.setReportedWorkItems(workItems);

        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));
        when(workItemMapper.toSummaryDto(workItems.get(0))).thenReturn(workItemsDto.get(0));
        when(workItemMapper.toSummaryDto(workItems.get(1))).thenReturn(workItemsDto.get(1));

        List<WorkItemSummaryDto> result = userService.findAllReportedWorkItemsByUserId(1);

        assertEquals(2, result.size());
        assertEquals(workItemsDto.get(0), result.get(0));
        assertEquals(workItemsDto.get(1), result.get(1));
        verify(userRepository, times(1)).findById(user.getId());
        verify(workItemMapper, times(1)).toSummaryDto(workItems.get(0));
        verify(workItemMapper, times(1)).toSummaryDto(workItems.get(1));
    }

    @Test
    void testFindAllReportedWorkItemsByUserId_UserNotFound() {
        when(userRepository.findById(1)).thenReturn(Optional.empty());

        NotFoundException exception = assertThrows(NotFoundException.class,
                () -> userService.findAllReportedWorkItemsByUserId(1));

        assertEquals("User with id 1 not found", exception.getMessage());
    }

    @Test
    void testFindAllAssignedWorkItemsByUserId_Valid() {
        User user = BuildInstances.buildUser();
        List<WorkItem> workItems = BuildInstances.buildWorkItems();
        List<WorkItemSummaryDto> workItemsDto = workItems.stream()
                .map(BuildDtos::buildWorkItemSummaryDto)
                .toList();
        user.setAssignedWorkItems(workItems);

        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));
        when(workItemMapper.toSummaryDto(workItems.get(0))).thenReturn(workItemsDto.get(0));
        when(workItemMapper.toSummaryDto(workItems.get(1))).thenReturn(workItemsDto.get(1));

        List<WorkItemSummaryDto> result = userService.findAllAssignedWorkItemsByUserId(1);

        assertEquals(2, result.size());
        assertEquals(workItemsDto.get(0), result.get(0));
        assertEquals(workItemsDto.get(1), result.get(1));
        verify(userRepository, times(1)).findById(user.getId());
        verify(workItemMapper, times(1)).toSummaryDto(workItems.get(0));
        verify(workItemMapper, times(1)).toSummaryDto(workItems.get(1));
    }

    @Test
    void testFindAllAssignedWorkItemsByUserId_UserNotFound() {
        when(userRepository.findById(1)).thenReturn(Optional.empty());

        NotFoundException exception = assertThrows(NotFoundException.class,
                () -> userService.findAllAssignedWorkItemsByUserId(1));

        assertEquals("User with id 1 not found", exception.getMessage());
    }

    @Test
    void testCreateUser_WithoutRole() {
        String keycloakId = "keycloak-uuid-1";
        User user = User.builder()
                .keycloakId(keycloakId)
                .email("user1@example.com")
                .username("User1")
                .firstName("Example")
                .lastName("User")
                .phoneNumber("+407777777777")
                .active(true)
                .createdAt(LocalDateTime.of(2025, 6, 13, 10, 35, 30))
                .build();
        User savedUser = BuildInstances.buildUser();
        UserCreateDto createDto = new UserCreateDto(
                "user1@example.com",
                "password",
                "User1",
                "Example",
                "User",
                "+407777777777",
                Role.USER,
                null
        );
        UserResponseDto responseDto = BuildDtos.buildUserResponseDto(savedUser);


        when(userRepository.existsByEmail(user.getEmail())).thenReturn(false);
        when(userRepository.existsByUsername(user.getUsername())).thenReturn(false);
        when(keycloakAdminService.createUser(createDto)).thenReturn(user.getKeycloakId());
        when(userRepository.existsByKeycloakId(keycloakId)).thenReturn(false);
        doNothing().when(keycloakAdminService).assignRole(keycloakId, Role.USER);
        when(userMapper.toEntity(createDto, keycloakId)).thenReturn(user);
        when(userRepository.save(user)).thenReturn(savedUser);
        when(userMapper.toResponseDto(savedUser)).thenReturn(responseDto);

        UserResponseDto result = userService.createUser(createDto);

        assertEquals(responseDto, result);
        verify(userRepository, times(1)).existsByEmail(user.getEmail());
        verify(userRepository, times(1)).existsByUsername(user.getUsername());
        verify(keycloakAdminService, times(1)).createUser(createDto);
        verify(userRepository, times(1)).existsByKeycloakId(user.getKeycloakId());
        verify(keycloakAdminService, times(1)).assignRole(keycloakId, Role.USER);
        verify(userMapper, times(1)).toEntity(createDto, keycloakId);
        verify(organizationRepository, never()).save(any());
        verify(userRepository, times(1)).save(user);
        verify(userMapper, times(1)).toResponseDto(savedUser);
    }

    @Test
    void testCreateUser_WithRole() {
        String keycloakId = "keycloak-uuid-1";
        User user = User.builder()
                .keycloakId(keycloakId)
                .email("user1@example.com")
                .username("User1")
                .firstName("Example")
                .lastName("User")
                .phoneNumber("+407777777777")
                .role(Role.MANAGER)
                .active(true)
                .createdAt(LocalDateTime.of(2025, 6, 13, 10, 35, 30))
                .build();
        User savedUser = BuildInstances.buildUser();
        UserCreateDto createDto = new UserCreateDto(
                "user1@example.com",
                "password",
                "User1",
                "Example",
                "User",
                "+407777777777",
                Role.MANAGER,
                null
        );
        UserResponseDto responseDto = BuildDtos.buildUserResponseDto(savedUser);

        when(userRepository.existsByEmail(createDto.getEmail())).thenReturn(false);
        when(userRepository.existsByUsername(createDto.getUsername())).thenReturn(false);
        when(keycloakAdminService.createUser(createDto)).thenReturn(keycloakId);
        when(userRepository.existsByKeycloakId(keycloakId)).thenReturn(false);
        doNothing().when(keycloakAdminService).assignRole(keycloakId, Role.MANAGER);
        when(userMapper.toEntity(createDto, keycloakId)).thenReturn(user);
        when(userRepository.save(user)).thenReturn(savedUser);
        when(userMapper.toResponseDto(savedUser)).thenReturn(responseDto);

        UserResponseDto result = userService.createUser(createDto);

        assertEquals(responseDto, result);
        verify(userRepository, times(1)).existsByEmail(user.getEmail());
        verify(userRepository, times(1)).existsByUsername(user.getUsername());
        verify(keycloakAdminService, times(1)).createUser(createDto);
        verify(userRepository, times(1)).existsByKeycloakId(user.getKeycloakId());
        verify(keycloakAdminService, times(1)).assignRole(keycloakId, Role.MANAGER);
        verify(userMapper, times(1)).toEntity(createDto, keycloakId);
        verify(organizationRepository, never()).save(any());
        verify(userRepository, times(1)).save(user);
        verify(userMapper, times(1)).toResponseDto(savedUser);
    }

    @Test
    void testCreateUser_WithOrganization() {
        String keycloakId = "keycloak-uuid-1";
        Organization organization = BuildInstances.buildOrganization();
        User user = User.builder()
                .keycloakId(keycloakId)
                .email("user1@example.com")
                .username("User1")
                .firstName("Example")
                .lastName("User")
                .phoneNumber("+407777777777")
                .active(true)
                .createdAt(LocalDateTime.of(2025, 6, 13, 10, 35, 30))
                .memberOrganizations(new ArrayList<>())
                .build();
        User savedUser = BuildInstances.buildUser();
        UserCreateDto createDto = new UserCreateDto(
                "user1@example.com",
                "password",
                "User1",
                "Example",
                "User",
                "+407777777777",
                Role.USER,
                List.of(organization.getId())
        );
        UserResponseDto responseDto = BuildDtos.buildUserResponseDto(savedUser);

        when(userRepository.existsByEmail(createDto.getEmail())).thenReturn(false);
        when(userRepository.existsByUsername(createDto.getUsername())).thenReturn(false);
        when(keycloakAdminService.createUser(createDto)).thenReturn(keycloakId);
        when(userRepository.existsByKeycloakId(keycloakId)).thenReturn(false);
        doNothing().when(keycloakAdminService).assignRole(keycloakId, Role.USER);
        when(userMapper.toEntity(createDto, keycloakId)).thenReturn(user);
        when(organizationRepository.findAllById(List.of(organization.getId()))).thenReturn(List.of(organization));
        when(organizationRepository.save(organization)).thenReturn(organization);
        when(userRepository.save(user)).thenReturn(savedUser);
        when(userMapper.toResponseDto(savedUser)).thenReturn(responseDto);

        UserResponseDto result = userService.createUser(createDto);

        assertEquals(responseDto, result);
        assertTrue(user.getMemberOrganizations().contains(organization));
        verify(userRepository, times(1)).existsByEmail(user.getEmail());
        verify(userRepository, times(1)).existsByUsername(user.getUsername());
        verify(keycloakAdminService, times(1)).createUser(createDto);
        verify(userRepository, times(1)).existsByKeycloakId(user.getKeycloakId());
        verify(keycloakAdminService, times(1)).assignRole(keycloakId, Role.USER);
        verify(userMapper, times(1)).toEntity(createDto, keycloakId);
        verify(organizationRepository, times(1)).findAllById(List.of(organization.getId()));
        verify(organizationRepository, times(1)).save(organization);
        verify(userRepository, times(1)).save(user);
        verify(userMapper, times(1)).toResponseDto(savedUser);
    }

    @Test
    void testCreateUser_WithExistingOrganization() {
        String keycloakId = "keycloak-uuid-1";

        Organization organization = BuildInstances.buildOrganization();
        organization.setMembers(new ArrayList<>());

        User user = User.builder()
                .keycloakId(keycloakId)
                .email("user1@example.com")
                .username("User1")
                .firstName("Example")
                .lastName("User")
                .phoneNumber("+407777777777")
                .active(true)
                .createdAt(LocalDateTime.of(2025, 6, 13, 10, 35, 30))
                .memberOrganizations(new ArrayList<>(List.of(organization)))
                .build();

        User savedUser = BuildInstances.buildUser();

        UserCreateDto createDto = new UserCreateDto(
                "user1@example.com",
                "password",
                "User1",
                "Example",
                "User",
                "+407777777777",
                Role.USER,
                List.of(organization.getId())
        );

        UserResponseDto responseDto = BuildDtos.buildUserResponseDto(savedUser);

        when(userRepository.existsByEmail(createDto.getEmail())).thenReturn(false);
        when(userRepository.existsByUsername(createDto.getUsername())).thenReturn(false);
        when(keycloakAdminService.createUser(createDto)).thenReturn(keycloakId);
        when(userRepository.existsByKeycloakId(keycloakId)).thenReturn(false);
        doNothing().when(keycloakAdminService).assignRole(keycloakId, Role.USER);
        when(userMapper.toEntity(createDto, keycloakId)).thenReturn(user);
        when(organizationRepository.findAllById(List.of(organization.getId()))).thenReturn(List.of(organization));
        when(organizationRepository.save(organization)).thenReturn(organization);
        when(userRepository.save(user)).thenReturn(savedUser);
        when(userMapper.toResponseDto(savedUser)).thenReturn(responseDto);

        UserResponseDto result = userService.createUser(createDto);

        assertEquals(responseDto, result);
        assertEquals(1, user.getMemberOrganizations().size());
        verify(userRepository, times(1)).existsByEmail(user.getEmail());
        verify(userRepository, times(1)).existsByUsername(user.getUsername());
        verify(keycloakAdminService, times(1)).createUser(createDto);
        verify(userRepository, times(1)).existsByKeycloakId(user.getKeycloakId());
        verify(keycloakAdminService, times(1)).assignRole(keycloakId, Role.USER);
        verify(userMapper, times(1)).toEntity(createDto, keycloakId);
        verify(organizationRepository, times(1)).findAllById(List.of(organization.getId()));
        verify(organizationRepository, times(1)).save(organization);
        verify(userRepository, times(1)).save(user);
        verify(userMapper, times(1)).toResponseDto(savedUser);
    }

    @Test
    void testCreateUser_WithEmptyOrganizationsList() {
        String keycloakId = "keycloak-uuid-1";

        User user = User.builder()
                .keycloakId(keycloakId)
                .email("user1@example.com")
                .username("User1")
                .firstName("Example")
                .lastName("User")
                .phoneNumber("+407777777777")
                .active(true)
                .createdAt(LocalDateTime.of(2025, 6, 13, 10, 35, 30))
                .memberOrganizations(new ArrayList<>())
                .build();
        User savedUser = BuildInstances.buildUser();
        UserCreateDto createDto = new UserCreateDto(
                "user1@example.com",
                "password",
                "User1",
                "Example",
                "User",
                "+407777777777",
                Role.USER,
                List.of()
        );
        UserResponseDto responseDto = BuildDtos.buildUserResponseDto(savedUser);

        when(userRepository.existsByEmail(createDto.getEmail())).thenReturn(false);
        when(userRepository.existsByUsername(createDto.getUsername())).thenReturn(false);
        when(keycloakAdminService.createUser(createDto)).thenReturn(keycloakId);
        when(userRepository.existsByKeycloakId(keycloakId)).thenReturn(false);
        doNothing().when(keycloakAdminService).assignRole(keycloakId, Role.USER);
        when(userMapper.toEntity(createDto, keycloakId)).thenReturn(user);
        when(userRepository.save(user)).thenReturn(savedUser);
        when(userMapper.toResponseDto(savedUser)).thenReturn(responseDto);
        UserResponseDto result = userService.createUser(createDto);

        assertEquals(responseDto, result);

        verify(userRepository, times(1)).existsByEmail(user.getEmail());
        verify(userRepository, times(1)).existsByUsername(user.getUsername());
        verify(keycloakAdminService, times(1)).createUser(createDto);
        verify(userRepository, times(1)).existsByKeycloakId(user.getKeycloakId());
        verify(keycloakAdminService, times(1)).assignRole(keycloakId, Role.USER);
        verify(userMapper, times(1)).toEntity(createDto, keycloakId);
        verify(organizationRepository, never()).findAllById(any());
        verify(organizationRepository, never()).save(any());
        verify(userRepository, times(1)).save(user);
        verify(userMapper, times(1)).toResponseDto(savedUser);

    }

    @Test
    void testCreateUser_OrganizationAlreadyContainsUser() {
        String keycloakId = "keycloak-uuid-1";

        User user = User.builder()
                .keycloakId(keycloakId)
                .email("user1@example.com")
                .username("User1")
                .firstName("Example")
                .lastName("User")
                .phoneNumber("+407777777777")
                .active(true)
                .createdAt(LocalDateTime.of(2025, 6, 13, 10, 35, 30))
                .memberOrganizations(new ArrayList<>())
                .build();

        Organization organization = BuildInstances.buildOrganization();
        organization.setMembers(new ArrayList<>(List.of(user)));

        User savedUser = BuildInstances.buildUser();
        UserCreateDto createDto = new UserCreateDto(
                "user1@example.com",
                "password",
                "User1",
                "Example",
                "User",
                "+407777777777",
                Role.USER,
                List.of(organization.getId())
        );
        UserResponseDto responseDto = BuildDtos.buildUserResponseDto(savedUser);

        when(userRepository.existsByEmail(createDto.getEmail())).thenReturn(false);
        when(userRepository.existsByUsername(createDto.getUsername())).thenReturn(false);
        when(keycloakAdminService.createUser(createDto)).thenReturn(keycloakId);
        when(userRepository.existsByKeycloakId(keycloakId)).thenReturn(false);
        doNothing().when(keycloakAdminService).assignRole(keycloakId, Role.USER);
        when(userMapper.toEntity(createDto, keycloakId)).thenReturn(user);
        when(organizationRepository.findAllById(List.of(organization.getId()))).thenReturn(List.of(organization));
        when(organizationRepository.save(organization)).thenReturn(organization);
        when(userRepository.save(user)).thenReturn(savedUser);
        when(userMapper.toResponseDto(savedUser)).thenReturn(responseDto);

        UserResponseDto result = userService.createUser(createDto);

        assertEquals(responseDto, result);
        assertEquals(1, organization.getMembers().size());

        verify(userRepository, times(1)).existsByEmail(user.getEmail());
        verify(userRepository, times(1)).existsByUsername(user.getUsername());
        verify(keycloakAdminService, times(1)).createUser(createDto);
        verify(userRepository, times(1)).existsByKeycloakId(user.getKeycloakId());
        verify(keycloakAdminService, times(1)).assignRole(keycloakId, Role.USER);
        verify(userMapper, times(1)).toEntity(createDto, keycloakId);
        verify(organizationRepository, times(1)).findAllById(List.of(organization.getId()));
        verify(organizationRepository, times(1)).save(organization);
        verify(userRepository, times(1)).save(user);
        verify(userMapper, times(1)).toResponseDto(savedUser);
    }

    @Test
    void testCreateUser_EmailAlreadyExists() {
        UserCreateDto createDto = new UserCreateDto(
                "user1@example.com",
                "password",
                "User1",
                "Example",
                "User",
                "+407777777777",
                Role.USER,
                null
        );

        when(userRepository.existsByEmail(createDto.getEmail())).thenReturn(true);

        DuplicateAttributeException exception = assertThrows(DuplicateAttributeException.class,
                () -> userService.createUser(createDto));

        assertEquals(String.format("Email %s already exists", createDto.getEmail()), exception.getMessage());
        verify(keycloakAdminService, never()).createUser(any());
    }

    @Test
    void testCreateUser_UsernameAlreadyExists() {
        UserCreateDto createDto = new UserCreateDto(
                "user1@example.com",
                "password",
                "User1",
                "Example",
                "User",
                "+407777777777",
                Role.USER,
                null
        );

        when(userRepository.existsByEmail(createDto.getEmail())).thenReturn(false);
        when(userRepository.existsByUsername(createDto.getUsername())).thenReturn(true);

        DuplicateAttributeException exception = assertThrows(DuplicateAttributeException.class,
                () -> userService.createUser(createDto));

        assertEquals(String.format("Username %s already exists", createDto.getUsername()), exception.getMessage());
        verify(keycloakAdminService, never()).createUser(any());
    }

    @Test
    void testCreateUser_UserAlreadyExists() {
        String keycloakId = "keycloak-uuid-1";
        UserCreateDto createDto = new UserCreateDto(
                "user1@example.com",
                "password",
                "User1",
                "Example",
                "User",
                "+407777777777",
                Role.USER,
                null
        );

        when(userRepository.existsByEmail(createDto.getEmail())).thenReturn(false);
        when(userRepository.existsByUsername(createDto.getUsername())).thenReturn(false);
        when(keycloakAdminService.createUser(createDto)).thenReturn(keycloakId);
        when(userRepository.existsByKeycloakId(keycloakId)).thenReturn(true);

        DuplicateAttributeException exception = assertThrows(DuplicateAttributeException.class,
                () -> userService.createUser(createDto));

        assertEquals("User already registered", exception.getMessage());
        verify(keycloakAdminService, never()).assignRole(any(), any());
    }

    @Test
    void testCreateUser_OrganizationNotFound() {
        String keycloakId = "keycloak-uuid-1";
        User user = User.builder()
                .keycloakId(keycloakId)
                .email("user1@example.com")
                .username("User1")
                .firstName("Example")
                .lastName("User")
                .phoneNumber("+407777777777")
                .active(true)
                .createdAt(LocalDateTime.of(2025, 6, 13, 10, 35, 30))
                .memberOrganizations(new ArrayList<>())
                .build();
        UserCreateDto createDto = new UserCreateDto(
                "user1@example.com",
                "password",
                "User1",
                "Example",
                "User",
                "+407777777777",
                Role.USER,
                List.of(1)
        );

        when(userRepository.existsByEmail(createDto.getEmail())).thenReturn(false);
        when(userRepository.existsByUsername(createDto.getUsername())).thenReturn(false);
        when(keycloakAdminService.createUser(createDto)).thenReturn(keycloakId);
        when(userRepository.existsByKeycloakId(keycloakId)).thenReturn(false);
        doNothing().when(keycloakAdminService).assignRole(keycloakId, Role.USER);
        when(userMapper.toEntity(createDto, keycloakId)).thenReturn(user);
        when(organizationRepository.findAllById(List.of(1))).thenReturn(List.of());

        NotFoundException exception = assertThrows(NotFoundException.class,
                () -> userService.createUser(createDto));

        assertEquals("One or more organizations were not found", exception.getMessage());
        verify(keycloakAdminService, times(1)).deleteUser(keycloakId);
        verify(organizationRepository, never()).saveAll(any());
        verify(userRepository, never()).save(any());
    }

    @Test
    void testUpdateUser_WithoutRole() {
        User user = BuildInstances.buildUser();
        User updatedUser = User.builder()
                .id(1)
                .email("user12@example.com")
                .username("User1 Actualizat")
                .firstName("Example")
                .lastName("User")
                .phoneNumber("+407777777777")
                .active(true)
                .createdAt(LocalDateTime.of(2025, 6, 13, 10, 35, 30))
                .build();
        UserUpdateDto updateDto = new UserUpdateDto(
                "user12@example.com",
                "User1 Actualizat",
                "Example",
                "User",
                "+407777777777",
                null,
                null,
                null
        );
        UserResponseDto responseDto = BuildDtos.buildUserResponseDto(updatedUser);

        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));
        when(userRepository.existsByEmail(updateDto.getEmail())).thenReturn(false);
        when(userRepository.existsByUsername(updateDto.getUsername())).thenReturn(false);
        doNothing().when(userMapper).updateEntityFromDto(updateDto, user);
        when(userRepository.save(user)).thenReturn(updatedUser);
        when(userMapper.toResponseDto(updatedUser)).thenReturn(responseDto);

        UserResponseDto result = userService.updateUser(user.getId(), updateDto);

        assertEquals(responseDto, result);
        verify(userRepository, times(1)).findById(user.getId());
        verify(userRepository, times(1)).existsByEmail(updateDto.getEmail());
        verify(userRepository, times(1)).existsByUsername(updatedUser.getUsername());
        verify(keycloakAdminService, never()).updateUserRole(any(), any());
        verify(userMapper, times(1)).updateEntityFromDto(updateDto, user);
        verify(keycloakAdminService, never()).setUserEnabled(any(), anyBoolean());
        verify(organizationRepository, never()).save(any());
        verify(userRepository, times(1)).save(user);
        verify(userMapper, times(1)).toResponseDto(updatedUser);
    }

    @Test
    void testUpdateUser_WithRole() {
        User user = BuildInstances.buildUser();
        User updatedUser = User.builder()
                .id(1)
                .email(user.getEmail())
                .username(user.getUsername())
                .firstName("Example")
                .lastName("User")
                .phoneNumber("+407777777777")
                .role(Role.MANAGER)
                .active(true)
                .createdAt(LocalDateTime.of(2025, 6, 13, 10, 35, 30))
                .build();
        UserUpdateDto updateDto = new UserUpdateDto(
                null,
                null,
                "Example",
                "User",
                "+407777777777",
                null,
                Role.MANAGER,
                null
        );
        UserResponseDto responseDto = BuildDtos.buildUserResponseDto(updatedUser);

        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));
        doNothing().when(keycloakAdminService).updateUserRole(user.getKeycloakId(), Role.MANAGER);
        doNothing().when(userMapper).updateEntityFromDto(updateDto, user);
        when(userRepository.save(user)).thenReturn(updatedUser);
        when(userMapper.toResponseDto(updatedUser)).thenReturn(responseDto);

        UserResponseDto result = userService.updateUser(user.getId(), updateDto);

        assertEquals(responseDto, result);
        verify(userRepository, times(1)).findById(user.getId());
        verify(userRepository, never()).existsByEmail(any());
        verify(userRepository, never()).existsByUsername(any());
        verify(keycloakAdminService, times(1)).updateUserRole(user.getKeycloakId(), Role.MANAGER);
        verify(userMapper, times(1)).updateEntityFromDto(updateDto, user);
        verify(keycloakAdminService, never()).setUserEnabled(any(), anyBoolean());
        verify(organizationRepository, never()).save(any());
        verify(userRepository, times(1)).save(user);
        verify(userMapper, times(1)).toResponseDto(updatedUser);
    }

    @Test
    void testUpdateUser_WithOrganization() {
        User user = BuildInstances.buildUser();
        user.setMemberOrganizations(new ArrayList<>());
        Organization organization = BuildInstances.buildOrganization();
        User updatedUser = BuildInstances.buildUser();
        UserUpdateDto updateDto = new UserUpdateDto(
                null,
                null,
                "Example",
                "User",
                "+407777777777",
                null,
                null,
                List.of(organization.getId())
        );
        UserResponseDto responseDto = BuildDtos.buildUserResponseDto(updatedUser);

        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));
        doNothing().when(userMapper).updateEntityFromDto(updateDto, user);
        when(organizationRepository.findAllById(List.of(organization.getId()))).thenReturn(List.of(organization));
        when(organizationRepository.saveAll(any())).thenReturn(List.of(organization));
        when(userRepository.save(user)).thenReturn(updatedUser);
        when(userMapper.toResponseDto(updatedUser)).thenReturn(responseDto);

        UserResponseDto result = userService.updateUser(user.getId(), updateDto);

        assertEquals(responseDto, result);
        assertTrue(user.getMemberOrganizations().contains(organization));
        verify(userRepository, times(1)).findById(user.getId());
        verify(userRepository, never()).existsByEmail(any());
        verify(userRepository, never()).existsByUsername(any());
        verify(keycloakAdminService, never()).updateUserRole(any(), any());
        verify(userMapper, times(1)).updateEntityFromDto(updateDto, user);
        verify(keycloakAdminService, never()).setUserEnabled(any(), anyBoolean());
        verify(organizationRepository, times(1)).findAllById(List.of(organization.getId()));
        verify(organizationRepository, times(2)).saveAll(any());
        verify(userRepository, times(1)).save(user);
        verify(userMapper, times(1)).toResponseDto(updatedUser);
    }

    @Test
    void testUpdateUser_WithExistingOrganizationMembership() {
        User user = BuildInstances.buildUser();
        Organization organization = BuildInstances.buildOrganization();
        user.setMemberOrganizations(new ArrayList<>(List.of(organization)));
        organization.setMembers(new ArrayList<>(List.of(user)));

        User updatedUser = BuildInstances.buildUser();
        UserUpdateDto updateDto = new UserUpdateDto(
                null,
                null,
                "Example",
                "User",
                "+407777777777",
                null,
                null,
                List.of(organization.getId())
        );
        UserResponseDto responseDto = BuildDtos.buildUserResponseDto(updatedUser);

        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));
        doNothing().when(userMapper).updateEntityFromDto(updateDto, user);
        when(organizationRepository.findAllById(List.of(organization.getId()))).thenReturn(List.of(organization));
        when(organizationRepository.saveAll(any())).thenReturn(List.of(organization));
        when(userRepository.save(user)).thenReturn(updatedUser);
        when(userMapper.toResponseDto(updatedUser)).thenReturn(responseDto);

        UserResponseDto result = userService.updateUser(user.getId(), updateDto);

        assertEquals(responseDto, result);
        assertEquals(1, user.getMemberOrganizations().size());
        assertEquals(1, organization.getMembers().size());
        verify(userRepository, times(1)).findById(user.getId());
        verify(keycloakAdminService, never()).setUserEnabled(any(), anyBoolean());
        verify(organizationRepository, times(1)).findAllById(List.of(organization.getId()));
        verify(organizationRepository, times(2)).saveAll(any());
        verify(userRepository, times(1)).save(user);
        verify(userMapper, times(1)).toResponseDto(updatedUser);
    }

    @Test
    void testUpdateUser_ActiveFalse() {
        User user = BuildInstances.buildUser();
        User updatedUser = User.builder()
                .id(1)
                .email(user.getEmail())
                .username(user.getUsername())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .phoneNumber(user.getPhoneNumber())
                .active(true)
                .createdAt(LocalDateTime.of(2025, 6, 13, 10, 35, 30))
                .build();
        UserUpdateDto updateDto = new UserUpdateDto(
                null,
                null,
                user.getFirstName(),
                user.getLastName(),
                user.getPhoneNumber(),
                false,
                null,
                null
        );
        UserResponseDto responseDto = BuildDtos.buildUserResponseDto(updatedUser);

        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));
        doNothing().when(keycloakAdminService).setUserEnabled(user.getKeycloakId(), false);
        doNothing().when(userMapper).updateEntityFromDto(updateDto, user);
        when(userRepository.save(user)).thenReturn(updatedUser);
        when(userMapper.toResponseDto(updatedUser)).thenReturn(responseDto);

        UserResponseDto result = userService.updateUser(user.getId(), updateDto);

        assertEquals(responseDto, result);
        verify(keycloakAdminService, times(1)).setUserEnabled(user.getKeycloakId(), false);
        verify(keycloakAdminService, never()).updateUserRole(any(), any());
        verify(userMapper, times(1)).updateEntityFromDto(updateDto, user);
        verify(organizationRepository, never()).save(any());
        verify(userRepository, times(1)).save(user);
        verify(userMapper, times(1)).toResponseDto(updatedUser);
    }

    @Test
    void testUpdateUser_ActiveTrue() {
        User user = BuildInstances.buildUser();
        user.setActive(false);
        User updatedUser = User.builder()
                .id(1)
                .email(user.getEmail())
                .username(user.getUsername())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .phoneNumber(user.getPhoneNumber())
                .active(true)
                .createdAt(LocalDateTime.of(2025, 6, 13, 10, 35, 30))
                .build();
        UserUpdateDto updateDto = new UserUpdateDto(
                null,
                null,
                user.getFirstName(),
                user.getLastName(),
                user.getPhoneNumber(),
                true,
                null,
                null
        );
        UserResponseDto responseDto = BuildDtos.buildUserResponseDto(updatedUser);

        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));
        doNothing().when(keycloakAdminService).setUserEnabled(user.getKeycloakId(), true);
        doNothing().when(userMapper).updateEntityFromDto(updateDto, user);
        when(userRepository.save(user)).thenReturn(updatedUser);
        when(userMapper.toResponseDto(updatedUser)).thenReturn(responseDto);

        UserResponseDto result = userService.updateUser(user.getId(), updateDto);

        assertEquals(responseDto, result);
        verify(keycloakAdminService, times(1)).setUserEnabled(user.getKeycloakId(), true);
        verify(keycloakAdminService, never()).updateUserRole(any(), any());
        verify(userMapper, times(1)).updateEntityFromDto(updateDto, user);
        verify(organizationRepository, never()).save(any());
        verify(userRepository, times(1)).save(user);
        verify(userMapper, times(1)).toResponseDto(updatedUser);
    }

    @Test
    void testUpdateUser_EmailNull() {
        User user = BuildInstances.buildUser();
        User updatedUser = User.builder()
                .id(1)
                .email(null)
                .username("User1")
                .firstName("Example")
                .lastName("User")
                .phoneNumber("+407777777777")
                .active(true)
                .createdAt(LocalDateTime.of(2025, 6, 13, 10, 35, 30))
                .build();
        UserUpdateDto updateDto = new UserUpdateDto(
                null,
                "User1",
                "Example",
                "User",
                "+407777777777",
                null,
                null,
                null
        );
        UserResponseDto responseDto = BuildDtos.buildUserResponseDto(updatedUser);

        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));
        doNothing().when(userMapper).updateEntityFromDto(updateDto, user);
        when(userRepository.save(user)).thenReturn(updatedUser);
        when(userMapper.toResponseDto(updatedUser)).thenReturn(responseDto);

        UserResponseDto result = userService.updateUser(user.getId(), updateDto);

        assertEquals(responseDto, result);
        verify(userRepository, times(1)).findById(user.getId());
        verify(userRepository, never()).existsByEmail(any());
        verify(userRepository, never()).existsByUsername(updatedUser.getUsername());
        verify(keycloakAdminService, never()).updateUserRole(any(), any());
        verify(userMapper, times(1)).updateEntityFromDto(updateDto, user);
        verify(keycloakAdminService, never()).setUserEnabled(any(), anyBoolean());
        verify(organizationRepository, never()).save(any());
        verify(userRepository, times(1)).save(user);
        verify(userMapper, times(1)).toResponseDto(updatedUser);
    }

    @Test
    void testUpdateUser_UsernameNull() {
        User user = BuildInstances.buildUser();
        User updatedUser = User.builder()
                .id(1)
                .email("user12@example.com")
                .username(null)
                .firstName("Example")
                .lastName("User")
                .phoneNumber("+407777777777")
                .active(true)
                .createdAt(LocalDateTime.of(2025, 6, 13, 10, 35, 30))
                .build();
        UserUpdateDto updateDto = new UserUpdateDto(
                "user12@example.com",
                null,
                "Example",
                "User",
                "+407777777777",
                null,
                null,
                null
        );
        UserResponseDto responseDto = BuildDtos.buildUserResponseDto(updatedUser);

        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));
        when(userRepository.existsByEmail(updateDto.getEmail())).thenReturn(false);
        doNothing().when(userMapper).updateEntityFromDto(updateDto, user);
        when(userRepository.save(user)).thenReturn(updatedUser);
        when(userMapper.toResponseDto(updatedUser)).thenReturn(responseDto);

        UserResponseDto result = userService.updateUser(user.getId(), updateDto);

        assertEquals(responseDto, result);
        verify(userRepository, times(1)).findById(user.getId());
        verify(userRepository, times(1)).existsByEmail(updateDto.getEmail());
        verify(userRepository, never()).existsByUsername(any());
        verify(keycloakAdminService, never()).updateUserRole(any(), any());
        verify(userMapper, times(1)).updateEntityFromDto(updateDto, user);
        verify(keycloakAdminService, never()).setUserEnabled(any(), anyBoolean());
        verify(organizationRepository, never()).save(any());
        verify(userRepository, times(1)).save(user);
        verify(userMapper, times(1)).toResponseDto(updatedUser);
    }

    @Test
    void testUpdateUser_OrganizationsNotFound() {
        User user = BuildInstances.buildUser();

        List<Integer> organizationIds = List.of(1, 2);

        UserUpdateDto updateDto = new UserUpdateDto(
                null,
                null,
                "Example",
                "User",
                "+407777777777",
                null,
                null,
                organizationIds
        );

        Organization organization = BuildInstances.buildOrganization();

        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));
        when(organizationRepository.findAllById(organizationIds))
                .thenReturn(List.of(organization));

        NotFoundException exception = assertThrows(NotFoundException.class,
                () -> userService.updateUser(user.getId(), updateDto));

        assertEquals("One or more organizations were not found", exception.getMessage());
        verify(organizationRepository, times(1)).saveAll(user.getMemberOrganizations());
        verify(userRepository, never()).save(any());
    }

    @Test
    void testUpdateUser_UserNotFound() {
        UserUpdateDto updateDto = new UserUpdateDto(
                "user12@example.com",
                "User1 Actualizat",
                "Example",
                "User",
                "+407777777777",
                null,
                null,
                null
        );

        when(userRepository.findById(1)).thenReturn(Optional.empty());

        NotFoundException exception = assertThrows(NotFoundException.class,
                () -> userService.updateUser(1, updateDto));

        assertEquals("User with id 1 not found", exception.getMessage());
    }

    @Test
    void testUpdateUser_EmailAlreadyExists() {
        User user = BuildInstances.buildUser();
        UserUpdateDto updateDto = new UserUpdateDto(
                "user12@example.com",
                "User1",
                "Example",
                "User",
                "+407777777777",
                null,
                null,
                null
        );

        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));
        when(userRepository.existsByEmail(updateDto.getEmail())).thenReturn(true);

        DuplicateAttributeException exception = assertThrows(DuplicateAttributeException.class,
                () -> userService.updateUser(user.getId(), updateDto));

        assertEquals(String.format("Email %s already exists", updateDto.getEmail()), exception.getMessage());
    }

    @Test
    void testUpdateUser_UsernameAlreadyExists() {
        User user = BuildInstances.buildUser();
        UserUpdateDto updateDto = new UserUpdateDto(
                "user1@example.com",
                "User1 Actualizat",
                "Example",
                "User",
                "+407777777777",
                null,
                null,
                null
        );

        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));
        when(userRepository.existsByEmail(updateDto.getEmail())).thenReturn(false);
        when(userRepository.existsByUsername(updateDto.getUsername())).thenReturn(true);

        DuplicateAttributeException exception = assertThrows(DuplicateAttributeException.class,
                () -> userService.updateUser(user.getId(), updateDto));

        assertEquals(String.format("Username %s already exists", updateDto.getUsername()), exception.getMessage());
    }

    @Test
    void testDeleteUser_Valid() {
        User user = BuildInstances.buildUser();
        List<WorkItem> workItems = BuildInstances.buildWorkItems();
        List<Project> projects = BuildInstances.buildProjects();
        List<Team> teams = BuildInstances.buildTeams();
        List<Organization> organizations = BuildInstances.buildOrganizations();
        List<Organization> memberOrganizations = BuildInstances.buildOrganizations();
        List<Comment> comments = BuildInstances.buildComments();

        workItems.forEach(workItem -> workItem.setAssignees(new ArrayList<>(List.of(user))));
        user.setAssignedWorkItems(workItems);

        teams.forEach(team -> team.setMembers(new ArrayList<>(List.of(user))));
        user.setAssignedTeams(teams);

        memberOrganizations.forEach(o -> o.setMembers(new ArrayList<>(List.of(user))));
        user.setMemberOrganizations(memberOrganizations);

        user.setReportedWorkItems(workItems);
        user.setProjects(projects);
        user.setManagedTeams(teams);
        user.setOrganizations(organizations);
        user.setComments(comments);

        when(userRepository.findById(1)).thenReturn(Optional.of(user));
        workItems.forEach(wi -> doNothing().when(workItemService).deleteWorkItem(wi.getId()));
        projects.forEach(p -> doNothing().when(projectService).deleteProject(p.getId()));
        teams.forEach(t -> doNothing().when(teamService).deleteTeam(t.getId()));
        organizations.forEach(o -> doNothing().when(organizationService).deleteOrganization(o.getId()));
        doNothing().when(commentRepository).deleteAll(comments);
        doNothing().when(userRepository).deleteById(user.getId());

        userService.deleteUser(user.getId());

        workItems.forEach(w -> assertFalse(w.getAssignees().contains(user)));
        teams.forEach(t -> assertFalse(t.getMembers().contains(user)));
        memberOrganizations.forEach(o -> assertFalse(o.getMembers().contains(user)));
        workItems.forEach(w -> verify(workItemService).deleteWorkItem(w.getId()));
        projects.forEach(p -> verify(projectService).deleteProject(p.getId()));
        teams.forEach(t -> verify(teamService).deleteTeam(t.getId()));
        organizations.forEach(o -> verify(organizationService).deleteOrganization(o.getId()));
        verify(commentRepository).deleteAll(comments);
        verify(userRepository, times(1)).deleteById(1);
    }

    @Test
    void testDeleteUser_NotFound() {
        when(userRepository.findById(1)).thenReturn(Optional.empty());

        userService.deleteUser(1);

        verify(workItemService, never()).deleteWorkItem(any());
        verify(projectService, never()).deleteProject(any());
        verify(teamService, never()).deleteTeam(any());
        verify(organizationService, never()).deleteOrganization(any());
        verify(commentRepository, never()).deleteAll(any());
        verify(userRepository, never()).deleteById(any());
    }
}
