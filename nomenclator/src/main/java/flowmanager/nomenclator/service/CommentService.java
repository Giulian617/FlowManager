package flowmanager.nomenclator.service;

import flowmanager.nomenclator.dto.CommentDto;
import flowmanager.nomenclator.dto.CommentListDto;
import flowmanager.nomenclator.dto.CommentResponseDto;
import flowmanager.nomenclator.dto.CommentSummaryDto;
import flowmanager.nomenclator.exception.NotFoundException;
import flowmanager.nomenclator.mapper.CommentMapper;
import flowmanager.nomenclator.model.Comment;
import flowmanager.nomenclator.model.WorkItem;
import flowmanager.nomenclator.repository.CommentRepository;
import flowmanager.nomenclator.repository.WorkItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CommentService {
    private final CommentRepository commentRepository;
    private final CommentMapper commentMapper;
    private final WorkItemRepository workItemRepository;

    @Transactional
    public List<CommentSummaryDto> findAllComments() {
        return commentRepository
                .findAll()
                .stream()
                .map(commentMapper::toSummaryDto)
                .toList();
    }

//    public CommentResponseDto findCommentById(Integer commentId) {
//        return commentMapper.toResponseDto(commentRepository.findById(commentId).orElseThrow(
//                () -> new NotFoundException(String.format("Comment with id %d not found", commentId))
//        ));
//    }


    @Transactional
    public List<CommentListDto> findCommentsByWorkItemId(Integer workItemId) {
        workItemRepository.findById(workItemId).orElseThrow(
                () -> new NotFoundException(String.format("WorkItem with id %d not found", workItemId))
        );
        return commentRepository.findByWorkItemId(workItemId)
                .stream()
                .map(commentMapper::toListDto)
                .toList();
    }


    public CommentResponseDto createComment(CommentDto commentDto, Integer workItemId) {
        WorkItem workItem = workItemRepository.findById(workItemId).orElseThrow(
                () -> new NotFoundException(String.format("WorkItem with id %d not found", workItemId))
        );
        Comment comment = commentMapper.toEntity(commentDto, workItem);
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