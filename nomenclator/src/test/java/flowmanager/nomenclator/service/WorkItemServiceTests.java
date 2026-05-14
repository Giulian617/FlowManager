package flowmanager.nomenclator.service;

import flowmanager.nomenclator.dto.*;
import flowmanager.nomenclator.exception.NotFoundException;
import flowmanager.nomenclator.mapper.CommentMapper;
import flowmanager.nomenclator.mapper.WorkItemMapper;
import flowmanager.nomenclator.model.*;
import flowmanager.nomenclator.repository.CommentRepository;
import flowmanager.nomenclator.repository.ProjectRepository;
import flowmanager.nomenclator.repository.UserRepository;
import flowmanager.nomenclator.repository.WorkItemRepository;
import flowmanager.nomenclator.utils.BuildDtos;
import flowmanager.nomenclator.utils.BuildInstances;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentMatchers;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

public class WorkItemServiceTests {
    @Mock
    private WorkItemRepository workItemRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CommentRepository commentRepository;

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private WorkItemMapper workItemMapper;

    @Mock
    private CommentMapper commentMapper;

    @InjectMocks
    private WorkItemService workItemService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testFindAllWorkItems_NoFilters() {
        List<WorkItem> workItems = BuildInstances.buildWorkItems();
        List<WorkItemSummaryDto> workItemsDto = workItems.stream()
                .map(BuildDtos::buildWorkItemSummaryDto)
                .toList();

        when(workItemRepository.findAll(ArgumentMatchers.<Specification<WorkItem>>any())).thenReturn(workItems);
        when(workItemMapper.toSummaryDto(workItems.get(0))).thenReturn(workItemsDto.get(0));
        when(workItemMapper.toSummaryDto(workItems.get(1))).thenReturn(workItemsDto.get(1));

        List<WorkItemSummaryDto> result = workItemService.findAllWorkItems(null, null, null);

        assertEquals(2, result.size());
        assertEquals(workItemsDto.get(0), result.get(0));
        assertEquals(workItemsDto.get(1), result.get(1));
        verify(workItemRepository, times(1)).findAll(ArgumentMatchers.<Specification<WorkItem>>any());
        verify(workItemMapper, times(1)).toSummaryDto(workItems.get(0));
        verify(workItemMapper, times(1)).toSummaryDto(workItems.get(1));
    }

    @Test
    void testFindAllWorkItems_WithItemTypeFilter() {
        List<WorkItem> workItems = BuildInstances.buildWorkItems();
        List<WorkItemSummaryDto> workItemsDto = workItems.stream()
                .map(BuildDtos::buildWorkItemSummaryDto)
                .toList();

        when(workItemRepository.findAll(ArgumentMatchers.<Specification<WorkItem>>any())).thenReturn(List.of(workItems.get(0), workItems.get(1)));
        when(workItemMapper.toSummaryDto(workItems.get(0))).thenReturn(workItemsDto.get(0));
        when(workItemMapper.toSummaryDto(workItems.get(1))).thenReturn(workItemsDto.get(1));

        List<WorkItemSummaryDto> result = workItemService.findAllWorkItems(ItemType.Task, null, null);

        assertEquals(2, result.size());
        verify(workItemRepository, times(1)).findAll(ArgumentMatchers.<Specification<WorkItem>>any());
        verify(workItemMapper, times(1)).toSummaryDto(workItems.get(0));
        verify(workItemMapper, times(1)).toSummaryDto(workItems.get(1));
    }

    @Test
    void testFindAllWorkItems_WithStatusFilter() {
        List<WorkItem> workItems = BuildInstances.buildWorkItems();
        List<WorkItemSummaryDto> workItemsDto = workItems.stream()
                .map(BuildDtos::buildWorkItemSummaryDto)
                .toList();

        when(workItemRepository.findAll(ArgumentMatchers.<Specification<WorkItem>>any())).thenReturn(List.of(workItems.get(1)));
        when(workItemMapper.toSummaryDto(workItems.get(1))).thenReturn(workItemsDto.get(1));

        List<WorkItemSummaryDto> result = workItemService.findAllWorkItems(null, Status.In_Progress, null);

        assertEquals(1, result.size());
        verify(workItemRepository, times(1)).findAll(ArgumentMatchers.<Specification<WorkItem>>any());
        verify(workItemMapper, times(0)).toSummaryDto(workItems.get(0));
        verify(workItemMapper, times(1)).toSummaryDto(workItems.get(1));
    }

