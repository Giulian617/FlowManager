package flowmanager.nomenclator.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.io.Serializable;

@Data
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode()
@SuperBuilder
@Entity
@Table(name = "work_item_assignment")
public class WorkItemAssignment {
    @Embeddable
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @SuperBuilder
    public static class WorkItemAssignmentId implements Serializable {
        private Integer workItemId;
        private Integer userId;
    }

    @EmbeddedId
    private WorkItemAssignment.WorkItemAssignmentId workItemAssignmentId;

    @ManyToOne
    @MapsId("workItemId")
    @JoinColumn(name = "work_item_id", nullable = false)
    private WorkItem workItem;

    @ManyToOne
    @MapsId("userId")
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}