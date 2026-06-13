package flowmanager.nomenclator.integration;

import flowmanager.nomenclator.dto.ProjectCreateDto;
import flowmanager.nomenclator.dto.ProjectUpdateDto;
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

class ProjectControllerIntegrationTests extends BaseIntegrationTests {
    private User seedManager(String kc) {
        return createUserAndMockJwt(kc, "mgr_" + kc, kc + "@t.com", Role.MANAGER);
    }

    private Organization seedOrg(User mgr) {
        return organizationRepository.save(
                Organization.builder()
                        .name("Org").description("d").industry("IT")
                        .createdAt(LocalDateTime.now()).manager(mgr).build());
    }

    private Project seedProject(User mgr, Organization org) {
        return projectRepository.save(
                Project.builder()
                        .name("Project").description("d")
                        .startDate(LocalDate.now()).endDate(LocalDate.now().plusMonths(6))
                        .organization(org).manager(mgr).build());
    }

    private Team seedTeam(User mgr, Organization org) {
        return teamRepository.save(
                Team.builder()
                        .name("Team").description("d")
                        .createdAt(LocalDate.now())
                        .organization(org).manager(mgr).build());
    }

    @Test
    void getAllProjects_returnsSeededProject() throws Exception {
        User mgr = seedManager("kc-p1");
        seedProject(mgr, seedOrg(mgr));

        mockMvc.perform(get("/projects")
                        .header("Authorization", bearer("kc-p1")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name", is("Project")));
    }

    @Test
    void getWorkItemsByProject_returnsWorkItems() throws Exception {
        User mgr = seedManager("kc-p8");
        Project project = seedProject(mgr, seedOrg(mgr));
        workItemRepository.save(WorkItem.builder()
                .title("T1").description("d")
                .itemType(ItemType.Task).status(Status.To_do).severity(Severity.Low)
                .createdAt(LocalDate.now()).project(project).reporter(mgr).build());

        mockMvc.perform(get("/projects/" + project.getId() + "/work-items")
                        .header("Authorization", bearer("kc-p8")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)));
    }

    @Test
    void getTeamsByProject_returnsTeams() throws Exception {
        User mgr = seedManager("kc-p9");
        Organization org = seedOrg(mgr);
        Team team = seedTeam(mgr, org);

        Project project = projectRepository.save(
                Project.builder()
                        .name("P")
                        .description("d")
                        .startDate(LocalDate.now())
                        .endDate(LocalDate.now().plusDays(30))
                        .organization(org)
                        .manager(mgr)
                        .build()
        );
        team.getProjects().add(project);
        teamRepository.save(team);

        mockMvc.perform(get("/projects/" + project.getId() + "/teams")
                        .header("Authorization", bearer("kc-p9")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)));
    }

