package flowmanager.nomenclator.dto;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
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
        "name",
        "description",
        "industry",
        "createdAt",
        "updatedAt",
        "manager"
})
public class OrganizationResponseDto {
    private Integer id;
    private String name;
    private String description;
    private String industry;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private UserSummaryDto manager;
}