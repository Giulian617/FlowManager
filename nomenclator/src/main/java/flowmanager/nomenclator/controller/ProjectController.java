package flowmanager.nomenclator.controller;

import flowmanager.nomenclator.dto.*;
import flowmanager.nomenclator.service.ProjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
    public ResponseEntity<List<ProjectSummaryDto>> getAllProjects() {
        return ResponseEntity.ok(projectService.findAllProjects());
    }

    @GetMapping("/{projectId}")
    @ResponseBody
    public ResponseEntity<ProjectResponseDto> getProjectById(
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

    @PutMapping("/{projectId}")
    @ResponseBody
    public ResponseEntity<ProjectResponseDto> updateProject(
            @PathVariable Integer projectId,
            @RequestBody @Valid ProjectUpdateDto projectUpdateDto
    ) {
        return ResponseEntity.ok(projectService.updateProject(projectId, projectUpdateDto));
    }

    @PutMapping("/{projectId}/assign")
    @ResponseBody
    public ResponseEntity<ProjectResponseDto> assignTeams(
            @PathVariable Integer projectId,
            @RequestBody @Valid ProjectAssignDto projectAssignDto
    ) {
        return ResponseEntity.ok(projectService.assignTeams(projectId, projectAssignDto));
    }

    @DeleteMapping("/{projectId}")
    @ResponseBody
    public ResponseEntity<Void> deleteProject(
            @PathVariable Integer projectId
    ) {
        projectService.deleteProject(projectId);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}
