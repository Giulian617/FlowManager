package flowmanager.nomenclator.security.model;

import flowmanager.nomenclator.exception.NotFoundException;
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

        if (!organizationRepository.existsById(organizationId))
            throw new NotFoundException(String.format("Organization with id %d not found", organizationId));

        String currentUserId = Utils.getCurrentUserId(auth);
        return organizationRepository.existsByIdAndManagerKeycloakId(organizationId, currentUserId);
    }

    public boolean canViewUsers(Authentication auth, Integer organizationId) {
        if (Utils.isNotAuthenticated(auth)) return false;
        if (Utils.isAdmin(auth)) return true;

        if (!organizationRepository.existsById(organizationId))
            throw new NotFoundException(String.format("Organization with id %d not found", organizationId));

        String currentUserId = Utils.getCurrentUserId(auth);
        return organizationRepository.existsByIdAndManagerKeycloakId(organizationId, currentUserId)
                || organizationRepository.existsByIdAndMembersKeycloakId(organizationId, currentUserId);
    }
}