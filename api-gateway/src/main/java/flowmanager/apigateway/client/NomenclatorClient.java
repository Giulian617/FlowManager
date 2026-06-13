package flowmanager.apigateway.client;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
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

    // Aspect order matters: the circuit breaker must wrap the retry (configured via
    // circuit-breaker-aspect-order < retry-aspect-order in application.yml) so the retry
    // exhausts its attempts before the fallback runs. With the resilience4j defaults the
    // order is reversed and the fallback swallows the first failure, so retries never fire.
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

    public ResponseEntity<byte[]> fallback(HttpServletRequest request, byte[] body, Throwable ex) {
        log.error("Circuit breaker triggered for {} {}: {}",
                request.getMethod(), request.getRequestURI(), ex.getMessage());
        return ResponseEntity
                .status(503)
                .header("Content-Type", "application/json")
                .body("{\"error\":\"Service temporarily unavailable. Please try again later.\"}".getBytes());
    }
}