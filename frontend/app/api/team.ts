import apiFetch from "./utils"
import type {
  TeamCreateDto,
  TeamUpdateDto,
  TeamResponseDto,
} from "../types/team"
import type { UserSummaryDto } from "../types/user"

export async function getTeamById(teamId: number): Promise<TeamResponseDto> {
  const response = await apiFetch(`/teams/${teamId}`)
  if (!response.ok) throw new Error(`Failed to fetch team ${teamId}`)
  return response.json()
}

export async function getMembersByTeamId(teamId: number): Promise<UserSummaryDto[]> {
  const response = await apiFetch(`/teams/${teamId}/members`)
  if (!response.ok) throw new Error(`Failed to fetch members for team ${teamId}`)
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