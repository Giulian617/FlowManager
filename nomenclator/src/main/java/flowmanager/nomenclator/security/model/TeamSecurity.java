package flowmanager.nomenclator.security.model;

import flowmanager.nomenclator.repository.TeamRepository;
import flowmanager.nomenclator.security.Utils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

@Component("teamSecurity")
@RequiredArgsConstructor
public class TeamSecurity {
    private final TeamRepository teamRepository;

    public boolean canView(Authentication auth, Integer teamId) {
        if (Utils.isNotAuthenticated(auth))
            return false;
        if (Utils.isAdmin(auth))
            return true;

        Integer currentUserId = Utils.getCurrentUserId(auth);
        return teamRepository.findById(teamId).map(team -> {
            if (team.getManager().getId().equals(currentUserId))
                return true;
            if (team.getOrganization().getManager().getId().equals(currentUserId))
                return true;
            return team.getMembers().stream()
                    .anyMatch(member -> member.getId().equals(currentUserId));
        }).orElse(false);
    }

    public boolean canModify(Authentication auth, Integer teamId) {
        return canView(auth, teamId);
    }

    public boolean canDelete(Authentication auth, Integer teamId) {
        if (Utils.isNotAuthenticated(auth))
            return false;
        if (Utils.isAdmin(auth))
            return true;

        Integer currentUserId = Utils.getCurrentUserId(auth);
        return teamRepository.findById(teamId)
                .map(team -> team.getOrganization().getManager().getId().equals(currentUserId))
                .orElse(false);
    }
}