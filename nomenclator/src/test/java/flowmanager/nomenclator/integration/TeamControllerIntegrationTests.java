package flowmanager.nomenclator.integration;

import flowmanager.nomenclator.dto.TeamCreateDto;
import flowmanager.nomenclator.dto.TeamUpdateDto;
import flowmanager.nomenclator.model.*;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class TeamControllerIntegrationTests extends BaseIntegrationTests {
    private User seedManager(String kc) {
        return createUserAndMockJwt(kc, "mgr_" + kc, kc + "@t.com", Role.MANAGER);
    }

    private Organization seedOrg(User mgr) {
        return organizationRepository.save(
                Organization.builder()
                        .name("Org").description("d").industry("IT")
                        .createdAt(LocalDateTime.now()).manager(mgr).build());
    }

    private Team seedTeam(User mgr, Organization org) {
        return teamRepository.save(
                Team.builder()
                        .name("Team").description("d")
                        .createdAt(LocalDate.now())
                        .organization(org).manager(mgr).build());
    }

    @Test
    void getAllTeams_returnsSeededTeam() throws Exception {
        User mgr = seedManager("kc-t1");
        seedTeam(mgr, seedOrg(mgr));

        mockMvc.perform(get("/teams")
                        .header("Authorization", bearer("kc-t1")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name", is("Team")));
    }

    @Test
    void getAllTeams_returns200_forOrgManager() throws Exception {
        User orgMgr = seedManager("kc-t8");
        Organization org = seedOrg(orgMgr);

        User teamMgr = createUserAndMockJwt("kc-t8b", "team_mgr2", "tm2@t.com", Role.MANAGER);
        seedTeam(teamMgr, org);

        mockMvc.perform(get("/teams")
                        .header("Authorization", bearer("kc-t8b")))
                .andExpect(status().isOk());
    }

    @Test
    void createTeam_persistsAndReturns201() throws Exception {
        User mgr = seedManager("kc-t2");
        Organization org = seedOrg(mgr);

        TeamCreateDto dto = new TeamCreateDto(
                "New Team",
                "desc",
                org.getId(),
                null
        );

        mockMvc.perform(post("/teams")
                        .header("Authorization", bearer("kc-t2"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name", is("New Team")));

        assertEquals(1, teamRepository.count());
    }

    @Test
    void createTeam_withMembers_includesThemInResponse() throws Exception {
        User mgr = seedManager("kc-t3");
        User member = createUserAndMockJwt("kc-t3b", "member", "mem@t.com", Role.USER);
        Organization org = seedOrg(mgr);

        TeamCreateDto dto = new TeamCreateDto(
                "Team With Members",
                "d",
                org.getId(),
                List.of(member.getId())
        );

        mockMvc.perform(post("/teams")
                        .header("Authorization", bearer("kc-t3"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.members", hasSize(greaterThanOrEqualTo(1))));
    }

    @Test
    void createTeam_returns401_withoutToken() throws Exception {
        User mgr = seedManager("kc-t12");
        Organization org = seedOrg(mgr);

        TeamCreateDto dto = new TeamCreateDto("X", "d", org.getId(), null);

        mockMvc.perform(post("/teams")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void updateTeam_byManager_updatesNameAndPersists() throws Exception {
        User mgr = seedManager("kc-t4");
        Team team = seedTeam(mgr, seedOrg(mgr));

        TeamUpdateDto dto = new TeamUpdateDto("Updated Team", "new desc", null, null);

        mockMvc.perform(put("/teams/" + team.getId())
                        .header("Authorization", bearer("kc-t4"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name", is("Updated Team")));

        Team updated = teamRepository.findById(team.getId()).orElseThrow();
        assertEquals("Updated Team", updated.getName());
    }

    @Test
    void updateTeam_byPlainMember_returns403() throws Exception {
        User mgr = seedManager("kc-t7");
        Team team = seedTeam(mgr, seedOrg(mgr));

        User member = createUserAndMockJwt("kc-t7b", "plain_member", "pm@t.com", Role.USER);
        team.getMembers().add(member);
        teamRepository.save(team);

        TeamUpdateDto dto = new TeamUpdateDto("Hacked", "x", null, null);

        mockMvc.perform(put("/teams/" + team.getId())
                        .header("Authorization", bearer("kc-t7b"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isForbidden());
    }

    @Test
    void updateTeam_returns404_whenMissing() throws Exception {
        seedManager("kc-t9");
        TeamUpdateDto dto = new TeamUpdateDto("x", "x", null, null);

        mockMvc.perform(put("/teams/99999")
                        .header("Authorization", bearer("kc-t9"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isNotFound());
    }

    @Test
    void deleteTeam_returns204_andRemovedFromDB() throws Exception {
        User mgr = seedManager("kc-t5");
        Team team = seedTeam(mgr, seedOrg(mgr));

        mockMvc.perform(delete("/teams/" + team.getId())
                        .header("Authorization", bearer("kc-t5")))
                .andExpect(status().isNoContent());

        assertFalse(teamRepository.findById(team.getId()).isPresent());
    }

    @Test
    void deleteTeam_returns204_whenMissing() throws Exception {
        User mgr = seedManager("kc-t11");

        mockMvc.perform(delete("/teams/99999")
                        .header("Authorization", bearer("kc-t11")))
                .andExpect(status().isNoContent());
    }

    @Test
    void deleteTeam_byTeamManager_returns403_onlyOrgManagerCanDelete() throws Exception {
        User orgManager = seedManager("kc-t6-org");
        Organization org = seedOrg(orgManager);

        User teamManager = createUserAndMockJwt("kc-t6-team", "team_mgr", "tmgr@t.com", Role.MANAGER);
        Team team = teamRepository.save(
                Team.builder()
                        .name("Team")
                        .description("d")
                        .createdAt(java.time.LocalDate.now())
                        .organization(org)
                        .manager(teamManager)
                        .build());

        mockMvc.perform(delete("/teams/" + team.getId())
                        .header("Authorization", bearer("kc-t6-team")))
                .andExpect(status().isForbidden());

        assertTrue(teamRepository.findById(team.getId()).isPresent());
    }
}
