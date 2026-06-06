import type { UserSummaryDto } from "./user"
import type { WorkItemSummaryDto } from "./workItem"

export interface CommentCreateDto {
  content: string
  workItemId: number
}

export interface CommentUpdateDto {
  content: string
}

export interface CommentResponseDto {
  id: number
  content: string
  createdAt: string
  updatedAt: string
  author: UserSummaryDto
  workItem: WorkItemSummaryDto
}

export interface CommentResponseWorkItemDto {
  id: number
  content: string
  createdAt: string
  updatedAt: string
  author: UserSummaryDto
}