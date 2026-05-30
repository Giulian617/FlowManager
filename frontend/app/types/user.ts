import type { Role } from "./enums"
import type { OrganizationSummaryDto } from "./organization"

export interface UserCreateDto {
  email: string
  password: string
  username: string
  firstName: string
  lastName: string
  phoneNumber: string
  role: Role
  organizationsIds: number[]
}
 
export interface UserUpdateDto {
  email?: string
  username?: string
  firstName?: string
  lastName?: string
  phoneNumber?: string
  active?: boolean
  role?: Role
  organizationsIds?: number[]
}

export interface UserSummaryDto {
  id: number
  username: string
  role: Role
}

export interface UserResponseDto {
  id: number
  username: string
  role: Role
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  active: boolean | null
  createdAt: string
  lastLogin: string | null
  memberOrganizations: OrganizationSummaryDto[] | null
}