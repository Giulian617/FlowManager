import apiFetch from "./utils"
import type {
  TeamCreateDto,
  TeamUpdateDto,
  TeamResponseDto,
} from "../types/team"

export async function getTeams(): Promise<TeamResponseDto[]> {
  const response = await apiFetch("/teams")
  if (!response.ok) throw new Error("Failed to fetch teams")
  return response.json()
}

export async function createTeam(data: TeamCreateDto): Promise<TeamResponseDto> {
  const response = await apiFetch("/teams", {
    method: "POST",
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error("Failed to create team")
  return response.json()
}

export async function updateTeam(teamId: number, data: TeamUpdateDto): Promise<TeamResponseDto> {
  const response = await apiFetch(`/teams/${teamId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error(`Failed to update team ${teamId}`)
  return response.json()
}

export async function deleteTeam(teamId: number): Promise<void> {
  const response = await apiFetch(`/teams/${teamId}`, { method: "DELETE" })
  if (!response.ok) throw new Error(`Failed to delete team ${teamId}`)
}