    @Test
    void getProjectById_returns200_forMember() throws Exception {
        User mgr = seedManager("kc-p2");
        Project project = seedProject(mgr, seedOrg(mgr));

        mockMvc.perform(get("/projects/" + project.getId())
                        .header("Authorization", bearer("kc-p2")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name", is("Project")));
    }

    @Test
    void getMembersByProject_returns200_forProjectManager() throws Exception {
        User mgr = seedManager("kc-p12");
        Project project = seedProject(mgr, seedOrg(mgr));

        mockMvc.perform(get("/projects/" + project.getId() + "/members")
                        .header("Authorization", bearer("kc-p12")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    void getProjectById_returns200_forTeamMember() throws Exception {
        User mgr = seedManager("kc-p13");
        Organization org = seedOrg(mgr);
        Project project = seedProject(mgr, org);

        User member = createUserAndMockJwt("kc-p13b", "team_member", "tm@t.com", Role.USER);
        Team team = teamRepository.save(Team.builder()
                .name("Team").description("d").createdAt(LocalDate.now())
                .organization(org).manager(mgr)
                .members(new java.util.ArrayList<>(java.util.List.of(member)))
                .build());
        team.getProjects().add(project);
        teamRepository.save(team);

        mockMvc.perform(get("/projects/" + project.getId())
                        .header("Authorization", bearer("kc-p13b")))
                .andExpect(status().isOk());
    }

    @Test
    void getProjectById_returns403_forNonMember() throws Exception {
        User mgr = seedManager("kc-p3");
        Project project = seedProject(mgr, seedOrg(mgr));
        createUserAndMockJwt("kc-p3b", "outsider", "out@t.com", Role.USER);

        mockMvc.perform(get("/projects/" + project.getId())
                        .header("Authorization", bearer("kc-p3b")))
                .andExpect(status().isForbidden());
    }

    @Test
    void getProjectById_returns404_whenMissing() throws Exception {
        seedManager("kc-p15");

        mockMvc.perform(get("/projects/99999")
                        .header("Authorization", bearer("kc-p15")))
                .andExpect(status().isNotFound());
    }

    @Test
    void createProject_persistsAndReturns201() throws Exception {
        User mgr = seedManager("kc-p4");
        Organization org = seedOrg(mgr);

        ProjectCreateDto dto = new ProjectCreateDto(
                "New Project",
                "desc",
                LocalDate.now(), LocalDate.now().plusMonths(6),
                org.getId(),
                null);

        mockMvc.perform(post("/projects")
                        .header("Authorization", bearer("kc-p4"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name", is("New Project")));

        assertEquals(1, projectRepository.count());
    }

    @Test
    void createProject_withTeams_assignsTeamsToProject() throws Exception {
        User mgr = seedManager("kc-p5");
        Organization org = seedOrg(mgr);
        Team team = seedTeam(mgr, org);

        ProjectCreateDto dto = new ProjectCreateDto(
                "Proj With Teams", "d",
                LocalDate.now(), LocalDate.now().plusMonths(3),
                org.getId(), List.of(team.getId()));

        mockMvc.perform(post("/projects")
                        .header("Authorization", bearer("kc-p5"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated());

        Team updated = teamRepository.findById(team.getId()).orElseThrow();
        long count = projectRepository.countByTeamsContaining(updated);
        assertTrue(count > 0);
    }

    @Test
    void createProject_returns401_withoutToken() throws Exception {
        User mgr = seedManager("kc-p17");
        Organization org = seedOrg(mgr);

        ProjectCreateDto dto = new ProjectCreateDto(
                "X", "d", LocalDate.now(), LocalDate.now().plusMonths(1),
                org.getId(), null);

        mockMvc.perform(post("/projects")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void updateProject_byManager_updatesName() throws Exception {
        User mgr = seedManager("kc-p6");
        Organization org = seedOrg(mgr);
        Project project = seedProject(mgr, org);

        ProjectUpdateDto dto = new ProjectUpdateDto(
                "Updated Project",
                "new desc",
                project.getStartDate(),
                project.getEndDate(),
                null,
                null);

        mockMvc.perform(put("/projects/" + project.getId())
                        .header("Authorization", bearer("kc-p6"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name", is("Updated Project")));
    }

    @Test
    void updateProject_byOrgManager_returns200() throws Exception {
        User orgMgr = seedManager("kc-p14");
        Organization org = seedOrg(orgMgr);

        User projectMgr = createUserAndMockJwt("kc-p14b", "proj_mgr2", "pm2@t.com", Role.MANAGER);
        Project project = projectRepository.save(Project.builder()
                .name("Project").description("d")
                .startDate(LocalDate.now()).endDate(LocalDate.now().plusMonths(3))
                .organization(org).manager(projectMgr).build());

        Team team = teamRepository.save(Team.builder()
                .name("Team").description("d").createdAt(LocalDate.now())
                .organization(org).manager(orgMgr).build());
        team.getProjects().add(project);
        teamRepository.save(team);

        ProjectUpdateDto dto = new ProjectUpdateDto("Updated", "d",
                project.getStartDate(), project.getEndDate(), null, null);

        mockMvc.perform(put("/projects/" + project.getId())
                        .header("Authorization", bearer("kc-p14"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk());
    }


    @Test
    void updateProject_byPlainTeamMember_returns403() throws Exception {
        User orgManager = seedManager("kc-p11-org");
        Organization org = seedOrg(orgManager);
        Project project = seedProject(orgManager, org);

        User member = createUserAndMockJwt("kc-p11-member", "plain_member", "pm@t.com", Role.USER);
        Team team = teamRepository.save(
                Team.builder()
                        .name("Team")
                        .description("d")
                        .createdAt(LocalDate.now())
                        .organization(org)
                        .manager(orgManager)
                        .members(new java.util.ArrayList<>(java.util.List.of(member)))
                        .build());
        team.getProjects().add(project);
        teamRepository.save(team);

        ProjectUpdateDto dto = new ProjectUpdateDto("Hacked", "x",
                project.getStartDate(), project.getEndDate(), null, null);

        mockMvc.perform(put("/projects/" + project.getId())
                        .header("Authorization", bearer("kc-p11-member"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isForbidden());
    }


    @Test
    void deleteProject_returns204_andRemovedFromDB() throws Exception {
        User mgr = seedManager("kc-p7");
        Organization org = seedOrg(mgr);
        Project project = seedProject(mgr, org);

        mockMvc.perform(delete("/projects/" + project.getId())
                        .header("Authorization", bearer("kc-p7")))
                .andExpect(status().isNoContent());

        assertFalse(projectRepository.existsById(project.getId()));
    }

    @Test
    void deleteProject_returns404_whenMissing() throws Exception {
        User mgr = seedManager("kc-p16");

        mockMvc.perform(delete("/projects/99999")
                        .header("Authorization", bearer("kc-p16")))
                .andExpect(status().isNotFound());
    }

    @Test
    void deleteProject_byProjectManager_returns403_onlyOrgManagerCanDelete() throws Exception {
        User orgManager = seedManager("kc-p10-org");
        Organization org = seedOrg(orgManager);

        User projectManager = createUserAndMockJwt("kc-p10-proj", "proj_mgr", "pmgr@t.com", Role.MANAGER);
        Project project = projectRepository.save(
                Project.builder()
                        .name("Project")
                        .description("d")
                        .startDate(LocalDate.now())
                        .endDate(LocalDate.now().plusMonths(3))
                        .organization(org)
                        .manager(projectManager)
                        .build());

        mockMvc.perform(delete("/projects/" + project.getId())
                        .header("Authorization", bearer("kc-p10-proj")))
                .andExpect(status().isForbidden());

        assertTrue(projectRepository.existsById(project.getId()));
    }

}