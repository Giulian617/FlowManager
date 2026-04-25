package flowmanager.nomenclator.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.hibernate.validator.constraints.Length;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserCreateDto {
    @NotBlank(message = "email is required and cannot be blank")
    @Email(message = "The email is not valid")
    private String email;

    @NotBlank(message = "password is required and cannot be blank")
    @Length(min = 8, max = 32, message = "The length of the password should be between 8 and 32 characters")
    private String password;

    @NotBlank(message = "username is required and cannot be blank")
    private String username;

    @NotBlank(message = "firstName is required and cannot be blank")
    private String firstName;

    @NotBlank(message = "lastName is required and cannot be blank")
    private String lastName;

    @NotBlank(message = "phoneNumber is required and cannot be blank")
    private String phoneNumber;
}