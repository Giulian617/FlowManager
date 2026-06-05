import apiFetch from "./utils"
import type {
  UserCreateDto,
  UserUpdateDto
} from "../types/user";

export async function getUsers() {
  const response = await apiFetch("/users")
  if (!response.ok) throw new Error("Failed to fetch users")
  return response.json()
}

export async function getCurrentUser() {
  const response = await apiFetch("/users/me")
  if (!response.ok) throw new Error("Failed to fetch user")
  return response.json()
}

export async function getManagers() {
  const response = await apiFetch("/users?role=MANAGER")
  if (!response.ok) throw new Error("Failed to fetch managers")
  return response.json()
}

export async function getManagedProjectsByUserId(userId: number) {
  const response = await apiFetch(`/users/${userId}/projects/manager`)
  if (!response.ok) throw new Error("Failed to fetch projects")
  return response.json()
}

export async function getAssignedProjectsByUserId(userId: number) {
  const response = await apiFetch(`/users/${userId}/projects/assignee`)
  if (!response.ok) throw new Error("Failed to fetch projects")
  return response.json()
}

export async function getManagedTeamsByUserId(userId: number) {
  const response = await apiFetch(`/users/${userId}/teams/manager`)
  if (!response.ok) throw new Error("Failed to fetch teams")
  return response.json()
}

export async function getAssignedTeamsByUserId(userId: number) {
  const response = await apiFetch(`/users/${userId}/teams/assignee`)
  if (!response.ok) throw new Error("Failed to fetch teams")
  return response.json()
}

export async function getReportedWorkItemsByUserId(userId: number) {
  const response = await apiFetch(`/users/${userId}/work-items/reporter`)
  if (!response.ok) throw new Error("Failed to fetch reported work items")
  return response.json()
}

export async function getAssignedWorkItemsByUserId(userId: number) {
  const response = await apiFetch(`/users/${userId}/work-items/assignee`)
  if (!response.ok) throw new Error("Failed to fetch assigned work items")
  return response.json()
}

export async function getUserOrganizations(userId: number) {
  const response = await apiFetch(`/users/${userId}/organizations/member`)
  if (!response.ok) throw new Error("Failed to fetch organizations")
  return response.json()
}

export async function createUser(data: UserCreateDto) {
  const response = await apiFetch("/users", {
    method: "POST",
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error("Failed to create user")
  return response.json()
}
 
export async function updateUser(userId: number, data: UserUpdateDto) {
  const response = await apiFetch(`/users/${userId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error("Failed to update user")
  return response.json()
}
 
export async function deleteUser(userId: number) {
  const response = await apiFetch(`/users/${userId}`, {
    method: "DELETE"
  })
  if (!response.ok) throw new Error("Failed to delete user")
}