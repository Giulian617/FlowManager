package flowmanager.nomenclator.controller;

import flowmanager.nomenclator.dto.OrganizationCreateDto;
import flowmanager.nomenclator.dto.OrganizationResponseDto;
import flowmanager.nomenclator.dto.OrganizationSummaryDto;
import flowmanager.nomenclator.dto.OrganizationUpdateDto;
import flowmanager.nomenclator.service.OrganizationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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