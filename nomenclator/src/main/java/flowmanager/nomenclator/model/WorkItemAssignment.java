package flowmanager.nomenclator.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(exclude = {"workItem", "user"})
@Builder
@Entity
@Table(name = "work_item_assignment")
public class WorkItemAssignment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "work_item_id", nullable = false)
    private WorkItem workItem;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}