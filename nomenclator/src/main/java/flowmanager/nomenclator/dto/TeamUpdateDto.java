package flowmanager.nomenclator.dto;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.util.List;

@Data
@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor
@JsonPropertyOrder({
        "name",
        "description",
        "organizationId",
        "managerId",
        "membersIds"
})
public class TeamUpdateDto {
    private String name;
    private String description;
    private Integer organizationId;
    private Integer managerId;
    private List<Integer> membersIds;
}
