package flowmanager.nomenclator.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode()
@Builder
@Entity
@Table(name = "user")
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

    @OneToMany(mappedBy = "author")
    private List<Comment> comments;

    @OneToMany(mappedBy = "manager")
    private List<Project> projects;

    @OneToMany(mappedBy = "manager")
    private List<Organization> organizations;

    @OneToMany(mappedBy = "manager")
    private List<Team> managedTeams;

    @ManyToMany(mappedBy = "users")
    private List<Team> assignedTeams;

    @OneToMany(mappedBy = "reporter")
    private List<WorkItem> reportedWorkItems;

    @ManyToMany(mappedBy = "assignees")
    private List<WorkItem> assignedWorkItems;
}