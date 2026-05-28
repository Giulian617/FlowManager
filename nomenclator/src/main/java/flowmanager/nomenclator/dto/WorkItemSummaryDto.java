package flowmanager.nomenclator.dto;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import flowmanager.nomenclator.model.ItemType;
import flowmanager.nomenclator.model.Severity;
import flowmanager.nomenclator.model.Status;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

@Data
@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor
@JsonPropertyOrder({
        "id",
        "title",
        "description",
        "itemType",
        "status",
        "severity",
        "createdAt",
        "projectId"
})
public class WorkItemSummaryDto {
    private Integer id;
    private String title;
    private String description;
    private ItemType itemType;
    private Status status;
    private Severity severity;
    private LocalDateTime createdAt;
    private Integer projectId;
}
