package flowmanager.nomenclator.mapper;

import flowmanager.nomenclator.dto.*;
import flowmanager.nomenclator.exception.NotFoundException;
import flowmanager.nomenclator.model.*;
import flowmanager.nomenclator.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class WorkItemMapper {
    private final UserRepository userRepository;
    private final CommentMapper commentMapper;

    public WorkItem toEntity(WorkItemCreateDto dto, Project project) {
        return WorkItem.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .itemType(dto.getItemType())
                .status(Status.To_do)
                .severity(dto.getSeverity())
                .createdAt(LocalDateTime.now())
                .dueDate(dto.getDueDate())
                .project(project)
                .reporter(userRepository.findById(1).orElseThrow(
                        () -> new NotFoundException(String.format("User with id %d not found", 1)))) // TODO: get the user from the context here
                .build();
    }

    public void updateEntityFromDto(WorkItemUpdateDto dto, WorkItem workItem) {
        Optional.ofNullable(dto.getTitle()).ifPresent(workItem::setTitle);
        Optional.ofNullable(dto.getDescription()).ifPresent(workItem::setDescription);
        Optional.ofNullable(dto.getStatus()).ifPresent(workItem::setStatus);
        Optional.ofNullable(dto.getSeverity()).ifPresent(workItem::setSeverity);
        Optional.ofNullable(dto.getDueDate()).ifPresent(workItem::setDueDate);
    }

    public WorkItemSummaryDto toSummaryDto(WorkItem workItem) {
        return WorkItemSummaryDto.builder()
                .id(workItem.getId())
                .itemType(workItem.getItemType())
                .title(workItem.getTitle())
                .status(workItem.getStatus())
                .severity(workItem.getSeverity())
                .build();
    }

    private List<UserSummaryDto> mapAssignees(List<WorkItemAssignment> assignments) {
        if (assignments == null) return new ArrayList<>();

        return assignments.stream()
                .map(assignment -> new UserSummaryDto(
                        assignment.getUser().getId(),
                        assignment.getUser().getUsername()
                ))
                .toList();
    }

    public WorkItemResponseDto toResponseDto(WorkItem workItem) {
        ProjectSummaryDto projectDto = ProjectSummaryDto.builder()
                .id(workItem.getProject().getId())
                .name(workItem.getProject().getName())
                .description(workItem.getProject().getDescription())
                .build();

        List<CommentResponseWorkItemDto> commentsDtos = new ArrayList<>();
        if(workItem.getComments() != null) {
            commentsDtos = workItem.getComments().stream()
                    .map(commentMapper::toResponseWorkItemDto)
                    .toList();
        }

        User reporter = workItem.getReporter();
        UserSummaryDto reporterDto = new UserSummaryDto(
                reporter.getId(),
                reporter.getUsername()
        );

        List<UserSummaryDto> assigneeDtos = mapAssignees(workItem.getAssignees());

        WorkItemSummaryDto parentDto = null;
        if (workItem.getParent() != null) {
            parentDto = toSummaryDto(workItem.getParent());
        }

        List<WorkItemSummaryDto> childrenDtos = new ArrayList<>();
        if (workItem.getChildren() != null) {
            childrenDtos = workItem.getChildren().stream()
                    .map(this::toSummaryDto)
                    .toList();
        }

        return WorkItemResponseDto.builder()
                .id(workItem.getId())
                .title(workItem.getTitle())
                .description(workItem.getDescription())
                .itemType(workItem.getItemType())
                .status(workItem.getStatus())
                .severity(workItem.getSeverity())
                .createdAt(workItem.getCreatedAt())
                .dueDate(workItem.getDueDate())
                .project(projectDto)
                .comments(commentsDtos)
                .reporter(reporterDto)
                .assignees(assigneeDtos)
                .parent(parentDto)
                .children(childrenDtos)
                .build();
    }
}