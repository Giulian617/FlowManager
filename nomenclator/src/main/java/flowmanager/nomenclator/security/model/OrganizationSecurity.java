package flowmanager.nomenclator.security.model;

import flowmanager.nomenclator.repository.OrganizationRepository;
import flowmanager.nomenclator.security.Utils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

@Component("organizationSecurity")
@RequiredArgsConstructor
public class OrganizationSecurity {
    private final OrganizationRepository organizationRepository;

    public boolean canView(Authentication auth, Integer organizationId) {
        if (Utils.isNotAuthenticated(auth))
            return false;
        if (Utils.isAdmin(auth))
            return true;

        Integer currentUserId = Utils.getCurrentUserId(auth);
        return organizationRepository.existsByIdAndManagerId(organizationId, currentUserId);
    }

    public boolean canModify(Authentication auth, Integer teamId) {
        return canView(auth, teamId);
    }
}