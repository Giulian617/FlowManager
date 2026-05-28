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
        "itemCount",
        "memberCount"
})
public class ProjectSummaryDto {
    private Integer id;
    private String name;
    private String description;
    private Integer itemCount;
    private Integer memberCount;
}
