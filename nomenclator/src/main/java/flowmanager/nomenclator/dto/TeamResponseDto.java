package flowmanager.nomenclator.dto;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
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
        "name",
        "description",
        "createdAt",
        "organization",
        "manager",
        "projects",
        "members"
})
public class TeamResponseDto {
    private Integer id;
    private String name;
    private String description;
    private LocalDateTime createdAt;
    private OrganizationSummaryDto organization;
    private UserSummaryDto manager;
    private List<ProjectSummaryDto> projects;
    private List<UserSummaryDto> members;
}
