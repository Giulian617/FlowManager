import apiFetch from "./utils"

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

export async function getUserOrganizations(userId: number) {
  const response = await apiFetch(`/users/${userId}/organizations/member`)
  if (!response.ok) throw new Error("Failed to fetch organizations")
  return response.json()
}