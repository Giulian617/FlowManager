package flowmanager.nomenclator.controller;

import flowmanager.nomenclator.dto.*;
import flowmanager.nomenclator.model.ItemType;
import flowmanager.nomenclator.model.Severity;
import flowmanager.nomenclator.model.Status;
import flowmanager.nomenclator.service.WorkItemService;
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

import java.util.List;
import java.util.Objects;

@RestController
@RequestMapping("work-items")
@RequiredArgsConstructor
public class WorkItemController {
    private final WorkItemService workItemService;

    @GetMapping("")
    @ResponseBody
    public ResponseEntity<PageResponseDto<WorkItemSummaryDto>> getAllWorkItems(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) List<ItemType> itemType,
            @RequestParam(required = false) List<Status> status,
            @RequestParam(required = false) List<Severity> severity,
            @RequestParam(required = false) List<Integer> reporterId,
            @RequestParam(required = false) List<Integer> assigneeId,
            @RequestParam(required = false) Boolean unassigned,
            @PageableDefault(size = 12, sort = "id") Pageable pageable
    ) {
        return ResponseEntity.ok(workItemService.findAllWorkItems(
                search, itemType, status, severity, reporterId, assigneeId, unassigned, null, pageable));
    }

    @PreAuthorize("@workItemSecurity.canView(authentication, #workItemId)")
    @GetMapping("/{workItemId}/comments")
    public ResponseEntity<List<CommentResponseWorkItemDto>> getAllCommentsByWorkItemId(
            @PathVariable Integer workItemId
    ) {
        return ResponseEntity.ok(workItemService.findAllCommentsByWorkItemId(workItemId));
    }

    @PreAuthorize("@workItemSecurity.canView(authentication, #workItemId)")
    @GetMapping("/{workItemId}")
    @ResponseBody
    public ResponseEntity<WorkItemResponseDto> getWorkItemById(
            @PathVariable Integer workItemId
    ) {
        return ResponseEntity.ok(workItemService.findWorkItemById(workItemId));
    }

    @PreAuthorize("@workItemSecurity.canCreate(authentication, #workItemCreateDto)")
    @PostMapping("")
    @ResponseBody
    public ResponseEntity<WorkItemResponseDto> createWorkItem(
            @RequestBody @Valid WorkItemCreateDto workItemCreateDto,
            Authentication authentication
    ) {
        Jwt jwt = (Jwt) authentication.getPrincipal();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(workItemService.createWorkItem(workItemCreateDto, Objects.requireNonNull(jwt.getSubject())));
    }

    @PreAuthorize("@workItemSecurity.canModify(authentication, #workItemId)")
    @PutMapping("/{workItemId}")
    @ResponseBody
    public ResponseEntity<WorkItemResponseDto> updateWorkItem(
            @PathVariable Integer workItemId,
            @RequestBody @Valid WorkItemUpdateDto workItemUpdateDto
    ) {
        return ResponseEntity.ok(workItemService.updateWorkItem(workItemId, workItemUpdateDto));
    }

    @PreAuthorize("@workItemSecurity.canModify(authentication, #childId)")
    @PutMapping("/{childId}/parent/{parentId}")
    @ResponseBody
    public ResponseEntity<WorkItemResponseDto> setParent(
            @PathVariable Integer childId,
            @PathVariable Integer parentId
    ) {
        return ResponseEntity.ok(workItemService.setParent(childId, parentId));
    }

    @PreAuthorize("@workItemSecurity.canModify(authentication, #childId)")
    @PutMapping("/{childId}/parent")
    @ResponseBody
    public ResponseEntity<WorkItemResponseDto> removeParent(
            @PathVariable Integer childId
    ) {
        return ResponseEntity.ok(workItemService.removeParent(childId));
    }

    @PreAuthorize("@workItemSecurity.canDelete(authentication, #workItemId)")
    @DeleteMapping("/{workItemId}")
    @ResponseBody
    public ResponseEntity<Void> deleteWorkItem(
            @PathVariable Integer workItemId
    ) {
        workItemService.deleteWorkItem(workItemId);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

}