package flowmanager.nomenclator.security.model;

import flowmanager.nomenclator.dto.WorkItemCreateDto;
import flowmanager.nomenclator.model.ItemType;
import flowmanager.nomenclator.repository.WorkItemRepository;
import flowmanager.nomenclator.security.Utils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

@Component("workItemSecurity")
@RequiredArgsConstructor
public class WorkItemSecurity {
    private final WorkItemRepository workItemRepository;

    public boolean canView(Authentication auth, Integer workItemId) {
        if (Utils.isNotAuthenticated(auth)) return false;
        if (Utils.isAdmin(auth)) return true;

        Integer currentUserId = Utils.getCurrentUserId(auth);
        return workItemRepository.findById(workItemId).map(workItem ->
                workItem.getProject().getTeams().stream()
                        .anyMatch(team ->
                                team.getManager().getId().equals(currentUserId) ||
                                        team.getOrganization().getManager().getId().equals(currentUserId) ||
                                        team.getMembers().stream().anyMatch(member -> member.getId().equals(currentUserId))
                        )
        ).orElse(false);
    }

    public boolean canCreate(Authentication auth, WorkItemCreateDto dto) {
        if (Utils.isNotAuthenticated(auth))
            return false;
        if (Utils.isAdminOrManager(auth))
            return true;
        return dto.getItemType() == ItemType.Bug;
    }

    public boolean canModify(Authentication auth, Integer workItemId) {
        if (Utils.isNotAuthenticated(auth)) return false;
        if (Utils.isAdmin(auth)) return true;

        Integer currentUserId = Utils.getCurrentUserId(auth);
        return workItemRepository.findById(workItemId).map(workItem -> {
            if (workItem.getReporter().getId().equals(currentUserId))
                return true;
            if (workItem.getProject().getManager().getId().equals(currentUserId))
                return true;
            return workItem.getProject().getTeams().stream()
                    .anyMatch(team ->
                            team.getManager().getId().equals(currentUserId) ||
                                    team.getOrganization().getManager().getId().equals(currentUserId)
                    );
        }).orElse(false);
    }

    public boolean canDelete(Authentication auth, Integer workItemId) {
        if (Utils.isNotAuthenticated(auth)) return false;
        if (Utils.isAdmin(auth)) return true;

        Integer currentUserId = Utils.getCurrentUserId(auth);
        return workItemRepository.findById(workItemId).map(workItem -> {
            if (workItem.getProject().getManager().getId().equals(currentUserId))
                return true;
            return workItem.getProject().getTeams().stream()
                    .anyMatch(team ->
                            team.getManager().getId().equals(currentUserId) ||
                                    team.getOrganization().getManager().getId().equals(currentUserId)
                    );
        }).orElse(false);
    }
}