    @Test
    void testFindAllWorkItems_WithSeverityFilter() {
        List<WorkItem> workItems = BuildInstances.buildWorkItems();
        List<WorkItemSummaryDto> workItemsDto = workItems.stream()
                .map(BuildDtos::buildWorkItemSummaryDto)
                .toList();

        when(workItemRepository.findAll(ArgumentMatchers.<Specification<WorkItem>>any())).thenReturn(List.of(workItems.getFirst()));
        when(workItemMapper.toSummaryDto(workItems.getFirst())).thenReturn(workItemsDto.getFirst());

        List<WorkItemSummaryDto> result = workItemService.findAllWorkItems(null, null, Severity.Low);

        assertEquals(1, result.size());
        verify(workItemRepository, times(1)).findAll(ArgumentMatchers.<Specification<WorkItem>>any());
        verify(workItemMapper, times(1)).toSummaryDto(workItems.get(0));
        verify(workItemMapper, times(0)).toSummaryDto(workItems.get(1));
    }

    @Test
    void testFindAllWorkItems_WithAllFilters() {
        List<WorkItem> workItems = BuildInstances.buildWorkItems();
        List<WorkItemSummaryDto> workItemsDto = workItems.stream()
                .map(BuildDtos::buildWorkItemSummaryDto)
                .toList();

        when(workItemRepository.findAll(ArgumentMatchers.<Specification<WorkItem>>any())).thenReturn(List.of(workItems.getFirst()));
        when(workItemMapper.toSummaryDto(workItems.getFirst())).thenReturn(workItemsDto.getFirst());

        List<WorkItemSummaryDto> result = workItemService.findAllWorkItems(ItemType.Task, Status.To_do, Severity.Low);

        assertEquals(1, result.size());
        verify(workItemRepository, times(1)).findAll(ArgumentMatchers.<Specification<WorkItem>>any());
        verify(workItemMapper, times(1)).toSummaryDto(workItems.get(0));
        verify(workItemMapper, times(0)).toSummaryDto(workItems.get(1));
    }

    @Test
    void testFindAllWorkItems_EmptyList() {
        when(workItemRepository.findAll(ArgumentMatchers.<Specification<WorkItem>>any())).thenReturn(List.of());

        List<WorkItemSummaryDto> result = workItemService.findAllWorkItems(null, null, null);

        assertEquals(0, result.size());
        verify(workItemRepository, times(1)).findAll(ArgumentMatchers.<Specification<WorkItem>>any());
        verify(workItemMapper, never()).toSummaryDto(any());
    }

    @Test
    void testFindAllCommentsByWorkItemId_Valid() {
        WorkItem workItem = BuildInstances.buildWorkItem();
        List<Comment> comments = BuildInstances.buildComments();
        List<CommentResponseWorkItemDto> commentsDto = comments.stream()
                .map(BuildDtos::buildCommentResponseWorkItemDto)
                .toList();
        workItem.setComments(comments);

        when(workItemRepository.findById(1)).thenReturn(Optional.of(workItem));
        when(commentMapper.toResponseWorkItemDto(comments.get(0))).thenReturn(commentsDto.get(0));
        when(commentMapper.toResponseWorkItemDto(comments.get(1))).thenReturn(commentsDto.get(1));

        List<CommentResponseWorkItemDto> result = workItemService.findAllCommentsByWorkItemId(1);

        assertEquals(2, result.size());
        assertEquals(commentsDto.get(0), result.get(0));
        assertEquals(commentsDto.get(1), result.get(1));
        verify(workItemRepository, times(1)).findById(1);
        verify(commentMapper, times(1)).toResponseWorkItemDto(comments.get(0));
        verify(commentMapper, times(1)).toResponseWorkItemDto(comments.get(1));
    }

    @Test
    void testFindAllCommentsByWorkItemId_WorkItemNotFound() {
        when(workItemRepository.findById(1)).thenReturn(Optional.empty());

        NotFoundException exception = assertThrows(NotFoundException.class,
                () -> workItemService.findAllCommentsByWorkItemId(1));

        assertEquals("WorkItem with id 1 not found", exception.getMessage());
    }

    @Test
    void testFindWorkItemById_Valid() {
        WorkItem workItem = BuildInstances.buildWorkItem();
        WorkItemResponseDto responseDto = BuildDtos.buildWorkItemResponseDto(workItem);

        when(workItemRepository.findById(workItem.getId())).thenReturn(Optional.of(workItem));
        when(workItemMapper.toResponseDto(workItem)).thenReturn(responseDto);

        WorkItemResponseDto result = workItemService.findWorkItemById(workItem.getId());

        assertEquals(responseDto, result);
        verify(workItemRepository, times(1)).findById(workItem.getId());
        verify(workItemMapper, times(1)).toResponseDto(workItem);
    }

    @Test
    void testFindWorkItemById_NotFound() {
        when(workItemRepository.findById(1)).thenReturn(Optional.empty());

        NotFoundException exception = assertThrows(NotFoundException.class,
                () -> workItemService.findWorkItemById(1));

        assertEquals("WorkItem with id 1 not found", exception.getMessage());
    }

