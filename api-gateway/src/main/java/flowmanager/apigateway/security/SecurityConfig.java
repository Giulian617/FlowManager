package flowmanager.apigateway.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.access.hierarchicalroles.RoleHierarchy;
import org.springframework.security.access.hierarchicalroles.RoleHierarchyAuthoritiesMapper;
import org.springframework.security.access.hierarchicalroles.RoleHierarchyImpl;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:8100"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public RoleHierarchy roleHierarchy() {
        return RoleHierarchyImpl.fromHierarchy("""
                    ROLE_ADMIN > ROLE_MANAGER
                    ROLE_MANAGER > ROLE_USER
                """);
    }

    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter(RoleHierarchy roleHierarchy) {
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        RoleHierarchyAuthoritiesMapper mapper = new RoleHierarchyAuthoritiesMapper(roleHierarchy);

        converter.setJwtGrantedAuthoritiesConverter(jwt -> {
            var authorities = new KeycloakRealmRoleConverter().convert(jwt);
            return new java.util.ArrayList<>(mapper.mapAuthorities(authorities));
        });

        return converter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            JwtAuthenticationConverter jwtAuthenticationConverter
    ) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .formLogin(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/actuator/health/**").permitAll()

                        .requestMatchers(HttpMethod.GET, "/users/").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/users/**").hasRole("USER")
                        .requestMatchers(HttpMethod.PUT, "/users/**").hasRole("USER")
                        .requestMatchers("/users/**").hasRole("ADMIN")

                        .requestMatchers(HttpMethod.GET, "/organizations/").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/organizations/**").hasRole("MANAGER")
                        .requestMatchers(HttpMethod.PUT, "/organizations/**").hasRole("MANAGER")
                        .requestMatchers("/organizations/**").hasRole("ADMIN")

                        .requestMatchers(HttpMethod.GET, "/projects/").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/projects/**").hasRole("USER")
                        .requestMatchers("/projects/**").hasRole("MANAGER")

                        .requestMatchers(HttpMethod.GET, "/teams/").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/teams/**").hasRole("USER")
                        .requestMatchers("/teams/**").hasRole("MANAGER")

                        .requestMatchers(HttpMethod.GET, "/work-items/").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/work-items/**").hasRole("MANAGER")
                        .requestMatchers("/work-items/**").hasRole("USER")

                        .requestMatchers(HttpMethod.GET, "/comments/**").hasRole("ADMIN")
                        .requestMatchers("/comments/**").hasRole("USER")
                        .anyRequest().authenticated()
                )
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter))
                );

        return http.build();
    }
}
