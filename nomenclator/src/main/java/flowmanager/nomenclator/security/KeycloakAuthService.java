package flowmanager.nomenclator.security;

import flowmanager.nomenclator.dto.LoginRequestDto;
import flowmanager.nomenclator.dto.LoginResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.util.Map;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class KeycloakAuthService {

    @Value("${keycloak.admin.url}")
    private String keycloakUrl;

    @Value("${keycloak.admin.realm}")
    private String realm;

    @Value("${keycloak.admin.client-id}")
    private String clientId;

    @Value("${keycloak.admin.client-secret}")
    private String clientSecret;

    private final RestTemplate restTemplate;
    private final JwtDecoder jwtDecoder;
    private final TokenBlacklistService tokenBlacklistService;

    private LoginResponseDto getLoginResponseDto(HttpHeaders headers, MultiValueMap<String, String> body) {
        ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                keycloakUrl + "/realms/" + realm + "/protocol/openid-connect/token",
                HttpMethod.POST,
                new HttpEntity<>(body, headers),
                new ParameterizedTypeReference<>() {}
        );

        Map<String, Object> responseBody = Objects.requireNonNull(response.getBody());

        return LoginResponseDto.builder()
                .accessToken((String) responseBody.get("access_token"))
                .refreshToken((String) responseBody.get("refresh_token"))
                .expiresIn((Integer) responseBody.get("expires_in"))
                .build();
    }

    public LoginResponseDto login(LoginRequestDto dto) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("grant_type", "password");
        body.add("client_id", clientId);
        body.add("client_secret", clientSecret);
        body.add("username", dto.getUsername());
        body.add("password", dto.getPassword());

        return getLoginResponseDto(headers, body);
    }

    public LoginResponseDto refresh(String refreshToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("grant_type", "refresh_token");
        body.add("client_id", clientId);
        body.add("client_secret", clientSecret);
        body.add("refresh_token", refreshToken);

        return getLoginResponseDto(headers, body);
    }

    public void logout(String accessToken, String refreshToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("client_id", clientId);
        body.add("client_secret", clientSecret);
        body.add("refresh_token", refreshToken);

        restTemplate.exchange(
                keycloakUrl + "/realms/" + realm + "/protocol/openid-connect/logout",
                HttpMethod.POST,
                new HttpEntity<>(body, headers),
                Void.class
        );

        long expiresIn = Objects.requireNonNull(jwtDecoder.decode(accessToken).getExpiresAt())
                .getEpochSecond() - Instant.now().getEpochSecond();
        tokenBlacklistService.blacklist(accessToken, expiresIn);
    }
}