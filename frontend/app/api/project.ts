import apiFetch from "./utils"
import type {
  ProjectCreateDto,
  ProjectUpdateDto,
  ProjectResponseDto,
  ProjectSummaryDto,
} from "../types/project"
import type { TeamSummaryOrganizationDto } from "../types/team"
import type { WorkItemResponseDto } from "../types/workItem"
import type { UserSummaryDto } from "../types/user"

export async function getProjects(): Promise<ProjectResponseDto[]> {
  const response = await apiFetch("/projects")
  if (!response.ok) throw new Error("Failed to fetch projects")
  return response.json()
}

export async function getWorkItemsByProjectId(projectId: number): Promise<WorkItemResponseDto[]> {
  const response = await apiFetch(`/projects/${projectId}/work-items`)
  if (!response.ok) throw new Error("Failed to fetch work items")
  return response.json()
}

export async function getTeamsByProjectId(projectId: number): Promise<TeamSummaryOrganizationDto[]> {
  const response = await apiFetch(`/projects/${projectId}/teams`)
  if (!response.ok) throw new Error("Failed to fetch teams")
  return response.json()
}

export async function getMembersByProjectId(projectId: number): Promise<UserSummaryDto[]> {
  const response = await apiFetch(`/projects/${projectId}/members`)
  if (!response.ok) throw new Error("Failed to fetch project members")
  return response.json()
}

export async function getProjectById(projectId: number): Promise<ProjectSummaryDto> {
  const response = await apiFetch(`/projects/${projectId}`)
  if (!response.ok) throw new Error("Failed to fetch project")
  return response.json()
}

export async function createProject(data: ProjectCreateDto): Promise<ProjectResponseDto> {
  const response = await apiFetch(`/projects`, {
    method: "POST",
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error("Failed to create project")
  return response.json()
}

export async function updateProject(projectId: number, data: ProjectUpdateDto): Promise<ProjectResponseDto> {
  const response = await apiFetch(`/projects/${projectId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error("Failed to update project")
  return response.json()
}

export async function deleteProject(projectId: number): Promise<void> {
  const response = await apiFetch(`/projects/${projectId}`, {
    method: "DELETE",
  })
  if (!response.ok) throw new Error("Failed to delete project")
}