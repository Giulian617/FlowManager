package flowmanager.nomenclator.controller;

import flowmanager.nomenclator.dto.CommentCreateDto;
import flowmanager.nomenclator.dto.CommentResponseDto;
import flowmanager.nomenclator.dto.CommentUpdateDto;
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
    public ResponseEntity<List<CommentResponseDto>> getAllComments() {
        return ResponseEntity.ok(commentService.findAllComments());
    }

    @PostMapping("")
    public ResponseEntity<CommentResponseDto> createComment(
            @RequestBody @Valid CommentCreateDto commentCreateDto
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(commentService.createComment(commentCreateDto));
    }

    @PutMapping("/{commentId}")
    @ResponseBody
    public ResponseEntity<CommentResponseDto> updateComment(
            @PathVariable Integer commentId,
            @RequestBody @Valid CommentUpdateDto commentUpdateDto
    ) {
        return ResponseEntity.ok(commentService.updateComment(commentId, commentUpdateDto));
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
