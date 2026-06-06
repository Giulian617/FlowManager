import type { UserSummaryDto } from "./user"
import type { WorkItemSummaryDto } from "./workItem"
import type { TeamSummaryDto } from "./team"
import type { OrganizationSummaryDto } from "./organization"

export interface ProjectCreateDto {
  name: string
  description: string
  startDate: string
  endDate: string
  organizationId: number
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
  endDate: string
  itemCount: number
  teamCount: number
  memberCount: number
  organization: OrganizationSummaryDto
}

export interface ProjectResponseDto {
  id: number
  name: string
  description: string
  startDate: string
  endDate: string
  organization: OrganizationSummaryDto
  manager: UserSummaryDto
  workItems: WorkItemSummaryDto[]
  teams: TeamSummaryDto[]
}