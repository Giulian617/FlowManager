package flowmanager.nomenclator.security.model;

import flowmanager.nomenclator.dto.UserUpdateDto;
import flowmanager.nomenclator.model.User;
import flowmanager.nomenclator.repository.OrganizationRepository;
import flowmanager.nomenclator.repository.UserRepository;
import flowmanager.nomenclator.security.Utils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

@Component("userSecurity")
@RequiredArgsConstructor
public class UserSecurity {
    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;

    public boolean canView(Authentication auth, Integer userId) {
        if (Utils.isNotAuthenticated(auth))
            return false;
        if (Utils.isAdmin(auth))
            return true;

        String currentUserId = Utils.getCurrentUserId(auth);

        User targetUser = userRepository.findById(userId).orElse(null);
        if (targetUser == null)
            return false;
        if (targetUser.getKeycloakId().equals(currentUserId))
            return true;
        return organizationRepository.existsByManagerKeycloakIdAndTeamsMembersKeycloakId(currentUserId, targetUser.getKeycloakId());
    }

    public boolean canUpdate(Authentication auth, Integer userId, UserUpdateDto userUpdateDto) {
        if (Utils.isNotAuthenticated(auth))
            return false;
        if (Utils.isAdmin(auth))
            return true;
        if (userUpdateDto.getRole() != null)
            return false;

        String currentUserId = Utils.getCurrentUserId(auth);

        User targetUser = userRepository.findById(userId).orElse(null);
        if (targetUser == null)
            return false;
        return targetUser.getKeycloakId().equals(currentUserId);
    }
}