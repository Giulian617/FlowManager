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

        when(workItemRepository.findAll(any(Specification.class))).thenReturn(workItems);
        when(workItemMapper.toSummaryDto(workItems.get(0))).thenReturn(workItemsDto.get(0));
        when(workItemMapper.toSummaryDto(workItems.get(1))).thenReturn(workItemsDto.get(1));

        List<WorkItemSummaryDto> result = workItemService.findAllWorkItems(null, null, null);

        assertEquals(2, result.size());
        assertEquals(workItemsDto.get(0), result.get(0));
        assertEquals(workItemsDto.get(1), result.get(1));
        verify(workItemRepository, times(1)).findAll(any(Specification.class));
        verify(workItemMapper, times(1)).toSummaryDto(workItems.get(0));
        verify(workItemMapper, times(1)).toSummaryDto(workItems.get(1));
    }

    @Test
    void testFindAllWorkItems_WithItemTypeFilter() {
        List<WorkItem> workItems = BuildInstances.buildWorkItems();
        List<WorkItemSummaryDto> workItemsDto = workItems.stream()
                .map(BuildDtos::buildWorkItemSummaryDto)
                .toList();

        when(workItemRepository.findAll(any(Specification.class))).thenReturn(workItems);
        when(workItemMapper.toSummaryDto(workItems.get(0))).thenReturn(workItemsDto.get(0));
        when(workItemMapper.toSummaryDto(workItems.get(1))).thenReturn(workItemsDto.get(1));

        List<WorkItemSummaryDto> result = workItemService.findAllWorkItems(ItemType.Task, null, null);

        assertEquals(2, result.size());
        verify(workItemRepository, times(1)).findAll(any(Specification.class));
    }

    @Test
    void testFindAllWorkItems_WithStatusFilter() {
        List<WorkItem> workItems = BuildInstances.buildWorkItems();
        List<WorkItemSummaryDto> workItemsDto = workItems.stream()
                .map(BuildDtos::buildWorkItemSummaryDto)
                .toList();

        when(workItemRepository.findAll(any(Specification.class))).thenReturn(workItems);
        when(workItemMapper.toSummaryDto(workItems.get(0))).thenReturn(workItemsDto.get(0));
        when(workItemMapper.toSummaryDto(workItems.get(1))).thenReturn(workItemsDto.get(1));

        List<WorkItemSummaryDto> result = workItemService.findAllWorkItems(null, Status.To_do, null);

        assertEquals(2, result.size());
        verify(workItemRepository, times(1)).findAll(any(Specification.class));
    }

    @Test
    void testFindAllWorkItems_WithSeverityFilter() {
        List<WorkItem> workItems = BuildInstances.buildWorkItems();
        List<WorkItemSummaryDto> workItemsDto = workItems.stream()
                .map(BuildDtos::buildWorkItemSummaryDto)
                .toList();

        when(workItemRepository.findAll(any(Specification.class))).thenReturn(workItems);
        when(workItemMapper.toSummaryDto(workItems.get(0))).thenReturn(workItemsDto.get(0));
        when(workItemMapper.toSummaryDto(workItems.get(1))).thenReturn(workItemsDto.get(1));

        List<WorkItemSummaryDto> result = workItemService.findAllWorkItems(null, null, Severity.Low);

        assertEquals(2, result.size());
        verify(workItemRepository, times(1)).findAll(any(Specification.class));
    }

    @Test
    void testFindAllWorkItems_WithAllFilters() {
        List<WorkItem> workItems = BuildInstances.buildWorkItems();
        List<WorkItemSummaryDto> workItemsDto = workItems.stream()
                .map(BuildDtos::buildWorkItemSummaryDto)
                .toList();

        when(workItemRepository.findAll(any(Specification.class))).thenReturn(workItems);
        when(workItemMapper.toSummaryDto(workItems.get(0))).thenReturn(workItemsDto.get(0));
        when(workItemMapper.toSummaryDto(workItems.get(1))).thenReturn(workItemsDto.get(1));

        List<WorkItemSummaryDto> result = workItemService.findAllWorkItems(ItemType.Task, Status.To_do, Severity.Low);

        assertEquals(2, result.size());
        verify(workItemRepository, times(1)).findAll(any(Specification.class));
    }

    @Test
    void testFindAllWorkItems_EmptyList() {
        when(workItemRepository.findAll(any(Specification.class))).thenReturn(List.of());

        List<WorkItemSummaryDto> result = workItemService.findAllWorkItems(null, null, null);

        assertEquals(0, result.size());
        verify(workItemRepository, times(1)).findAll(any(Specification.class));
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

        when(workItemRepository.findById(1)).thenReturn(Optional.of(workItem));
        when(workItemMapper.toResponseDto(workItem)).thenReturn(responseDto);

        WorkItemResponseDto result = workItemService.findWorkItemById(1);

        assertNotNull(result);
        assertEquals(responseDto, result);
        verify(workItemRepository, times(1)).findById(1);
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

        WorkItem workItem = WorkItem.builder()
                .title("Work item 1")
                .description("Description work item 1")
                .itemType(ItemType.Task)
                .status(Status.To_do)
                .severity(Severity.Low)
                .createdAt(LocalDateTime.of(2026, 3, 20, 18, 33, 30))
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

        when(projectRepository.findById(1)).thenReturn(Optional.of(project));
        when(workItemMapper.toEntity(createDto, project)).thenReturn(workItem);
        when(workItemRepository.save(workItem)).thenReturn(savedWorkItem);
        when(workItemMapper.toResponseDto(workItem)).thenReturn(responseDto);

        WorkItemResponseDto result = workItemService.createWorkItem(createDto);

        assertEquals(responseDto, result);
        verify(projectRepository, times(1)).findById(1);
        verify(workItemMapper, times(1)).toEntity(createDto, project);
        verify(workItemRepository, times(1)).save(workItem);
        verify(userRepository, never()).findAllById(any());
    }

    @Test
    void testCreateWorkItem_Valid_WithAssignees() {
        Project project = BuildInstances.buildProject();
        List<User> users = BuildInstances.buildUsers();
        List<Integer> assigneesIds = List.of(1, 2);

        WorkItem workItem = WorkItem.builder()
                .title("Work item 1")
                .description("Description work item 1")
                .itemType(ItemType.Task)
                .status(Status.To_do)
                .severity(Severity.Low)
                .createdAt(LocalDateTime.of(2026, 3, 20, 18, 33, 30))
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

        when(projectRepository.findById(1)).thenReturn(Optional.of(project));
        when(workItemMapper.toEntity(createDto, project)).thenReturn(workItem);
        when(userRepository.findAllById(assigneesIds)).thenReturn(users);
        when(workItemRepository.save(workItem)).thenReturn(savedWorkItem);
        when(workItemMapper.toResponseDto(workItem)).thenReturn(responseDto);

        WorkItemResponseDto result = workItemService.createWorkItem(createDto);

        assertEquals(responseDto, result);
        assertEquals(users, workItem.getAssignees());
        verify(userRepository, times(1)).findAllById(assigneesIds);
        verify(workItemRepository, times(1)).save(workItem);
    }

    @Test
    void testCreateWorkItem_EmptyAssigneesList() {
        Project project = BuildInstances.buildProject();

        WorkItem workItem = WorkItem.builder()
                .title("Work item 1")
                .description("Description work item 1")
                .itemType(ItemType.Task)
                .status(Status.To_do)
                .severity(Severity.Low)
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

        when(projectRepository.findById(1)).thenReturn(Optional.of(project));
        when(workItemMapper.toEntity(createDto, project)).thenReturn(workItem);
        when(workItemRepository.save(workItem)).thenReturn(savedWorkItem);
        when(workItemMapper.toResponseDto(workItem)).thenReturn(BuildDtos.buildWorkItemResponseDto(savedWorkItem));

        WorkItemResponseDto result = workItemService.createWorkItem(createDto);

        assertNotNull(result);
        verify(userRepository, never()).findAllById(any());
        verify(workItemRepository, times(1)).save(workItem);
    }

    @Test
    void testCreateWorkItem_ProjectNotFound() {
        WorkItemCreateDto createDto = new WorkItemCreateDto(
                "Work item 1",
                "Description work item 1",
                ItemType.Task,
                Severity.Low,
                99,
                null,
                null,
                null
        );

        when(projectRepository.findById(99)).thenReturn(Optional.empty());

        NotFoundException exception = assertThrows(NotFoundException.class,
                () -> workItemService.createWorkItem(createDto));

        assertEquals("Project with id 99 not found", exception.getMessage());
        verify(workItemRepository, never()).save(any());
    }

    @Test
    void testCreateWorkItem_AssigneesNotFound() {
        Project project = BuildInstances.buildProject();

        WorkItem workItem = WorkItem.builder()
                .title("Work item 1")
                .description("Description work item 1")
                .itemType(ItemType.Task)
                .severity(Severity.Low)
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

        when(projectRepository.findById(1)).thenReturn(Optional.of(project));
        when(workItemMapper.toEntity(createDto, project)).thenReturn(workItem);
        when(userRepository.findAllById(List.of(1, 2))).thenReturn(List.of(BuildInstances.buildUser()));

        NotFoundException exception = assertThrows(NotFoundException.class,
                () -> workItemService.createWorkItem(createDto));

        assertEquals("One or more users were not found", exception.getMessage());
        verify(workItemRepository, never()).save(any());
    }

    @Test
    void testCreateWorkItem_Valid_WithParent() {
        Project project = BuildInstances.buildProject();
        User reporter = BuildInstances.buildUser();

        WorkItem parent = WorkItem.builder()
                .id(2)
                .title("UserStory 1")
                .itemType(ItemType.User_Story)
                .reporter(reporter)
                .project(project)
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
                .reporter(reporter)
                .project(project)
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

        when(projectRepository.findById(1)).thenReturn(Optional.of(project));
        when(workItemMapper.toEntity(createDto, project)).thenReturn(workItem);
        when(workItemRepository.save(workItem)).thenReturn(workItem);
        when(workItemRepository.findById(1)).thenReturn(Optional.of(workItem));
        when(workItemRepository.findById(2)).thenReturn(Optional.of(parent));
        when(workItemMapper.toResponseDto(workItem)).thenReturn(responseDto);

        WorkItemResponseDto result = workItemService.createWorkItem(createDto);

        assertEquals(responseDto, result);
        assertEquals(parent, workItem.getParent());
        verify(workItemRepository, times(2)).save(workItem);
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

        WorkItemUpdateDto updateDto = new WorkItemUpdateDto("Work item 1 actualizat", "Description work item 1", Status.In_Progress, Severity.Medium, null);

        WorkItemResponseDto responseDto = BuildDtos.buildWorkItemResponseDto(updatedWorkItem);

        when(workItemRepository.findById(1)).thenReturn(Optional.of(workItem));
        doNothing().when(workItemMapper).updateEntityFromDto(updateDto, workItem);
        when(workItemRepository.save(workItem)).thenReturn(updatedWorkItem);
        when(workItemMapper.toResponseDto(updatedWorkItem)).thenReturn(responseDto);

        WorkItemResponseDto result = workItemService.updateWorkItem(1, updateDto);

        assertEquals(responseDto, result);
        verify(workItemRepository, times(1)).findById(1);
        verify(workItemMapper, times(1)).updateEntityFromDto(updateDto, workItem);
        verify(workItemRepository, times(1)).save(workItem);
        verify(workItemMapper, times(1)).toResponseDto(updatedWorkItem);
    }

    @Test
    void testUpdateWorkItem_NotFound() {
        when(workItemRepository.findById(1)).thenReturn(Optional.empty());

        NotFoundException exception = assertThrows(NotFoundException.class,
                () -> workItemService.updateWorkItem(1, new WorkItemUpdateDto()));

        assertEquals("WorkItem with id 1 not found", exception.getMessage());
        verify(workItemRepository, never()).save(any());
    }


    @Test
    void testAssignUsers_Valid() {
        WorkItem workItem = BuildInstances.buildWorkItem();
        List<User> users = BuildInstances.buildUsers();
        List<Integer> assigneesIds = List.of(1, 2);

        WorkItemAssignDto assignDto = new WorkItemAssignDto(assigneesIds);
        WorkItemResponseDto responseDto = BuildDtos.buildWorkItemResponseDto(workItem);

        when(workItemRepository.findById(1)).thenReturn(Optional.of(workItem));
        when(userRepository.findAllById(assigneesIds)).thenReturn(users);
        when(workItemMapper.toResponseDto(workItem)).thenReturn(responseDto);

        WorkItemResponseDto result = workItemService.assignUsers(1, assignDto);

        assertEquals(responseDto, result);
        assertEquals(users, workItem.getAssignees());
        //verify(workItemRepository, never()).save(any());
        verify(workItemRepository, times(1)).findById(1);
        verify(userRepository, times(1)).findAllById(assigneesIds);
        verify(workItemMapper, times(1)).toResponseDto(workItem);
    }

    @Test
    void testAssignUsers_UsersNotFound() {
        WorkItem workItem = BuildInstances.buildWorkItem();
        List<Integer> assigneesIds = List.of(1, 2);

        WorkItemAssignDto assignDto = new WorkItemAssignDto(assigneesIds);

        when(workItemRepository.findById(1)).thenReturn(Optional.of(workItem));
        when(userRepository.findAllById(assigneesIds)).thenReturn(List.of(BuildInstances.buildUser()));

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
                .id(2)
                .title("Epic 1")
                .itemType(ItemType.Epic)
                .project(project)
                .reporter(reporter)
                .assignees(new ArrayList<>())
                .comments(new ArrayList<>())
                .children(new ArrayList<>())
                .build();

        WorkItem child = WorkItem.builder()
                .id(1)
                .title("UserStory 1")
                .itemType(ItemType.User_Story)
                .project(project)
                .reporter(reporter)
                .assignees(new ArrayList<>())
                .comments(new ArrayList<>())
                .children(new ArrayList<>())
                .build();

        WorkItemResponseDto responseDto = BuildDtos.buildWorkItemResponseDto(child);

        when(workItemRepository.findById(1)).thenReturn(Optional.of(child));
        when(workItemRepository.findById(2)).thenReturn(Optional.of(parent));
        when(workItemRepository.save(child)).thenReturn(child);
        when(workItemMapper.toResponseDto(child)).thenReturn(responseDto);

        WorkItemResponseDto result = workItemService.setParent(1, 2);

        assertEquals(responseDto, result);
        assertEquals(parent, child.getParent());
        verify(workItemRepository, times(1)).save(child);
        verify(workItemMapper, times(1)).toResponseDto(child);
    }

    @Test
    void testSetParent_Valid_UserStoryParent() {
        Project project = BuildInstances.buildProject();
        User reporter = BuildInstances.buildUser();

        WorkItem parent = WorkItem.builder()
                .id(2)
                .title("UserStory 1")
                .itemType(ItemType.User_Story)
                .reporter(reporter)
                .project(project)
                .assignees(new ArrayList<>())
                .comments(new ArrayList<>())
                .children(new ArrayList<>())
                .build();

        WorkItem child = WorkItem.builder()
                .id(1)
                .title("Task 1")
                .itemType(ItemType.Task)
                .reporter(reporter)
                .project(project)
                .assignees(new ArrayList<>())
                .comments(new ArrayList<>())
                .children(new ArrayList<>())
                .build();

        WorkItemResponseDto responseDto = BuildDtos.buildWorkItemResponseDto(child);

        when(workItemRepository.findById(1)).thenReturn(Optional.of(child));
        when(workItemRepository.findById(2)).thenReturn(Optional.of(parent));
        when(workItemRepository.save(child)).thenReturn(child);
        when(workItemMapper.toResponseDto(child)).thenReturn(responseDto);

        WorkItemResponseDto result = workItemService.setParent(1, 2);

        assertEquals(responseDto, result);
        assertEquals(parent, child.getParent());
    }

    @Test
    void testSetParent_ParentIsTask() {
        WorkItem parent = WorkItem.builder()
                .id(2)
                .itemType(ItemType.Task)
                .assignees(new ArrayList<>())
                .comments(new ArrayList<>())
                .children(new ArrayList<>())
                .build();

        WorkItem child = WorkItem.builder()
                .id(1)
                .itemType(ItemType.Task)
                .assignees(new ArrayList<>())
                .comments(new ArrayList<>())
                .children(new ArrayList<>())
                .build();

        when(workItemRepository.findById(1)).thenReturn(Optional.of(child));
        when(workItemRepository.findById(2)).thenReturn(Optional.of(parent));

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> workItemService.setParent(1, 2));

        assertEquals("A Task cannot have children", exception.getMessage());
        verify(workItemRepository, never()).save(any());
    }

    @Test
    void testSetParent_ParentIsBug() {
        WorkItem parent = WorkItem.builder()
                .id(2)
                .itemType(ItemType.Bug)
                .assignees(new ArrayList<>())
                .comments(new ArrayList<>())
                .children(new ArrayList<>())
                .build();

        WorkItem child = WorkItem.builder()
                .id(1)
                .itemType(ItemType.Task)
                .assignees(new ArrayList<>())
                .comments(new ArrayList<>())
                .children(new ArrayList<>())
                .build();

        when(workItemRepository.findById(1)).thenReturn(Optional.of(child));
        when(workItemRepository.findById(2)).thenReturn(Optional.of(parent));

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> workItemService.setParent(1, 2));

        assertEquals("A Bug cannot have children", exception.getMessage());
        verify(workItemRepository, never()).save(any());
    }

    @Test
    void testSetParent_ChildIsEpic() {
        WorkItem parent = WorkItem.builder()
                .id(2)
                .itemType(ItemType.Epic)
                .assignees(new ArrayList<>())
                .comments(new ArrayList<>())
                .children(new ArrayList<>())
                .build();

        WorkItem child = WorkItem.builder()
                .id(1)
                .itemType(ItemType.Epic)
                .assignees(new ArrayList<>())
                .comments(new ArrayList<>())
                .children(new ArrayList<>())
                .build();

        when(workItemRepository.findById(1)).thenReturn(Optional.of(child));
        when(workItemRepository.findById(2)).thenReturn(Optional.of(parent));

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> workItemService.setParent(1, 2));

        assertEquals("An Epic cannot have a parent", exception.getMessage());
        verify(workItemRepository, never()).save(any());
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

        when(workItemRepository.findById(1)).thenReturn(Optional.of(child));
        when(workItemRepository.findById(2)).thenReturn(Optional.empty());

        NotFoundException exception = assertThrows(NotFoundException.class,
                () -> workItemService.setParent(1, 2));

        assertEquals("WorkItem with id 2 not found", exception.getMessage());
    }

    @Test
    void testRemoveParent_Valid() {
        Project project = BuildInstances.buildProject();
        User reporter = BuildInstances.buildUser();

        WorkItem parent = WorkItem.builder()
                .id(2)
                .itemType(ItemType.Epic)
                .build();

        WorkItem child = WorkItem.builder()
                .id(1)
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

        when(workItemRepository.findById(1)).thenReturn(Optional.of(child));
        when(workItemRepository.save(child)).thenReturn(child);
        when(workItemMapper.toResponseDto(child)).thenReturn(responseDto);

        WorkItemResponseDto result = workItemService.removeParent(1);

        assertEquals(responseDto, result);
        assertNull(child.getParent());
        verify(workItemRepository, times(1)).findById(1);
        verify(workItemRepository, times(1)).save(child);
        verify(workItemMapper, times(1)).toResponseDto(child);
    }

    @Test
    void testRemoveParent_WorkItemNotFound() {
        when(workItemRepository.findById(1)).thenReturn(Optional.empty());

        NotFoundException exception = assertThrows(NotFoundException.class,
                () -> workItemService.removeParent(1));

        assertEquals("WorkItem with id 1 not found", exception.getMessage());
        verify(workItemRepository, never()).save(any());
    }


    @Test
    void testDeleteWorkItem_Valid_NoChildren_NoComments() {
        WorkItem workItem = WorkItem.builder()
                .id(1)
                .title("Work item 1")
                .itemType(ItemType.Task)
                .assignees(new ArrayList<>())
                .comments(new ArrayList<>())
                .children(new ArrayList<>())
                .build();

        when(workItemRepository.findById(1)).thenReturn(Optional.of(workItem));

        workItemService.deleteWorkItem(1);

        verify(workItemRepository, times(1)).deleteById(1);
        verify(commentRepository, times(1)).deleteAll(workItem.getComments());
    }

    @Test
    void testDeleteWorkItem_ClearsAssigneesAndDeletesComments() {
        List<User> assignees = new ArrayList<>(BuildInstances.buildUsers());
        List<Comment> comments = new ArrayList<>(BuildInstances.buildComments());

        WorkItem workItem = WorkItem.builder()
                .id(1)
                .itemType(ItemType.Task)
                .assignees(assignees)
                .comments(comments)
                .children(new ArrayList<>())
                .build();

        when(workItemRepository.findById(1)).thenReturn(Optional.of(workItem));

        workItemService.deleteWorkItem(1);

        assertTrue(workItem.getAssignees().isEmpty());
        verify(commentRepository, times(1)).deleteAll(comments);
        verify(workItemRepository, times(1)).deleteById(1);
    }

    @Test
    void testDeleteWorkItem_ClearsChildrenParent() {
        WorkItem parent = WorkItem.builder()
                .id(1)
                .itemType(ItemType.Epic)
                .assignees(new ArrayList<>())
                .comments(new ArrayList<>())
                .build();

        WorkItem child1 = WorkItem.builder()
                .id(2)
                .itemType(ItemType.User_Story)
                .parent(parent)
                .assignees(new ArrayList<>())
                .comments(new ArrayList<>())
                .children(new ArrayList<>())
                .build();

        WorkItem child2 = WorkItem.builder()
                .id(3)
                .itemType(ItemType.User_Story)
                .parent(parent)
                .assignees(new ArrayList<>())
                .comments(new ArrayList<>())
                .children(new ArrayList<>())
                .build();

        parent.setChildren(new ArrayList<>(List.of(child1, child2)));

        when(workItemRepository.findById(1)).thenReturn(Optional.of(parent));

        workItemService.deleteWorkItem(1);

        assertNull(child1.getParent());
        assertNull(child2.getParent());
        verify(commentRepository, times(1)).deleteAll(parent.getComments());
        verify(workItemRepository, times(1)).deleteById(1);
    }

    @Test
    void testDeleteWorkItem_NotFound() {
        when(workItemRepository.findById(1)).thenReturn(Optional.empty());

        workItemService.deleteWorkItem(1);

        verify(workItemRepository, never()).deleteById(anyInt());
        verify(commentRepository, never()).deleteAll(any());
    }

}