    @Test
    void testCreateWorkItem_Valid_NoAssignees_NoParent() {
        Project project = BuildInstances.buildProject();
        User reporter = BuildInstances.buildUser();

        WorkItem workItem = WorkItem.builder()
                .title("Work item 1")
                .description("Description work item 1")
                .itemType(ItemType.Task)
                .status(Status.To_do)
                .severity(Severity.Low)
                .createdAt(LocalDateTime.of(2026, 3, 20, 18, 33, 30))
                .project(project)
                .reporter(reporter)
                .assignees(new ArrayList<>())
                .comments(new ArrayList<>())
                .children(new ArrayList<>())
                .build();
        WorkItem savedWorkItem = BuildInstances.buildWorkItem();
        WorkItemCreateDto createDto = new WorkItemCreateDto(
                "Work item 1",
                "Description work item 1",
                ItemType.Task,
                Severity.Low,
                1,
                null,
                null,
                null
        );
        WorkItemResponseDto responseDto = BuildDtos.buildWorkItemResponseDto(savedWorkItem);

        when(projectRepository.findById(project.getId())).thenReturn(Optional.of(project));
        when(userRepository.findByKeycloakId(reporter.getKeycloakId())).thenReturn(Optional.of(reporter));
        when(workItemMapper.toEntity(createDto, project, reporter)).thenReturn(workItem);
        when(workItemRepository.save(workItem)).thenReturn(savedWorkItem);
        when(workItemMapper.toResponseDto(workItem)).thenReturn(responseDto);

        WorkItemResponseDto result = workItemService.createWorkItem(createDto, reporter.getKeycloakId());

        assertEquals(responseDto, result);
        verify(projectRepository, times(1)).findById(project.getId());
        verify(userRepository, times(1)).findByKeycloakId(reporter.getKeycloakId());
        verify(workItemMapper, times(1)).toEntity(createDto, project, reporter);
        verify(userRepository, never()).findAllById(any());
        verify(workItemRepository, times(1)).save(workItem);
        verify(workItemRepository, never()).findById(any());
        verify(workItemMapper, times(1)).toResponseDto(workItem);
    }

    @Test
    void testCreateWorkItem_Valid_WithAssignees() {
        Project project = BuildInstances.buildProject();
        User reporter = BuildInstances.buildUser();
        List<User> users = BuildInstances.buildUsers();
        List<Integer> assigneesIds = List.of(users.get(0).getId(), users.get(1).getId());

        WorkItem workItem = WorkItem.builder()
                .title("Work item 1")
                .description("Description work item 1")
                .itemType(ItemType.Task)
                .status(Status.To_do)
                .severity(Severity.Low)
                .createdAt(LocalDateTime.of(2026, 3, 20, 18, 33, 30))
                .project(project)
                .reporter(reporter)
                .assignees(new ArrayList<>())
                .comments(new ArrayList<>())
                .children(new ArrayList<>())
                .build();
        WorkItem savedWorkItem = BuildInstances.buildWorkItem();
        WorkItemCreateDto createDto = new WorkItemCreateDto(
                "Work item 1",
                "Description work item 1",
                ItemType.Task,
                Severity.Low,
                1,
                null,
                null,
                assigneesIds
        );
        WorkItemResponseDto responseDto = BuildDtos.buildWorkItemResponseDto(savedWorkItem);

        when(projectRepository.findById(project.getId())).thenReturn(Optional.of(project));
        when(userRepository.findByKeycloakId(reporter.getKeycloakId())).thenReturn(Optional.of(reporter));
        when(workItemMapper.toEntity(createDto, project, reporter)).thenReturn(workItem);
        when(userRepository.findAllById(assigneesIds)).thenReturn(users);
        when(workItemRepository.save(workItem)).thenReturn(savedWorkItem);
        when(workItemMapper.toResponseDto(workItem)).thenReturn(responseDto);

        WorkItemResponseDto result = workItemService.createWorkItem(createDto, reporter.getKeycloakId());

        assertEquals(responseDto, result);
        assertEquals(users, workItem.getAssignees());
        verify(projectRepository, times(1)).findById(project.getId());
        verify(userRepository, times(1)).findByKeycloakId(reporter.getKeycloakId());
        verify(workItemMapper, times(1)).toEntity(createDto, project, reporter);
        verify(userRepository, times(1)).findAllById(assigneesIds);
        verify(workItemRepository, times(1)).save(workItem);
        verify(workItemRepository, never()).findById(any());
        verify(workItemMapper, times(1)).toResponseDto(workItem);
    }

