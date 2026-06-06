package flowmanager.nomenclator.controller;

import flowmanager.nomenclator.dto.*;
import flowmanager.nomenclator.model.Role;
import flowmanager.nomenclator.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @GetMapping("")
    @ResponseBody
    public ResponseEntity<List<UserResponseDto>> getAllUsers(
            @RequestParam(required = false) Role role
    ) {
        return ResponseEntity.ok(userService.findAllUsers(role));
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponseDto> getCurrentUser(
            Authentication authentication
    ) {
        return ResponseEntity.ok(userService.getCurrentUser(authentication));
    }

    @PreAuthorize("@userSecurity.canView(authentication, #userId)")
    @GetMapping("/{userId}/comments")
    @ResponseBody
    public ResponseEntity<List<CommentResponseUserDto>> getAllCommentsByUserId(
            @PathVariable Integer userId
    ) {
        return ResponseEntity.ok(userService.findAllCommentsByUserId(userId));
    }

    @PreAuthorize("@userSecurity.canView(authentication, #userId)")
    @GetMapping("/{userId}/projects/manager")
    @ResponseBody
    public ResponseEntity<List<ProjectResponseDto>> getAllManagedProjectsByUserId(
            @PathVariable Integer userId
    ) {
        return ResponseEntity.ok(userService.findAllManagedProjectsByUserId(userId));
    }

    @PreAuthorize("@userSecurity.canView(authentication, #userId)")
    @GetMapping("/{userId}/projects/assignee")
    @ResponseBody
    public ResponseEntity<List<ProjectResponseDto>> getAllAssignedProjectsByUserId(
            @PathVariable Integer userId
    ) {
        return ResponseEntity.ok(userService.findAllAssignedProjectsByUserId(userId));
    }

    @PreAuthorize("@userSecurity.canView(authentication, #userId)")
    @GetMapping("/{userId}/organizations/manager")
    @ResponseBody
    public ResponseEntity<List<OrganizationSummaryDto>> getAllManagedOrganizationsByUserId(
            @PathVariable Integer userId
    ) {
        return ResponseEntity.ok(userService.findAllManagedOrganizationsByUserId(userId));
    }

    @PreAuthorize("@userSecurity.canView(authentication, #userId)")
    @GetMapping("/{userId}/organizations/member")
    @ResponseBody
    public ResponseEntity<List<OrganizationSummaryDto>> getAllMemberOrganizationsByUserId(
            @PathVariable Integer userId
    ) {
        return ResponseEntity.ok(userService.findAllMemberOrganizationsByUserId(userId));
    }

    @PreAuthorize("@userSecurity.canView(authentication, #userId)")
    @GetMapping("/{userId}/teams/manager")
    @ResponseBody
    public ResponseEntity<List<TeamResponseDto>> getAllManagedTeamsByUserId(
            @PathVariable Integer userId
    ) {
        return ResponseEntity.ok(userService.findAllManagedTeamsByUserId(userId));
    }

    @PreAuthorize("@userSecurity.canView(authentication, #userId)")
    @GetMapping("/{userId}/teams/assignee")
    @ResponseBody
    public ResponseEntity<List<TeamResponseDto>> getAllAssignedTeamsByUserId(
            @PathVariable Integer userId
    ) {
        return ResponseEntity.ok(userService.findAllAssignedTeamsByUserId(userId));
    }

    @PreAuthorize("@userSecurity.canView(authentication, #userId)")
    @GetMapping("/{userId}/work-items/reporter")
    @ResponseBody
    public ResponseEntity<List<WorkItemSummaryDto>> getAllReportedWorkItemsByUserId(
            @PathVariable Integer userId
    ) {
        return ResponseEntity.ok(userService.findAllReportedWorkItemsByUserId(userId));
    }

    @PreAuthorize("@userSecurity.canView(authentication, #userId)")
    @GetMapping("/{userId}/work-items/assignee")
    @ResponseBody
    public ResponseEntity<List<WorkItemSummaryDto>> getAllAssignedWorkItemsByUserId(
            @PathVariable Integer userId
    ) {
        return ResponseEntity.ok(userService.findAllAssignedWorkItemsByUserId(userId));
    }

    @PostMapping("")
    @ResponseBody
    public ResponseEntity<UserResponseDto> createUser(
            @RequestBody @Valid UserCreateDto userCreateDto
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.createUser(userCreateDto));
    }

    @PreAuthorize("@userSecurity.canUpdate(authentication, #userId, #userUpdateDto)")
    @PutMapping("/{userId}")
    @ResponseBody
    public ResponseEntity<UserResponseDto> updateUser(
            @PathVariable Integer userId,
            @RequestBody @Valid UserUpdateDto userUpdateDto
    ) {
        return ResponseEntity.ok(userService.updateUser(userId, userUpdateDto));
    }

    @DeleteMapping("/{userId}")
    @ResponseBody
    public ResponseEntity<Void> deleteUser(
            @PathVariable Integer userId
    ) {
        userService.deleteUser(userId);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}
