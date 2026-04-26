package flowmanager.nomenclator.dto;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import flowmanager.nomenclator.model.ItemType;
import flowmanager.nomenclator.model.Status;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import org.springframework.cglib.core.Local;

import java.time.LocalDateTime;

@Data
@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor
@JsonPropertyOrder({
        "id",
        "itemType",
        "title",
        "status"
})
public class WorkItemSummaryDto {
    private Integer id;
    private ItemType itemType;
    private String title;
    private Status status;
}
