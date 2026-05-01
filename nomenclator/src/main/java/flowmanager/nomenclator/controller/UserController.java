package flowmanager.nomenclator.controller;

import flowmanager.nomenclator.dto.*;
import flowmanager.nomenclator.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @GetMapping("")
    @ResponseBody
    public ResponseEntity<List<UserSummaryDto>> getAllUsers() {
        return ResponseEntity.ok(userService.findAllUsers());
    }

    @GetMapping("/{userId}/comments")
    @ResponseBody
    public ResponseEntity<List<CommentResponseUserDto>> getAllCommentsByUserId(
            @PathVariable Integer userId
    ) {
        return ResponseEntity.ok(userService.findAllCommentsByUserId(userId));
    }

    @GetMapping("/{userId}/projects")
    @ResponseBody
    public ResponseEntity<List<ProjectSummaryDto>> getAllProjectsByUserId(
            @PathVariable Integer userId
    ) {
        return ResponseEntity.ok(userService.findAllProjectsByUserId(userId));
    }

    @GetMapping("/{userId}/organizations")
    @ResponseBody
    public ResponseEntity<List<OrganizationSummaryDto>> getAllOrganizationsByUserId(
            @PathVariable Integer userId
    ) {
        return ResponseEntity.ok(userService.findAllOrganizationsByUserId(userId));
    }

    @GetMapping("/{userId}/teams/manager")
    @ResponseBody
    public ResponseEntity<List<TeamSummaryUserDto>> getAllTeamsByUserIdWhereManager(
            @PathVariable Integer userId
    ) {
        return ResponseEntity.ok(userService.findAllTeamsByUserIdWhereManager(userId));
    }

    @GetMapping("/{userId}/teams/assignee")
    @ResponseBody
    public ResponseEntity<List<TeamSummaryUserDto>> getAllTeamsByUserIdWhereAssignee(
            @PathVariable Integer userId
    ) {
        return ResponseEntity.ok(userService.findAllTeamsByUserIdWhereAssignee(userId));
    }

    @GetMapping("/{userId}/work-items/reporter")
    @ResponseBody
    public ResponseEntity<List<WorkItemSummaryDto>> getAllWorkItemsByUserIdWhereReporter(
            @PathVariable Integer userId
    ) {
        return ResponseEntity.ok(userService.findAllWorkItemsByUserIdWhereReporter(userId));
    }

    @GetMapping("/{userId}/work-items/assignee")
    @ResponseBody
    public ResponseEntity<List<WorkItemSummaryDto>> getAllWorkItemsByUserIdWhereAssignee(
            @PathVariable Integer userId
    ) {
        return ResponseEntity.ok(userService.findAllWorkItemsByUserIdWhereAssignee(userId));
    }

    @GetMapping("/{userId}")
    @ResponseBody
    public ResponseEntity<UserResponseDto> getUserById(
            @PathVariable Integer userId
    ) {
        return ResponseEntity.ok(userService.findUserById(userId));
    }

    @PostMapping("")
    @ResponseBody
    public ResponseEntity<UserResponseDto> createUser(
            @RequestBody @Valid UserCreateDto userCreateDto
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.createUser(userCreateDto));
    }

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
