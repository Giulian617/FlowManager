package flowmanager.nomenclator.dto;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import flowmanager.nomenclator.model.Severity;
import flowmanager.nomenclator.model.Status;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import org.springframework.cglib.core.Local;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor
@JsonPropertyOrder({
        "title",
        "description",
        "status",
        "severity",
        "dueDate",
        //"assignees",

})
public class WorkItemUpdateDto {
    private String title;
    private String description;
    private Status status;
    private Severity severity;
    private LocalDate dueDate;
   // private List<Long> assigneeIds;
}
