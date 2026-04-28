package flowmanager.nomenclator.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.validator.constraints.Length;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserCreateDto {
    @NotBlank(message = "email is required and cannot be blank")
    @Email(message = "The email is not valid")
    private String email;

    @NotBlank(message = "username is required and cannot be blank")
    private String username;

    @NotBlank(message = "firstName is required and cannot be blank")
    private String firstName;

    @NotBlank(message = "lastName is required and cannot be blank")
    private String lastName;

    @NotBlank(message = "phoneNumber is required and cannot be blank")
    private String phoneNumber;
}