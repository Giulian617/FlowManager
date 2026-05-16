package flowmanager.nomenclator.security.model;

import flowmanager.nomenclator.repository.ProjectRepository;
import flowmanager.nomenclator.security.Utils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

@Component("projectSecurity")
@RequiredArgsConstructor
public class ProjectSecurity {
    private final ProjectRepository projectRepository;

    public boolean canView(Authentication auth, Integer projectId) {
        if (Utils.isNotAuthenticated(auth)) return false;
        if (Utils.isAdmin(auth)) return true;

        Integer currentUserId = Utils.getCurrentUserId(auth);
        return projectRepository.findById(projectId).map(project -> {
            if (project.getManager().getId().equals(currentUserId))
                return true;

            return project.getTeams().stream()
                    .anyMatch(team ->
                            team.getManager().getId().equals(currentUserId) ||
                                    team.getOrganization().getManager().getId().equals(currentUserId) ||
                                    team.getMembers().stream().anyMatch(member -> member.getId().equals(currentUserId))
                    );
        }).orElse(false);
    }

    public boolean canModify(Authentication auth, Integer projectId) {
        if (Utils.isNotAuthenticated(auth)) return false;
        if (Utils.isAdmin(auth)) return true;

        Integer currentUserId = Utils.getCurrentUserId(auth);
        return projectRepository.findById(projectId).map(project -> {
            if (project.getManager().getId().equals(currentUserId))
                return true;

            return project.getTeams().stream()
                    .anyMatch(team -> team.getOrganization().getManager().getId().equals(currentUserId));
        }).orElse(false);
    }

    public boolean canDelete(Authentication auth, Integer projectId) {
        if (Utils.isNotAuthenticated(auth)) return false;
        if (Utils.isAdmin(auth)) return true;

        Integer currentUserId = Utils.getCurrentUserId(auth);
        return projectRepository.findById(projectId).map(project ->
                project.getTeams().stream()
                        .anyMatch(team -> team.getOrganization().getManager().getId().equals(currentUserId))
        ).orElse(false);
    }
}