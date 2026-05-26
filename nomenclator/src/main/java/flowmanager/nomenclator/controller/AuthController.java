package flowmanager.nomenclator.controller;

import flowmanager.nomenclator.dto.LoginRequestDto;
import flowmanager.nomenclator.dto.LoginResponseDto;
import flowmanager.nomenclator.dto.LogoutRequestDto;
import flowmanager.nomenclator.security.KeycloakAuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    private final KeycloakAuthService keycloakAuthService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDto> login(
            @RequestBody @Valid LoginRequestDto dto
    ) {
        return ResponseEntity.ok(keycloakAuthService.login(dto));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            @RequestHeader("Authorization") String bearerToken,
            @RequestBody @Valid LogoutRequestDto dto
    ) {
        String accessToken = bearerToken.replace("Bearer ", "");
        keycloakAuthService.logout(accessToken, dto.getRefreshToken());
        return ResponseEntity.noContent().build();
    }
}