package flowmanager.nomenclator.controller;

import flowmanager.nomenclator.dto.*;
import flowmanager.nomenclator.model.ItemType;
import flowmanager.nomenclator.model.Severity;
import flowmanager.nomenclator.model.Status;
import flowmanager.nomenclator.service.WorkItemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("work-items")
@RequiredArgsConstructor
public class WorkItemController {
    private final WorkItemService workItemService;

    @GetMapping("")
    @ResponseBody
    public ResponseEntity<List<WorkItemSummaryDto>> getAllWorkItems(
            @RequestParam(required = false) ItemType itemType,
            @RequestParam(required = false) Status status,
            @RequestParam(required = false) Severity severity
            ) {
        return ResponseEntity.ok(workItemService.findAllWorkItems(itemType, status, severity));
    }

    @GetMapping("/comments/{workItemId}")
    public ResponseEntity<List<CommentResponseWorkItemDto>> getAllCommentsByWorkItemId(
            @PathVariable Integer workItemId
    ) {
        return ResponseEntity.ok(workItemService.findAllCommentsByWorkItemId(workItemId));
    }

    @GetMapping("/{workItemId}")
    @ResponseBody
    public ResponseEntity<WorkItemResponseDto> getWorkItemById(
            @PathVariable Integer workItemId
    ) {
        return ResponseEntity.ok(workItemService.findWorkItemById(workItemId));
    }

    @PostMapping("")
    @ResponseBody
    public ResponseEntity<WorkItemResponseDto> createWorkItem(
            @RequestBody @Valid WorkItemCreateDto workItemCreateDto
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(workItemService.createWorkItem(workItemCreateDto));
    }

    @PutMapping("/{workItemId}")
    @ResponseBody
    public ResponseEntity<WorkItemResponseDto> updateWorkItem(
            @PathVariable Integer workItemId,
            @RequestBody @Valid WorkItemUpdateDto workItemUpdateDto
    ) {
        return ResponseEntity.ok(workItemService.updateWorkItem(workItemId, workItemUpdateDto));
    }

    @PutMapping("/{workItemId}/assignees")
    @ResponseBody
    public ResponseEntity<WorkItemResponseDto> assignUsers(
            @PathVariable Integer workItemId,
            @RequestBody @Valid WorkItemAssignDto workItemAssignDto
    ) {
        return ResponseEntity.ok(workItemService.assignUsers(workItemId, workItemAssignDto));
    }

    @PutMapping("/{childId}/parent/{parentId}")
    @ResponseBody
    public ResponseEntity<WorkItemResponseDto> setParent(
            @PathVariable Integer childId,
            @PathVariable Integer parentId
    ) {
        return ResponseEntity.ok(workItemService.setParent(childId, parentId));
    }

    @DeleteMapping("/{childId}/parent")
    @ResponseBody
    public ResponseEntity<WorkItemResponseDto> removeParent(
            @PathVariable Integer childId
    ) {
        return ResponseEntity.ok(workItemService.removeParent(childId));
    }
    @DeleteMapping("/{workItemId}")
    @ResponseBody
    public ResponseEntity<Void> deleteWorkItem(
            @PathVariable Integer workItemId
    ) {
        workItemService.deleteWorkItem(workItemId);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

}