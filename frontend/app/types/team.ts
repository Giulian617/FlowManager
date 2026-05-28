import type { OrganizationSummaryDto } from "./organization"
import type { UserSummaryDto } from "./user"

export interface TeamSummaryOrganizationDto {
  id: number
  name: string
  manager: UserSummaryDto
}

export interface TeamSummaryDto {
  id: number
  name: string
  description: string
  organization: OrganizationSummaryDto
  manager: UserSummaryDto
}