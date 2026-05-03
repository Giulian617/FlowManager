package flowmanager.nomenclator.service;

import flowmanager.nomenclator.dto.*;
import flowmanager.nomenclator.exception.DuplicateAttributeException;
import flowmanager.nomenclator.exception.NotFoundException;
import flowmanager.nomenclator.mapper.*;
import flowmanager.nomenclator.model.*;
import flowmanager.nomenclator.repository.CommentRepository;
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

    @InjectMocks
    private UserService userService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testFindAllUsers_Valid() {
        List<User> users = BuildInstances.buildUsers();
        List<UserSummaryDto> usersDto = users.stream()
                .map(BuildDtos::buildUserSummaryDto)
                .toList();

        when(userRepository.findAll()).thenReturn(users);
        when(userMapper.toSummaryDto(users.get(0))).thenReturn(usersDto.get(0));
        when(userMapper.toSummaryDto(users.get(1))).thenReturn(usersDto.get(1));

        List<UserSummaryDto> result = userService.findAllUsers();

        assertEquals(2, result.size());
        assertEquals(usersDto.get(0), result.get(0));
        assertEquals(usersDto.get(1), result.get(1));
        verify(userRepository, times(1)).findAll();
        verify(userMapper, times(1)).toSummaryDto(users.get(0));
        verify(userMapper, times(1)).toSummaryDto(users.get(1));
    }

    @Test
    void testFindAllUsers_EmptyList() {
        when(userRepository.findAll()).thenReturn(List.of());

        List<UserSummaryDto> result = userService.findAllUsers();

        assertEquals(0, result.size());
        verify(userRepository, times(1)).findAll();
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
    void findAllOrganizationsByUserId_Valid() {
        User user = BuildInstances.buildUser();
        List<Organization> organizations = BuildInstances.buildOrganizations();
        List<OrganizationSummaryDto> organizationsDto = organizations.stream()
                .map(BuildDtos::buildOrganizationSummaryDto)
                .toList();
        user.setOrganizations(organizations);

        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));
        when(organizationMapper.toSummaryDto(organizations.get(0))).thenReturn(organizationsDto.get(0));
        when(organizationMapper.toSummaryDto(organizations.get(1))).thenReturn(organizationsDto.get(1));

        List<OrganizationSummaryDto> result = userService.findAllOrganizationsByUserId(1);

        assertEquals(2, result.size());
        assertEquals(organizationsDto.get(0), result.get(0));
        assertEquals(organizationsDto.get(1), result.get(1));
        verify(userRepository, times(1)).findById(user.getId());
        verify(organizationMapper, times(1)).toSummaryDto(organizations.get(0));
        verify(organizationMapper, times(1)).toSummaryDto(organizations.get(1));
    }

    @Test
    void testFindAllOrganizationsByUserId_UserNotFound() {
        when(userRepository.findById(1)).thenReturn(Optional.empty());

        NotFoundException exception = assertThrows(NotFoundException.class,
                () -> userService.findAllOrganizationsByUserId(1));

        assertEquals("User with id 1 not found", exception.getMessage());
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
    void testCreateUser_Valid() {
        User user = User.builder()
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
                "User1",
                "Example",
                "User",
                "+407777777777"
        );
        UserResponseDto responseDto = BuildDtos.buildUserResponseDto(savedUser);

        when(userMapper.toEntity(createDto)).thenReturn(user);
        when(userRepository.existsByEmail(user.getEmail())).thenReturn(false);
        when(userRepository.existsByUsername(user.getUsername())).thenReturn(false);
        when(userRepository.save(user)).thenReturn(savedUser);
        when(userMapper.toResponseDto(savedUser)).thenReturn(responseDto);

        UserResponseDto result = userService.createUser(createDto);

        assertEquals(responseDto, result);
        verify(userMapper, times(1)).toEntity(createDto);
        verify(userRepository, times(1)).existsByEmail(user.getEmail());
        verify(userRepository, times(1)).existsByUsername(user.getUsername());
        verify(userRepository, times(1)).save(user);
        verify(userMapper, times(1)).toResponseDto(savedUser);
    }

    @Test
    void testCreateUser_EmailAlreadyExists() {
        User user = User.builder()
                .email("user1@example.com")
                .username("User1")
                .firstName("Example")
                .lastName("User")
                .phoneNumber("+407777777777")
                .active(false)
                .createdAt(LocalDateTime.of(2025, 6, 13, 10, 35, 30))
                .build();

        UserCreateDto createDto = new UserCreateDto(
                "user1@example.com",
                "User1",
                "Example",
                "User",
                "+407777777777"
        );

        when(userMapper.toEntity(createDto)).thenReturn(user);
        when(userRepository.existsByEmail(user.getEmail())).thenReturn(true);

        DuplicateAttributeException exception = assertThrows(DuplicateAttributeException.class,
                () -> userService.createUser(createDto));

        assertEquals("Email user1@example.com already exists", exception.getMessage());
    }

    @Test
    void testCreateUser_UsernameAlreadyExists() {
        User user = User.builder()
                .email("user1@example.com")
                .username("User1")
                .firstName("Example")
                .lastName("User")
                .phoneNumber("+407777777777")
                .active(false)
                .createdAt(LocalDateTime.of(2025, 6, 13, 10, 35, 30))
                .build();

        UserCreateDto createDto = new UserCreateDto(
                "user1@example.com",
                "User1",
                "Example",
                "User",
                "+407777777777"
        );

        when(userMapper.toEntity(createDto)).thenReturn(user);
        when(userRepository.existsByEmail(user.getEmail())).thenReturn(false);
        when(userRepository.existsByUsername(user.getUsername())).thenReturn(true);

        DuplicateAttributeException exception = assertThrows(DuplicateAttributeException.class,
                () -> userService.createUser(createDto));

        assertEquals(String.format("Username %s already exists", createDto.getUsername()), exception.getMessage());
    }

    @Test
    void testUpdateUser_Valid() {
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
                "+407777777777"
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
                "+407777777777"
        );
        UserResponseDto responseDto = BuildDtos.buildUserResponseDto(updatedUser);

        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));
        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));
        doNothing().when(userMapper).updateEntityFromDto(updateDto, user);
        when(userRepository.save(user)).thenReturn(updatedUser);
        when(userMapper.toResponseDto(updatedUser)).thenReturn(responseDto);

        UserResponseDto result = userService.updateUser(user.getId(), updateDto);

        assertEquals(responseDto, result);
        verify(userRepository, times(1)).findById(user.getId());
        verify(userRepository, times(0)).existsByEmail(updateDto.getEmail());
        verify(userRepository, times(0)).existsByUsername(updatedUser.getUsername());
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
                "+407777777777"
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
        verify(userRepository, times(0)).existsByUsername(updatedUser.getUsername());
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
                "+407777777777"
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
                "+407777777777"
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
                "+407777777777"
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
