package flowmanager.nomenclator.security.model;

import flowmanager.nomenclator.repository.OrganizationRepository;
import flowmanager.nomenclator.security.Utils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

@Component("userSecurity")
@RequiredArgsConstructor
public class UserSecurity {
    private final OrganizationRepository organizationRepository;

    public boolean canView(Authentication auth, Integer userId) {
        if (Utils.isNotAuthenticated(auth))
            return false;
        if (Utils.isAdmin(auth))
            return true;

        Integer currentUserId = Utils.getCurrentUserId(auth);
        if (userId.equals(currentUserId)) {
            return true;
        }
        return organizationRepository.existsByManagerIdAndTeamsMembersId(currentUserId, userId);
    }
}