    @Test
    void testCreateWorkItem_Valid_WithParent() {
        Project project = BuildInstances.buildProject();
        User reporter = BuildInstances.buildUser();

        WorkItem parent = WorkItem.builder()
                .id(2)
                .title("UserStory 1")
                .itemType(ItemType.User_Story)
                .project(project)
                .reporter(reporter)
                .assignees(new ArrayList<>())
                .comments(new ArrayList<>())
                .children(new ArrayList<>())
                .build();
        WorkItem workItem = WorkItem.builder()
                .id(1)
                .title("Work item 1")
                .description("Description work item 1")
                .itemType(ItemType.Task)
                .status(Status.To_do)
                .severity(Severity.Low)
                .project(project)
                .reporter(reporter)
                .assignees(new ArrayList<>())
                .comments(new ArrayList<>())
                .children(new ArrayList<>())
                .build();
        WorkItemCreateDto createDto = new WorkItemCreateDto(
                "Work item 1",
                "Description work item 1",
                ItemType.Task,
                Severity.Low,
                1,
                2,
                null,
                null
        );
        WorkItemResponseDto responseDto = BuildDtos.buildWorkItemResponseDto(workItem);

        when(projectRepository.findById(project.getId())).thenReturn(Optional.of(project));
        when(userRepository.findByKeycloakId(reporter.getKeycloakId())).thenReturn(Optional.of(reporter));
        when(workItemMapper.toEntity(createDto, project, reporter)).thenReturn(workItem);
        when(workItemRepository.save(workItem)).thenReturn(workItem);
        when(workItemRepository.findById(1)).thenReturn(Optional.of(workItem));
        when(workItemRepository.findById(2)).thenReturn(Optional.of(parent));
        when(workItemMapper.toResponseDto(workItem)).thenReturn(responseDto);

        WorkItemResponseDto result = workItemService.createWorkItem(createDto, reporter.getKeycloakId());

        assertEquals(responseDto, result);
        assertEquals(parent, workItem.getParent());
        verify(projectRepository, times(1)).findById(project.getId());
        verify(userRepository, times(1)).findByKeycloakId(reporter.getKeycloakId());
        verify(workItemMapper, times(1)).toEntity(createDto, project, reporter);
        verify(userRepository, never()).findAllById(any());
        verify(workItemRepository, times(2)).save(workItem);
        verify(workItemRepository, times(1)).findById(workItem.getId());
        verify(workItemRepository, times(1)).findById(parent.getId());
        verify(workItemMapper, times(2)).toResponseDto(workItem);
    }

    @Test
    void testCreateWorkItem_EmptyAssigneesList() {
        Project project = BuildInstances.buildProject();
        User reporter = BuildInstances.buildUser();

        WorkItem workItem = WorkItem.builder()
                .title("Work item 1")
                .description("Description work item 1")
                .itemType(ItemType.Task)
                .status(Status.To_do)
                .severity(Severity.Low)
                .project(project)
                .reporter(reporter)
                .assignees(new ArrayList<>())
                .comments(new ArrayList<>())
                .children(new ArrayList<>())
                .build();
        WorkItem savedWorkItem = BuildInstances.buildWorkItem();
        WorkItemCreateDto createDto = new WorkItemCreateDto(
                "Work item 1",
                "Description work item 1",
                ItemType.Task,
                Severity.Low,
                1,
                null,
                null,
                new ArrayList<>()
        );
        WorkItemResponseDto responseDto = BuildDtos.buildWorkItemResponseDto(savedWorkItem);

        when(projectRepository.findById(project.getId())).thenReturn(Optional.of(project));
        when(userRepository.findByKeycloakId(reporter.getKeycloakId())).thenReturn(Optional.of(reporter));
        when(workItemMapper.toEntity(createDto, project, reporter)).thenReturn(workItem);
        when(workItemRepository.save(workItem)).thenReturn(savedWorkItem);
        when(workItemMapper.toResponseDto(workItem)).thenReturn(responseDto);

        WorkItemResponseDto result = workItemService.createWorkItem(createDto, reporter.getKeycloakId());

        assertEquals(responseDto, result);
        verify(projectRepository, times(1)).findById(project.getId());
        verify(userRepository, times(1)).findByKeycloakId(reporter.getKeycloakId());
        verify(workItemMapper, times(1)).toEntity(createDto, project, reporter);
        verify(userRepository, never()).findAllById(any());
        verify(workItemRepository, times(1)).save(workItem);
        verify(workItemRepository, never()).findById(any());
        verify(workItemMapper, times(1)).toResponseDto(workItem);
    }

    @Test
    void testCreateWorkItem_ProjectNotFound() {
        String keycloakId = "keycloak-uuid-1";
        WorkItemCreateDto createDto = new WorkItemCreateDto(
                "Work item 1",
                "Description work item 1",
                ItemType.Task,
                Severity.Low,
                1,
                null,
                null,
                null
        );

        when(projectRepository.findById(1)).thenReturn(Optional.empty());

        NotFoundException exception = assertThrows(NotFoundException.class,
                () -> workItemService.createWorkItem(createDto, keycloakId));

        assertEquals("Project with id 1 not found", exception.getMessage());
    }

