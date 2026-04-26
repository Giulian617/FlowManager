package flowmanager.nomenclator.controller;

import flowmanager.nomenclator.dto.*;
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
    public ResponseEntity<List<WorkItemSummaryDto>> getAllWorkItems() {
        return ResponseEntity.ok(workItemService.findAllWorkItems());
    }


    @GetMapping("/{workItemId}")
    @ResponseBody
    public ResponseEntity<WorkItemResponseDto> getWorkItemById(
            @PathVariable Integer workItemId
    ) {
        return ResponseEntity.ok(workItemService.findWorkItemById(workItemId));
    }


    @GetMapping("/reporter/{userId}")
    public ResponseEntity<List<WorkItemSummaryDto>> getWorkItemsByReporter(
            @PathVariable Integer userId
    ) {
        return ResponseEntity.ok(workItemService.findAllWorkItemsByReporter(userId));
    }

    @GetMapping("/assignee/{userId}")
    public ResponseEntity<List<WorkItemSummaryDto>> getWorkItemsAssignedToUser(
            @PathVariable Integer userId
    ) {
        return ResponseEntity.ok(workItemService.findAllWorkItemsAssignedToUser(userId));
    }


    @PostMapping("/project/{projectId}")
    @ResponseBody
    public ResponseEntity<WorkItemResponseDto> createWorkItem(
            @PathVariable Integer projectId,
            @RequestBody @Valid WorkItemCreateDto workItemCreateDto
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(workItemService.createWorkItem(workItemCreateDto, projectId));
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


    @DeleteMapping("/{workItemId}")
    @ResponseBody
    public ResponseEntity<Void> deleteWorkItem(
            @PathVariable Integer workItemId
    ) {
        workItemService.deleteWorkItem(workItemId);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}