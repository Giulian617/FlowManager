package flowmanager.nomenclator.dto;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import org.springframework.cglib.core.Local;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor
@JsonPropertyOrder({
        "name",
        "description",
        "startDate",
        "endDate",
        "managerId"
})
public class ProjectUpdateDto {
    private String name;
    private String description;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer managerId;
}
