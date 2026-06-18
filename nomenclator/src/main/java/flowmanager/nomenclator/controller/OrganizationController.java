package flowmanager.nomenclator.controller;

import flowmanager.nomenclator.dto.*;
import flowmanager.nomenclator.model.Role;
import flowmanager.nomenclator.service.OrganizationService;
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
@RequestMapping("organizations")
@RequiredArgsConstructor
public class OrganizationController {
    private final OrganizationService organizationService;

    @GetMapping("")
    public ResponseEntity<PageResponseDto<OrganizationResponseDto>> getAllOrganizations(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String industry,
            @RequestParam(required = false) Integer managerId,
            @PageableDefault(size = 9) Pageable pageable
    ) {
        return ResponseEntity.ok(organizationService.findAllOrganizations(search, industry, managerId, pageable));
    }

    @PreAuthorize("@organizationSecurity.canView(authentication, #organizationId)")
    @GetMapping("/{organizationId}/teams")
    @ResponseBody
    public ResponseEntity<PageResponseDto<TeamSummaryOrganizationDto>> getAllTeamsByOrganizationId(
            @PathVariable Integer organizationId,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer managerId,
            @RequestParam(required = false) String teamSize,
            @PageableDefault(size = 6) Pageable pageable,
            Authentication authentication
    ) {
        Jwt jwt = (Jwt) authentication.getPrincipal();
        return ResponseEntity.ok(organizationService.findAllTeamsByOrganizationId(
                organizationId, jwt.getSubject(), search, managerId, teamSize, pageable));
    }

    @PreAuthorize("@organizationSecurity.canViewUsers(authentication, #organizationId)")
    @GetMapping("/{organizationId}/users")
    public ResponseEntity<PageResponseDto<UserResponseDto>> getAllUsersByOrganizationId(
            @PathVariable Integer organizationId,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Role role,
            @RequestParam(required = false) Boolean active,
            @PageableDefault(size = 9) Pageable pageable
    ) {
        return ResponseEntity.ok(organizationService.findAllUsersByOrganizationId(organizationId, search, role, active, pageable));
    }

    @PreAuthorize("@organizationSecurity.canView(authentication, #organizationId)")
    @GetMapping("/{organizationId}/projects")
    public ResponseEntity<PageResponseDto<ProjectResponseDto>> getAllProjectsByOrganizationId(
            @PathVariable Integer organizationId,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer managerId,
            @RequestParam(required = false) String deadline,
            @PageableDefault(size = 6) Pageable pageable,
            Authentication authentication
    ) {
        Jwt jwt = (Jwt) authentication.getPrincipal();
        return ResponseEntity.ok(organizationService.findAllProjectsByOrganizationId(
                organizationId, jwt.getSubject(), search, managerId, deadline, pageable));
    }

    @PreAuthorize("@organizationSecurity.canView(authentication, #organizationId)")
    @GetMapping("/{organizationId}/work-items")
    public ResponseEntity<List<WorkItemSummaryDto>> getAllWorkItemsByOrganizationId(
            @PathVariable Integer organizationId
    ) {
        return ResponseEntity.ok(organizationService.findAllWorkItemsByOrganizationId(organizationId));
    }

    @PreAuthorize("@organizationSecurity.canViewUsers(authentication, #organizationId)")
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