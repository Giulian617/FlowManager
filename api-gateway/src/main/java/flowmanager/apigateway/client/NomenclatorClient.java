package flowmanager.apigateway.client;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.ratelimiter.RequestNotPermitted;
import io.github.resilience4j.ratelimiter.annotation.RateLimiter;
import io.github.resilience4j.retry.annotation.Retry;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

@Component
public class NomenclatorClient {

    private static final Logger log = LoggerFactory.getLogger(NomenclatorClient.class);

    private final RestTemplate restTemplate;

    @Value("${nomenclator.base-url:http://localhost:8082}")
    private String nomenclatorBaseUrl;

    @Value("${gateway.internal-secret}")
    private String gatewaySecret;

    public NomenclatorClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @RateLimiter(name = "nomenclator", fallbackMethod = "rateLimitFallback")
    @CircuitBreaker(name = "nomenclator", fallbackMethod = "fallback")
    @Retry(name = "nomenclator")
    public ResponseEntity<byte[]> forward(HttpServletRequest request, byte[] body) {
        String uri = UriComponentsBuilder
                .fromUriString(nomenclatorBaseUrl)
                .path(request.getRequestURI())
                .query(request.getQueryString())
                .build(true)
                .toUriString();

        HttpHeaders headers = new HttpHeaders();
        request.getHeaderNames().asIterator().forEachRemaining(name -> {
            if (!name.equalsIgnoreCase("content-length") &&
                    !name.equalsIgnoreCase("host") &&
                    !name.equalsIgnoreCase("transfer-encoding")) {
                headers.add(name, request.getHeader(name));
            }
        });
        headers.set("Internal-Gateway", gatewaySecret);

        HttpMethod method = HttpMethod.valueOf(request.getMethod());
        HttpEntity<byte[]> entity = new HttpEntity<>(body, headers);

        log.debug("Forwarding {} {} to nomenclator", method, uri);
        return restTemplate.exchange(uri, method, entity, byte[].class);
    }

    public ResponseEntity<byte[]> rateLimitFallback(HttpServletRequest request,
                                                    byte[] body,
                                                    RequestNotPermitted ex) {
        log.warn("Rate limit exceeded for {} {}: {}",
                request.getMethod(), request.getRequestURI(), ex.getMessage());
        return ResponseEntity
                .status(429)
                .header("Content-Type", "application/json")
                .header("Retry-After", "1")
                .body("{\"error\":\"Too many requests. Please slow down.\"}".getBytes());
    }

    // Called when the circuit breaker is OPEN (downstream is considered down).
    public ResponseEntity<byte[]> fallback(HttpServletRequest request,
                                           byte[] body,
                                           Throwable ex) {
        log.error("Circuit breaker triggered for {} {}: {}",
                request.getMethod(), request.getRequestURI(), ex.getMessage());
        return ResponseEntity
                .status(503)
                .header("Content-Type", "application/json")
                .body("{\"error\":\"Service temporarily unavailable. Please try again later.\"}".getBytes());
    }
}