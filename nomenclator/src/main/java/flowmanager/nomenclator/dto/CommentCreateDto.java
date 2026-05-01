package flowmanager.nomenclator.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CommentCreateDto {
    @NotBlank(message = "content is required and cannot be blank")
    private String content;

    @NotNull(message = "workItemId is required and cannot be null")
    private Integer workItemId;
}