    @Test
    void testCreateWorkItem_UserNotFound() {
        Project project = BuildInstances.buildProject();
        String keycloakId = "keycloak-uuid-1";
        WorkItemCreateDto createDto = new WorkItemCreateDto(
                "Work item 1",
                "Description work item 1",
                ItemType.Task,
                Severity.Low,
                1,
                null,
                null,
                null
        );

        when(projectRepository.findById(project.getId())).thenReturn(Optional.of(project));
        when(userRepository.findByKeycloakId(keycloakId)).thenReturn(Optional.empty());

        NotFoundException exception = assertThrows(NotFoundException.class,
                () -> workItemService.createWorkItem(createDto, keycloakId));

        assertEquals("User not found", exception.getMessage());
    }

    @Test
    void testCreateWorkItem_AssigneesNotFound() {
        Project project = BuildInstances.buildProject();
        User reporter = BuildInstances.buildUser();

        WorkItem workItem = WorkItem.builder()
                .title("Work item 1")
                .description("Description work item 1")
                .itemType(ItemType.Task)
                .severity(Severity.Low)
                .project(project)
                .reporter(reporter)
                .assignees(new ArrayList<>())
                .comments(new ArrayList<>())
                .children(new ArrayList<>())
                .build();
        WorkItemCreateDto createDto = new WorkItemCreateDto(
                "Work item 1",
                "Description work item 1",
                ItemType.Task,
                Severity.Low,
                1,
                null,
                null,
                List.of(1, 2)
        );

        when(projectRepository.findById(project.getId())).thenReturn(Optional.of(project));
        when(userRepository.findByKeycloakId(reporter.getKeycloakId())).thenReturn(Optional.of(reporter));
        when(workItemMapper.toEntity(createDto, project, reporter)).thenReturn(workItem);
        when(userRepository.findAllById(List.of(1, 2))).thenReturn(List.of(BuildInstances.buildUser()));

        NotFoundException exception = assertThrows(NotFoundException.class,
                () -> workItemService.createWorkItem(createDto, reporter.getKeycloakId()));

        assertEquals("One or more users were not found", exception.getMessage());
    }

    @Test
    void testUpdateWorkItem_Valid() {
        WorkItem workItem = BuildInstances.buildWorkItem();
        Project project = BuildInstances.buildProject();
        User reporter = BuildInstances.buildUser();

        WorkItem updatedWorkItem = WorkItem.builder()
                .id(1)
                .title("Work item 1 actualizat")
                .description("Description work item 1")
                .itemType(ItemType.Task)
                .status(Status.In_Progress)
                .severity(Severity.Medium)
                .reporter(reporter)
                .project(project)
                .createdAt(LocalDateTime.of(2026, 3, 20, 18, 33, 30))
                .assignees(new ArrayList<>())
                .comments(new ArrayList<>())
                .children(new ArrayList<>())
                .build();
        WorkItemUpdateDto updateDto = new WorkItemUpdateDto(
                "Work item 1 actualizat",
                "Description work item 1",
                Status.In_Progress,
                Severity.Medium,
                null
        );
        WorkItemResponseDto responseDto = BuildDtos.buildWorkItemResponseDto(updatedWorkItem);

        when(workItemRepository.findById(workItem.getId())).thenReturn(Optional.of(workItem));
        doNothing().when(workItemMapper).updateEntityFromDto(updateDto, workItem);
        when(workItemRepository.save(workItem)).thenReturn(updatedWorkItem);
        when(workItemMapper.toResponseDto(updatedWorkItem)).thenReturn(responseDto);

        WorkItemResponseDto result = workItemService.updateWorkItem(workItem.getId(), updateDto);

        assertEquals(responseDto, result);
        verify(workItemRepository, times(1)).findById(workItem.getId());
        verify(workItemMapper, times(1)).updateEntityFromDto(updateDto, workItem);
        verify(workItemRepository, times(1)).save(workItem);
        verify(workItemMapper, times(1)).toResponseDto(updatedWorkItem);
    }

    @Test
    void testUpdateWorkItem_NotFound() {
        WorkItemUpdateDto updateDto = new WorkItemUpdateDto(
                "Work item 1 actualizat",
                "Description work item 1",
                Status.In_Progress,
                Severity.Medium,
                null
        );

        when(workItemRepository.findById(1)).thenReturn(Optional.empty());

        NotFoundException exception = assertThrows(NotFoundException.class,
                () -> workItemService.updateWorkItem(1, updateDto));

        assertEquals("WorkItem with id 1 not found", exception.getMessage());
    }

