package flowmanager.nomenclator.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LoginRequestDto {
    @NotBlank(message = "Username is required and cannot be blank")
    private String username;

    @NotBlank(message = "password is required and cannot be blank")
    @ToString.Exclude
    private String password;
}