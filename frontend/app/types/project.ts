import type { UserSummaryDto } from "./user"
import type { WorkItemSummaryDto } from "./workItem"
import type { TeamSummaryDto } from "./team"

export interface ProjectCreateDto {
  name: string
  description: string
  startDate: string
  endDate: string
  teamsIds?: number[]
}

export interface ProjectUpdateDto {
  name?: string
  description?: string
  startDate?: string
  endDate?: string
  managerId?: number
  teamsIds?: number[]
}

export interface ProjectSummaryDto {
  id: number
  name: string
  description: string
  itemCount: number
  memberCount: number
}

export interface ProjectResponseDto {
  id: number
  name: string
  description: string
  startDate: string
  endDate: string
  manager: UserSummaryDto
  workItems: WorkItemSummaryDto[]
  teams: TeamSummaryDto[]
}