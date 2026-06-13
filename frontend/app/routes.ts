import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
  index("routes/login.tsx"),

  layout("routes/protected-layout.tsx", [
    route("select-org", "routes/select-org.tsx"),
    route("admin-menu", "routes/admin-menu.tsx"),
  ]),

  route("admin", "routes/admin-layout.tsx", [
    index("routes/admin-dashboard.tsx"),
    route("dashboard", "routes/admin-dashboard.tsx", { id: "admin-dashboard" }),
    route("users", "routes/admin-users.tsx"),
    route("organizations", "routes/admin-organizations.tsx"),
    route("projects", "routes/admin-projects.tsx"),
    route("teams", "routes/admin-teams.tsx"),
    route("work-items", "routes/admin-workItems.tsx"),
    route("work-items/:id", "routes/workItems-view.tsx", { id: "admin-workItems-view" }),
    route("work-items/:id/edit", "routes/workItems-edit.tsx", { id: "admin-workItems-edit" }),
    route("comments", "routes/admin-comments.tsx"),
    route("profile", "routes/profile.tsx", { id: "admin-profile" }),
  ]),

  route("org", "routes/org-layout.tsx", [
    index("routes/org-dashboard.tsx"),
    route("dashboard", "routes/org-dashboard.tsx", { id: "org-dashboard" }),
    route("projects", "routes/org-projects.tsx"),
    route("teams", "routes/org-teams.tsx"),
    route("users", "routes/org-users.tsx"),
    route("profile", "routes/profile.tsx", { id: "org-profile" }),
  ]),

  route("project", "routes/project-layout.tsx", [
    index("routes/project-dashboard.tsx"),
    route("dashboard", "routes/project-dashboard.tsx", { id: "project-dashboard" }),
    route("teams", "routes/project-teams.tsx"),
    route("work-items", "routes/workItems.tsx"),
    route("work-items/new/:type", "routes/workItems-new.tsx"),
    route("work-items/:id", "routes/workItems-view.tsx"),
    route("work-items/:id/edit", "routes/workItems-edit.tsx"),
    route("kanban", "routes/project-kanban.tsx"),
    route("profile", "routes/profile.tsx", { id: "project-profile" }),
  ]),
] satisfies RouteConfig;