package flowmanager.apigateway.client;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.annotation.Order;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
@Order(1)
public class ResilienceGatewayFilter extends OncePerRequestFilter {

    private static final List<String> PROXIED_PATHS = List.of(
            "/auth/**",
            "/users/**",
            "/organizations/**",
            "/teams/**",
            "/projects/**",
            "/work-items/**",
            "/comments/**"
    );

    private final NomenclatorClient nomenclatorClient;
    private final AntPathMatcher pathMatcher = new AntPathMatcher();

    public ResilienceGatewayFilter(NomenclatorClient nomenclatorClient) {
        this.nomenclatorClient = nomenclatorClient;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return PROXIED_PATHS.stream().noneMatch(pattern -> pathMatcher.match(pattern, path));
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain)
            throws ServletException, IOException {

        byte[] body = request.getInputStream().readAllBytes();
        ResponseEntity<byte[]> result = nomenclatorClient.forward(request, body);

        response.setStatus(result.getStatusCode().value());
        result.getHeaders().forEach((name, values) -> {
            if (name.equalsIgnoreCase("Transfer-Encoding") ||
                    name.equalsIgnoreCase("Content-Length") ||
                    name.equalsIgnoreCase("Connection") ||
                    name.equalsIgnoreCase("Keep-Alive")) {
                return;
            }
            values.forEach(value -> response.addHeader(name, value));
        });

        if (result.getBody() != null) {
            response.getOutputStream().write(result.getBody());
        }
    }
}