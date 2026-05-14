package flowmanager.nomenclator.controller;

import flowmanager.nomenclator.dto.*;
import flowmanager.nomenclator.service.TeamService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
    public ResponseEntity<List<TeamSummaryDto>> getAllTeams() {
        return ResponseEntity.ok(teamService.findAllTeams());
    }

    @GetMapping("/{teamId}")
    @ResponseBody
    public ResponseEntity<TeamResponseDto> getTeamById(
            @PathVariable Integer teamId
    ) {
        return ResponseEntity.ok(teamService.findTeamById(teamId));
    }

    @PostMapping("")
    public ResponseEntity<TeamResponseDto> createTeam(
            @RequestBody @Valid TeamCreateDto teamCreateDto,
            Authentication authentication
    ) {
        Jwt jwt = (Jwt) authentication.getPrincipal();
        return ResponseEntity.status(HttpStatus.CREATED).body(teamService.createTeam(teamCreateDto, jwt.getSubject()));
    }

    @PutMapping("/{teamId}")
    @ResponseBody
    public ResponseEntity<TeamResponseDto> updateTeam(
            @PathVariable Integer teamId,
            @RequestBody @Valid TeamUpdateDto teamUpdateDto
    ) {
        return ResponseEntity.ok(teamService.updateTeam(teamId, teamUpdateDto));
    }

    @PutMapping("/{teamId}/assignees")
    @ResponseBody
    public ResponseEntity<TeamResponseDto> assignUsers(
            @PathVariable Integer teamId,
            @RequestBody @Valid TeamAssignDto teamAssignDto
    ) {
        return ResponseEntity.ok(teamService.assignUsers(teamId, teamAssignDto));
    }

    @DeleteMapping("/{teamId}")
    @ResponseBody
    public ResponseEntity<Void> deleteTeam(
            @PathVariable Integer teamId
    ) {
        teamService.deleteTeam(teamId);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}
