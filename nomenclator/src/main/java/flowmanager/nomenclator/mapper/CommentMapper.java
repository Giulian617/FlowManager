package flowmanager.nomenclator.mapper;

import flowmanager.nomenclator.dto.CommentDto;
import flowmanager.nomenclator.dto.CommentResponseDto;
import flowmanager.nomenclator.dto.CommentSummaryDto;
import flowmanager.nomenclator.dto.UserSummaryDto;
import flowmanager.nomenclator.exception.NotFoundException;
import flowmanager.nomenclator.model.Comment;
import flowmanager.nomenclator.model.User;
import flowmanager.nomenclator.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class CommentMapper {
    private final UserRepository userRepository;

    public Comment toEntity(CommentDto dto) {
        return Comment.builder()
                .content(dto.getContent())
                .createdAt(LocalDateTime.now())
                .user(userRepository.findById(1).orElseThrow(
                        () -> new NotFoundException(String.format("User with id %d not found", 1)))) //TODO: get the user from the context here
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
                .build();
    }

    public CommentResponseDto toResponseDto(Comment comment) {
        User user = comment.getUser();
        UserSummaryDto userDto = new UserSummaryDto(
                user.getId(),
                user.getUsername()
        );

        return CommentResponseDto.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .user(userDto)
                .build();
    }
}
