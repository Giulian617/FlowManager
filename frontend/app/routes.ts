import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/login.tsx"),
  route("select-org", "routes/select-org.tsx"),
  route("dashboard", "routes/dashboard.tsx"),
  route("projects", "routes/projects.tsx"),
  route("teams", "routes/teams.tsx"),
  route("work-items", "routes/work-items.tsx"),
  route("work-items/:id/edit", "routes/work-items-edit.tsx"),
  route("work-items/new/:type", "routes/work-items-new.tsx"),
  route("kanban", "routes/kanban.tsx"),
  route("profile", "routes/profile.tsx"),
  route("settings", "routes/settings.tsx"),
  route("org", "routes/org-layout.tsx", [
    index("routes/org-dashboard.tsx"),
    route("dashboard", "routes/org-dashboard.tsx", { id: "org-dashboard" }),
    route("projects", "routes/org-projects.tsx"),
    route("teams", "routes/org-teams.tsx"),
    route("users", "routes/org-users.tsx"),
    route("settings", "routes/org-settings.tsx"),
    route("profile", "routes/org-profile.tsx"),
  ]),
] satisfies RouteConfig;