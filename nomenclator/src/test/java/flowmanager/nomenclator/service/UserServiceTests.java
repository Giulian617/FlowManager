package flowmanager.nomenclator.service;

import flowmanager.nomenclator.dto.*;
import flowmanager.nomenclator.exception.DuplicateAttributeException;
import flowmanager.nomenclator.exception.NotFoundException;
import flowmanager.nomenclator.mapper.*;
import flowmanager.nomenclator.model.*;
import flowmanager.nomenclator.repository.CommentRepository;
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
        List<UserSummaryDto> usersDto = users.stream()
                .map(BuildDtos::buildUserSummaryDto)
                .toList();

        when(userRepository.findAll(ArgumentMatchers.<Specification<User>>any())).thenReturn(users);
        when(userMapper.toSummaryDto(users.get(0))).thenReturn(usersDto.get(0));
        when(userMapper.toSummaryDto(users.get(1))).thenReturn(usersDto.get(1));

        List<UserSummaryDto> result = userService.findAllUsers(null);

        assertEquals(2, result.size());
        assertEquals(usersDto.get(0), result.get(0));
        assertEquals(usersDto.get(1), result.get(1));
        verify(userRepository, times(1)).findAll(ArgumentMatchers.<Specification<User>>any());
        verify(userMapper, times(1)).toSummaryDto(users.get(0));
        verify(userMapper, times(1)).toSummaryDto(users.get(1));
    }

    @Test
    void testFindAllUsers_WithRoleFilter() {
        List<User> users = BuildInstances.buildUsers();
        List<UserSummaryDto> usersDto = users.stream()
                .map(BuildDtos::buildUserSummaryDto)
                .toList();

        when(userRepository.findAll(ArgumentMatchers.<Specification<User>>any())).thenReturn(List.of(users.getFirst()));
        when(userMapper.toSummaryDto(users.getFirst())).thenReturn(usersDto.getFirst());

        List<UserSummaryDto> result = userService.findAllUsers(Role.MANAGER);

        assertEquals(1, result.size());
        assertEquals(usersDto.getFirst(), result.getFirst());
        verify(userRepository, times(1)).findAll(ArgumentMatchers.<Specification<User>>any());
        verify(userMapper, times(1)).toSummaryDto(users.get(0));
        verify(userMapper, never()).toSummaryDto(users.get(1));
    }

    @Test
    void testFindAllUsers_EmptyList() {
        when(userRepository.findAll(ArgumentMatchers.<Specification<User>>any())).thenReturn(List.of());

        List<UserSummaryDto> result = userService.findAllUsers(null);

        assertEquals(0, result.size());
        verify(userRepository, times(1)).findAll(ArgumentMatchers.<Specification<User>>any());
        verify(userMapper, never()).toSummaryDto(any());
    }

    @Test
    void testGetCurrentUser_Valid() {
        User user = BuildInstances.buildUser();
        UserSummaryDto summaryDto = BuildDtos.buildUserSummaryDto(user);

        Authentication auth = mock(Authentication.class);
        Jwt jwt = mock(Jwt.class);

        when(auth.getPrincipal()).thenReturn(jwt);
        when(jwt.getSubject()).thenReturn(user.getKeycloakId());
        when(userRepository.findByKeycloakId(user.getKeycloakId())).thenReturn(Optional.of(user));
        when(userMapper.toSummaryDto(user)).thenReturn(summaryDto);

        UserSummaryDto result = userService.getCurrentUser(auth);

        assertEquals(summaryDto, result);
        verify(userRepository, times(1)).findByKeycloakId(user.getKeycloakId());
        verify(userMapper, times(1)).toSummaryDto(user);
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
    void findAllProjectsByUserId_Valid() {
        User user = BuildInstances.buildUser();
        List<Project> projects = BuildInstances.buildProjects();
        List<ProjectSummaryDto> projectsDto = projects.stream()
                .map(BuildDtos::buildProjectSummaryDto)
                .toList();
        user.setProjects(projects);

        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));
        when(projectMapper.toSummaryDto(projects.get(0))).thenReturn(projectsDto.get(0));
        when(projectMapper.toSummaryDto(projects.get(1))).thenReturn(projectsDto.get(1));

        List<ProjectSummaryDto> result = userService.findAllProjectsByUserId(1);

        assertEquals(2, result.size());
        assertEquals(projectsDto.get(0), result.get(0));
        assertEquals(projectsDto.get(1), result.get(1));
        verify(userRepository, times(1)).findById(user.getId());
        verify(projectMapper, times(1)).toSummaryDto(projects.get(0));
        verify(projectMapper, times(1)).toSummaryDto(projects.get(1));
    }

    @Test
    void testFindAllProjectsByUserId_UserNotFound() {
        when(userRepository.findById(1)).thenReturn(Optional.empty());

        NotFoundException exception = assertThrows(NotFoundException.class,
                () -> userService.findAllProjectsByUserId(1));

        assertEquals("User with id 1 not found", exception.getMessage());
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
        Organization org1 = orgs.get(0);
        Organization org2 = orgs.get(1);
        Organization org3 = Organization.builder()
                .id(3)
                .name("Organizatia 3")
                .description("Descriere 3")
                .industry("IT")
                .createdAt(LocalDateTime.of(2025, 12, 31, 10, 0, 5))
                .manager(user)
                .build();

        user.setOrganizations(List.of(org1));

        Team assignedTeam = BuildInstances.buildTeam();
        assignedTeam.setOrganization(org2);

        Team assignedTeamDuplicate = BuildInstances.buildTeam();
        assignedTeamDuplicate.setOrganization(org1);

        user.setAssignedTeams(List.of(assignedTeam, assignedTeamDuplicate));

        List<Team> managedTeams = BuildInstances.buildTeams();
        managedTeams.get(0).setOrganization(org3);
        managedTeams.get(1).setOrganization(org2);

        user.setManagedTeams(managedTeams);

        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));

        when(organizationMapper.toSummaryDto(any()))
                .thenAnswer(invocation -> {
                    Organization o = invocation.getArgument(0);
                    return BuildDtos.buildOrganizationSummaryDto(o);
                });

        List<OrganizationSummaryDto> result =
                userService.findAllAssignedOrganizationsByUserId(user.getId());

        assertEquals(3, result.size());
        verify(userRepository, times(1)).findById(user.getId());
        verify(organizationMapper, times(3)).toSummaryDto(any());
    }

    @Test
    void testFindAllAssignedOrganizationsByUserId_UserNotFound() {
        when(userRepository.findById(1)).thenReturn(Optional.empty());

        NotFoundException exception = assertThrows(NotFoundException.class,
                () -> userService.findAllAssignedOrganizationsByUserId(1));

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
                userService.findAllAssignedOrganizationsByUserId(user.getId());

        assertTrue(result.isEmpty());
        verify(userRepository, times(1)).findById(user.getId());
        verify(organizationMapper, never()).toSummaryDto(any());
    }


    @Test
    void testFindAllManagedTeamsByUserId_Valid() {
        User user = BuildInstances.buildUser();
        List<Team> teams = BuildInstances.buildTeams();
        List<TeamSummaryUserDto> teamsDto = teams.stream()
                .map(BuildDtos::buildTeamSummaryUserDto)
                .toList();
        user.setManagedTeams(teams);

        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));
        when(teamMapper.toSummaryUserDto(teams.get(0))).thenReturn(teamsDto.get(0));
        when(teamMapper.toSummaryUserDto(teams.get(1))).thenReturn(teamsDto.get(1));

        List<TeamSummaryUserDto> result = userService.findAllManagedTeamsByUserId(1);

        assertEquals(2, result.size());
        assertEquals(teamsDto.get(0), result.get(0));
        assertEquals(teamsDto.get(1), result.get(1));
        verify(userRepository, times(1)).findById(user.getId());
        verify(teamMapper, times(1)).toSummaryUserDto(teams.get(0));
        verify(teamMapper, times(1)).toSummaryUserDto(teams.get(1));
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
        List<TeamSummaryUserDto> teamsDto = teams.stream()
                .map(BuildDtos::buildTeamSummaryUserDto)
                .toList();
        user.setAssignedTeams(teams);

        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));
        when(teamMapper.toSummaryUserDto(teams.get(0))).thenReturn(teamsDto.get(0));
        when(teamMapper.toSummaryUserDto(teams.get(1))).thenReturn(teamsDto.get(1));

        List<TeamSummaryUserDto> result = userService.findAllAssignedTeamsByUserId(1);

        assertEquals(2, result.size());
        assertEquals(teamsDto.get(0), result.get(0));
        assertEquals(teamsDto.get(1), result.get(1));
        verify(userRepository, times(1)).findById(user.getId());
        verify(teamMapper, times(1)).toSummaryUserDto(teams.get(0));
        verify(teamMapper, times(1)).toSummaryUserDto(teams.get(1));
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
    void testFindUserById_Valid() {
        User user = BuildInstances.buildUser();
        UserResponseDto responseDto = BuildDtos.buildUserResponseDto(user);

        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));
        when(userMapper.toResponseDto(user)).thenReturn(responseDto);

        UserResponseDto result = userService.findUserById(user.getId());

        assertNotNull(result);
        assertEquals(responseDto, result);
        verify(userRepository, times(1)).findById(user.getId());
        verify(userMapper, times(1)).toResponseDto(user);
    }

    @Test
    void testFindUserById_UserNotFound() {
        when(userRepository.findById(1)).thenReturn(Optional.empty());

        NotFoundException exception = assertThrows(NotFoundException.class,
                () -> userService.findUserById(1));

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
                .active(false)
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
                .active(false)
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
                Role.MANAGER
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
    void testUpdateUser_WithoutRole() {
        User user = BuildInstances.buildUser();
        User updatedUser = User.builder()
                .id(1)
                .email("user12@example.com")
                .username("User1 Actualizat")
                .firstName("Example")
                .lastName("User")
                .phoneNumber("+407777777777")
                .active(false)
                .createdAt(LocalDateTime.of(2025, 6, 13, 10, 35, 30))
                .build();
        UserUpdateDto updateDto = new UserUpdateDto(
                "user12@example.com",
                "User1 Actualizat",
                "Example",
                "User",
                "+407777777777",
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
                .active(false)
                .createdAt(LocalDateTime.of(2025, 6, 13, 10, 35, 30))
                .build();
        UserUpdateDto updateDto = new UserUpdateDto(
                null,
                null,
                "Example",
                "User",
                "+407777777777",
                Role.MANAGER
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
                .active(false)
                .createdAt(LocalDateTime.of(2025, 6, 13, 10, 35, 30))
                .build();
        UserUpdateDto updateDto = new UserUpdateDto(
                null,
                "User1",
                "Example",
                "User",
                "+407777777777",
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
                .active(false)
                .createdAt(LocalDateTime.of(2025, 6, 13, 10, 35, 30))
                .build();
        UserUpdateDto updateDto = new UserUpdateDto(
                "user12@example.com",
                null,
                "Example",
                "User",
                "+407777777777",
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
        verify(userRepository, times(1)).save(user);
        verify(userMapper, times(1)).toResponseDto(updatedUser);
    }

    @Test
    void testUpdateUser_UserNotFound() {
        UserUpdateDto updateDto = new UserUpdateDto(
                "user12@example.com",
                "User1 Actualizat",
                "Example",
                "User",
                "+407777777777",
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
        List<Comment> comments = BuildInstances.buildComments();

        workItems.forEach(workItem -> workItem.setAssignees(new ArrayList<>(List.of(user))));
        user.setAssignedWorkItems(workItems);

        teams.forEach(team -> team.setMembers(new ArrayList<>(List.of(user))));
        user.setAssignedTeams(teams);

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
