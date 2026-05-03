package flowmanager.nomenclator.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(exclude = {
        "comments",
        "projects",
        "organizations",
        "managedTeams",
        "assignedTeams",
        "reportedWorkItems",
        "assignedWorkItems"
})
@Builder
@Entity
@Table(name = "app_user")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Column(nullable = false)
    private String phoneNumber;

    @Column(nullable = false)
    private Boolean active;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column
    private LocalDateTime lastLogin;

    @Builder.Default
    @OneToMany(mappedBy = "author")
    private List<Comment> comments = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "manager")
    private List<Project> projects = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "manager")
    private List<Organization> organizations = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "manager")
    private List<Team> managedTeams = new ArrayList<>();

    @Builder.Default
    @ManyToMany(mappedBy = "members")
    private List<Team> assignedTeams = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "reporter")
    private List<WorkItem> reportedWorkItems = new ArrayList<>();

    @Builder.Default
    @ManyToMany(mappedBy = "assignees")
    private List<WorkItem> assignedWorkItems = new ArrayList<>();
}