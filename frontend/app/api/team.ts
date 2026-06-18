import apiFetch, { buildQuery, fetchAllPages } from "./utils"
import type {
  TeamCreateDto,
  TeamUpdateDto,
} from "../types/team"
import type { Page, PageParams } from "../types/page"

export async function getTeams() {
  return fetchAllPages("/teams")
}

export async function getTeamsPage(
  params: PageParams & { managerId?: number; teamSize?: string }
): Promise<Page<any>> {
  const response = await apiFetch(`/teams${buildQuery(params)}`)
  if (!response.ok) throw new Error("Failed to fetch teams")
  return response.json()
}

export async function createTeam(data: TeamCreateDto) {
  const response = await apiFetch("/teams", {
    method: "POST",
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error("Failed to create team")
  return response.json()
}

export async function updateTeam(teamId: number, data: TeamUpdateDto) {
  const response = await apiFetch(`/teams/${teamId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error(`Failed to update team ${teamId}`)
  return response.json()
}

export async function deleteTeam(teamId: number) {
  const response = await apiFetch(`/teams/${teamId}`, { method: "DELETE" })
  if (!response.ok) throw new Error(`Failed to delete team ${teamId}`)
}