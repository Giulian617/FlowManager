package flowmanager.nomenclator.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;

import java.util.Objects;

public class Utils {
    private Utils() {}

    public static boolean isAdmin(Authentication auth) {
        return auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .filter(Objects::nonNull)
                .anyMatch(role -> role.equals("ROLE_ADMIN"));
    }

    public static boolean isAdminOrManager(Authentication auth) {
        return auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .filter(Objects::nonNull)
                .anyMatch(role -> role.equals("ROLE_ADMIN") || role.equals("ROLE_MANAGER"));
    }

    public static Integer getCurrentUserId(Authentication auth) {
        Jwt jwt = (Jwt) auth.getPrincipal();
        return Integer.parseInt(jwt.getSubject());
    }

    public static boolean isNotAuthenticated(Authentication auth) {
        return auth == null || !auth.isAuthenticated();
    }
}
