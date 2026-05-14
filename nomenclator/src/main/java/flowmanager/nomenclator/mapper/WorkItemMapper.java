package flowmanager.nomenclator.mapper;

import flowmanager.nomenclator.dto.*;
import flowmanager.nomenclator.model.Project;
import flowmanager.nomenclator.model.Status;
import flowmanager.nomenclator.model.User;
import flowmanager.nomenclator.model.WorkItem;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class WorkItemMapper {
    private final CommentMapper commentMapper;

    public WorkItem toEntity(WorkItemCreateDto dto, Project project, User reporter) {
        return WorkItem.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .itemType(dto.getItemType())
                .status(Status.To_do)
                .severity(dto.getSeverity())
                .createdAt(LocalDateTime.now())
                .dueDate(dto.getDueDate())
                .project(project)
                .reporter(reporter)
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

    private List<UserSummaryDto> mapAssignees(List<User> assignedUsers) {
        if (assignedUsers == null) return new ArrayList<>();

        return assignedUsers.stream()
                .map(assignedUser -> new UserSummaryDto(
                        assignedUser.getId(),
                        assignedUser.getUsername()
                ))
                .toList();
    }

    public WorkItemResponseDto toResponseDto(WorkItem workItem) {
        ProjectSummaryDto projectDto = ProjectSummaryDto.builder()
                .id(workItem.getProject().getId())
                .name(workItem.getProject().getName())
                .description(workItem.getProject().getDescription())
                .build();

        List<CommentResponseWorkItemDto> commentsDto = new ArrayList<>();
        if(workItem.getComments() != null) {
            commentsDto = workItem.getComments().stream()
                    .map(commentMapper::toResponseWorkItemDto)
                    .toList();
        }

        User reporter = workItem.getReporter();
        UserSummaryDto reporterDto = new UserSummaryDto(
                reporter.getId(),
                reporter.getUsername()
        );

        List<UserSummaryDto> assigneesDto = mapAssignees(workItem.getAssignees());

        WorkItemSummaryDto parentDto = null;
        if (workItem.getParent() != null) {
            parentDto = toSummaryDto(workItem.getParent());
        }

        List<WorkItemSummaryDto> childrenDto = new ArrayList<>();
        if (workItem.getChildren() != null) {
            childrenDto = workItem.getChildren().stream()
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
                .comments(commentsDto)
                .reporter(reporterDto)
                .assignees(assigneesDto)
                .parent(parentDto)
                .children(childrenDto)
                .build();
    }
}