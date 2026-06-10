package flowmanager.nomenclator.security.model;

import flowmanager.nomenclator.dto.WorkItemCreateDto;
import flowmanager.nomenclator.exception.NotFoundException;
import flowmanager.nomenclator.model.ItemType;
import flowmanager.nomenclator.model.WorkItem;
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

        WorkItem workItem = workItemRepository.findById(workItemId)
                .orElseThrow(() -> new NotFoundException(String.format("WorkItem with id %d not found", workItemId)));

        String currentUserId = Utils.getCurrentUserId(auth);
        if (workItem.getProject().getManager().getKeycloakId().equals(currentUserId))
            return true;
        return workItem.getProject().getTeams().stream()
                .anyMatch(team ->
                        team.getManager().getKeycloakId().equals(currentUserId) ||
                                team.getOrganization().getManager().getKeycloakId().equals(currentUserId) ||
                                team.getMembers().stream().anyMatch(member -> member.getKeycloakId().equals(currentUserId))
                );
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

        WorkItem workItem = workItemRepository.findById(workItemId)
                .orElseThrow(() -> new NotFoundException(String.format("WorkItem with id %d not found", workItemId)));

        String currentUserId = Utils.getCurrentUserId(auth);
        if (workItem.getReporter().getKeycloakId().equals(currentUserId))
            return true;
        if (workItem.getProject().getManager().getKeycloakId().equals(currentUserId))
            return true;
        return workItem.getProject().getTeams().stream()
                .anyMatch(team ->
                        team.getManager().getKeycloakId().equals(currentUserId) ||
                                team.getOrganization().getManager().getKeycloakId().equals(currentUserId)
                );
    }

    public boolean canDelete(Authentication auth, Integer workItemId) {
        if (Utils.isNotAuthenticated(auth)) return false;
        if (Utils.isAdmin(auth)) return true;

        String currentUserId = Utils.getCurrentUserId(auth);
        return workItemRepository.findById(workItemId).map(workItem -> {
            if (workItem.getProject().getManager().getKeycloakId().equals(currentUserId))
                return true;
            return workItem.getProject().getTeams().stream()
                    .anyMatch(team ->
                            team.getManager().getKeycloakId().equals(currentUserId) ||
                                    team.getOrganization().getManager().getKeycloakId().equals(currentUserId)
                    );
        }).orElse(true);
    }
}