package flowmanager.nomenclator.dto;

import flowmanager.nomenclator.model.Role;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserUpdateDto {
    private String email;
    private String username;
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private Boolean active;
    private Role role;
    private List<Integer> organizationIds;
}