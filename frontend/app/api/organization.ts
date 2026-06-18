import apiFetch, { buildQuery, fetchAllPages } from "./utils"
import type {
  OrganizationCreateDto,
  OrganizationUpdateDto,
  OrganizationResponseDto,
} from "../types/organization"
import type { ProjectResponseDto } from "../types/project"
import type { TeamSummaryOrganizationDto } from "../types/team"
import type { WorkItemSummaryDto } from "../types/workItem"
import type { UserResponseDto } from "../types/user"
import type { Role } from "../types/enums"
import type { Page, PageParams } from "../types/page"

export async function getOrganizations() {
  return fetchAllPages("/organizations")
}

export async function getOrganizationsPage(
  params: PageParams & { industry?: string; managerId?: number }
): Promise<Page<any>> {
  const response = await apiFetch(`/organizations${buildQuery(params)}`)
  if (!response.ok) throw new Error("Failed to fetch organizations")
  return response.json()
}

export async function getTeamsByOrganizationId(orgId: number) {
  return fetchAllPages(`/organizations/${orgId}/teams`)
}

export async function getTeamsByOrganizationIdPage(
  orgId: number,
  params: PageParams & { managerId?: number; teamSize?: string }
): Promise<Page<any>> {
  const response = await apiFetch(`/organizations/${orgId}/teams${buildQuery(params)}`)
  if (!response.ok) throw new Error("Failed to fetch teams")
  return response.json()
}

export async function getUsersByOrganizationId(orgId: number, role?: Role) {
  return fetchAllPages(`/organizations/${orgId}/users`, { role })
}

export async function getUsersByOrganizationIdPage(
  orgId: number,
  params: PageParams & { role?: string; active?: string }
): Promise<Page<any>> {
  const response = await apiFetch(`/organizations/${orgId}/users${buildQuery(params)}`)
  if (!response.ok) throw new Error("Failed to fetch users")
  return response.json()
}

export async function getProjectsByOrganizationId(orgId: number) {
  return fetchAllPages(`/organizations/${orgId}/projects`)
}

export async function getProjectsByOrganizationIdPage(
  orgId: number,
  params: PageParams & { managerId?: number; deadline?: string }
): Promise<Page<any>> {
  const response = await apiFetch(`/organizations/${orgId}/projects${buildQuery(params)}`)
  if (!response.ok) throw new Error("Failed to fetch projects")
  return response.json()
}

export async function getWorkItemsByOrganizationId(orgId: number) {
  const response = await apiFetch(`/organizations/${orgId}/work-items`)
  if (!response.ok) throw new Error("Failed to fetch work items")
  return response.json()
}

export async function getOrganizationById(orgId: number) {
  const response = await apiFetch(`/organizations/${orgId}`)
  if (!response.ok) throw new Error("Failed to fetch organization")
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