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
        if (Utils.isNotAuthenticated(auth)) return false;
        if (Utils.isAdmin(auth)) return true;

        String currentUserId = Utils.getCurrentUserId(auth);
        return organizationRepository.existsByIdAndManagerKeycloakId(organizationId, currentUserId);
    }

    public boolean canViewUsers(Authentication auth, Integer organizationId) {
        if (Utils.isNotAuthenticated(auth)) return false;
        if (Utils.isAdmin(auth)) return true;

        String currentUserId = Utils.getCurrentUserId(auth);
        return organizationRepository.existsByIdAndManagerKeycloakId(organizationId, currentUserId)
                || organizationRepository.existsByIdAndMembersKeycloakId(organizationId, currentUserId);
    }
}