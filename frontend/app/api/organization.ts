import apiFetch from "./utils"
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

export async function getOrganizations(): Promise<OrganizationResponseDto[]> {
  const response = await apiFetch("/organizations")
  if (!response.ok) throw new Error("Failed to fetch organizations")
  return response.json()
}

export async function getTeamsByOrganizationId(orgId: number): Promise<TeamSummaryOrganizationDto[]> {
  const response = await apiFetch(`/organizations/${orgId}/teams`)
  if (!response.ok) throw new Error("Failed to fetch teams")
  return response.json()
}

export async function getUsersByOrganizationId(orgId: number, role?: Role): Promise<UserResponseDto[]> {
  const url = role
    ? `/organizations/${orgId}/users?role=${role}`
    : `/organizations/${orgId}/users`
  const response = await apiFetch(url)
  if (!response.ok) throw new Error("Failed to fetch users")
  return response.json()
}

export async function getProjectsByOrganizationId(orgId: number): Promise<ProjectResponseDto[]> {
  const response = await apiFetch(`/organizations/${orgId}/projects`)
  if (!response.ok) throw new Error("Failed to fetch projects")
  return response.json()
}

export async function getWorkItemsByOrganizationId(orgId: number): Promise<WorkItemSummaryDto[]> {
  const response = await apiFetch(`/organizations/${orgId}/work-items`)
  if (!response.ok) throw new Error("Failed to fetch work items")
  return response.json()
}

export async function getOrganizationById(orgId: number): Promise<OrganizationResponseDto> {
  const response = await apiFetch(`/organizations/${orgId}`)
  if (!response.ok) throw new Error("Failed to fetch organization")
  return response.json()
}

export async function createOrganization(data: OrganizationCreateDto): Promise<OrganizationResponseDto> {
  const response = await apiFetch("/organizations", {
    method: "POST",
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error("Failed to create organization")
  return response.json()
}

export async function updateOrganization(orgId: number, data: OrganizationUpdateDto): Promise<OrganizationResponseDto> {
  const response = await apiFetch(`/organizations/${orgId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error("Failed to update organization")
  return response.json()
}

export async function deleteOrganization(orgId: number): Promise<void> {
  const response = await apiFetch(`/organizations/${orgId}`, {
    method: "DELETE",
  })
  if (!response.ok) throw new Error("Failed to delete organization")
}