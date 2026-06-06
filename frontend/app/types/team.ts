import type { UserSummaryDto } from "./user"
import type { OrganizationSummaryDto } from "./organization"
import type { ProjectSummaryDto } from "./project"

export interface TeamCreateDto {
  name: string
  description: string
  organizationId: number
  membersIds?: number[]
}

export interface TeamUpdateDto {
  name?: string
  description?: string
  managerId?: number
  membersIds?: number[]
}

export interface TeamSummaryOrganizationDto {
  id: number
  name: string
  manager: UserSummaryDto
}

export interface TeamSummaryUserDto {
  id: number
  name: string
  organization: OrganizationSummaryDto
  createdAt: string
}

export interface TeamSummaryDto {
  id: number
  name: string
  description: string
  organization: OrganizationSummaryDto
  manager: UserSummaryDto
}

export interface TeamResponseDto {
  id: number
  name: string
  description: string
  createdAt: string
  organization: OrganizationSummaryDto
  manager: UserSummaryDto
  projects: ProjectSummaryDto[]
  members: UserSummaryDto[]
}