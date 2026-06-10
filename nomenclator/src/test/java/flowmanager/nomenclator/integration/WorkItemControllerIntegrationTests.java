package flowmanager.nomenclator.integration;

import flowmanager.nomenclator.dto.WorkItemCreateDto;
import flowmanager.nomenclator.dto.WorkItemUpdateDto;
import flowmanager.nomenclator.model.*;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class WorkItemControllerIntegrationTests extends BaseIntegrationTests {
    private User seedManager(String keycloakId) {
        return createUserAndMockJwt(keycloakId, "mgr_" + keycloakId,
                keycloakId + "@t.com", Role.MANAGER);
    }

    record Ctx(User user, Organization org, Project project) {}

    private Ctx seedContext(String keycloakId) {
        User user = createUserAndMockJwt(keycloakId, "wi_user_" + keycloakId,
                keycloakId + "@t.com", Role.MANAGER);

        Organization org = organizationRepository.save(
                Organization.builder()
                        .name("WI Org")
                        .description("d")
                        .industry("IT")
                        .createdAt(LocalDateTime.now())
                        .manager(user)
                        .build()
        );

        Project project = projectRepository.save(
                Project.builder()
                        .name("WI Project")
                        .description("d")
                        .startDate(LocalDate.now())
                        .endDate(LocalDate.now().plusMonths(3))
                        .organization(org)
                        .manager(user)
                        .build()
        );

        return new Ctx(user, org, project);
    }

    private WorkItem saveWorkItem(Ctx ctx, String title, ItemType type,
                                  Status status, Severity severity) {
        return workItemRepository.save(WorkItem.builder()
                .title(title).description("desc")
                .itemType(type).status(status).severity(severity)
                .createdAt(LocalDate.now())
                .project(ctx.project()).reporter(ctx.user()).build());
    }

    @Test
    void getAllWorkItems_noFilters_returnsAll() throws Exception {
        Ctx ctx = seedContext("kc-wi-1");
        saveWorkItem(ctx, "Task A", ItemType.Task, Status.To_do, Severity.Low);
        saveWorkItem(ctx, "Bug B", ItemType.Bug, Status.In_Progress, Severity.High);

        mockMvc.perform(get("/work-items")
                        .header("Authorization", bearer("kc-wi-1")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)));
    }

    @Test
    void getAllWorkItems_filterByItemType_returnsOnlyMatching() throws Exception {
        Ctx ctx = seedContext("kc-wi-2");
        saveWorkItem(ctx, "Task A", ItemType.Task, Status.To_do, Severity.Low);
        saveWorkItem(ctx, "Bug B", ItemType.Bug, Status.To_do, Severity.Low);

        mockMvc.perform(get("/work-items")
                        .param("itemType", "Task")
                        .header("Authorization", bearer("kc-wi-2")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].title", is("Task A")));
    }

    @Test
    void getAllWorkItems_filterByStatus_returnsOnlyMatching() throws Exception {
        Ctx ctx = seedContext("kc-wi-3");
        saveWorkItem(ctx, "Task A", ItemType.Task, Status.To_do, Severity.Low);
        saveWorkItem(ctx, "Task B", ItemType.Task, Status.Done, Severity.Low);

        mockMvc.perform(get("/work-items")
                        .param("status", "Done")
                        .header("Authorization", bearer("kc-wi-3")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].title", is("Task B")));
    }

    @Test
    void getAllWorkItems_filterBySeverity_returnsOnlyMatching() throws Exception {
        Ctx ctx = seedContext("kc-wi-4");
        saveWorkItem(ctx, "Low Item", ItemType.Task, Status.To_do, Severity.Low);
        saveWorkItem(ctx, "Critical Item", ItemType.Bug, Status.To_do, Severity.Critical);

        mockMvc.perform(get("/work-items")
                        .param("severity", "Critical")
                        .header("Authorization", bearer("kc-wi-4")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].title", is("Critical Item")));
    }

    @Test
    void getCommentsByWorkItem_returnsComments() throws Exception {
        Ctx ctx = seedContext("kc-wi-14");
        WorkItem wi = saveWorkItem(ctx, "Task", ItemType.Task, Status.To_do, Severity.Low);

        commentRepository.save(Comment.builder()
                .content("A comment").createdAt(LocalDateTime.now())
                .author(ctx.user()).workItem(wi).build());

        mockMvc.perform(get("/work-items/" + wi.getId() + "/comments")
                        .header("Authorization", bearer("kc-wi-14")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].content", is("A comment")));
    }

    @Test
    void getWorkItemById_returns200_forProjectMember() throws Exception {
        Ctx ctx = seedContext("kc-wi-5");
        WorkItem wi = saveWorkItem(ctx, "My Task", ItemType.Task, Status.To_do, Severity.Low);

        mockMvc.perform(get("/work-items/" + wi.getId())
                        .header("Authorization", bearer("kc-wi-5")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title", is("My Task")));
    }

    @Test
    void getWorkItemById_returns403_forNonMember() throws Exception {
        Ctx ctx = seedContext("kc-wi-6");
        WorkItem wi = saveWorkItem(ctx, "My Task", ItemType.Task, Status.To_do, Severity.Low);

        createUserAndMockJwt("kc-wi-6b", "outsider", "out@t.com", Role.USER);

        mockMvc.perform(get("/work-items/" + wi.getId())
                        .header("Authorization", bearer("kc-wi-6b")))
                .andExpect(status().isForbidden());
    }

    @Test
    void getWorkItemById_returns404_whenMissing() throws Exception {
        Ctx ctx = seedContext("kc-wi-20");

        mockMvc.perform(get("/work-items/99999")
                        .header("Authorization", bearer("kc-wi-20")))
                .andExpect(status().isNotFound());
    }

    @Test
    void createWorkItem_persistsAndReturns201() throws Exception {
        Ctx ctx = seedContext("kc-wi-7");

        WorkItemCreateDto dto = new WorkItemCreateDto(
                "New Task", "description", ItemType.Task, Severity.Medium,
                ctx.project().getId(), null, null, null);

        mockMvc.perform(post("/work-items")
                        .header("Authorization", bearer("kc-wi-7"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title", is("New Task")))
                .andExpect(jsonPath("$.status", is("To_do")))   // default assigned by service
                .andExpect(jsonPath("$.reporter.username", is(ctx.user().getUsername())));

        assertEquals(1, workItemRepository.count());
    }

    @Test
    void createWorkItem_withAssignees_linksThemCorrectly() throws Exception {
        Ctx ctx = seedContext("kc-wi-8");
        User assignee = createUserAndMockJwt("kc-wi-8b", "assignee", "a@t.com", Role.USER);

        WorkItemCreateDto dto = new WorkItemCreateDto(
                "Assigned Task", "desc", ItemType.Task, Severity.Low,
                ctx.project().getId(), null, null, List.of(assignee.getId()));

        mockMvc.perform(post("/work-items")
                        .header("Authorization", bearer("kc-wi-8"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.assignees", hasSize(1)))
                .andExpect(jsonPath("$.assignees[0].username", is("assignee")));
    }

    @Test
    void createWorkItem_byUser_bugType_returns201() throws Exception {
        Ctx ctx = seedContext("kc-wi-16");
        User plainUser = createUserAndMockJwt("kc-wi-16b", "plain_user2", "pu2@t.com", Role.USER);

        WorkItemCreateDto dto = new WorkItemCreateDto(
                "User Bug", "desc", ItemType.Bug, Severity.High,
                ctx.project().getId(), null, null, null);

        mockMvc.perform(post("/work-items")
                        .header("Authorization", bearer("kc-wi-16b"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title", is("User Bug")))
                .andExpect(jsonPath("$.status", is("To_do")));
    }

    @Test
    void createWorkItem_byUser_nonBug_returns403() throws Exception {
        Ctx ctx = seedContext("kc-wi-15");
        User plainUser = createUserAndMockJwt("kc-wi-15b", "plain_user", "pu@t.com", Role.USER);

        WorkItemCreateDto dto = new WorkItemCreateDto(
                "User Task", "desc", ItemType.Task, Severity.Low,
                ctx.project().getId(), null, null, null);

        mockMvc.perform(post("/work-items")
                        .header("Authorization", bearer("kc-wi-15b"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isForbidden());
    }

    @Test
    void createWorkItem_returns401_withoutToken() throws Exception {
        Ctx ctx = seedContext("kc-wi-26");

        WorkItemCreateDto dto = new WorkItemCreateDto(
                "Task", "d", ItemType.Task, Severity.Low,
                ctx.project().getId(), null, null, null);

        mockMvc.perform(post("/work-items")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void updateWorkItem_byProjectManager_updatesSuccessfully() throws Exception {
        Ctx ctx = seedContext("kc-wi-9");
        WorkItem wi = saveWorkItem(ctx, "Old Title", ItemType.Task, Status.To_do, Severity.Low);

        WorkItemUpdateDto dto = new WorkItemUpdateDto(
                "New Title", "new desc", Status.In_Progress, Severity.High, null, null);

        mockMvc.perform(put("/work-items/" + wi.getId())
                        .header("Authorization", bearer("kc-wi-9"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title", is("New Title")))
                .andExpect(jsonPath("$.status", is("In_Progress")));
    }

    @Test
    void updateWorkItem_byOrgManager_returns200() throws Exception {
        User orgMgr = seedManager("kc-wi-19");
        Organization org = organizationRepository.save(Organization.builder()
                .name("Org").description("d").industry("IT")
                .createdAt(LocalDateTime.now()).manager(orgMgr).build());

        User projectMgr = createUserAndMockJwt("kc-wi-19b", "pmgr19", "p19@t.com", Role.MANAGER);
        Project project = projectRepository.save(Project.builder()
                .name("P").description("d")
                .startDate(LocalDate.now()).endDate(LocalDate.now().plusMonths(3))
                .organization(org).manager(projectMgr).build());

        Team team = teamRepository.save(Team.builder()
                .name("T").description("d").createdAt(LocalDate.now())
                .organization(org).manager(orgMgr).build());
        team.getProjects().add(project);
        teamRepository.save(team);

        WorkItem wi = workItemRepository.save(WorkItem.builder()
                .title("Task").description("d")
                .itemType(ItemType.Task).status(Status.To_do).severity(Severity.Low)
                .createdAt(LocalDate.now()).project(project).reporter(projectMgr).build());

        WorkItemUpdateDto dto = new WorkItemUpdateDto(
                "Updated", "d", Status.In_Progress, Severity.High, null, null);

        mockMvc.perform(put("/work-items/" + wi.getId())
                        .header("Authorization", bearer("kc-wi-19"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk());
    }

    @Test
    void updateWorkItem_returns404_whenMissing() throws Exception {
        Ctx ctx = seedContext("kc-wi-23");

        WorkItemUpdateDto dto = new WorkItemUpdateDto(
                "Ghost", "d", Status.In_Progress, Severity.High, null, null);

        mockMvc.perform(put("/work-items/99999")
                        .header("Authorization", bearer("kc-wi-23"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isNotFound());
    }

    @Test
    void setParent_epicToUserStory_linksCorrectly() throws Exception {
        Ctx ctx = seedContext("kc-wi-10");
        WorkItem epic = saveWorkItem(ctx, "Epic 1", ItemType.Epic, Status.To_do, Severity.Low);
        WorkItem story = saveWorkItem(ctx, "Story 1", ItemType.User_Story, Status.To_do, Severity.Low);

        mockMvc.perform(put("/work-items/" + story.getId() + "/parent/" + epic.getId())
                        .header("Authorization", bearer("kc-wi-10")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.parent.id", is(epic.getId())));

        WorkItem updated = workItemRepository.findById(story.getId()).orElseThrow();
        org.junit.jupiter.api.Assertions.assertNotNull(updated.getParent());
        assertEquals(epic.getId(), updated.getParent().getId());
    }

    @Test
    void setParent_taskAsParent_returns400() throws Exception {
        Ctx ctx = seedContext("kc-wi-11");
        WorkItem parent = saveWorkItem(ctx, "Task Parent", ItemType.Task, Status.To_do, Severity.Low);
        WorkItem child  = saveWorkItem(ctx, "Task Child",  ItemType.Task, Status.To_do, Severity.Low);

        mockMvc.perform(put("/work-items/" + child.getId() + "/parent/" + parent.getId())
                        .header("Authorization", bearer("kc-wi-11")))
                .andExpect(status().isBadRequest());
    }

    @Test
    void setParent_epicAsChild_returns400() throws Exception {
        Ctx ctx = seedContext("kc-wi-17");
        WorkItem epic1 = saveWorkItem(ctx, "Epic 1", ItemType.Epic, Status.To_do, Severity.Low);
        WorkItem epic2 = saveWorkItem(ctx, "Epic 2", ItemType.Epic, Status.To_do, Severity.Low);

        mockMvc.perform(put("/work-items/" + epic1.getId() + "/parent/" + epic2.getId())
                        .header("Authorization", bearer("kc-wi-17")))
                .andExpect(status().isBadRequest());
    }

    @Test
    void setParent_byNonMember_returns403() throws Exception {
        Ctx ctx = seedContext("kc-wi-18");
        WorkItem epic  = saveWorkItem(ctx, "Epic",  ItemType.Epic,       Status.To_do, Severity.Low);
        WorkItem story = saveWorkItem(ctx, "Story", ItemType.User_Story, Status.To_do, Severity.Low);

        createUserAndMockJwt("kc-wi-18b", "outsider", "out2@t.com", Role.MANAGER);

        mockMvc.perform(put("/work-items/" + story.getId() + "/parent/" + epic.getId())
                        .header("Authorization", bearer("kc-wi-18b")))
                .andExpect(status().isForbidden());
    }

    @Test
    void removeParent_clearsParentLink() throws Exception {
        Ctx ctx = seedContext("kc-wi-12");
        WorkItem epic  = saveWorkItem(ctx, "Epic", ItemType.Epic, Status.To_do, Severity.Low);
        WorkItem story = saveWorkItem(ctx, "Story", ItemType.User_Story, Status.To_do, Severity.Low);

        story.setParent(epic);
        workItemRepository.save(story);

        mockMvc.perform(put("/work-items/" + story.getId() + "/parent")
                        .header("Authorization", bearer("kc-wi-12")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.parent").doesNotExist());
    }

    @Test
    void removeParent_returns404_whenWorkItemMissing() throws Exception {
        Ctx ctx = seedContext("kc-wi-25");

        mockMvc.perform(put("/work-items/99999/parent")
                        .header("Authorization", bearer("kc-wi-25")))
                .andExpect(status().isNotFound());
    }

    @Test
    void setParent_returns404_whenChildMissing() throws Exception {
        Ctx ctx = seedContext("kc-wi-27");
        WorkItem epic = saveWorkItem(ctx, "Epic", ItemType.Epic, Status.To_do, Severity.Low);

        mockMvc.perform(put("/work-items/99999/parent/" + epic.getId())
                        .header("Authorization", bearer("kc-wi-27")))
                .andExpect(status().isNotFound());
    }

    @Test
    void deleteWorkItem_returns204_andRemovedFromDB() throws Exception {
        Ctx ctx = seedContext("kc-wi-13");
        WorkItem wi = saveWorkItem(ctx, "To Delete", ItemType.Task, Status.To_do, Severity.Low);

        mockMvc.perform(delete("/work-items/" + wi.getId())
                        .header("Authorization", bearer("kc-wi-13")))
                .andExpect(status().isNoContent());

        assertFalse(workItemRepository.findById(wi.getId()).isPresent());
    }

    @Test
    void deleteWorkItem_returns204_whenMissing() throws Exception {
        Ctx ctx = seedContext("kc-wi-22");

        mockMvc.perform(delete("/work-items/99999")
                        .header("Authorization", bearer("kc-wi-22")))
                .andExpect(status().isNoContent());
    }

    @Test
    void deleteWorkItem_byOrgManager_returns204() throws Exception {
        User orgMgr = seedManager("kc-wi-21");
        Organization org = organizationRepository.save(Organization.builder()
                .name("Org").description("d").industry("IT")
                .createdAt(LocalDateTime.now()).manager(orgMgr).build());

        User projectMgr = createUserAndMockJwt("kc-wi-21b", "pmgr21", "p21@t.com", Role.MANAGER);
        Project project = projectRepository.save(Project.builder()
                .name("P").description("d")
                .startDate(LocalDate.now()).endDate(LocalDate.now().plusMonths(3))
                .organization(org).manager(projectMgr).build());

        Team team = teamRepository.save(Team.builder()
                .name("T").description("d").createdAt(LocalDate.now())
                .organization(org).manager(orgMgr).build());
        team.getProjects().add(project);
        teamRepository.save(team);

        WorkItem wi = workItemRepository.save(WorkItem.builder()
                .title("Task").description("d")
                .itemType(ItemType.Task).status(Status.To_do).severity(Severity.Low)
                .createdAt(LocalDate.now()).project(project).reporter(projectMgr).build());

        mockMvc.perform(delete("/work-items/" + wi.getId())
                        .header("Authorization", bearer("kc-wi-21")))
                .andExpect(status().isNoContent());

        assertFalse(workItemRepository.findById(wi.getId()).isPresent());
    }

    @Test
    void deleteWorkItem_byPlainTeamMember_returns403() throws Exception {
        Ctx ctx = seedContext("kc-wi-24");
        WorkItem wi = saveWorkItem(ctx, "Task", ItemType.Task, Status.To_do, Severity.Low);

        User member = createUserAndMockJwt("kc-wi-24b", "member24", "m24@t.com", Role.USER);
        Team team = teamRepository.save(Team.builder()
                .name("T").description("d").createdAt(LocalDate.now())
                .organization(ctx.org()).manager(ctx.user())
                .members(new java.util.ArrayList<>(java.util.List.of(member)))
                .build());
        team.getProjects().add(ctx.project());
        teamRepository.save(team);

        mockMvc.perform(delete("/work-items/" + wi.getId())
                        .header("Authorization", bearer("kc-wi-24b")))
                .andExpect(status().isForbidden());
    }
}