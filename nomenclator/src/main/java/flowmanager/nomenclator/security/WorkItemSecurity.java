package flowmanager.nomenclator.security;

import flowmanager.nomenclator.dto.WorkItemCreateDto;
import flowmanager.nomenclator.model.ItemType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;

import java.util.Objects;

@Component("workItemSecurity")
public class WorkItemSecurity {

    public boolean canCreate(Authentication auth, WorkItemCreateDto dto) {
        if (auth == null || !auth.isAuthenticated()) {
            return false;
        }

        boolean isAdminOrManager = auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .filter(Objects::nonNull)
                .anyMatch(role ->
                        role.equals("ROLE_ADMIN") ||
                                role.equals("ROLE_MANAGER")
                );

        if (isAdminOrManager) {
            return true;
        }

        return dto.getItemType() == ItemType.Bug;
    }
}