package flowmanager.nomenclator.dto;

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
public class ProjectCreateDto {
    @NotBlank(message = "name is required and cannot be blank")
    private String name;

    @NotBlank(message = "description is required and cannot be blank")
    private String description;

    @NotNull(message = "startDate is required")
    private LocalDate startDate;

    @NotNull(message = "endDate is required")
    private LocalDate endDate;

    @NotNull(message = "organizationId is required and cannot be null")
    private Integer organizationId;

    private List<Integer> teamsIds;
}