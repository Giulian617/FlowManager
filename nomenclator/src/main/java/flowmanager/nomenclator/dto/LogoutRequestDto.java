package flowmanager.nomenclator.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LogoutRequestDto {
    @NotBlank(message = "refreshToken is required and cannot be blank")
    private String refreshToken;
}