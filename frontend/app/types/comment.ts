import type { UserSummaryDto } from "./user"

export interface CommentResponseWorkItemDto {
  id: number
  content: string
  createdAt: string
  updatedAt: string
  author: UserSummaryDto
}