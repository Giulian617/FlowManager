import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/dashboard.tsx"),
  route("projects", "routes/projects.tsx"),
  route("teams", "routes/teams.tsx"),
  route("work-items", "routes/work-items.tsx"),
  route("kanban", "routes/kanban.tsx"),
  route("profile", "routes/profile.tsx"),
] satisfies RouteConfig;
