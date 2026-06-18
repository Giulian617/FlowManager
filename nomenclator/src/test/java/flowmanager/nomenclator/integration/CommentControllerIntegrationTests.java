package flowmanager.nomenclator.integration;

import flowmanager.nomenclator.dto.CommentCreateDto;
import flowmanager.nomenclator.dto.CommentUpdateDto;
import flowmanager.nomenclator.model.*;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import java.time.LocalDate;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;


class CommentControllerIntegrationTests extends BaseIntegrationTests {

    private SeedData seed(String keycloakId) {
        User user = createUserAndMockJwt(keycloakId, "commenter_" + keycloakId,
                keycloakId + "@test.com", Role.USER);

        Organization org = organizationRepository.save(
                Organization.builder()
                        .name("Org")
                        .description("d")
                        .industry("IT")
                        .createdAt(java.time.LocalDateTime.now())
                        .manager(user)
                        .build());

        Project project = projectRepository.save(
                Project.builder()
                        .name("Project")
                        .description("d")
                        .startDate(LocalDate.now())
                        .endDate(LocalDate.now().plusMonths(6))
                        .organization(org)
                        .manager(user)
                        .build());

        WorkItem workItem = workItemRepository.save(
                WorkItem.builder()
                        .title("Task 1")
                        .description("desc")
                        .itemType(ItemType.Task)
                        .status(Status.To_do)
                        .severity(Severity.Low)
                        .createdAt(LocalDate.now())
                        .project(project)
                        .reporter(user)
                        .build());

        return new SeedData(user, workItem);
    }

    record SeedData(User user, WorkItem workItem) {}

    @Test
    void getAllComments_returnsEmptyList_whenNoComments() throws Exception {
        createUserAndMockJwt("kc-1", "user1", "u1@t.com", Role.USER);

        mockMvc.perform(get("/comments")
                        .header("Authorization", bearer("kc-1")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(0)));
    }

