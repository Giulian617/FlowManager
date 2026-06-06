package flowmanager.nomenclator.dto;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;
import java.util.List;

@Data
@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor
@JsonPropertyOrder({
        "id",
        "name",
        "description",
        "manager",
        "createdAt",
        "members"
})
public class TeamSummaryOrganizationDto {
    private Integer id;
    private String name;
    private String description;
    private UserSummaryDto manager;
    private LocalDate createdAt;
    private List<UserSummaryDto> members;
}
