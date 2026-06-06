import type { ItemType, Severity, Status } from "./enums"
import type { UserSummaryDto } from "./user"
import type { ProjectSummaryDto } from "./project"
import type { CommentResponseWorkItemDto } from "./comment"

export interface WorkItemCreateDto {
  title: string
  description: string
  itemType: ItemType
  severity: Severity
  projectId: number
  parentId?: number
  dueDate?: string
  assigneesIds?: number[]
}

export interface WorkItemUpdateDto {
  title?: string
  description?: string
  status?: Status
  severity?: Severity
  dueDate?: string
  assigneesIds?: number[]
}

export interface WorkItemSummaryDto {
  id: number
  title: string
  description: string
  itemType: ItemType
  status: Status
  severity: Severity
  createdAt: string
  dueDate: string | null
  projectId: number
  reporter: UserSummaryDto
  assignees: UserSummaryDto[]
}

export interface WorkItemResponseDto {
  id: number
  title: string
  description: string
  itemType: ItemType
  status: Status
  severity: Severity
  createdAt: string
  dueDate: string | null
  project: ProjectSummaryDto
  comments: CommentResponseWorkItemDto[]
  reporter: UserSummaryDto
  assignees: UserSummaryDto[]
  parent: WorkItemSummaryDto | null
  children: WorkItemSummaryDto[]
}