    @Test
    void testAssignUsers_Valid() {
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

        WorkItem workItem = BuildInstances.buildWorkItem();
        workItem.setAssignees(users);
        retainedUser.getAssignedWorkItems().add(workItem);
        removedUser.getAssignedWorkItems().add(workItem);

        List<Integer> newUserIds = List.of(retainedUser.getId(), addedUser.getId());
        WorkItemAssignDto assignDto = new WorkItemAssignDto(newUserIds);
        WorkItemResponseDto responseDto = BuildDtos.buildWorkItemResponseDto(workItem);

        when(workItemRepository.findById(workItem.getId())).thenReturn(Optional.of(workItem));
        when(userRepository.findAllById(newUserIds)).thenReturn(List.of(retainedUser, addedUser));
        when(workItemRepository.save(workItem)).thenReturn(workItem);
        when(workItemMapper.toResponseDto(workItem)).thenReturn(responseDto);

        WorkItemResponseDto result = workItemService.assignUsers(workItem.getId(), assignDto);

        assertEquals(responseDto, result);
        assertFalse(removedUser.getAssignedWorkItems().contains(workItem));
        assertTrue(retainedUser.getAssignedWorkItems().contains(workItem));
        assertEquals(1, retainedUser.getAssignedWorkItems().stream()
                .filter(wi -> wi.equals(workItem)).count());
        assertTrue(addedUser.getAssignedWorkItems().contains(workItem));
        assertEquals(List.of(retainedUser, addedUser), workItem.getAssignees());
        verify(workItemRepository, times(1)).findById(workItem.getId());
        verify(userRepository, times(1)).findAllById(newUserIds);
        verify(workItemRepository, times(1)).save(workItem);
        verify(workItemMapper, times(1)).toResponseDto(workItem);
    }

    @Test
    void testAssignUsers_WhenNotAlreadyPresent() {
        WorkItem workItem = BuildInstances.buildWorkItem();
        List<User> users = BuildInstances.buildUsers();

        users.get(0).setAssignedWorkItems(new ArrayList<>());
        users.get(1).setAssignedWorkItems(new ArrayList<>(List.of(workItem)));
        workItem.setAssignees(new ArrayList<>(List.of(users.get(1))));

        List<Integer> userIds = List.of(users.get(0).getId(), users.get(1).getId());
        WorkItemAssignDto assignDto = new WorkItemAssignDto(userIds);
        WorkItemResponseDto responseDto = BuildDtos.buildWorkItemResponseDto(workItem);

        when(workItemRepository.findById(workItem.getId())).thenReturn(Optional.of(workItem));
        when(userRepository.findAllById(userIds)).thenReturn(users);
        when(workItemRepository.save(workItem)).thenReturn(workItem);
        when(workItemMapper.toResponseDto(workItem)).thenReturn(responseDto);

        WorkItemResponseDto result = workItemService.assignUsers(workItem.getId(), assignDto);

        assertEquals(responseDto, result);
        assertEquals(users, workItem.getAssignees());
        assertTrue(users.get(0).getAssignedWorkItems().contains(workItem));
        assertEquals(1, users.get(1).getAssignedWorkItems().size());
        verify(workItemRepository, times(1)).findById(workItem.getId());
        verify(userRepository, times(1)).findAllById(userIds);
        verify(workItemRepository, times(1)).save(workItem);
        verify(workItemMapper, times(1)).toResponseDto(workItem);
    }

    @Test
    void testAssignUsers_UsersNotFound() {
        WorkItem workItem = BuildInstances.buildWorkItem();
        User user = BuildInstances.buildUser();
        List<Integer> userIds = List.of(1, 2);
        WorkItemAssignDto assignDto = new WorkItemAssignDto(userIds);

        when(workItemRepository.findById(1)).thenReturn(Optional.of(workItem));
        when(userRepository.findAllById(userIds)).thenReturn(List.of(user));

        NotFoundException exception = assertThrows(NotFoundException.class,
                () -> workItemService.assignUsers(1, assignDto));

        assertEquals("One or more users were not found", exception.getMessage());
    }

    @Test
    void testAssignUsers_WorkItemNotFound() {
        WorkItemAssignDto assignDto = new WorkItemAssignDto(List.of(1, 2));

        when(workItemRepository.findById(1)).thenReturn(Optional.empty());

        NotFoundException exception = assertThrows(NotFoundException.class,
                () -> workItemService.assignUsers(1, assignDto));

        assertEquals("WorkItem with id 1 not found", exception.getMessage());
    }

