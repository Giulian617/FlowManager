package flowmanager.nomenclator.controller;

import flowmanager.nomenclator.dto.ProjectCreateDto;
import flowmanager.nomenclator.dto.ProjectResponseDto;
import flowmanager.nomenclator.dto.ProjectSummaryDto;
import flowmanager.nomenclator.dto.ProjectUpdateDto;
import flowmanager.nomenclator.service.ProjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
            @RequestBody @Valid ProjectCreateDto projectCreateDto
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(projectService.createProject(projectCreateDto));
    }

    @PutMapping("/{projectId}")
    @ResponseBody
    public ResponseEntity<ProjectResponseDto> updateProject(
            @PathVariable Integer projectId,
            @RequestBody @Valid ProjectUpdateDto projectUpdateDto
    ) {
        return ResponseEntity.ok(projectService.updateProject(projectId, projectUpdateDto));
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
