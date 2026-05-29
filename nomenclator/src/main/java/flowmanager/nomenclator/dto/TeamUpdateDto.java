package flowmanager.nomenclator.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.util.List;

@Data
@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor
public class TeamUpdateDto {
    private String name;
    private String description;
    private Integer managerId;
    private List<Integer> membersIds;
}
