package flowmanager.nomenclator.dto;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@JsonPropertyOrder({
        "accessToken",
        "refreshToken",
        "expiresIn"
})
public class LoginResponseDto {
    private String accessToken;
    private String refreshToken;
    private Integer expiresIn;
}