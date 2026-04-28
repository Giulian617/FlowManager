package flowmanager.nomenclator.dto;

import flowmanager.nomenclator.model.ItemType;
import flowmanager.nomenclator.model.Severity;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class WorkItemCreateDto {
    @NotBlank(message = "name is required and cannot be blank")
    private String title;

    @NotBlank(message = "description is required and cannot be blank")
    private String description;

    @NotNull(message = "type is required and cannot be blank")
    private ItemType itemType;

    @NotNull(message = "severity is required and cannot be blank")
    private Severity severity;

    @NotNull(message = "projectId is required and cannot be null")
    private Integer projectId;

    private Integer parentId;

    private LocalDate dueDate;

    private List<Integer> assigneesIds;
}