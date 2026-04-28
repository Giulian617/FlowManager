package flowmanager.nomenclator.mapper;

import flowmanager.nomenclator.dto.*;
import flowmanager.nomenclator.exception.NotFoundException;
import flowmanager.nomenclator.model.Comment;
import flowmanager.nomenclator.model.User;
import flowmanager.nomenclator.model.WorkItem;
import flowmanager.nomenclator.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class CommentMapper {
    private final UserRepository userRepository;

    public Comment toEntity(CommentCreateDto dto, WorkItem workItem) {
        return Comment.builder()
                .content(dto.getContent())
                .createdAt(LocalDateTime.now())
                .workItem(workItem)
                .author(userRepository.findById(1).orElseThrow(
                        () -> new NotFoundException(String.format("User with id %d not found", 1)))) // TODO: get from context
                .build();
    }

    public void updateEntityFromDto(CommentUpdateDto dto, Comment comment) {
        Optional.ofNullable(dto.getContent()).ifPresent(comment::setContent);
        comment.setUpdatedAt(LocalDateTime.now());
    }

    private WorkItemSummaryDto getWorkItemSummaryDto(Comment comment) {
        WorkItem workItem = comment.getWorkItem();
        return new WorkItemSummaryDto(
                workItem.getId(),
                workItem.getItemType(),
                workItem.getTitle(),
                workItem.getStatus(),
                workItem.getSeverity()
        );
    }

    private UserSummaryDto getAuthorSummaryDto(Comment comment) {
        User author = comment.getAuthor();
        return new UserSummaryDto(
                author.getId(),
                author.getUsername()
        );
    }

    public CommentResponseUserDto toResponseUserDto(Comment comment) {
        return CommentResponseUserDto.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .workItem(getWorkItemSummaryDto(comment))
                .build();
    }

    public CommentResponseWorkItemDto toResponseWorkItemDto(Comment comment) {
        return CommentResponseWorkItemDto.builder()
                .id(comment.getId())
                .content(comment.getContent())
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
