package flowmanager.apigateway.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.function.RouterFunction;
import org.springframework.web.servlet.function.ServerResponse;

import static org.springframework.cloud.gateway.server.mvc.filter.BeforeFilterFunctions.addRequestHeader;
import static org.springframework.cloud.gateway.server.mvc.filter.BeforeFilterFunctions.uri;
import static org.springframework.cloud.gateway.server.mvc.handler.GatewayRouterFunctions.route;
import static org.springframework.cloud.gateway.server.mvc.handler.HandlerFunctions.http;
import static org.springframework.cloud.gateway.server.mvc.predicate.GatewayRequestPredicates.path;

@Configuration
public class GatewayConfig {

    @Value("${gateway.internal-secret}")
    private String gatewaySecret;

    @Bean
    public RouterFunction<ServerResponse> routes() {
        return route("nomenclator-route")
                .route(
                        path("/auth/**")
                            .or(path("/users/**"))
                            .or(path("/organizations/**"))
                            .or(path("/teams/**"))
                            .or(path("/projects/**"))
                            .or(path("/work-items/**"))
                            .or(path("/comments/**")),
                        http()
                )
                .before(uri("http://localhost:8082"))
                .before(addRequestHeader("Internal-Gateway", gatewaySecret))
                .build();
    }
}