import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
  index("routes/login.tsx"),
  route("select-org", "routes/select-org.tsx"),

  route("project", "routes/project-layout.tsx", [
    index("routes/project-dashboard.tsx"),
    route("dashboard", "routes/project-dashboard.tsx", { id: "project-dashboard" }),
    route("teams", "routes/project-teams.tsx"),
    route("work-items", "routes/work-items.tsx"),
    route("work-items/:id/edit", "routes/work-items-edit.tsx"),
    route("work-items/new/:type", "routes/work-items-new.tsx"),
    route("kanban", "routes/project-kanban.tsx"),
  ]),

  layout("routes/project-layout.tsx", { id: "project-layout-shell" }, [
    route("notification-settings", "routes/notification-settings.tsx"),
    route("profile", "routes/profile.tsx"),
  ]),

  route("org", "routes/org-layout.tsx", [
    index("routes/org-dashboard.tsx"),
    route("dashboard", "routes/org-dashboard.tsx", { id: "org-dashboard" }),
    route("projects", "routes/org-projects.tsx"),
    route("teams", "routes/org-teams.tsx"),
    route("users", "routes/org-users.tsx"),
  ]),
] satisfies RouteConfig;