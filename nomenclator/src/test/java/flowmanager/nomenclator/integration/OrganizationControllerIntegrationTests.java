package flowmanager.nomenclator.integration;

import flowmanager.nomenclator.dto.OrganizationCreateDto;
import flowmanager.nomenclator.dto.OrganizationUpdateDto;
import flowmanager.nomenclator.model.Organization;
import flowmanager.nomenclator.model.Role;
import flowmanager.nomenclator.model.Team;
import flowmanager.nomenclator.model.User;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class OrganizationControllerIntegrationTests extends BaseIntegrationTests {
    private User seedManager(String keycloakId) {
        return createUserAndMockJwt(keycloakId, "mgr_" + keycloakId,
                keycloakId + "@t.com", Role.MANAGER);
    }

    private User seedUser(String keycloakId) {
        return createUserAndMockJwt(keycloakId, "usr_" + keycloakId,
                keycloakId + "@t.com", Role.USER);
    }

    private Organization seedOrg(User manager) {
        return organizationRepository.save(
                Organization.builder()
                        .name("Org Alpha")
                        .description("desc")
                        .industry("IT")
                        .createdAt(LocalDateTime.now())
                        .manager(manager)
                        .build());
    }

    @Test
    void getAllOrganizations_returnsEmptyList() throws Exception {
        seedManager("kc-org-1");

        mockMvc.perform(get("/organizations")
                        .header("Authorization", bearer("kc-org-1")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    void getAllOrganizations_returnsSeededOrg() throws Exception {
        User mgr = seedManager("kc-org-2");
        seedOrg(mgr);

        mockMvc.perform(get("/organizations")
                        .header("Authorization", bearer("kc-org-2")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name", is("Org Alpha")));
    }

    @Test
    void getTeamsByOrganization_returnsTeams() throws Exception {
        User mgr = seedManager("kc-org-10");
        Organization org = seedOrg(mgr);

        teamRepository.save(Team.builder()
                .name("Team A")
                .description("d")
                .createdAt(LocalDate.now())
                .organization(org).manager(mgr).build());

        mockMvc.perform(get("/organizations/" + org.getId() + "/teams")
                        .header("Authorization", bearer("kc-org-10")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name", is("Team A")));
    }

    @Test
    void getUsersByOrganization_returnsMembersFilteredByRole() throws Exception {
        User mgr = seedManager("kc-org-11");
        Organization org = Organization.builder()
                .name("Org")
                .description("d")
                .industry("IT")
                .createdAt(LocalDateTime.now())
                .manager(mgr)
                .build();
        org.getMembers().add(mgr);
        org = organizationRepository.save(org);

        mockMvc.perform(get("/organizations/" + org.getId() + "/users")
                        .param("role", "MANAGER")
                        .header("Authorization", bearer("kc-org-11")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].username", is(mgr.getUsername())));
    }

    @Test
    void getTeamsByOrganization_returns403_forMember() throws Exception {
        User mgr = seedManager("kc-org-20");
        User member = seedUser("kc-org-20b");
        Organization org = Organization.builder()
                .name("Org").description("d").industry("IT")
                .createdAt(LocalDateTime.now()).manager(mgr).build();
        org.getMembers().add(member);
        org = organizationRepository.save(org);

        mockMvc.perform(get("/organizations/" + org.getId() + "/teams")
                        .header("Authorization", bearer("kc-org-20b")))
                .andExpect(status().isForbidden());
    }

    @Test
    void getProjectsByOrganization_returns403_forNonMember() throws Exception {
        User mgr = seedManager("kc-org-21");
        Organization org = seedOrg(mgr);
        seedUser("kc-org-21b");

        mockMvc.perform(get("/organizations/" + org.getId() + "/projects")
                        .header("Authorization", bearer("kc-org-21b")))
                .andExpect(status().isForbidden());
    }

    @Test
    void getProjectsByOrganization_returns200_forOrgManager() throws Exception {
        User mgr = seedManager("kc-org-22");
        Organization org = seedOrg(mgr);

        mockMvc.perform(get("/organizations/" + org.getId() + "/projects")
                        .header("Authorization", bearer("kc-org-22")))
                .andExpect(status().isOk());
    }

    @Test
    void getWorkItemsByOrganization_returns403_forNonMember() throws Exception {
        User mgr = seedManager("kc-org-23");
        Organization org = seedOrg(mgr);
        seedUser("kc-org-23b");

        mockMvc.perform(get("/organizations/" + org.getId() + "/work-items")
                        .header("Authorization", bearer("kc-org-23b")))
                .andExpect(status().isForbidden());
    }

    @Test
    void getWorkItemsByOrganization_returns200_forOrgManager() throws Exception {
        User mgr = seedManager("kc-org-24");
        Organization org = seedOrg(mgr);

        mockMvc.perform(get("/organizations/" + org.getId() + "/work-items")
                        .header("Authorization", bearer("kc-org-24")))
                .andExpect(status().isOk());
    }

    @Test
    void getOrganizationById_returns200_forMember() throws Exception {
        User mgr = seedManager("kc-org-3");
        Organization org = seedOrg(mgr);

        mockMvc.perform(get("/organizations/" + org.getId())
                        .header("Authorization", bearer("kc-org-3")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(org.getId())))
                .andExpect(jsonPath("$.name", is("Org Alpha")));
    }

    @Test
    void getOrganizationById_returns403_forNonMember() throws Exception {
        User mgr = seedManager("kc-org-4");
        Organization org = seedOrg(mgr);
        seedUser("kc-org-4b");

        mockMvc.perform(get("/organizations/" + org.getId())
                        .header("Authorization", bearer("kc-org-4b")))
                .andExpect(status().isForbidden());
    }

    @Test
    void getOrganizationById_returns404_whenMissing() throws Exception {
        seedManager("kc-org-25");

        mockMvc.perform(get("/organizations/99999")
                        .header("Authorization", bearer("kc-org-25")))
                .andExpect(status().isNotFound());
    }

    @Test
    void createOrganization_persistsAndReturns201() throws Exception {
        User mgr = seedManager("kc-org-5");

        OrganizationCreateDto dto = new OrganizationCreateDto(
                "New Org",
                "A description",
                "Finance",
                mgr.getId(),
                List.of()
        );

        mockMvc.perform(post("/organizations")
                        .header("Authorization", bearer("kc-org-5"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name", is("New Org")))
                .andExpect(jsonPath("$.industry", is("Finance")));

        assertEquals(1, organizationRepository.count());
    }

    @Test
    void createOrganization_withMembers_addsThemCorrectly() throws Exception {
        User mgr = seedManager("kc-org-6");
        User member = seedUser("kc-org-6b");

        OrganizationCreateDto dto = new OrganizationCreateDto(
                "Org With Members",
                "desc",
                "IT",
                mgr.getId(),
                List.of(member.getId())
        );

        mockMvc.perform(post("/organizations")
                        .header("Authorization", bearer("kc-org-6"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.memberCount", greaterThanOrEqualTo(1)));
    }

    @Test
    void createOrganization_returns401_withoutToken() throws Exception {
        User mgr = seedManager("kc-org-7");
        OrganizationCreateDto dto = new OrganizationCreateDto(
                "X",
                "d",
                "IT",
                mgr.getId(),
                List.of());

        mockMvc.perform(post("/organizations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void updateOrganization_returns200_andPersistsChange() throws Exception {
        User mgr = seedManager("kc-org-8");
        Organization org = seedOrg(mgr);

        OrganizationUpdateDto dto = new OrganizationUpdateDto(
                "Updated Name", "new desc", "Healthcare", null, null);

        mockMvc.perform(put("/organizations/" + org.getId())
                        .header("Authorization", bearer("kc-org-8"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name", is("Updated Name")));

        Organization updated = organizationRepository.findById(org.getId()).orElseThrow();
        assertEquals("Updated Name", updated.getName());
    }

    @Test
    void updateOrganization_returns404_whenMissing() throws Exception {
        seedManager("kc-org-27");

        OrganizationUpdateDto dto = new OrganizationUpdateDto(
                "Ghost", "d", "IT", null, null);

        mockMvc.perform(put("/organizations/99999")
                        .header("Authorization", bearer("kc-org-27"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isNotFound());
    }

    @Test
    void deleteOrganization_returns204_andRemovedFromDB() throws Exception {
        User mgr = seedManager("kc-org-9");
        Organization org = seedOrg(mgr);

        mockMvc.perform(delete("/organizations/" + org.getId())
                        .header("Authorization", bearer("kc-org-9")))
                .andExpect(status().isNoContent());

        assertFalse(organizationRepository.findById(org.getId()).isPresent());
    }

    @Test
    void deleteOrganization_returns204_whenMissing() throws Exception {
        seedManager("kc-org-26");

        mockMvc.perform(delete("/organizations/99999")
                        .header("Authorization", bearer("kc-org-26")))
                .andExpect(status().isNoContent());
    }
}