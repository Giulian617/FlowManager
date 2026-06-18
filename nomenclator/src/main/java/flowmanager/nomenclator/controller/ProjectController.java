package flowmanager.nomenclator.controller;

import flowmanager.nomenclator.dto.*;
import flowmanager.nomenclator.model.ItemType;
import flowmanager.nomenclator.model.Severity;
import flowmanager.nomenclator.model.Status;
import flowmanager.nomenclator.service.ProjectService;
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

@RestController
@RequestMapping("projects")
@RequiredArgsConstructor
public class ProjectController {
    private final ProjectService projectService;

    @GetMapping("")
    @ResponseBody
    public ResponseEntity<PageResponseDto<ProjectResponseDto>> getAllProjects(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer managerId,
            @RequestParam(required = false) String deadline,
            @PageableDefault(size = 6) Pageable pageable
    ) {
        return ResponseEntity.ok(projectService.findAllProjects(search, managerId, deadline, pageable));
    }

    @PreAuthorize("@projectSecurity.canView(authentication, #projectId)")
    @GetMapping("/{projectId}/work-items")
    public ResponseEntity<PageResponseDto<WorkItemSummaryDto>> getAllWorkItemsByProjectId(
            @PathVariable Integer projectId,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) List<ItemType> itemType,
            @RequestParam(required = false) List<Status> status,
            @RequestParam(required = false) List<Severity> severity,
            @RequestParam(required = false) List<Integer> reporterId,
            @RequestParam(required = false) List<Integer> assigneeId,
            @RequestParam(required = false) Boolean unassigned,
            @PageableDefault(size = 12, sort = "id") Pageable pageable
    ) {
        return ResponseEntity.ok(projectService.findWorkItemsByProject(
                projectId, search, itemType, status, severity, reporterId, assigneeId, unassigned, pageable));
    }

    @PreAuthorize("@projectSecurity.canView(authentication, #projectId)")
    @GetMapping("/{projectId}/teams")
    public ResponseEntity<PageResponseDto<TeamSummaryOrganizationDto>> getAllTeamsByProjectId(
            @PathVariable Integer projectId,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer managerId,
            @RequestParam(required = false) String teamSize,
            @PageableDefault(size = 6) Pageable pageable
    ) {
        return ResponseEntity.ok(projectService.findTeamsByProject(projectId, search, managerId, teamSize, pageable));
    }

    @PreAuthorize("@projectSecurity.canView(authentication, #projectId)")
    @GetMapping("/{projectId}/members")
    public ResponseEntity<List<UserSummaryDto>> getAllMembersByProjectId(
            @PathVariable Integer projectId
    ) {
        return ResponseEntity.ok(projectService.findAllMembersByProjectId(projectId));
    }

    @PreAuthorize("@projectSecurity.canView(authentication, #projectId)")
    @GetMapping("/{projectId}")
    @ResponseBody
    public ResponseEntity<ProjectSummaryDto> getProjectById(
            @PathVariable Integer projectId
    ) {
        return ResponseEntity.ok(projectService.findProjectById(projectId));
    }

    @PostMapping("")
    @ResponseBody
    public ResponseEntity<ProjectResponseDto> createProject(
            @RequestBody @Valid ProjectCreateDto projectCreateDto,
            Authentication authentication
    ) {
        Jwt jwt = (Jwt) authentication.getPrincipal();
        return ResponseEntity.status(HttpStatus.CREATED).body(projectService.createProject(projectCreateDto, jwt.getSubject()));
    }

    @PreAuthorize("@projectSecurity.canModify(authentication, #projectId)")
    @PutMapping("/{projectId}")
    @ResponseBody
    public ResponseEntity<ProjectResponseDto> updateProject(
            @PathVariable Integer projectId,
            @RequestBody @Valid ProjectUpdateDto projectUpdateDto
    ) {
        return ResponseEntity.ok(projectService.updateProject(projectId, projectUpdateDto));
    }

    @PreAuthorize("@projectSecurity.canDelete(authentication, #projectId)")
    @DeleteMapping("/{projectId}")
    @ResponseBody
    public ResponseEntity<Void> deleteProject(
            @PathVariable Integer projectId
    ) {
        projectService.deleteProject(projectId);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}
