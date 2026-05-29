package flowmanager.nomenclator.dto;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import flowmanager.nomenclator.model.Role;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;
import java.util.List;

@Data
@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor
@JsonPropertyOrder({
        "id",
        "username",
        "role",
        "firstName",
        "lastName",
        "email",
        "phoneNumber",
        "active",
        "createdAt",
        "lastLogin",
        "comments",
        "projects",
        "organizations",
        "memberOrganizations",
        "managedTeams",
        "assignedTeams",
        "reportedWorkItems",
        "assignedWorkItems"
})
public class UserResponseDto {
    private Integer id;
    private String username;
    private Role role;
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private Boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime lastLogin;
    private List<CommentResponseUserDto> comments;
    private List<ProjectSummaryDto> projects;
    private List<OrganizationSummaryDto> organizations;
    private List<OrganizationSummaryDto> memberOrganizations;
    private List<TeamSummaryUserDto> managedTeams;
    private List<TeamSummaryUserDto> assignedTeams;
    private List<WorkItemSummaryDto> reportedWorkItems;
    private List<WorkItemSummaryDto> assignedWorkItems;
}
