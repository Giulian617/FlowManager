import apiFetch from "./utils"
import type { CommentResponseWorkItemDto } from "../types/comment"

export async function getComments() {
  const response = await apiFetch("/comments")
  if (!response.ok) throw new Error("Failed to fetch comments")
  return response.json()
}

export async function createComment(workItemId: number, content: string): Promise<CommentResponseWorkItemDto> {
  const response = await apiFetch("/comments", {
    method: "POST",
    body: JSON.stringify({ content, workItemId }),
  })
  if (!response.ok) throw new Error("Failed to create comment")
  return response.json()
}

export async function updateComment(commentId: number, content: string): Promise<CommentResponseWorkItemDto> {
  const response = await apiFetch(`/comments/${commentId}`, {
    method: "PUT",
    body: JSON.stringify({ content }),
  })
  if (!response.ok) throw new Error("Failed to update comment")
  return response.json()
}

export async function deleteComment(commentId: number): Promise<void> {
  const response = await apiFetch(`/comments/${commentId}`, { method: "DELETE" })
  if (!response.ok) throw new Error("Failed to delete comment")
}