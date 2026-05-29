package flowmanager.nomenclator.dto;

import flowmanager.nomenclator.model.Role;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserUpdateDto {
    private String email;
    private String username;
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private Integer organizationId;
    private Role role;
}