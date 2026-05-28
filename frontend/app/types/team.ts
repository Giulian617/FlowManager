import type { UserSummaryDto } from "./user"

export interface TeamSummaryOrganizationDto {
  id: number
  name: string
  manager: UserSummaryDto
}