import apiFetch from "./utils"
import type {
  ProjectCreateDto,
  ProjectUpdateDto
} from "../types/project"

export async function createProject(orgId: number, data: ProjectCreateDto) {
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