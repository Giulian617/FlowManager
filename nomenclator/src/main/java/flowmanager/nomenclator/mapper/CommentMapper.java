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

    public Comment toEntity(CommentDto dto, WorkItem workItem) {
        return Comment.builder()
                .content(dto.getContent())
                .createdAt(LocalDateTime.now())
                .workItem(workItem)
                .author(userRepository.findById(1).orElseThrow(
                        () -> new NotFoundException(String.format("User with id %d not found", 1)))) // TODO: get from context
                .build();
    }

    public void updateEntityFromDto(CommentDto dto, Comment comment) {
        Optional.ofNullable(dto.getContent()).ifPresent(comment::setContent);
        comment.setUpdatedAt(LocalDateTime.now());
    }

    public CommentSummaryDto toSummaryDto(Comment comment) {
        return CommentSummaryDto.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .workItemId(comment.getWorkItem().getId())
                .build();
    }

    public CommentResponseDto toResponseDto(Comment comment) {
        User author = comment.getAuthor();
        UserSummaryDto authorDto = new UserSummaryDto(
                author.getId(),
                author.getUsername()
        );

        return CommentResponseDto.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .author(authorDto)
                .workItemId(comment.getWorkItem().getId())
                .build();
    }

    public CommentListDto toListDto(Comment comment) {
        User author = comment.getAuthor();
        UserSummaryDto authorDto = new UserSummaryDto(
                author.getId(),
                author.getUsername()
        );

        return CommentListDto.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .author(authorDto)
                .build();
    }
}
