package flowmanager.nomenclator.integration;

import flowmanager.nomenclator.dto.UserCreateDto;
import flowmanager.nomenclator.dto.UserUpdateDto;
import flowmanager.nomenclator.model.*;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;


class UserControllerIntegrationTests extends BaseIntegrationTests {
    private User seedAdmin(String kc) {
        return createUserAndMockJwt(kc, "admin_" + kc, kc + "@t.com", Role.ADMIN);
    }

    private User seedUser(String kc) {
        return createUserAndMockJwt(kc, "user_" + kc, kc + "@t.com", Role.USER);
    }

    @Test
    void getAllUsers_noFilter_returnsAllUsers() throws Exception {
        seedUser("kc-u1");
        seedUser("kc-u1b");

        mockMvc.perform(get("/users")
                        .header("Authorization", bearer("kc-u1")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(2)))
                .andExpect(jsonPath("$.totalElements", is(2)));
    }

    @Test
    void getAllUsers_filterByRole_returnsOnlyMatching() throws Exception {
        seedUser("kc-u2");
        seedAdmin("kc-u2b");

        mockMvc.perform(get("/users")
                        .param("role", "ADMIN")
                        .header("Authorization", bearer("kc-u2")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].username", is("admin_kc-u2b")));
    }

    @Test
    void getCurrentUser_returnsSelf() throws Exception {
        User user = seedUser("kc-u3");

        mockMvc.perform(get("/users/me")
                        .header("Authorization", bearer("kc-u3")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username", is(user.getUsername())));
    }

    @Test
    void getManagedProjectsByUser_returns200_forOrgManagerOfUsersTeam() throws Exception {
        User orgMgr = createUserAndMockJwt("kc-u15", "orgmgr15", "om15@t.com", Role.MANAGER);
        User teamMember = createUserAndMockJwt("kc-u15b", "member15", "m15@t.com", Role.USER);

        Organization org = organizationRepository.save(Organization.builder()
                .name("Org").description("d").industry("IT")
                .createdAt(LocalDateTime.now()).manager(orgMgr).build());

        teamRepository.save(Team.builder()
                .name("Team").description("d").createdAt(LocalDate.now())
                .organization(org).manager(orgMgr)
                .members(new java.util.ArrayList<>(java.util.List.of(teamMember)))
                .build());

        mockMvc.perform(get("/users/" + teamMember.getId() + "/projects/manager")
                        .header("Authorization", bearer("kc-u15")))
                .andExpect(status().isOk());
    }

    @Test
    void getManagedProjectsByUser_returns403_forUnrelatedUser() throws Exception {
        User target = seedUser("kc-u16");
        seedUser("kc-u16b");

        mockMvc.perform(get("/users/" + target.getId() + "/projects/manager")
                        .header("Authorization", bearer("kc-u16b")))
                .andExpect(status().isForbidden());
    }

    @Test
    void getManagedProjectsByUser_returns404_whenUserMissing() throws Exception {
        seedUser("kc-u17");

        mockMvc.perform(get("/users/99999/projects/manager")
                        .header("Authorization", bearer("kc-u17")))
                .andExpect(status().isNotFound());
    }

    @Test
    void getManagedProjectsByUser_returnsManagedProjects() throws Exception {
        User mgr = createUserAndMockJwt("kc-u11", "mgr11", "mgr11@t.com", Role.MANAGER);
        Organization org = organizationRepository.save(
                Organization.builder().name("O").description("d").industry("IT")
                        .createdAt(LocalDateTime.now()).manager(mgr).build());
        projectRepository.save(Project.builder()
                .name("My Project").description("d")
                .startDate(LocalDate.now()).endDate(LocalDate.now().plusMonths(3))
                .organization(org).manager(mgr).build());

        mockMvc.perform(get("/users/" + mgr.getId() + "/projects/manager")
                        .header("Authorization", bearer("kc-u11")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name", is("My Project")));
    }

    @Test
    void getReportedWorkItemsByUser_returnsWorkItems() throws Exception {
        User reporter = createUserAndMockJwt("kc-u12", "rep12", "rep12@t.com", Role.USER);
        Organization org = organizationRepository.save(
                Organization.builder().name("O").description("d").industry("IT")
                        .createdAt(LocalDateTime.now()).manager(reporter).build());
        Project project = projectRepository.save(Project.builder()
                .name("P").description("d")
                .startDate(LocalDate.now()).endDate(LocalDate.now().plusMonths(1))
                .organization(org).manager(reporter).build());
        workItemRepository.save(WorkItem.builder()
                .title("Reported Task").description("d")
                .itemType(ItemType.Task).status(Status.To_do).severity(Severity.Low)
                .createdAt(LocalDate.now()).project(project).reporter(reporter).build());

        mockMvc.perform(get("/users/" + reporter.getId() + "/work-items/reporter")
                        .header("Authorization", bearer("kc-u12")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].title", is("Reported Task")));
    }

    @Test
    void createUser_persistsAndReturns201() throws Exception {
        String newKcId = "new-kc-uuid";

        when(keycloakAdminService.createUser(any())).thenReturn(newKcId);
        doNothing().when(keycloakAdminService).assignRole(eq(newKcId), any());
        when(jwtDecoder.decode(newKcId)).thenReturn(buildJwt(newKcId, Role.USER));

        seedAdmin("kc-u4-admin");

        UserCreateDto dto = new UserCreateDto(
                "newuser@example.com",
                "password123",
                "newuser",
                "First",
                "Last",
                "+40700111222",
                Role.USER,
                null
        );

        mockMvc.perform(post("/users")
                        .header("Authorization", bearer("kc-u4-admin"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.username", is("newuser")))
                .andExpect(jsonPath("$.email", is("newuser@example.com")));

        assertEquals(2, userRepository.count());
    }

    @Test
    void createUser_duplicateEmail_returns409() throws Exception {
        seedUser("kc-u5");
        seedAdmin("kc-u5-admin");

        UserCreateDto dto = new UserCreateDto(
                "kc-u5@t.com",
                "pass",
                "differentUsername",
                "F",
                "L",
                "+40700000001",
                Role.USER,
                null
        );

        mockMvc.perform(post("/users")
                        .header("Authorization", bearer("kc-u5-admin"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isConflict());

        assertEquals(2, userRepository.count());
    }

    @Test
    void createUser_duplicateUsername_returns409() throws Exception {
        seedUser("kc-u6");
        seedAdmin("kc-u6-admin");

        UserCreateDto dto = new UserCreateDto(
                "unique@example.com",
                "pass",
                "user_kc-u6",
                "F",
                "L",
                "+40700000002",
                Role.USER,
                null
        );

        mockMvc.perform(post("/users")
                        .header("Authorization", bearer("kc-u6-admin"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isConflict());

        assertEquals(2, userRepository.count());
    }

    @Test
    void updateUser_bySelf_updatesFirstName() throws Exception {
        User user = seedUser("kc-u7");

        UserUpdateDto dto = new UserUpdateDto(
                null,
                null,
                "UpdatedFirst",
                "L",
                user.getPhoneNumber(),
                null,
                null,
                null
        );

        mockMvc.perform(put("/users/" + user.getId())
                        .header("Authorization", bearer("kc-u7"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName", is("UpdatedFirst")));
    }

    @Test
    void updateUser_byOtherNonAdmin_returns403() throws Exception {
        User target = seedUser("kc-u8");
        seedUser("kc-u8b");

        UserUpdateDto dto = new UserUpdateDto(
                null,
                null,
                "Hacked",
                "X",
                target.getPhoneNumber(),
                null,
                null,
                null
        );

        mockMvc.perform(put("/users/" + target.getId())
                        .header("Authorization", bearer("kc-u8b"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isForbidden());
    }

    @Test
    void updateUser_roleChange_callsKeycloakAndPersists() throws Exception {
        User user = seedUser("kc-u9");
        seedAdmin("kc-u9-admin");
        doNothing().when(keycloakAdminService).updateUserRole(eq(user.getKeycloakId()), any());

        UserUpdateDto dto = new UserUpdateDto(
                null,
                null,
                user.getFirstName(),
                user.getLastName(),
                user.getPhoneNumber(),
                null,
                Role.MANAGER,
                null
        );

        mockMvc.perform(put("/users/" + user.getId())
                        .header("Authorization", bearer("kc-u9-admin"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk());

        verify(keycloakAdminService, times(1)).updateUserRole(user.getKeycloakId(), Role.MANAGER);

        User updated = userRepository.findById(user.getId()).orElseThrow();
        assertEquals(Role.MANAGER, updated.getRole());
    }

    @Test
    void updateUser_roleChange_byNonAdmin_returns403() throws Exception {
        User user = seedUser("kc-u13");

        UserUpdateDto dto = new UserUpdateDto(
                null,
                null,
                user.getFirstName(),
                user.getLastName(),
                user.getPhoneNumber(),
                null,
                Role.MANAGER,
                null
        );

        mockMvc.perform(put("/users/" + user.getId())
                        .header("Authorization", bearer("kc-u13"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isForbidden());
    }

    @Test
    void updateUser_byOtherNonAdmin_withNoRoleChange_returns403() throws Exception {
        User target = seedUser("kc-u14");
        User other  = seedUser("kc-u14b");

        UserUpdateDto dto = new UserUpdateDto(
                null,
                null,
                "StolenName",
                target.getLastName(),
                target.getPhoneNumber(),
                null,
                null,
                null
        );

        mockMvc.perform(put("/users/" + target.getId())
                        .header("Authorization", bearer("kc-u14b"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isForbidden());
    }

    @Test
    void deleteUser_removesFromDB() throws Exception {
        User user = seedUser("kc-u10");
        doNothing().when(keycloakAdminService).deleteUser(user.getKeycloakId());

        mockMvc.perform(delete("/users/" + user.getId())
                        .header("Authorization", bearer("kc-u10")))
                .andExpect(status().isNoContent());

        assertFalse(userRepository.findById(user.getId()).isPresent());
        verify(keycloakAdminService, times(1)).deleteUser(user.getKeycloakId());
    }

    @Test
    void deleteUser_returns204_whenMissing() throws Exception {
        seedUser("kc-u18");

        mockMvc.perform(delete("/users/99999")
                        .header("Authorization", bearer("kc-u18")))
                .andExpect(status().isNoContent());

        verify(keycloakAdminService, never()).deleteUser(any());
    }
}