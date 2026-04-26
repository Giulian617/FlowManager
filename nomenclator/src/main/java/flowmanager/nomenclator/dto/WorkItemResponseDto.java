package flowmanager.nomenclator.dto;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import flowmanager.nomenclator.model.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import org.springframework.cglib.core.Local;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Data
@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor
@JsonPropertyOrder({
        "id",
        "project",
        "title",
        "description",
        "reporter",
        "assignees",
        "itemType",
        "status",
        "severity",
        "createdAt",
        "dueDate",
        "parent",
        "children"
})
public class WorkItemResponseDto {
    private Integer id;
    private ProjectSummaryDto project;
    private String title;
    private String description;
    private UserSummaryDto reporter;
    private List<UserSummaryDto> assignees;
    private ItemType itemType;
    private Status status;
    private Severity severity;
    private LocalDateTime createdAt;
    private LocalDate dueDate;
    private WorkItemSummaryDto parent;
    private List<WorkItemSummaryDto> children;
}
