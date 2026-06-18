package flowmanager.nomenclator.controller;

import flowmanager.nomenclator.dto.CommentCreateDto;
import flowmanager.nomenclator.dto.CommentResponseDto;
import flowmanager.nomenclator.dto.CommentUpdateDto;
import flowmanager.nomenclator.dto.PageResponseDto;
import flowmanager.nomenclator.service.CommentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("comments")
@RequiredArgsConstructor
public class CommentController {
    private final CommentService commentService;

    @GetMapping("")
    @ResponseBody
    public ResponseEntity<PageResponseDto<CommentResponseDto>> getAllComments(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer authorId,
            @PageableDefault(size = 15) Pageable pageable
    ) {
        return ResponseEntity.ok(commentService.findAllComments(search, authorId, pageable));
    }

    @PostMapping("")
    public ResponseEntity<CommentResponseDto> createComment(
            @RequestBody @Valid CommentCreateDto commentCreateDto,
            Authentication authentication
    ) {
        Jwt jwt = (Jwt) authentication.getPrincipal();
        return ResponseEntity.status(HttpStatus.CREATED).body(commentService.createComment(commentCreateDto, jwt.getSubject()));
    }

    @PreAuthorize("@commentSecurity.canModify(authentication, #commentId)")
    @PutMapping("/{commentId}")
    @ResponseBody
    public ResponseEntity<CommentResponseDto> updateComment(
            @PathVariable Integer commentId,
            @RequestBody @Valid CommentUpdateDto commentUpdateDto
    ) {
        return ResponseEntity.ok(commentService.updateComment(commentId, commentUpdateDto));
    }

    @PreAuthorize("@commentSecurity.canDelete(authentication, #commentId)")
    @DeleteMapping("/{commentId}")
    @ResponseBody
    public ResponseEntity<Void> deleteComment(
            @PathVariable Integer commentId
    ) {
        commentService.deleteComment(commentId);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}
