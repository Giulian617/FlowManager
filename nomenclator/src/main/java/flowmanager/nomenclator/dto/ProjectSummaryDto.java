package flowmanager.nomenclator.dto;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
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
        "name",
        "description"
})
public class ProjectSummaryDto {
    private Integer id;
    private String name;
    private String description;
}
