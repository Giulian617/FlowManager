package flowmanager.nomenclator.security;

import flowmanager.nomenclator.dto.UserCreateDto;
import flowmanager.nomenclator.model.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class KeycloakAdminService {

    @Value("${keycloak.admin.url}")
    private String keycloakUrl;

    @Value("${keycloak.admin.realm}")
    private String realm;

    @Value("${keycloak.admin.client-id}")
    private String clientId;

    @Value("${keycloak.admin.client-secret}")
    private String clientSecret;

    private final RestTemplate restTemplate;

    private HttpEntity<String> buildTokenRequest() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        String body = "grant_type=client_credentials" +
                "&client_id=" + clientId +
                "&client_secret=" + clientSecret;
        return new HttpEntity<>(body, headers);
    }

    private String getAdminToken() {
        ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                keycloakUrl + "/realms/" + realm + "/protocol/openid-connect/token",
                HttpMethod.POST,
                buildTokenRequest(),
                new ParameterizedTypeReference<>() {}
        );
        return (String) Objects.requireNonNull(response.getBody()).get("access_token");
    }

    public String createUser(UserCreateDto dto) {
        String token = getAdminToken();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(token);

        Map<String, Object> userRepresentation = Map.of(
                "username", dto.getUsername(),
                "email", dto.getEmail(),
                "firstName", dto.getFirstName(),
                "lastName", dto.getLastName(),
                "enabled", true,
                "emailVerified", true,
                "credentials", List.of(Map.of(
                        "type", "password",
                        "value", dto.getPassword(),
                        "temporary", false
                ))
        );

        ResponseEntity<Void> response = restTemplate.postForEntity(
                keycloakUrl + "/admin/realms/" + realm + "/users",
                new HttpEntity<>(userRepresentation, headers),
                Void.class
        );

        String location = Objects.requireNonNull(response.getHeaders().getLocation()).toString();
        return location.substring(location.lastIndexOf("/") + 1);
    }

    public void assignRole(String keycloakId, Role role) {
        String token = getAdminToken();

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);

        ResponseEntity<Map<String, Object>> roleResponse = restTemplate.exchange(
                keycloakUrl + "/admin/realms/" + realm + "/roles/" + role.name(),
                HttpMethod.GET,
                new HttpEntity<>(headers),
                new ParameterizedTypeReference<>() {}
        );

        Map<String, Object> roleRepresentation = Objects.requireNonNull(roleResponse.getBody());

        headers.setContentType(MediaType.APPLICATION_JSON);
        restTemplate.postForEntity(
                keycloakUrl + "/admin/realms/" + realm + "/users/" + keycloakId + "/role-mappings/realm",
                new HttpEntity<>(List.of(roleRepresentation), headers),
                Void.class
        );
    }

    public void removeRole(String keycloakId, Role role) {
        String token = getAdminToken();

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        headers.setContentType(MediaType.APPLICATION_JSON);

        ResponseEntity<Map<String, Object>> roleResponse = restTemplate.exchange(
                keycloakUrl + "/admin/realms/" + realm + "/roles/" + role.name(),
                HttpMethod.GET,
                new HttpEntity<>(headers),
                new ParameterizedTypeReference<>() {}
        );

        Map<String, Object> roleRepresentation = Objects.requireNonNull(roleResponse.getBody());

        restTemplate.exchange(
                keycloakUrl + "/admin/realms/" + realm + "/users/" + keycloakId + "/role-mappings/realm",
                HttpMethod.DELETE,
                new HttpEntity<>(List.of(roleRepresentation), headers),
                Void.class
        );
    }

    public void updateUserRole(String keycloakId, Role newRole) {
        Arrays.stream(Role.values()).forEach(role -> {
            try {
                removeRole(keycloakId, role);
            } catch (Exception ignored) {}
        });
        assignRole(keycloakId, newRole);
    }
}