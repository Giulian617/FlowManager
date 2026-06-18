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
import flowmanager.nomenclator.repository.spec.WorkItemSpecifications;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.stream.Stream;

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

    public PageResponseDto<WorkItemSummaryDto> findAllWorkItems(
            String search,
            List<ItemType> itemTypes,
            List<Status> statuses,
            List<Severity> severities,
            List<Integer> reporterIds,
            List<Integer> assigneeIds,
            Boolean unassigned,
            Integer projectId,
            Pageable pageable) {
        List<Specification<WorkItem>> specs = Stream.of(
                WorkItemSpecifications.projectIdEquals(projectId),
                WorkItemSpecifications.search(search),
                WorkItemSpecifications.itemTypeIn(itemTypes),
                WorkItemSpecifications.statusIn(statuses),
                WorkItemSpecifications.severityIn(severities),
                WorkItemSpecifications.reporterIdIn(reporterIds),
                WorkItemSpecifications.assigneeFilter(assigneeIds, Boolean.TRUE.equals(unassigned))
        ).filter(Objects::nonNull).toList();

        return PageResponseDto.from(
                workItemRepository.findAll(Specification.allOf(specs), pageable),
                workItemMapper::toSummaryDto);
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
    public WorkItemResponseDto createWorkItem(WorkItemCreateDto workItemCreateDto, String keycloakId) {
        Project project = projectRepository.findById(workItemCreateDto.getProjectId()).orElseThrow(
                () -> new NotFoundException(String.format("Project with id %d not found", workItemCreateDto.getProjectId()))
        );
        User user = userRepository.findByKeycloakId(keycloakId).orElseThrow(
                () -> new NotFoundException("User not found")
        );
        WorkItem workItem = workItemMapper.toEntity(workItemCreateDto, project, user);

        if (workItemCreateDto.getAssigneesIds() != null && !workItemCreateDto.getAssigneesIds().isEmpty()) {
            List<User> assignedUsers = getAssignedUsers(workItemCreateDto.getAssigneesIds());
            assignedUsers.forEach(assignee -> {
                if (!assignee.getAssignedWorkItems().contains(workItem)) {
                    assignee.getAssignedWorkItems().add(workItem);
                }
            });
            workItem.setAssignees(assignedUsers);
        }
        workItemRepository.save(workItem);

        if(workItemCreateDto.getParentId() != null) {
            setParent(workItem.getId(), workItemCreateDto.getParentId());
        }

        return workItemMapper.toResponseDto(workItem);
    }

    @Transactional
    public WorkItemResponseDto updateWorkItem(Integer workItemId, WorkItemUpdateDto workItemUpdateDto) {
        WorkItem workItem = getWorkItem(workItemId);

        if(workItemUpdateDto.getAssigneesIds() != null) {
            List<User> previousAssignees = workItem.getAssignees();
            List<User> newAssignees = getAssignedUsers(workItemUpdateDto.getAssigneesIds());

            previousAssignees.forEach(user -> {
                if (!newAssignees.contains(user)) {
                    user.getAssignedWorkItems().remove(workItem);
                }
            });

            newAssignees.forEach(user -> {
                if (!user.getAssignedWorkItems().contains(workItem)) {
                    user.getAssignedWorkItems().add(workItem);
                }
            });

            workItem.setAssignees(newAssignees);
        }

        workItemMapper.updateEntityFromDto(workItemUpdateDto, workItem);

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