package flowmanager.nomenclator.dto;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import flowmanager.nomenclator.model.ItemType;
import flowmanager.nomenclator.model.Severity;
import flowmanager.nomenclator.model.Status;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

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
        "dueDate",
        "project",
        "comments",
        "reporter",
        "assignees",
        "parent",
        "children"
})
public class WorkItemResponseDto {
    private Integer id;
    private String title;
    private String description;
    private ItemType itemType;
    private Status status;
    private Severity severity;
    private LocalDateTime createdAt;
    private LocalDate dueDate;
    private ProjectSummaryDto project;
    private List<CommentResponseWorkItemDto> comments;
    private UserSummaryDto reporter;
    private List<UserSummaryDto> assignees;
    private WorkItemSummaryDto parent;
    private List<WorkItemSummaryDto> children;
}
