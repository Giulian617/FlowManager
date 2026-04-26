package flowmanager.nomenclator.service;

import flowmanager.nomenclator.dto.*;
import flowmanager.nomenclator.exception.NotFoundException;
import flowmanager.nomenclator.mapper.WorkItemMapper;
import flowmanager.nomenclator.model.*;
import flowmanager.nomenclator.repository.ProjectRepository;
import flowmanager.nomenclator.repository.UserRepository;
import flowmanager.nomenclator.repository.WorkItemAssignmentRepository;
import flowmanager.nomenclator.repository.WorkItemRepository;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WorkItemService {
    private final WorkItemRepository workItemRepository;
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final WorkItemMapper workItemMapper;
    private final WorkItemAssignmentRepository workItemAssignmentRepository;

    public List<WorkItemSummaryDto> findAllWorkItems() {
        return workItemRepository
                .findAll()
                .stream()
                .map(workItemMapper::toSummaryDto)
                .toList();
    }

    @Transactional
    public WorkItemResponseDto findWorkItemById(Integer workItemId) {
        return workItemMapper.toResponseDto(
                workItemRepository.findByIdWithAssignees(workItemId).orElseThrow(
                        () -> new NotFoundException(String.format("Work Item with id %d not found", workItemId))
                )
        );
    }

    @Transactional
    public WorkItemResponseDto createWorkItem(WorkItemCreateDto dto, Integer projectId) {
        Project project = projectRepository.findById(projectId).orElseThrow(
                () -> new NotFoundException(String.format("Project with id %d not found", projectId))
        );

        WorkItem workItem = workItemMapper.toEntity(dto, project);
        workItemRepository.save(workItem);

        if (dto.getAssigneesId() != null && !dto.getAssigneesId().isEmpty()) {
            List<WorkItemAssignment> assignments = dto.getAssigneesId().stream()
                    .map(userId -> {
                        User user = userRepository.findById(userId).orElseThrow(
                                () -> new NotFoundException(String.format("User with id %d not found", userId))
                        );
                        return WorkItemAssignment.builder()
                                .workItem(workItem)
                                .user(user)
                                .build();
                    })
                    .toList();
            workItemAssignmentRepository.saveAll(assignments);
            workItemAssignmentRepository.flush();
            workItem.setAssignees(new java.util.LinkedHashSet<>(assignments));
        }

        return workItemMapper.toResponseDto(workItem);
    }

    @Transactional
    public WorkItemResponseDto setParent(Integer childId, Integer parentId) {
        WorkItem child = workItemRepository.findByIdWithAssignees(childId).orElseThrow(
                () -> new NotFoundException(String.format("WorkItem with id %d not found", childId))
        );
        WorkItem parent = workItemRepository.findByIdWithAssignees(parentId).orElseThrow(
                () -> new NotFoundException(String.format("WorkItem with id %d not found", parentId))
        );

        if (parent.getType() == ItemType.Task) {
            throw new IllegalArgumentException("A Task cannot have children");
        }

        if (parent.getType() == ItemType.Bug) {
            throw new IllegalArgumentException("A Bug cannot have children");
        }

        if (child.getType() == ItemType.Epic) {
            throw new IllegalArgumentException("An Epic cannot have a parent");
        }

        child.setParent(parent);
        return workItemMapper.toResponseDto(workItemRepository.save(child));
    }


    @Transactional
    public WorkItemResponseDto removeParent(Integer childId) {
        WorkItem child = workItemRepository.findByIdWithAssignees(childId).orElseThrow(
                () -> new NotFoundException(String.format("WorkItem with id %d not found", childId))
        );

        child.setParent(null);
        return workItemMapper.toResponseDto(workItemRepository.save(child));
    }

    @Transactional
    public WorkItemResponseDto updateWorkItem(Integer workItemId, WorkItemUpdateDto dto) {
        WorkItem workItem = workItemRepository.findByIdWithAssignees(workItemId).orElseThrow(
                () -> new NotFoundException(String.format("WorkItem with id %d not found", workItemId))
        );

        workItemMapper.updateEntityFromDto(dto, workItem);
        return workItemMapper.toResponseDto(workItemRepository.save(workItem));
    }

    @Transactional
    public WorkItemResponseDto assignUsers(Integer workItemId, WorkItemAssignDto dto) {
        WorkItem workItem = workItemRepository.findByIdWithAssignees(workItemId).orElseThrow(
                () -> new NotFoundException(String.format("WorkItem with id %d not found", workItemId))
        );

        workItemAssignmentRepository.deleteByWorkItemId(workItemId);
        workItemAssignmentRepository.flush();

        List<WorkItemAssignment> assignments = dto.getAssigneesId().stream()
                .map(userId -> {
                    User user = userRepository.findById(userId).orElseThrow(
                            () -> new NotFoundException(String.format("User with id %d not found", userId))
                    );
                    return WorkItemAssignment.builder()
                            .workItem(workItem)
                            .user(user)
                            .build();
                })
                .toList();

        workItemAssignmentRepository.saveAll(assignments);
        workItemAssignmentRepository.flush();

        workItem.getAssignees().clear();
        workItem.getAssignees().addAll(assignments);

        return workItemMapper.toResponseDto(workItem);
    }

    @Transactional
    public void deleteWorkItem(Integer workItemId) {
        workItemRepository.findById(workItemId).orElseThrow(
                () -> new NotFoundException(String.format("WorkItem with id %d not found", workItemId))
        );
        workItemAssignmentRepository.deleteByWorkItemId(workItemId);
        workItemRepository.deleteById(workItemId);
    }
}