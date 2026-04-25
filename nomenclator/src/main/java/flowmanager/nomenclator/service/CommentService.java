package flowmanager.nomenclator.service;

import flowmanager.nomenclator.dto.CommentDto;
import flowmanager.nomenclator.dto.CommentResponseDto;
import flowmanager.nomenclator.dto.CommentSummaryDto;
import flowmanager.nomenclator.exception.NotFoundException;
import flowmanager.nomenclator.mapper.CommentMapper;
import flowmanager.nomenclator.model.Comment;
import flowmanager.nomenclator.repository.CommentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CommentService {
    private final CommentRepository commentRepository;
    private final CommentMapper commentMapper;

    public List<CommentSummaryDto> findAllComments() {
        return commentRepository
                .findAll()
                .stream()
                .map(commentMapper::toSummaryDto)
                .toList();
    }

    public CommentResponseDto findCommentById(Integer commentId) {
        return commentMapper.toResponseDto(commentRepository.findById(commentId).orElseThrow(
                () -> new NotFoundException(String.format("Comment with id %d not found", commentId))
        ));
    }

    public CommentResponseDto createComment(CommentDto commentDto) {
        Comment comment = commentMapper.toEntity(commentDto);

        return commentMapper.toResponseDto(commentRepository.save(comment));
    }

    public CommentResponseDto updateComment(Integer commentId, CommentDto commentDto) {
        Comment comment = commentRepository.findById(commentId).orElseThrow(
                () -> new NotFoundException(String.format("Comment with id %d not found", commentId))
        );
        commentMapper.updateEntityFromDto(commentDto, comment);

        return commentMapper.toResponseDto(commentRepository.save(comment));
    }

    public void deleteComment(Integer commentId) {
        commentRepository.deleteById(commentId);
    }
}