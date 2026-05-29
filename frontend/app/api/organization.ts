import apiFetch from "./utils"
import type {
  OrganizationCreateDto,
  OrganizationUpdateDto
} from "../types/organization"

export async function getOrganizations() {
  const response = await apiFetch("/organizations")
  if (!response.ok) throw new Error("Failed to fetch organizations")
  return response.json()
}

export async function getOrganizationById(orgId: number) {
  const response = await apiFetch(`/organizations/${orgId}`)
  if (!response.ok) throw new Error("Failed to fetch organization")
  return response.json()
}

export async function getProjectsByOrganizationId(orgId: number) {
  const response = await apiFetch(`/organizations/${orgId}/projects`)
  if (!response.ok) throw new Error("Failed to fetch projects")
  return response.json()
}

export async function getTeamsByOrganizationId(orgId: number) {
  const response = await apiFetch(`/organizations/${orgId}/teams`)
  if (!response.ok) throw new Error("Failed to fetch teams")
  return response.json()
}

export async function getUsersByOrganizationId(orgId: number) {
  const response = await apiFetch(`/organizations/${orgId}/users`)
  if (!response.ok) throw new Error("Failed to fetch users")
  return response.json()
}

export async function getWorkItemsByOrganizationId(orgId: number) {
  const response = await apiFetch(`/organizations/${orgId}/work-items`)
  if (!response.ok) throw new Error("Failed to fetch work items")
  return response.json()
}

export async function createOrganization(data: OrganizationCreateDto) {
  const response = await apiFetch("/organizations", {
    method: "POST",
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error("Failed to create organization")
  return response.json()
}

export async function updateOrganization(orgId: number, data: OrganizationUpdateDto) {
  const response = await apiFetch(`/organizations/${orgId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error("Failed to update organization")
  return response.json()
}

export async function deleteOrganization(orgId: number) {
  const response = await apiFetch(`/organizations/${orgId}`, {
    method: "DELETE",
  })
  if (!response.ok) throw new Error("Failed to delete organization")
}