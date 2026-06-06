package flowmanager.nomenclator.security;

import flowmanager.nomenclator.dto.UserCreateDto;
import flowmanager.nomenclator.dto.UserUpdateDto;
import flowmanager.nomenclator.model.Role;
import flowmanager.nomenclator.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.*;

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

    private HttpEntity<MultiValueMap<String, String>> buildTokenRequest() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("grant_type", "client_credentials");
        body.add("client_id", clientId);
        body.add("client_secret", clientSecret);

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
    private void patchKeycloakUser(String keycloakId, Map<String, Object> overrides) {
        String token = getAdminToken();
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);

        ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                keycloakUrl + "/admin/realms/" + realm + "/users/" + keycloakId,
                HttpMethod.GET,
                new HttpEntity<>(headers),
                new ParameterizedTypeReference<>() {}
        );

        if (response.getBody() == null) throw new RuntimeException("Keycloak user not found");

        Map<String, Object> existing = response.getBody();

        Map<String, Object> kcUser = new HashMap<>();
        kcUser.put("id",              existing.get("id"));
        kcUser.put("username",        existing.get("username"));
        kcUser.put("email",           existing.get("email"));
        kcUser.put("firstName",       existing.get("firstName"));
        kcUser.put("lastName",        existing.get("lastName"));
        kcUser.put("enabled",         existing.get("enabled"));
        kcUser.put("emailVerified",   existing.get("emailVerified"));
        kcUser.put("requiredActions", existing.get("requiredActions"));

        kcUser.putAll(overrides);

        headers.setContentType(MediaType.APPLICATION_JSON);
//        restTemplate.exchange(
//                keycloakUrl + "/admin/realms/" + realm + "/users/" + keycloakId,
//                HttpMethod.PUT,
//                new HttpEntity<>(kcUser, headers),
//                Void.class
//        );
        try {
            restTemplate.exchange(
                    keycloakUrl + "/admin/realms/" + realm + "/users/" + keycloakId,
                    HttpMethod.PUT,
                    new HttpEntity<>(kcUser, headers),
                    Void.class
            );
        } catch (HttpClientErrorException e) {
        System.out.println("Keycloak error: " + e.getStatusCode());
        System.out.println("Keycloak body: " + e.getResponseBodyAsString());
        throw new RuntimeException("Keycloak update failed: " + e.getResponseBodyAsString(), e);
    }
    }

    public void updateUser(User user, UserUpdateDto dto) {
        boolean updateNeeded =
                dto.getUsername() != null ||
                        dto.getEmail() != null ||
                        dto.getFirstName() != null ||
                        dto.getLastName() != null;

        if (!updateNeeded) return;

        Map<String, Object> overrides = new HashMap<>();
        if (dto.getUsername() != null)  overrides.put("username",  dto.getUsername());
        if (dto.getEmail() != null)     overrides.put("email",     dto.getEmail());
        if (dto.getFirstName() != null) overrides.put("firstName", dto.getFirstName());
        if (dto.getLastName() != null)  overrides.put("lastName",  dto.getLastName());

        patchKeycloakUser(user.getKeycloakId(), overrides);
    }

    public void setUserEnabled(String keycloakId, boolean enabled) {
        patchKeycloakUser(keycloakId, Map.of("enabled", enabled));
    }

    public void deleteUser(String keycloakId) {
        String token = getAdminToken();

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);

        restTemplate.exchange(
                keycloakUrl + "/admin/realms/" + realm + "/users/" + keycloakId,
                HttpMethod.DELETE,
                new HttpEntity<>(headers),
                Void.class
        );
    }
}