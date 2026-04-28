package flowmanager.nomenclator.service;

import flowmanager.nomenclator.dto.*;
import flowmanager.nomenclator.exception.NotFoundException;
import flowmanager.nomenclator.mapper.CommentMapper;
import flowmanager.nomenclator.mapper.WorkItemMapper;
import flowmanager.nomenclator.model.*;
import flowmanager.nomenclator.model.WorkItemAssignment.WorkItemAssignmentId;
import flowmanager.nomenclator.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WorkItemService {
    private final WorkItemRepository workItemRepository;
    private final UserRepository userRepository;
    private final CommentRepository commentRepository;
    private final ProjectRepository projectRepository;
    private final WorkItemMapper workItemMapper;
    private final WorkItemAssignmentRepository workItemAssignmentRepository;
    private final CommentMapper commentMapper;

    public List<WorkItemSummaryDto> findAllWorkItems() {
        return workItemRepository
                .findAll()
                .stream()
                .map(workItemMapper::toSummaryDto)
                .toList();
    }

    public List<CommentResponseWorkItemDto> findAllCommentsByWorkItemId(Integer workItemId) {
        workItemRepository.findById(workItemId).orElseThrow(
                () -> new NotFoundException(String.format("WorkItem with id %d not found", workItemId))
        );
        return commentRepository.findAllByWorkItemId(workItemId)
                .stream()
                .map(commentMapper::toResponseWorkItemDto)
                .toList();
    }

    public WorkItemResponseDto findWorkItemById(Integer workItemId) {
        return workItemMapper.toResponseDto(
                workItemRepository.findById(workItemId).orElseThrow(
                        () -> new NotFoundException(String.format("Work Item with id %d not found", workItemId))
                )
        );
    }

    @Transactional
    protected List<WorkItemAssignment> createAssignments(WorkItem workItem, List<Integer> assigneesIds) {
        return assigneesIds.stream()
                .distinct()
                .map(userId -> {
                    User user = userRepository.findById(userId).orElseThrow(
                            () -> new NotFoundException(String.format("User with id %d not found", userId))
                    );

                    WorkItemAssignmentId id = new WorkItemAssignmentId();
                    id.setWorkItemId(workItem.getId());
                    id.setUserId(userId);

                    return (WorkItemAssignment) WorkItemAssignment.builder()
                            .workItemAssignmentId(id)
                            .workItem(workItem)
                            .user(user)
                            .build();
                })
                .toList();
    }

    @Transactional
    public WorkItemResponseDto createWorkItem(WorkItemCreateDto workItemCreateDto) {
        Project project = projectRepository.findById(workItemCreateDto.getProjectId()).orElseThrow(
                () -> new NotFoundException(String.format("Project with id %d not found", workItemCreateDto.getProjectId()))
        );

        WorkItem workItem = workItemMapper.toEntity(workItemCreateDto, project);

        if (workItemCreateDto.getAssigneesIds() != null && !workItemCreateDto.getAssigneesIds().isEmpty()) {
            List<WorkItemAssignment> assignments = createAssignments(workItem, workItemCreateDto.getAssigneesIds());
            workItem.setAssignees(assignments);
        }
        workItemRepository.save(workItem);

        if(workItemCreateDto.getParentId() != null) {
            setParent(workItem.getId(), workItemCreateDto.getParentId());
        }

        return workItemMapper.toResponseDto(workItem);
    }

    public WorkItemResponseDto updateWorkItem(Integer workItemId, WorkItemUpdateDto workItemUpdateDto) {
        WorkItem workItem = workItemRepository.findById(workItemId).orElseThrow(
                () -> new NotFoundException(String.format("WorkItem with id %d not found", workItemId))
        );
        workItemMapper.updateEntityFromDto(workItemUpdateDto, workItem);

        return workItemMapper.toResponseDto(workItemRepository.save(workItem));
    }

    @Transactional
    public WorkItemResponseDto assignUsers(Integer workItemId, WorkItemAssignDto workItemAssignDto) {
        WorkItem workItem = workItemRepository.findById(workItemId).orElseThrow(
                () -> new NotFoundException(String.format("WorkItem with id %d not found", workItemId))
        );

        workItemAssignmentRepository.deleteByWorkItemId(workItemId);
        workItemAssignmentRepository.flush();

        List<WorkItemAssignment> assignments = createAssignments(workItem, workItemAssignDto.getAssigneesIds());

        workItemAssignmentRepository.saveAll(assignments);
        workItemAssignmentRepository.flush();
        workItem.setAssignees(assignments);

        return workItemMapper.toResponseDto(workItem);
    }

    public WorkItemResponseDto setParent(Integer childId, Integer parentId) {
        WorkItem child = workItemRepository.findById(childId).orElseThrow(
                () -> new NotFoundException(String.format("WorkItem with id %d not found", childId))
        );
        WorkItem parent = workItemRepository.findById(parentId).orElseThrow(
                () -> new NotFoundException(String.format("WorkItem with id %d not found", parentId))
        );

        if (parent.getItemType() == ItemType.Task) {
            throw new IllegalArgumentException("A Task cannot have children");
        }

        if (parent.getItemType() == ItemType.Bug) {
            throw new IllegalArgumentException("A Bug cannot have children");
        }

        if (child.getItemType() == ItemType.Epic) {
            throw new IllegalArgumentException("An Epic cannot have a parent");
        }

        child.setParent(parent);
        return workItemMapper.toResponseDto(workItemRepository.save(child));
    }

    public WorkItemResponseDto removeParent(Integer childId) {
        WorkItem child = workItemRepository.findById(childId).orElseThrow(
                () -> new NotFoundException(String.format("WorkItem with id %d not found", childId))
        );

        child.setParent(null);
        return workItemMapper.toResponseDto(workItemRepository.save(child));
    }

    @Transactional
    public void deleteWorkItem(Integer workItemId) {
        WorkItem workItem = workItemRepository.findById(workItemId).orElseThrow(
                () -> new NotFoundException(String.format("WorkItem with id %d not found", workItemId))
        );
        for (WorkItem child : workItem.getChildren()) {
            child.setParent(null);
        }
        workItemAssignmentRepository.deleteByWorkItemId(workItemId);
        workItemRepository.deleteById(workItemId);
    }
}