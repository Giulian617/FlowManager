import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  route("select-org", "routes/select-org.tsx"),
  route("select-project", "routes/select-project.tsx"),
  index("routes/dashboard.tsx"),
  route("projects", "routes/projects.tsx"),
  route("teams", "routes/teams.tsx"),
  route("work-items", "routes/work-items.tsx"),
  route("work-items/new/:type", "routes/work-items-new.tsx"),
  route("kanban", "routes/kanban.tsx"),
  route("profile", "routes/profile.tsx"),
] satisfies RouteConfig;