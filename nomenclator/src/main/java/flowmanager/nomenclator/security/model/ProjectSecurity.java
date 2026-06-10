package flowmanager.nomenclator.security.model;

import flowmanager.nomenclator.exception.NotFoundException;
import flowmanager.nomenclator.model.Project;
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

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new NotFoundException(String.format("Project with id %d not found", projectId)));

        String currentUserId = Utils.getCurrentUserId(auth);
        if (project.getManager().getKeycloakId().equals(currentUserId))
            return true;

        return project.getTeams().stream()
                .anyMatch(team ->
                        team.getManager().getKeycloakId().equals(currentUserId) ||
                                team.getOrganization().getManager().getKeycloakId().equals(currentUserId) ||
                                team.getMembers().stream().anyMatch(member -> member.getKeycloakId().equals(currentUserId))
                );
    }

    public boolean canModify(Authentication auth, Integer projectId) {
        if (Utils.isNotAuthenticated(auth)) return false;
        if (Utils.isAdmin(auth)) return true;

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new NotFoundException(String.format("Project with id %d not found", projectId)));

        String currentUserId = Utils.getCurrentUserId(auth);
        if (project.getManager().getKeycloakId().equals(currentUserId))
            return true;

        return project.getTeams().stream()
                .anyMatch(team -> team.getOrganization().getManager().getKeycloakId().equals(currentUserId));
    }

    public boolean canDelete(Authentication auth, Integer projectId) {
        if (Utils.isNotAuthenticated(auth)) return false;
        if (Utils.isAdmin(auth)) return true;

        String currentUserId = Utils.getCurrentUserId(auth);
        return projectRepository.findById(projectId)
                .map(project -> project.getOrganization().getManager().getKeycloakId().equals(currentUserId))
                .orElse(true);
    }
}