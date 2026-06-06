package flowmanager.nomenclator.mapper;

import flowmanager.nomenclator.dto.*;
import flowmanager.nomenclator.model.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class UserMapper {
    private final CommentMapper commentMapper;
    private final ProjectMapper projectMapper;

    public User toEntity(UserCreateDto dto, String keycloakId) {
        return User.builder()
                .keycloakId(keycloakId)
                .email(dto.getEmail())
                .username(dto.getUsername())
                .firstName(dto.getFirstName())
                .lastName(dto.getLastName())
                .phoneNumber(dto.getPhoneNumber())
                .role(dto.getRole() != null ? dto.getRole() : Role.USER)
                .active(Boolean.TRUE)
                .createdAt(LocalDateTime.now())
                .build();
    }

    public void updateEntityFromDto(UserUpdateDto dto, User user) {
        Optional.ofNullable(dto.getEmail()).ifPresent(user::setEmail);
        Optional.ofNullable(dto.getUsername()).ifPresent(user::setUsername);
        Optional.ofNullable(dto.getFirstName()).ifPresent(user::setFirstName);
        Optional.ofNullable(dto.getLastName()).ifPresent(user::setLastName);
        Optional.ofNullable(dto.getPhoneNumber()).ifPresent(user::setPhoneNumber);
        Optional.ofNullable(dto.getActive()).ifPresent(user::setActive);
        Optional.ofNullable(dto.getRole()).ifPresent(user::setRole);
    }

    public UserSummaryDto toSummaryDto(User user) {
        return UserSummaryDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .role(user.getRole())
                .build();
    }

    private TeamSummaryUserDto mapTeamSummary(Team team) {
        Organization organization = team.getOrganization();
        OrganizationSummaryDto organizationSummaryDto =  new OrganizationSummaryDto(
                organization.getId(),
                organization.getName(),
                organization.getDescription()
        );

        return TeamSummaryUserDto.builder()
                .id(team.getId())
                .name(team.getName())
                .organization(organizationSummaryDto)
                .build();
    }

    private WorkItemSummaryDto mapWorkItemSummary(WorkItem workItem) {
        return WorkItemSummaryDto.builder()
                .id(workItem.getId())
                .itemType(workItem.getItemType())
                .title(workItem.getTitle())
                .status(workItem.getStatus())
                .severity(workItem.getSeverity())
                .build();
    }
    private OrganizationSummaryDto mapOrganizationSummary(Organization organization) {
        return OrganizationSummaryDto.builder()
                .id(organization.getId())
                .name(organization.getName())
                .description(organization.getDescription())
                .build();
    }

    public UserResponseDto toResponseDto(User user) {
        List<CommentResponseUserDto> commentsDto = new ArrayList<>();
        if(user.getComments() != null) {
            commentsDto = user.getComments()
                    .stream()
                    .map(commentMapper::toResponseUserDto)
                    .toList();
        }

        List<ProjectSummaryDto> projectsDto = new ArrayList<>();
        if(user.getProjects() != null) {
            projectsDto = user.getProjects()
                    .stream()
                    .map(projectMapper::toSummaryDto)
                    .toList();
        }

        List<OrganizationSummaryDto> organizationsDto = new ArrayList<>();
        if(user.getOrganizations() != null) {
            organizationsDto = user.getOrganizations()
                    .stream()
                    .map(this::mapOrganizationSummary)
                    .toList();
        }

        List<OrganizationSummaryDto> memberOrganizationsDto = new ArrayList<>();
        if(user.getMemberOrganizations() != null) {
            memberOrganizationsDto = user.getMemberOrganizations()
                    .stream()
                    .map(this::mapOrganizationSummary)
                    .toList();
        }

        List<TeamSummaryUserDto> managedTeamsDto = new ArrayList<>();
        if(user.getManagedTeams() != null) {
            managedTeamsDto = user.getManagedTeams()
                    .stream()
                    .map(this::mapTeamSummary)
                    .toList();
        }

        List<TeamSummaryUserDto> assignedTeamsDto = new ArrayList<>();
        if(user.getAssignedTeams() != null) {
            assignedTeamsDto = user.getAssignedTeams()
                    .stream()
                    .map(this::mapTeamSummary)
                    .toList();
        }

        List<WorkItemSummaryDto> reportedWorkItemsDto = new ArrayList<>();
        if(user.getReportedWorkItems() != null) {
            reportedWorkItemsDto = user.getReportedWorkItems()
                    .stream()
                    .map(this::mapWorkItemSummary)
                    .toList();
        }

        List<WorkItemSummaryDto> assignedWorkItemsDto = new ArrayList<>();
        if(user.getAssignedWorkItems() != null) {
            assignedWorkItemsDto = user.getAssignedWorkItems()
                    .stream()
                    .map(this::mapWorkItemSummary)
                    .toList();
        }

        return UserResponseDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .username(user.getUsername())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .phoneNumber(user.getPhoneNumber())
                .role(user.getRole())
                .active(user.getActive())
                .createdAt(user.getCreatedAt())
                .lastLogin(user.getLastLogin())
                .comments(commentsDto)
                .projects(projectsDto)
                .organizations(organizationsDto)
                .memberOrganizations(memberOrganizationsDto)
                .managedTeams(managedTeamsDto)
                .assignedTeams(assignedTeamsDto)
                .reportedWorkItems(reportedWorkItemsDto)
                .assignedWorkItems(assignedWorkItemsDto)
                .build();
    }
}