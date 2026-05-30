import type { UserSummaryDto } from "./user"
import type { WorkItemSummaryDto } from "./workItem"

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
  teamCount: number
  projectCount: number
  memberCount: number
}