    @Test
    void testSetParent_Valid_EpicParent() {
        Project project = BuildInstances.buildProject();
        User reporter = BuildInstances.buildUser();

        WorkItem parent = WorkItem.builder()
                .id(1)
                .title("Epic 1")
                .itemType(ItemType.Epic)
                .project(project)
                .reporter(reporter)
                .assignees(new ArrayList<>())
                .comments(new ArrayList<>())
                .children(new ArrayList<>())
                .build();
        WorkItem child = WorkItem.builder()
                .id(2)
                .title("UserStory 1")
                .itemType(ItemType.User_Story)
                .project(project)
                .reporter(reporter)
                .assignees(new ArrayList<>())
                .comments(new ArrayList<>())
                .children(new ArrayList<>())
                .build();
        WorkItemResponseDto responseDto = BuildDtos.buildWorkItemResponseDto(child);

        when(workItemRepository.findById(child.getId())).thenReturn(Optional.of(child));
        when(workItemRepository.findById(parent.getId())).thenReturn(Optional.of(parent));
        when(workItemRepository.save(child)).thenReturn(child);
        when(workItemMapper.toResponseDto(child)).thenReturn(responseDto);

        WorkItemResponseDto result = workItemService.setParent(child.getId(), parent.getId());

        assertEquals(responseDto, result);
        assertEquals(parent, child.getParent());
        verify(workItemRepository, times(1)).findById(child.getId());
        verify(workItemRepository, times(1)).findById(parent.getId());
        verify(workItemRepository, times(1)).save(child);
        verify(workItemMapper, times(1)).toResponseDto(child);
    }

    @Test
    void testSetParent_Valid_UserStoryParent() {
        Project project = BuildInstances.buildProject();
        User reporter = BuildInstances.buildUser();

        WorkItem parent = WorkItem.builder()
                .id(1)
                .title("UserStory 1")
                .itemType(ItemType.User_Story)
                .reporter(reporter)
                .project(project)
                .assignees(new ArrayList<>())
                .comments(new ArrayList<>())
                .children(new ArrayList<>())
                .build();
        WorkItem child = WorkItem.builder()
                .id(2)
                .title("Task 1")
                .itemType(ItemType.Task)
                .reporter(reporter)
                .project(project)
                .assignees(new ArrayList<>())
                .comments(new ArrayList<>())
                .children(new ArrayList<>())
                .build();
        WorkItemResponseDto responseDto = BuildDtos.buildWorkItemResponseDto(child);

        when(workItemRepository.findById(child.getId())).thenReturn(Optional.of(child));
        when(workItemRepository.findById(parent.getId())).thenReturn(Optional.of(parent));
        when(workItemRepository.save(child)).thenReturn(child);
        when(workItemMapper.toResponseDto(child)).thenReturn(responseDto);

        WorkItemResponseDto result = workItemService.setParent(child.getId(), parent.getId());

        assertEquals(responseDto, result);
        assertEquals(parent, child.getParent());
        verify(workItemRepository, times(1)).findById(child.getId());
        verify(workItemRepository, times(1)).findById(parent.getId());
        verify(workItemRepository, times(1)).save(child);
        verify(workItemMapper, times(1)).toResponseDto(child);
    }

    @Test
    void testSetParent_ParentIsTask() {
        WorkItem parent = WorkItem.builder()
                .id(1)
                .itemType(ItemType.Task)
                .assignees(new ArrayList<>())
                .comments(new ArrayList<>())
                .children(new ArrayList<>())
                .build();

        WorkItem child = WorkItem.builder()
                .id(2)
                .itemType(ItemType.Task)
                .assignees(new ArrayList<>())
                .comments(new ArrayList<>())
                .children(new ArrayList<>())
                .build();

        when(workItemRepository.findById(child.getId())).thenReturn(Optional.of(child));
        when(workItemRepository.findById(parent.getId())).thenReturn(Optional.of(parent));

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> workItemService.setParent(child.getId(), parent.getId()));

