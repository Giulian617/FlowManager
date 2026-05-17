package flowmanager.nomenclator.service;

import flowmanager.nomenclator.dto.CommentCreateDto;
import flowmanager.nomenclator.dto.CommentResponseDto;
import flowmanager.nomenclator.dto.CommentUpdateDto;
import flowmanager.nomenclator.exception.NotFoundException;
import flowmanager.nomenclator.mapper.CommentMapper;
import flowmanager.nomenclator.model.Comment;
import flowmanager.nomenclator.model.User;
import flowmanager.nomenclator.model.WorkItem;
import flowmanager.nomenclator.repository.CommentRepository;
import flowmanager.nomenclator.repository.UserRepository;
import flowmanager.nomenclator.repository.WorkItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CommentService {
    private final CommentRepository commentRepository;
    private final CommentMapper commentMapper;
    private final WorkItemRepository workItemRepository;
    private final UserRepository userRepository;

    public List<CommentResponseDto> findAllComments() {
        return commentRepository
                .findAll()
                .stream()
                .map(commentMapper::toResponseDto)
                .toList();
    }

    public CommentResponseDto createComment(CommentCreateDto commentCreateDto, String keycloakId) {
        WorkItem workItem = workItemRepository.findById(commentCreateDto.getWorkItemId()).orElseThrow(
                () -> new NotFoundException(String.format("WorkItem with id %d not found", commentCreateDto.getWorkItemId()))
        );
        User user = userRepository.findByKeycloakId(keycloakId).orElseThrow(
                () -> new NotFoundException("User not found")
        );
        Comment comment = commentMapper.toEntity(commentCreateDto, workItem, user);

        return commentMapper.toResponseDto(commentRepository.save(comment));
    }

    public CommentResponseDto updateComment(Integer commentId, CommentUpdateDto commentUpdateDto) {
        Comment comment = commentRepository.findById(commentId).orElseThrow(
                () -> new NotFoundException(String.format("Comment with id %d not found", commentId))
        );
        commentMapper.updateEntityFromDto(commentUpdateDto, comment);

        return commentMapper.toResponseDto(commentRepository.save(comment));
    }

    public void deleteComment(Integer commentId) {
        commentRepository.deleteById(commentId);
    }
}