    @Test
    void getAllComments_returnsSavedComments() throws Exception {
        SeedData data = seed("kc-2");

        commentRepository.save(Comment.builder()
                .content("Hello world")
                .createdAt(java.time.LocalDateTime.now())
                .author(data.user())
                .workItem(data.workItem())
                .build());

        mockMvc.perform(get("/comments")
                        .header("Authorization", bearer("kc-2")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].content", is("Hello world")));
    }

    @Test
    void createComment_persistsAndReturns201() throws Exception {
        SeedData data = seed("kc-3");
        CommentCreateDto dto = new CommentCreateDto("My comment", data.workItem().getId());

        mockMvc.perform(post("/comments")
                        .header("Authorization", bearer("kc-3"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.content", is("My comment")))
                .andExpect(jsonPath("$.author.username", is(data.user().getUsername())));

        assertEquals(1, commentRepository.count());
    }

    @Test
    void createComment_returns401_whenNoToken() throws Exception {
        SeedData data = seed("kc-4");
        CommentCreateDto dto = new CommentCreateDto("x", data.workItem().getId());

        mockMvc.perform(post("/comments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void createComment_returns404_whenWorkItemMissing() throws Exception {
        createUserAndMockJwt("kc-5", "user5", "u5@t.com", Role.USER);

        CommentCreateDto dto = new CommentCreateDto("text", 99999);

        mockMvc.perform(post("/comments")
                        .header("Authorization", bearer("kc-5"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isNotFound());
    }

    @Test
    void updateComment_byAuthor_returnsUpdatedContent() throws Exception {
        SeedData data = seed("kc-6");

        Comment saved = commentRepository.save(Comment.builder()
                .content("Original")
                .createdAt(java.time.LocalDateTime.now())
                .author(data.user())
                .workItem(data.workItem())
                .build());

        CommentUpdateDto updateDto = new CommentUpdateDto("Updated content");

        mockMvc.perform(put("/comments/" + saved.getId())
                        .header("Authorization", bearer("kc-6"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", is("Updated content")));
    }

    @Test
    void updateComment_byOtherUser_returns403() throws Exception {
        SeedData data = seed("kc-7");
        createUserAndMockJwt("kc-7b", "other_user", "other@t.com", Role.USER);

        Comment saved = commentRepository.save(Comment.builder()
                .content("Original")
                .createdAt(java.time.LocalDateTime.now())
                .author(data.user())
                .workItem(data.workItem())
                .build());

        CommentUpdateDto updateDto = new CommentUpdateDto("Hacked");

        mockMvc.perform(put("/comments/" + saved.getId())
                        .header("Authorization", bearer("kc-7b"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateDto)))
                .andExpect(status().isForbidden());
    }

    @Test
    void updateComment_returns404_whenCommentMissing() throws Exception {
        createUserAndMockJwt("kc-11", "user11", "u11@t.com", Role.USER);

        CommentUpdateDto dto = new CommentUpdateDto("Ghost update");

        mockMvc.perform(put("/comments/99999")
                        .header("Authorization", bearer("kc-11"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isNotFound());
    }

    @Test
    void deleteComment_byAuthor_returns204_andRemovedFromDB() throws Exception {
        SeedData data = seed("kc-8");

        Comment saved = commentRepository.save(Comment.builder()
                .content("To be deleted")
                .createdAt(java.time.LocalDateTime.now())
                .author(data.user())
                .workItem(data.workItem())
                .build());

        mockMvc.perform(delete("/comments/" + saved.getId())
                        .header("Authorization", bearer("kc-8")))
                .andExpect(status().isNoContent());

        assertFalse(commentRepository.findById(saved.getId()).isPresent());
    }

    @Test
    void deleteComment_byOtherUser_returns403() throws Exception {
        SeedData data = seed("kc-9");
        createUserAndMockJwt("kc-9b", "intruder", "intruder@t.com", Role.USER);

        Comment saved = commentRepository.save(Comment.builder()
                .content("Private")
                .createdAt(java.time.LocalDateTime.now())
                .author(data.user())
                .workItem(data.workItem())
                .build());

        mockMvc.perform(delete("/comments/" + saved.getId())
                        .header("Authorization", bearer("kc-9b")))
                .andExpect(status().isForbidden());

        assertTrue(commentRepository.findById(saved.getId()).isPresent());
    }

    @Test
    void deleteComment_byWorkItemReporter_succeeds() throws Exception {
        User author   = createUserAndMockJwt("kc-10a", "author10",   "a10@t.com",  Role.USER);
        User reporter = createUserAndMockJwt("kc-10b", "reporter10", "r10@t.com",  Role.USER);

        Organization org = organizationRepository.save(
                Organization.builder()
                        .name("Org").description("d").industry("IT")
                        .createdAt(java.time.LocalDateTime.now()).manager(reporter).build());

        Project project = projectRepository.save(
                Project.builder()
                        .name("Project").description("d")
                        .startDate(java.time.LocalDate.now())
                        .endDate(java.time.LocalDate.now().plusMonths(3))
                        .organization(org).manager(reporter).build());

        WorkItem workItem = workItemRepository.save(
                WorkItem.builder()
                        .title("Task").description("d")
                        .itemType(ItemType.Task).status(Status.To_do).severity(Severity.Low)
                        .createdAt(java.time.LocalDate.now())
                        .project(project).reporter(reporter).build());

        Comment comment = commentRepository.save(
                Comment.builder()
                        .content("Author's comment")
                        .createdAt(java.time.LocalDateTime.now())
                        .author(author)
                        .workItem(workItem)
                        .build());

        mockMvc.perform(delete("/comments/" + comment.getId())
                        .header("Authorization", bearer("kc-10b")))
                .andExpect(status().isNoContent());

        assertFalse(commentRepository.findById(comment.getId()).isPresent());
    }

    @Test
    void deleteComment_returns404_whenMissing() throws Exception {
        createUserAndMockJwt("kc-12", "user12", "u12@t.com", Role.USER);

        mockMvc.perform(delete("/comments/99999")
                        .header("Authorization", bearer("kc-12")))
                .andExpect(status().isNotFound());
    }

    @Test
    void deleteComment_returns404_notForbidden_whenMissing() throws Exception {
        createUserAndMockJwt("kc-13", "user13", "u13@t.com", Role.USER);

        mockMvc.perform(delete("/comments/99999")
                        .header("Authorization", bearer("kc-13")))
                .andExpect(status().isNotFound());
    }
}