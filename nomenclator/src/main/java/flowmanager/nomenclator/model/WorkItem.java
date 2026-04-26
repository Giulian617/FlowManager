package flowmanager.nomenclator.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Set;

@Data
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(exclude = {"assignees", "comments", "children", "parent", "project", "reporter"})
@Builder
@Entity
@Table(name = "work_item")
public class WorkItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ManyToOne
    @JoinColumn(name = "reporter_id")
    private User reporter;

    @OneToMany(mappedBy = "workItem")
    private Set<WorkItemAssignment> assignees;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ItemType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.To_do;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Severity severity;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column
    private LocalDate dueDate;

    @OneToMany(mappedBy = "workItem")
    private List<Comment> comments;

    @ManyToOne
    @JoinColumn(name = "parent_id")
    private WorkItem parent;

    @OneToMany(mappedBy = "parent")
    private List<WorkItem> children;

}