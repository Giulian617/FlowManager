package flowmanager.apigateway.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class GatewayLoggingFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(GatewayLoggingFilter.class);

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain)
            throws ServletException, IOException {

        long start = System.currentTimeMillis();

        log.info("→ {} {} from {}",
                request.getMethod(),
                request.getRequestURI(),
                request.getRemoteAddr());

        try {
            chain.doFilter(request, response);
        } catch (Exception ex) {
            log.error("✖ Unhandled exception on {} {}: {}",
                    request.getMethod(), request.getRequestURI(), ex.getMessage(), ex);
            throw ex;
        } finally {
            long elapsed = System.currentTimeMillis() - start;
            log.info("← {} {} → {} [{}ms]",
                    request.getMethod(),
                    request.getRequestURI(),
                    response.getStatus(),
                    elapsed);
        }
    }
}