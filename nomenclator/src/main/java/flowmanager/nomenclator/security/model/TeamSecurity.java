package flowmanager.nomenclator.security.model;

import flowmanager.nomenclator.exception.NotFoundException;
import flowmanager.nomenclator.model.Team;
import flowmanager.nomenclator.repository.TeamRepository;
import flowmanager.nomenclator.security.Utils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

@Component("teamSecurity")
@RequiredArgsConstructor
public class TeamSecurity {
    private final TeamRepository teamRepository;

    public boolean canModify(Authentication auth, Integer teamId) {
        if (Utils.isNotAuthenticated(auth)) return false;
        if (Utils.isAdmin(auth)) return true;

        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new NotFoundException(String.format("Team with id %d not found", teamId)));

        String currentUserId = Utils.getCurrentUserId(auth);
        if (team.getManager().getKeycloakId().equals(currentUserId))
            return true;
        return team.getOrganization().getManager().getKeycloakId().equals(currentUserId);
    }

    public boolean canDelete(Authentication auth, Integer teamId) {
        if (Utils.isNotAuthenticated(auth)) return false;
        if (Utils.isAdmin(auth)) return true;

        String currentUserId = Utils.getCurrentUserId(auth);
        return teamRepository.findById(teamId)
                .map(team -> team.getOrganization().getManager().getKeycloakId().equals(currentUserId))
                .orElse(true);
    }
}