        assertEquals("A Task cannot have children", exception.getMessage());
    }

    @Test
    void testSetParent_ParentIsBug() {
        WorkItem parent = WorkItem.builder()
                .id(1)
                .itemType(ItemType.Bug)
                .assignees(new ArrayList<>())
                .comments(new ArrayList<>())
                .children(new ArrayList<>())
                .build();

        WorkItem child = WorkItem.builder()
                .id(2)
                .itemType(ItemType.Task)
                .assignees(new ArrayList<>())
                .comments(new ArrayList<>())
                .children(new ArrayList<>())
                .build();

        when(workItemRepository.findById(child.getId())).thenReturn(Optional.of(child));
        when(workItemRepository.findById(parent.getId())).thenReturn(Optional.of(parent));

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> workItemService.setParent(child.getId(), parent.getId()));

        assertEquals("A Bug cannot have children", exception.getMessage());
    }

    @Test
    void testSetParent_ChildIsEpic() {
        WorkItem parent = WorkItem.builder()
                .id(1)
                .itemType(ItemType.Epic)
                .assignees(new ArrayList<>())
                .comments(new ArrayList<>())
                .children(new ArrayList<>())
                .build();

        WorkItem child = WorkItem.builder()
                .id(2)
                .itemType(ItemType.Epic)
                .assignees(new ArrayList<>())
                .comments(new ArrayList<>())
                .children(new ArrayList<>())
                .build();

        when(workItemRepository.findById(child.getId())).thenReturn(Optional.of(child));
        when(workItemRepository.findById(parent.getId())).thenReturn(Optional.of(parent));

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> workItemService.setParent(child.getId(), parent.getId()));

        assertEquals("An Epic cannot have a parent", exception.getMessage());
    }

    @Test
    void testSetParent_ChildNotFound() {
        when(workItemRepository.findById(1)).thenReturn(Optional.empty());

        NotFoundException exception = assertThrows(NotFoundException.class,
                () -> workItemService.setParent(1, 2));

        assertEquals("WorkItem with id 1 not found", exception.getMessage());
    }

    @Test
    void testSetParent_ParentNotFound() {
        WorkItem child = WorkItem.builder()
                .id(1)
                .itemType(ItemType.Task)
                .assignees(new ArrayList<>())
                .comments(new ArrayList<>())
                .children(new ArrayList<>())
                .build();

        when(workItemRepository.findById(child.getId())).thenReturn(Optional.of(child));
        when(workItemRepository.findById(2)).thenReturn(Optional.empty());

        NotFoundException exception = assertThrows(NotFoundException.class,
                () -> workItemService.setParent(child.getId(), 2));

        assertEquals("WorkItem with id 2 not found", exception.getMessage());
    }

    @Test
    void testRemoveParent_Valid() {
        Project project = BuildInstances.buildProject();
        User reporter = BuildInstances.buildUser();

        WorkItem parent = WorkItem.builder()
                .id(1)
                .itemType(ItemType.Epic)
                .build();
        WorkItem child = WorkItem.builder()
                .id(2)
                .title("Work item 1")
                .description("Description work item 1")
                .itemType(ItemType.Task)
                .status(Status.To_do)
                .severity(Severity.Low)
                .reporter(reporter)
                .parent(parent)
                .project(project)
                .assignees(new ArrayList<>())
                .comments(new ArrayList<>())
                .children(new ArrayList<>())
                .build();
        WorkItemResponseDto responseDto = BuildDtos.buildWorkItemResponseDto(child);

        when(workItemRepository.findById(child.getId())).thenReturn(Optional.of(child));
        when(workItemRepository.save(child)).thenReturn(child);
        when(workItemMapper.toResponseDto(child)).thenReturn(responseDto);

        WorkItemResponseDto result = workItemService.removeParent(child.getId());

        assertEquals(responseDto, result);
        assertNull(child.getParent());
        verify(workItemRepository, times(1)).findById(child.getId());
        verify(workItemRepository, times(1)).save(child);
        verify(workItemMapper, times(1)).toResponseDto(child);
    }

    @Test
    void testRemoveParent_WorkItemNotFound() {
        when(workItemRepository.findById(1)).thenReturn(Optional.empty());

        NotFoundException exception = assertThrows(NotFoundException.class,
                () -> workItemService.removeParent(1));

        assertEquals("WorkItem with id 1 not found", exception.getMessage());
    }

    @Test
    void testDeleteWorkItem_Valid() {
        WorkItem workItem = BuildInstances.buildWorkItem();
        List<User> assignees = BuildInstances.buildUsers();
        List<Comment> comments = BuildInstances.buildComments();
        workItem.setAssignees(assignees);
        workItem.setComments(comments);

        workItem.setItemType(ItemType.Epic);
        List<WorkItem> children = List.of(
                WorkItem.builder()
                    .id(2)
                    .itemType(ItemType.User_Story)
                    .parent(workItem)
                    .assignees(new ArrayList<>())
                    .comments(new ArrayList<>())
                    .children(new ArrayList<>())
                    .build(),
                WorkItem.builder()
                    .id(3)
                    .itemType(ItemType.User_Story)
                    .parent(workItem)
                    .assignees(new ArrayList<>())
                    .comments(new ArrayList<>())
                    .children(new ArrayList<>())
                    .build()
        );
        workItem.setChildren(children);

        when(workItemRepository.findById(1)).thenReturn(Optional.of(workItem));

        workItemService.deleteWorkItem(1);

        children.forEach(child -> assertNull(child.getParent()));
        assignees.forEach(a -> assertFalse(a.getAssignedWorkItems().contains(workItem)));
        verify(commentRepository, times(1)).deleteAll(comments);
        verify(workItemRepository, times(1)).deleteById(1);
    }

    @Test
    void testDeleteWorkItem_NotFound() {
        when(workItemRepository.findById(1)).thenReturn(Optional.empty());

        workItemService.deleteWorkItem(1);

        verify(commentRepository, never()).deleteAll(any());
        verify(workItemRepository, never()).deleteById(any());
    }
}