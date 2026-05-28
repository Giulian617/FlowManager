package flowmanager.nomenclator.controller;

import flowmanager.nomenclator.dto.*;
import flowmanager.nomenclator.service.OrganizationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("organizations")
@RequiredArgsConstructor
public class OrganizationController {
    private final OrganizationService organizationService;

    @GetMapping("")
    public ResponseEntity<List<OrganizationSummaryDto>> getAllOrganizations() {
        return ResponseEntity.ok(organizationService.findAllOrganizations());
    }

    @PreAuthorize("@organizationSecurity.canView(authentication, #organizationId)")
    @GetMapping("/{organizationId}/teams")
    @ResponseBody
    public ResponseEntity<List<TeamSummaryOrganizationDto>> getAllTeamsByOrganizationId(
            @PathVariable Integer organizationId
    ) {
        return ResponseEntity.ok(organizationService.findAllTeamsByOrganizationId(organizationId));
    }

    @PreAuthorize("@organizationSecurity.canView(authentication, #organizationId)")
    @GetMapping("/{organizationId}/users")
    public ResponseEntity<List<UserSummaryDto>> getAllUsersByOrganizationId(
            @PathVariable Integer organizationId
    ) {
        return ResponseEntity.ok(organizationService.findAllUsersByOrganizationId(organizationId));
    }

    @PreAuthorize("@organizationSecurity.canView(authentication, #organizationId)")
    @GetMapping("/{organizationId}/projects")
    public ResponseEntity<List<ProjectResponseDto>> getAllProjectsByOrganizationId(
            @PathVariable Integer organizationId
    ) {
        return ResponseEntity.ok(organizationService.findAllProjectsByOrganizationId(organizationId));
    }

    @PreAuthorize("@organizationSecurity.canView(authentication, #organizationId)")
    @GetMapping("/{organizationId}/work-items")
    public ResponseEntity<List<WorkItemSummaryDto>> getAllWorkItemsByOrganizationId(
            @PathVariable Integer organizationId
    ) {
        return ResponseEntity.ok(organizationService.findAllWorkItemsByOrganizationId(organizationId));
    }

    @PreAuthorize("@organizationSecurity.canView(authentication, #organizationId)")
    @GetMapping("/{organizationId}")
    public ResponseEntity<OrganizationResponseDto> getOrganizationById(
            @PathVariable Integer organizationId
    ) {
        return ResponseEntity.ok(organizationService.findOrganizationById(organizationId));
    }

    @PostMapping("")
    public ResponseEntity<OrganizationResponseDto> createOrganization(
            @RequestBody @Valid OrganizationCreateDto organizationCreateDto
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(organizationService.createOrganization(organizationCreateDto));
    }

    @PutMapping("/{organizationId}")
    public ResponseEntity<OrganizationResponseDto> updateOrganization(
            @PathVariable Integer organizationId,
            @RequestBody @Valid OrganizationUpdateDto organizationUpdateDto
    ) {
        return ResponseEntity.ok(organizationService.updateOrganization(organizationId, organizationUpdateDto));
    }

    @DeleteMapping("/{organizationId}")
    public ResponseEntity<Void> deleteOrganization(
            @PathVariable Integer organizationId
    ) {
        organizationService.deleteOrganization(organizationId);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}