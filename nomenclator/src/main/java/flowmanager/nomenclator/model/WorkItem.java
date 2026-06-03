package flowmanager.nomenclator.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(exclude = {
        "project",
        "comments",
        "reporter",
        "assignees",
        "parent",
        "children"
})
@Builder
@Entity
@Table(name = "work_item")
public class WorkItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ItemType itemType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Severity severity;

    @Column(nullable = false)
    private LocalDate createdAt;

    @Column
    private LocalDate dueDate;

    @ManyToOne
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Builder.Default
    @OneToMany(mappedBy = "workItem")
    private List<Comment> comments = new ArrayList<>();

    @ManyToOne
    @JoinColumn(name = "reporter_id", nullable = false)
    private User reporter;

    @Builder.Default
    @ManyToMany
    @JoinTable(
            name = "work_item_assignment",
            joinColumns = @JoinColumn(name = "work_item_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private List<User> assignees = new ArrayList<>();

    @ManyToOne
    @JoinColumn(name = "parent_id")
    private WorkItem parent;

    @Builder.Default
    @OneToMany(mappedBy = "parent")
    private List<WorkItem> children = new ArrayList<>();
}