package flowmanager.nomenclator.dto;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;

@Data
@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor
@JsonPropertyOrder({
        "id",
        "name",
        "description",
        "endDate",
        "itemCount",
        "teamCount",
        "memberCount",
        "organization"
})
public class ProjectSummaryDto {
    private Integer id;
    private String name;
    private String description;
    private LocalDate endDate;
    private Integer itemCount;
    private Integer teamCount;
    private Integer memberCount;
    private OrganizationSummaryDto organization;
}
