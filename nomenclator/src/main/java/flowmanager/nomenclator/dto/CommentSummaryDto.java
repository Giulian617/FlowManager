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
    "content",
    "createdAt",
    "updatedAt"
})
public class CommentSummaryDto {
    private Integer id;
    private String content;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
