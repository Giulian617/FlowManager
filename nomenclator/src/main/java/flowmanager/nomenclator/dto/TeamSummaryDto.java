package flowmanager.nomenclator.dto;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Data
@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor
@JsonPropertyOrder({
        "id",
        "name",
        "description",
        "organization",
        "manager"
})
public class TeamSummaryDto {
    private Integer id;
    private String name;
    private String description;
    private OrganizationSummaryDto organization;
    private UserSummaryDto manager;
}
