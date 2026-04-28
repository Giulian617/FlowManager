package flowmanager.nomenclator.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TeamCreateDto {
    @NotBlank(message = "name is required and cannot be blank")
    private String name;

    @NotBlank(message = "description is required and cannot be blank")
    private String description;

    @NotNull(message = "organizationId is required and cannot be null")
    private Integer organizationId;
}