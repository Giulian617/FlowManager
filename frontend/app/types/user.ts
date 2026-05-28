import type { Role } from "./enums"

export interface UserSummaryDto {
  id: number
  username: string
  role: Role
}