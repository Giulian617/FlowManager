import apiFetch from "./utils"
import type {
  UserCreateDto,
  UserUpdateDto,
  UserResponseDto,
} from "../types/user"
import type { ProjectResponseDto } from "../types/project"
import type { OrganizationSummaryDto } from "../types/organization"
import type { TeamResponseDto } from "../types/team"
import type { WorkItemSummaryDto } from "../types/workItem"
import type { Role } from "../types/enums"

export async function getUsers(role?: Role): Promise<UserResponseDto[]> {
  const url = role ? `/users?role=${role}` : "/users"
  const response = await apiFetch(url)
  if (!response.ok) throw new Error("Failed to fetch users")
  return response.json()
}

export async function getCurrentUser(): Promise<UserResponseDto> {
  const response = await apiFetch("/users/me")
  if (!response.ok) throw new Error("Failed to fetch user")
  return response.json()
}

export async function getManagedProjectsByUserId(userId: number): Promise<ProjectResponseDto[]> {
  const response = await apiFetch(`/users/${userId}/projects/manager`)
  if (!response.ok) throw new Error("Failed to fetch projects")
  return response.json()
}

export async function getAssignedProjectsByUserId(userId: number): Promise<ProjectResponseDto[]> {
  const response = await apiFetch(`/users/${userId}/projects/assignee`)
  if (!response.ok) throw new Error("Failed to fetch projects")
  return response.json()
}

export async function getManagedOrganizationsByUserId(userId: number): Promise<OrganizationSummaryDto[]> {
  const response = await apiFetch(`/users/${userId}/organizations/manager`)
  if (!response.ok) throw new Error("Failed to fetch organizations")
  return response.json()
}

export async function getMemberOrganizationsByUserId(userId: number): Promise<OrganizationSummaryDto[]> {
  const response = await apiFetch(`/users/${userId}/organizations/member`)
  if (!response.ok) throw new Error("Failed to fetch organizations")
  return response.json()
}

export async function getManagedTeamsByUserId(userId: number): Promise<TeamResponseDto[]> {
  const response = await apiFetch(`/users/${userId}/teams/manager`)
  if (!response.ok) throw new Error("Failed to fetch teams")
  return response.json()
}

export async function getAssignedTeamsByUserId(userId: number): Promise<TeamResponseDto[]> {
  const response = await apiFetch(`/users/${userId}/teams/assignee`)
  if (!response.ok) throw new Error("Failed to fetch teams")
  return response.json()
}

export async function getReportedWorkItemsByUserId(userId: number): Promise<WorkItemSummaryDto[]> {
  const response = await apiFetch(`/users/${userId}/work-items/reporter`)
  if (!response.ok) throw new Error("Failed to fetch reported work items")
  return response.json()
}

export async function getAssignedWorkItemsByUserId(userId: number): Promise<WorkItemSummaryDto[]> {
  const response = await apiFetch(`/users/${userId}/work-items/assignee`)
  if (!response.ok) throw new Error("Failed to fetch assigned work items")
  return response.json()
}

export async function createUser(data: UserCreateDto): Promise<UserResponseDto> {
  const response = await apiFetch("/users", {
    method: "POST",
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error("Failed to create user")
  return response.json()
}

export async function updateUser(userId: number, data: UserUpdateDto): Promise<UserResponseDto> {
  const response = await apiFetch(`/users/${userId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error("Failed to update user")
  return response.json()
}

export async function deleteUser(userId: number): Promise<void> {
  const response = await apiFetch(`/users/${userId}`, {
    method: "DELETE"
  })
  if (!response.ok) throw new Error("Failed to delete user")
}