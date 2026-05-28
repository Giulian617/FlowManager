import type { UserSummaryDto } from "./user"
import type { TeamSummaryOrganizationDto } from "./team"

export interface OrganizationCreateDto {
  name: string
  description: string
  industry: string
  managerId: number
}

export interface OrganizationUpdateDto {
  name: string
  description: string
  industry: string
  managerId: number | null
}

export interface OrganizationSummaryDto {
  id: number
  name: string
  description: string
}

export interface OrganizationResponseDto {
  id: number
  name: string
  description: string
  industry: string
  createdAt: string
  manager: UserSummaryDto
  teams: TeamSummaryOrganizationDto[]
}