package flowmanager.nomenclator.mapper;

import flowmanager.nomenclator.dto.*;
import flowmanager.nomenclator.model.Comment;
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
public class CommentMapper {
    public Comment toEntity(CommentCreateDto dto, WorkItem workItem, User author) {
        return Comment.builder()
                .content(dto.getContent())
                .createdAt(LocalDateTime.now())
                .workItem(workItem)
                .author(author)
                .build();
    }

    public void updateEntityFromDto(CommentUpdateDto dto, Comment comment) {
        Optional.ofNullable(dto.getContent()).ifPresent(comment::setContent);
        comment.setUpdatedAt(LocalDateTime.now());
    }

    private List<UserSummaryDto> mapAssignees(List<User> assignedUsers) {
        if (assignedUsers == null) return new ArrayList<>();

        return assignedUsers.stream()
                .map(assignedUser -> new UserSummaryDto(
                        assignedUser.getId(),
                        assignedUser.getUsername(),
                        assignedUser.getRole()
                ))
                .toList();
    }

    private WorkItemSummaryDto getWorkItemSummaryDto(Comment comment) {
        WorkItem workItem = comment.getWorkItem();
        User reporter = workItem.getReporter();
        UserSummaryDto reporterDto = new UserSummaryDto(
                reporter.getId(),
                reporter.getUsername(),
                reporter.getRole()
        );

        return new WorkItemSummaryDto(
                workItem.getId(),
                workItem.getTitle(),
                workItem.getDescription(),
                workItem.getItemType(),
                workItem.getStatus(),
                workItem.getSeverity(),
                workItem.getCreatedAt(),
                workItem.getDueDate(),
                workItem.getProject().getId(),
                reporterDto,
                mapAssignees(workItem.getAssignees())
        );
    }

    private UserSummaryDto getAuthorSummaryDto(Comment comment) {
        User author = comment.getAuthor();
        return new UserSummaryDto(
                author.getId(),
                author.getUsername(),
                author.getRole()
        );
    }

    public CommentResponseUserDto toResponseUserDto(Comment comment) {
        return CommentResponseUserDto.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .workItem(getWorkItemSummaryDto(comment))
                .build();
    }

    public CommentResponseWorkItemDto toResponseWorkItemDto(Comment comment) {
        return CommentResponseWorkItemDto.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .author(getAuthorSummaryDto(comment))
                .build();
    }

    public CommentResponseDto toResponseDto(Comment comment) {
        return CommentResponseDto.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .author(getAuthorSummaryDto(comment))
                .workItem(getWorkItemSummaryDto(comment))
                .build();
    }
}
