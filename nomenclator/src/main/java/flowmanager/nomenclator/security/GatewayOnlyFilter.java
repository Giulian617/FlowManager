package flowmanager.nomenclator.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.jspecify.annotations.NonNull;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@ConditionalOnProperty(name = "gateway.filter.enabled", havingValue = "true", matchIfMissing = true)
public class GatewayOnlyFilter extends OncePerRequestFilter {
    private static final String INTERNAL_HEADER_NAME = "Internal-Gateway";

    @Value("${gateway.internal-secret}")
    private String internalSecret;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return request.getRequestURI().startsWith("/actuator");
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        String headerValue = request.getHeader(INTERNAL_HEADER_NAME);

        if (!internalSecret.equals(headerValue)) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setContentType("application/json");
            response.getWriter().write("""
                    {
                      "error": "Forbidden",
                      "message": "nomenclator can be accessed only through api-gateway"
                    }
                    """);
            return;
        }

        filterChain.doFilter(request, response);
    }
}