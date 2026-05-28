package flowmanager.nomenclator.utils;

import flowmanager.nomenclator.model.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public final class BuildInstances {
    private BuildInstances() {}

    public static List<User> buildUsers() {
        return List.of(
                User.builder()
                    .id(1)
                    .keycloakId("keycloak-uuid-1")
                    .email("user1@example.com")
                    .username("User1")
                    .firstName("Example")
                    .lastName("User")
                    .phoneNumber("+407777777777")
                    .active(false)
                    .role(Role.MANAGER)
                    .createdAt(LocalDateTime.of(2025, 6, 13, 10, 35, 30))
                    .build(),
                User.builder()
                    .id(2)
                    .keycloakId("keycloak-uuid-2")
                    .email("user2@example.com")
                    .username("User2")
                    .firstName("Example2")
                    .lastName("User")
                    .phoneNumber("+408888888888")
                    .active(false)
                    .role(Role.USER)
                    .createdAt(LocalDateTime.of(2025, 9, 22, 19, 41, 3))
                    .build()
        );
    }

    public static User buildUser() {
        return buildUsers().getFirst();
    }

    public static List<WorkItem> buildWorkItems() {
        Project project = buildProject();
        User reporter = buildUser();

        return List.of(
                WorkItem.builder()
                    .id(1)
                    .title("Work item 1")
                    .description("Description work item 1")
                    .itemType(ItemType.Task)
                    .status(Status.To_do)
                    .severity(Severity.Low)
                    .createdAt(LocalDateTime.of(2026, 3, 20, 18, 33, 30))
                    .project(project)
                    .reporter(reporter)
                    .build(),
                WorkItem.builder()
                    .id(2)
                    .title("Work item 2")
                    .description("Description work item 2")
                    .itemType(ItemType.Task)
                    .status(Status.In_Progress)
                    .severity(Severity.High)
                    .createdAt(LocalDateTime.of(2026, 5, 15, 13, 27, 51))
                    .project(project)
                    .reporter(reporter)
                    .build()
        );
    }

    public static WorkItem buildWorkItem() {
        return buildWorkItems().getFirst();
    }

    public static List<Comment> buildComments() {
        User author = buildUser();
        WorkItem workItem = buildWorkItem();

        return List.of(
                Comment.builder()
                    .id(1)
                    .content("Comentariul 1")
                    .createdAt(LocalDateTime.of(2026, 5, 1, 15, 23, 30))
                    .author(author)
                    .workItem(workItem)
                    .build(),
                Comment.builder()
                    .id(2)
                    .content("Comentariul 2")
                    .createdAt(LocalDateTime.of(2026, 5, 1, 15, 24, 21))
                    .updatedAt(LocalDateTime.of(2026, 5, 1, 15, 28, 44))
                    .author(author)
                    .workItem(workItem)
                    .build()
        );
    }

    public static Comment buildComment() {
        return buildComments().getFirst();
    }

    public static List<Project> buildProjects() {
        User manager = buildUser();

        return List.of(
                Project.builder()
                    .id(1)
                    .name("Proiectul 1")
                    .description("Descriere 1")
                    .startDate(LocalDate.of(2026, 1, 1))
                    .endDate(LocalDate.of(2026,12,31))
                    .manager(manager)
                    .workItems(new ArrayList<>())
                    .teams(new ArrayList<>())
                    .build(),
                Project.builder()
                    .id(2)
                    .name("Proiectul 2")
                    .description("Descriere 2")
                    .startDate(LocalDate.of(2026, 1, 20))
                    .endDate(LocalDate.of(2026,7,20))
                    .manager(manager)
                    .workItems(new ArrayList<>())
                    .teams(new ArrayList<>())
                    .build()
        );
    }

    public static Project buildProject() {
        return buildProjects().getFirst();
    }

    public static List<Organization> buildOrganizations() {
        User manager = buildUser();
        return List.of(
                Organization.builder()
                    .id(1)
                    .name("Organizatia 1")
                    .description("Descriere 1")
                    .industry("IT")
                    .createdAt(LocalDateTime.of(2025, 12, 31, 10, 0, 5))
                    .manager(manager)
                    .build()
                ,
                Organization.builder()
                    .id(2)
                    .name("Organizatia 2")
                    .description("Descriere 2")
                    .industry("IT")
                    .createdAt(LocalDateTime.of(2023, 10, 11, 15, 10, 45))
                    .manager(manager)
                    .build()
        );
    }

    public static Organization buildOrganization() {
        return buildOrganizations().getFirst();
    }

    public static List<Team> buildTeams() {
        User manager = buildUser();
        Organization organization = buildOrganization();

        return List.of(
                Team.builder()
                    .id(1)
                    .name("Echipa 1")
                    .description("Descriere 1")
                    .organization(organization)
                    .manager(manager)
                    .build(),
                Team.builder()
                    .id(2)
                    .name("Echipa 2")
                    .description("Descriere 2")
                    .organization(organization)
                    .manager(manager)
                    .build()
        );
    }

    public static Team buildTeam() {
        return buildTeams().getFirst();
    }
}
