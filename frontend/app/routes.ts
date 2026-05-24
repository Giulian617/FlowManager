import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("select-org", "routes/select-org.tsx"),
  route("select-project", "routes/select-project.tsx"),
  route("dashboard", "routes/dashboard.tsx"),
  route("projects", "routes/projects.tsx"),
  route("teams", "routes/teams.tsx"),
  route("work-items", "routes/work-items.tsx"),
  route("work-items/new/:type", "routes/work-items-new.tsx"),
  route("kanban", "routes/kanban.tsx"),
  route("profile", "routes/profile.tsx"),
  route("org", "routes/org.tsx", [
    index("routes/org-dashboard.tsx"),
    route("projects", "routes/org-projects.tsx"),
    route("teams", "routes/org-teams.tsx"),
  ]),
] satisfies RouteConfig;