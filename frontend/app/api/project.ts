import apiFetch, { buildQuery, fetchAllPages } from "./utils"
import type {
  ProjectCreateDto,
  ProjectUpdateDto,
} from "../types/project"
import type { Page, PageParams } from "../types/page"

export async function getProjects() {
  return fetchAllPages("/projects")
}

export async function getProjectsPage(
  params: PageParams & { managerId?: number; deadline?: string }
): Promise<Page<any>> {
  const response = await apiFetch(`/projects${buildQuery(params)}`)
  if (!response.ok) throw new Error("Failed to fetch projects")
  return response.json()
}

export async function getWorkItemsByProjectId(projectId: number) {
  return fetchAllPages(`/projects/${projectId}/work-items`)
}

export async function getWorkItemsByProjectIdPage(
  projectId: number,
  params: PageParams & {
    itemType?: string[]
    status?: string[]
    severity?: string[]
    reporterId?: string[]
    assigneeId?: string[]
    unassigned?: string
  }
): Promise<Page<any>> {
  const response = await apiFetch(`/projects/${projectId}/work-items${buildQuery(params)}`)
  if (!response.ok) throw new Error("Failed to fetch work items")
  return response.json()
}

export async function getTeamsByProjectId(projectId: number) {
  return fetchAllPages(`/projects/${projectId}/teams`)
}

export async function getTeamsByProjectIdPage(
  projectId: number,
  params: PageParams & { managerId?: number; teamSize?: string }
): Promise<Page<any>> {
  const response = await apiFetch(`/projects/${projectId}/teams${buildQuery(params)}`)
  if (!response.ok) throw new Error("Failed to fetch teams")
  return response.json()
}

export async function getMembersByProjectId(projectId: number) {
  const response = await apiFetch(`/projects/${projectId}/members`)
  if (!response.ok) throw new Error("Failed to fetch project members")
  return response.json()
}

export async function getProjectById(projectId: number) {
  const response = await apiFetch(`/projects/${projectId}`)
  if (!response.ok) throw new Error("Failed to fetch project")
  return response.json()
}

export async function createProject(data: ProjectCreateDto) {
  const response = await apiFetch(`/projects`, {
    method: "POST",
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error("Failed to create project")
  return response.json()
}

export async function updateProject(projectId: number, data: ProjectUpdateDto) {
  const response = await apiFetch(`/projects/${projectId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error("Failed to update project")
  return response.json()
}

export async function deleteProject(projectId: number) {
  const response = await apiFetch(`/projects/${projectId}`, {
    method: "DELETE",
  })
  if (!response.ok) throw new Error("Failed to delete project")
}