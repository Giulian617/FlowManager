package flowmanager.nomenclator.controller;

import flowmanager.nomenclator.dto.PageResponseDto;
import flowmanager.nomenclator.dto.TeamCreateDto;
import flowmanager.nomenclator.dto.TeamResponseDto;
import flowmanager.nomenclator.dto.TeamUpdateDto;
import flowmanager.nomenclator.service.TeamService;
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
@RequestMapping("teams")
@RequiredArgsConstructor
public class TeamController {
    private final TeamService teamService;

    @GetMapping("")
    @ResponseBody
    public ResponseEntity<PageResponseDto<TeamResponseDto>> getAllTeams(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer managerId,
            @RequestParam(required = false) String teamSize,
            @PageableDefault(size = 6) Pageable pageable
    ) {
        return ResponseEntity.ok(teamService.findAllTeams(search, managerId, teamSize, pageable));
    }

    @PostMapping("")
    public ResponseEntity<TeamResponseDto> createTeam(
            @RequestBody @Valid TeamCreateDto teamCreateDto,
            Authentication authentication
    ) {
        Jwt jwt = (Jwt) authentication.getPrincipal();
        return ResponseEntity.status(HttpStatus.CREATED).body(teamService.createTeam(teamCreateDto, jwt.getSubject()));
    }

    @PreAuthorize("@teamSecurity.canModify(authentication, #teamId)")
    @PutMapping("/{teamId}")
    @ResponseBody
    public ResponseEntity<TeamResponseDto> updateTeam(
            @PathVariable Integer teamId,
            @RequestBody @Valid TeamUpdateDto teamUpdateDto
    ) {
        return ResponseEntity.ok(teamService.updateTeam(teamId, teamUpdateDto));
    }
    
    @PreAuthorize("@teamSecurity.canDelete(authentication, #teamId)")
    @DeleteMapping("/{teamId}")
    @ResponseBody
    public ResponseEntity<Void> deleteTeam(
            @PathVariable Integer teamId
    ) {
        teamService.deleteTeam(teamId);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}
