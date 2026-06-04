import type { UserSummaryDto } from "./user"

export interface CommentCreateDto {
  content: string
  workItemId: number
}

export interface CommentUpdateDto {
  content: string
}

export interface CommentResponseWorkItemDto {
  id: number
  content: string
  createdAt: string
  updatedAt: string
  author: UserSummaryDto
}