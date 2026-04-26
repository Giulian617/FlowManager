package flowmanager.nomenclator.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OrganizationCreateDto {
    @NotBlank(message = "name is required and cannot be blank")
    private String name;

    private String description;

    private String industry;
}