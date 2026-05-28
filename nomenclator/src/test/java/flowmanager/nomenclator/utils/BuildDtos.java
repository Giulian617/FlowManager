package flowmanager.nomenclator.utils;

import flowmanager.nomenclator.dto.*;
import flowmanager.nomenclator.model.*;

import java.util.Optional;
import java.util.stream.Stream;

public final class BuildDtos {
    private BuildDtos() {}

    public static UserSummaryDto buildUserSummaryDto(User user) {
        return UserSummaryDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .build();
    }

    public static UserResponseDto buildUserResponseDto(User user) {
        return UserResponseDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .username(user.getUsername())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .phoneNumber(user.getPhoneNumber())
                .active(user.getActive())
                .createdAt(user.getCreatedAt())
                .lastLogin(user.getLastLogin())
                .comments(null)
                .projects(null)
                .organizations(null)
                .managedTeams(null)
                .assignedTeams(null)
                .reportedWorkItems(null)
                .assignedWorkItems(null)
                .build();
    }

    public static WorkItemSummaryDto buildWorkItemSummaryDto(WorkItem workItem) {
        return WorkItemSummaryDto.builder()
                .id(workItem.getId())
                .title(workItem.getTitle())
                .description(workItem.getDescription())
                .itemType(workItem.getItemType())
                .status(workItem.getStatus())
                .severity(workItem.getSeverity())
                .createdAt(workItem.getCreatedAt())
                .projectId(workItem.getProject() != null ? workItem.getProject().getId() : null)
                .build();
    }

    public static WorkItemResponseDto buildWorkItemResponseDto(WorkItem workItem) {
        return WorkItemResponseDto.builder()
                .id(workItem.getId())
                .title(workItem.getTitle())
                .description(workItem.getDescription())
                .itemType(workItem.getItemType())
                .status(workItem.getStatus())
                .severity(workItem.getSeverity())
                .createdAt(workItem.getCreatedAt())
                .dueDate(workItem.getDueDate())
                .project(buildProjectSummaryDto(workItem.getProject()))
                .comments(workItem.getComments().stream()
                        .map(BuildDtos::buildCommentResponseWorkItemDto)
                        .toList()
                )
                .reporter(buildUserSummaryDto(workItem.getReporter()))
                .assignees(workItem.getAssignees().stream()
                        .map(BuildDtos::buildUserSummaryDto)
                        .toList()
                )
                .parent(Optional.ofNullable(workItem.getParent())
                        .map(BuildDtos::buildWorkItemSummaryDto)
                        .orElse(null)
                )
                .children(workItem.getChildren().stream()
                        .map(BuildDtos::buildWorkItemSummaryDto)
                        .toList()
                )
                .build();
    }

    public static CommentResponseDto buildCommentResponseDto(Comment comment) {
        return CommentResponseDto.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .author(buildUserSummaryDto(comment.getAuthor()))
                .workItem(buildWorkItemSummaryDto(comment.getWorkItem()))
                .build();
    }

    public static CommentResponseUserDto buildCommentResponseUserDto(Comment comment) {
        return CommentResponseUserDto.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .workItem(buildWorkItemSummaryDto(comment.getWorkItem()))
                .build();
    }

    public static CommentResponseWorkItemDto buildCommentResponseWorkItemDto(Comment comment) {
        return CommentResponseWorkItemDto.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .author(buildUserSummaryDto(comment.getAuthor()))
                .build();
    }

    public static ProjectSummaryDto buildProjectSummaryDto(Project project) {
        return ProjectSummaryDto.builder()
                .id(project.getId())
                .name(project.getName())
                .description(project.getDescription())
                .itemCount(project.getWorkItems().size())
                .memberCount((int) Stream.concat(
                                Stream.concat(
                                        project.getTeams().stream().flatMap(team -> team.getMembers().stream()),
                                        project.getTeams().stream().map(Team::getManager)
                                ),
                                Stream.of(project.getManager())
                        )
                        .map(User::getId)
                        .distinct()
                        .count())
                .build();
    }

    public static ProjectResponseDto buildProjectResponseDto(Project project) {
        return ProjectResponseDto.builder()
                .id(project.getId())
                .name(project.getName())
                .description(project.getDescription())
                .startDate(project.getStartDate())
                .endDate(project.getEndDate())
                .manager(buildUserSummaryDto(project.getManager()))
                .workItems(project.getWorkItems().stream()
                        .map(BuildDtos::buildWorkItemSummaryDto)
                        .toList()
                )
                .teams(project.getTeams().stream()
                        .map(BuildDtos::buildTeamSummaryDto)
                        .toList()
                )
                .build();
    }

    public static OrganizationSummaryDto buildOrganizationSummaryDto(Organization organization) {
        return OrganizationSummaryDto.builder()
                .id(organization.getId())
                .name(organization.getName())
                .description(organization.getDescription())
                .build();
    }

    public static OrganizationResponseDto buildOrganizationResponseDto(Organization organization) {
        return OrganizationResponseDto.builder()
                .id(organization.getId())
                .name(organization.getName())
                .description(organization.getDescription())
                .industry(organization.getIndustry())
                .createdAt(organization.getCreatedAt())
                .manager(buildUserSummaryDto(organization.getManager()))
                .teams(organization.getTeams().stream()
                        .map(BuildDtos::buildTeamSummaryOrganizationDto)
                        .toList()
                )
                .build();
    }

    public static TeamSummaryDto buildTeamSummaryDto(Team team) {
        return TeamSummaryDto.builder()
                .id(team.getId())
                .name(team.getName())
                .description(team.getDescription())
                .organization(buildOrganizationSummaryDto(team.getOrganization()))
                .manager(buildUserSummaryDto(team.getManager()))
                .build();
    }

    public static TeamResponseDto buildTeamResponseDto(Team team) {
        return TeamResponseDto.builder()
                .id(team.getId())
                .name(team.getName())
                .description(team.getDescription())
                .createdAt(team.getCreatedAt())
                .organization(buildOrganizationSummaryDto(team.getOrganization()))
                .manager(buildUserSummaryDto(team.getManager()))
                .projects(team.getProjects().stream()
                        .map(BuildDtos::buildProjectSummaryDto)
                        .toList()
                )
                .members(team.getMembers().stream()
                        .map(BuildDtos::buildUserSummaryDto)
                        .toList()
                )
                .build();
    }

    public static TeamSummaryUserDto buildTeamSummaryUserDto(Team team) {
        return TeamSummaryUserDto.builder()
                .id(team.getId())
                .name(team.getName())
                .organization(buildOrganizationSummaryDto(team.getOrganization()))
                .build();
    }

    public static TeamSummaryOrganizationDto buildTeamSummaryOrganizationDto(Team team) {
        return TeamSummaryOrganizationDto.builder()
                .id(team.getId())
                .name(team.getName())
                .manager(buildUserSummaryDto(team.getManager()))
                .build();
    }
}
