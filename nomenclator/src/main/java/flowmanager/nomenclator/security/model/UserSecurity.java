package flowmanager.nomenclator.security.model;

import flowmanager.nomenclator.dto.UserUpdateDto;
import flowmanager.nomenclator.exception.NotFoundException;
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
        if (Utils.isNotAuthenticated(auth)) return false;
        if (Utils.isAdmin(auth)) return true;

        User targetUser = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException(String.format("User with id %d not found", userId)));

        String currentUserId = Utils.getCurrentUserId(auth);
        if (targetUser.getKeycloakId().equals(currentUserId))
            return true;
        return organizationRepository.existsByManagerKeycloakIdAndTeamsMembersKeycloakId(
                currentUserId, targetUser.getKeycloakId());
    }

    public boolean canUpdate(Authentication auth, Integer userId, UserUpdateDto userUpdateDto) {
        if (Utils.isNotAuthenticated(auth)) return false;
        if (Utils.isAdmin(auth)) return true;
        if (userUpdateDto.getRole() != null) return false;

        User targetUser = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException(String.format("User with id %d not found", userId)));

        String currentUserId = Utils.getCurrentUserId(auth);
        return targetUser.getKeycloakId().equals(currentUserId);
    }
}