package flowmanager.nomenclator.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OrganizationCreateDto {
    @NotBlank(message = "name is required and cannot be blank")
    private String name;

    @NotBlank(message = "description is required and cannot be blank")
    private String description;

    @NotBlank(message = "industry is required and cannot be blank")
    private String industry;

    @NotNull(message = "managerId is required and cannot be null")
    private Integer managerId;
}