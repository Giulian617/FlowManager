package flowmanager.nomenclator.controller;

import flowmanager.nomenclator.dto.*;
import flowmanager.nomenclator.service.ProjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
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
    public ResponseEntity<List<ProjectResponseDto>> getAllProjects() {
        return ResponseEntity.ok(projectService.findAllProjects());
    }

    @PreAuthorize("@projectSecurity.canView(authentication, #projectId)")
    @GetMapping("/{projectId}/work-items")
    public ResponseEntity<List<WorkItemResponseDto>> getAllWorkItemsByProjectId(
            @PathVariable Integer projectId
    ) {
        return ResponseEntity.ok(projectService.findAllWorkItemsByProjectId(projectId));
    }

    @PreAuthorize("@projectSecurity.canView(authentication, #projectId)")
    @GetMapping("/{projectId}/teams")
    public ResponseEntity<List<TeamSummaryOrganizationDto>> getAllTeamsByProjectId(
            @PathVariable Integer projectId
    ) {
        return ResponseEntity.ok(projectService.findAllTeamsByProjectId(projectId));
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
