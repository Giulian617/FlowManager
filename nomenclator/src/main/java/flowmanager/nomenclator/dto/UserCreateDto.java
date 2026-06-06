package flowmanager.nomenclator.dto;

import flowmanager.nomenclator.model.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserCreateDto {
    @NotBlank(message = "email is required and cannot be blank")
    @Email(message = "The email is not valid")
    private String email;

    @NotBlank(message = "password is required and cannot be blank")
    private String password;

    @NotBlank(message = "username is required and cannot be blank")
    private String username;

    @NotBlank(message = "firstName is required and cannot be blank")
    private String firstName;

    @NotBlank(message = "lastName is required and cannot be blank")
    private String lastName;

    @NotBlank(message = "phoneNumber is required and cannot be blank")
    private String phoneNumber;

    @NotNull(message = "role is required and cannot be null")
    private Role role;

    private List<Integer> organizationIds;
}