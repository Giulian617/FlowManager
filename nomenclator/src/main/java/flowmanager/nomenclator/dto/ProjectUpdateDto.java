package flowmanager.nomenclator.dto;

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
public class ProjectUpdateDto {
    private String name;
    private String description;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer managerId;
    private List<Integer> teamsIds;
}
