package flowmanager.nomenclator.controller;

import flowmanager.nomenclator.dto.CommentDto;
import flowmanager.nomenclator.dto.CommentResponseDto;
import flowmanager.nomenclator.dto.CommentSummaryDto;
import flowmanager.nomenclator.service.CommentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("comments")
@RequiredArgsConstructor
public class CommentController {
    private final CommentService commentService;

    @GetMapping("")
    @ResponseBody
    public ResponseEntity<List<CommentSummaryDto>> getAllComments() {
        return ResponseEntity.ok(commentService.findAllComments());
    }

    @GetMapping("/{commentId}")
    @ResponseBody
    public ResponseEntity<CommentResponseDto> getCommentById(
            @PathVariable Integer commentId
    ) {
        return ResponseEntity.ok(commentService.findCommentById(commentId));
    }

    @PostMapping("")
    @ResponseBody
    public ResponseEntity<CommentResponseDto> createComment(
            @RequestBody @Valid CommentDto commentDto
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(commentService.createComment(commentDto));
    }

    @PutMapping("/{commentId}")
    @ResponseBody
    public ResponseEntity<CommentResponseDto> updateComment(
            @PathVariable Integer commentId,
            @RequestBody @Valid CommentDto commentDto
    ) {
        return ResponseEntity.ok(commentService.updateComment(commentId, commentDto));
    }

    @DeleteMapping("/{commentId}")
    @ResponseBody
    public ResponseEntity<Void> deleteComment(
            @PathVariable Integer commentId
    ) {
        commentService.deleteComment(commentId);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}
