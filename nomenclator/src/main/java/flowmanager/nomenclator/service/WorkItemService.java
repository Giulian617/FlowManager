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
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
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
    private final CommentMapper commentMapper;

    private WorkItem getWorkItem(Integer workItemId) {
        return workItemRepository.findById(workItemId).orElseThrow(
                () -> new NotFoundException(String.format("WorkItem with id %d not found", workItemId))
        );
    }

    public List<WorkItemSummaryDto> findAllWorkItems(ItemType itemType, Status status, Severity severity) {
        Specification<WorkItem> specs = Specification.allOf();

        if (itemType != null) {
            specs = specs.and((root, query, cb) -> cb.equal(root.get("itemType"), itemType));
        }

        if (status != null) {
            specs = specs.and((root, query, cb) -> cb.equal(root.get("status"), status));
        }

        if (severity != null) {
            specs = specs.and((root, query, cb) -> cb.equal(root.get("severity"), severity));
        }

        return workItemRepository
                .findAll(specs)
                .stream()
                .map(workItemMapper::toSummaryDto)
                .toList();
    }

    public List<CommentResponseWorkItemDto> findAllCommentsByWorkItemId(Integer workItemId) {
        return getWorkItem(workItemId)
                .getComments()
                .stream()
                .map(commentMapper::toResponseWorkItemDto)
                .toList();
    }

    public WorkItemResponseDto findWorkItemById(Integer workItemId) {
        return workItemMapper.toResponseDto(getWorkItem(workItemId));
    }

    @Transactional
    protected List<User> getAssignedUsers(List<Integer> assigneesIds) {
        List<User> users = userRepository.findAllById(assigneesIds);
        if(users.size() != assigneesIds.size()) {
            throw new NotFoundException("One or more users were not found");
        }
        return users;
    }

    @Transactional
    public WorkItemResponseDto createWorkItem(WorkItemCreateDto workItemCreateDto) {
        Project project = projectRepository.findById(workItemCreateDto.getProjectId()).orElseThrow(
                () -> new NotFoundException(String.format("Project with id %d not found", workItemCreateDto.getProjectId()))
        );
        WorkItem workItem = workItemMapper.toEntity(workItemCreateDto, project);

        if (workItemCreateDto.getAssigneesIds() != null && !workItemCreateDto.getAssigneesIds().isEmpty()) {
            List<User> assignedUsers = getAssignedUsers(workItemCreateDto.getAssigneesIds());
            workItem.setAssignees(assignedUsers);
        }
        workItemRepository.save(workItem);

        if(workItemCreateDto.getParentId() != null) {
            setParent(workItem.getId(), workItemCreateDto.getParentId());
        }

        return workItemMapper.toResponseDto(workItem);
    }

    public WorkItemResponseDto updateWorkItem(Integer workItemId, WorkItemUpdateDto workItemUpdateDto) {
        WorkItem workItem = getWorkItem(workItemId);
        workItemMapper.updateEntityFromDto(workItemUpdateDto, workItem);

        return workItemMapper.toResponseDto(workItemRepository.save(workItem));
    }

    @Transactional
    public WorkItemResponseDto assignUsers(Integer workItemId, WorkItemAssignDto workItemAssignDto) {
        WorkItem workItem = getWorkItem(workItemId);
        List<User> assignedUsers = getAssignedUsers(workItemAssignDto.getAssigneesIds());
        workItem.setAssignees(assignedUsers);
        assignedUsers.forEach(user -> {
            if(!user.getAssignedWorkItems().contains(workItem)) {
                user.getAssignedWorkItems().add(workItem);
            }
        });

        return workItemMapper.toResponseDto(workItemRepository.save(workItem));
    }

    public WorkItemResponseDto setParent(Integer childId, Integer parentId) {
        WorkItem child = getWorkItem(childId);
        WorkItem parent = getWorkItem(parentId);

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
        WorkItem child = getWorkItem(childId);

        child.setParent(null);
        return workItemMapper.toResponseDto(workItemRepository.save(child));
    }

    @Transactional
    public void deleteWorkItem(Integer workItemId) {
        WorkItem workItem = workItemRepository.findById(workItemId).orElse(null);
        if(workItem == null) {
            return;
        }

        for (WorkItem child : workItem.getChildren()) {
            child.setParent(null);
        }
        workItem.getAssignees()
                .forEach(user -> user.getAssignedWorkItems().remove(workItem));

        commentRepository.deleteAll(workItem.getComments());
        workItemRepository.deleteById(workItemId);
    }
}