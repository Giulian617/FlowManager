package flowmanager.nomenclator.dto;

import flowmanager.nomenclator.model.Severity;
import flowmanager.nomenclator.model.Status;
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
public class WorkItemUpdateDto {
    private String title;
    private String description;
    private Status status;
    private Severity severity;
    private LocalDate dueDate;
    private List<Integer> assigneesIds;
}
