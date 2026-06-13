package flowmanager.nomenclator.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import flowmanager.nomenclator.model.Role;
import flowmanager.nomenclator.model.User;
import flowmanager.nomenclator.repository.*;
import flowmanager.nomenclator.security.KeycloakAdminService;
import flowmanager.nomenclator.security.KeycloakAuthService;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import static org.mockito.Mockito.when;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(BaseIntegrationTests.TestConfig.class)
public abstract class BaseIntegrationTests {

    @Autowired
    protected MockMvc mockMvc;

    @Autowired
    protected ObjectMapper objectMapper;

    @Autowired
    protected UserRepository userRepository;

    @Autowired
    protected OrganizationRepository organizationRepository;

    @Autowired
    protected TeamRepository teamRepository;

    @Autowired
    protected ProjectRepository projectRepository;

    @Autowired
    protected WorkItemRepository workItemRepository;

    @Autowired
    protected CommentRepository commentRepository;

    @MockitoBean
    protected KeycloakAdminService keycloakAdminService;

    @MockitoBean
    protected KeycloakAuthService keycloakAuthService;

    @MockitoBean
    protected JwtDecoder jwtDecoder;

    @Autowired
    private javax.sql.DataSource dataSource;

    @BeforeEach
    void cleanDatabase() throws Exception {
        try (var conn = dataSource.getConnection();
             var stmt = conn.createStatement()) {
            stmt.execute("SET REFERENTIAL_INTEGRITY FALSE");
            stmt.execute("DELETE FROM team_project");
            stmt.execute("DELETE FROM organization_user");
            stmt.execute("DELETE FROM work_item_assignment");
            stmt.execute("DELETE FROM comment");
            stmt.execute("DELETE FROM work_item");
            stmt.execute("DELETE FROM project");
            stmt.execute("DELETE FROM team");
            stmt.execute("DELETE FROM organization");
            stmt.execute("DELETE FROM app_user");
            stmt.execute("ALTER TABLE comment ALTER COLUMN id RESTART WITH 1");
            stmt.execute("ALTER TABLE work_item ALTER COLUMN id RESTART WITH 1");
            stmt.execute("ALTER TABLE project ALTER COLUMN id RESTART WITH 1");
            stmt.execute("ALTER TABLE team ALTER COLUMN id RESTART WITH 1");
            stmt.execute("ALTER TABLE organization ALTER COLUMN id RESTART WITH 1");
            stmt.execute("ALTER TABLE app_user ALTER COLUMN id RESTART WITH 1");
            stmt.execute("SET REFERENTIAL_INTEGRITY TRUE");
        }
    }

    protected Jwt buildJwt(String keycloakId, Role role) {
        return Jwt.withTokenValue(keycloakId)
                .header("alg", "none")
                .claim("sub", keycloakId)
                .claim("preferred_username", keycloakId)
                .claim("realm_access", Map.of("roles", List.of(role.name())))
                .issuedAt(Instant.now())
                .expiresAt(Instant.now().plusSeconds(3600))
                .build();
    }

    protected String bearer(String keycloakId) {
        return "Bearer " + keycloakId;
    }

    protected User createUserAndMockJwt(String keycloakId, String username, String email, Role role) {
        User user = User.builder()
                .keycloakId(keycloakId)
                .email(email)
                .username(username)
                .firstName("Test")
                .lastName("User")
                .phoneNumber("+40700000000")
                .role(role)
                .active(true)
                .createdAt(LocalDateTime.now())
                .build();
        user = userRepository.save(user);

        Jwt jwt = buildJwt(keycloakId, role);
        when(jwtDecoder.decode(keycloakId)).thenReturn(jwt);
        return user;
    }

    @TestConfiguration
    static class TestConfig {
        @Bean
        public ObjectMapper objectMapper() {
            return new ObjectMapper()
                    .registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule())
                    .disable(com.fasterxml.jackson.databind.SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        }
    }
}