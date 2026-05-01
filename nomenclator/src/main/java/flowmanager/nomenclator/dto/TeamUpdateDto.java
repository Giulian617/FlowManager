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
        "name",
        "description",
        "organizationId",
        "managerId"
})
public class TeamUpdateDto {
    private String name;
    private String description;
    private Integer organizationId;
    private Integer managerId;
}
