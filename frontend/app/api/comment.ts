import apiFetch, { buildQuery, fetchAllPages } from "./utils"
import type { Page, PageParams } from "../types/page"

export async function getComments() {
  return fetchAllPages("/comments")
}

export async function getCommentsPage(
  params: PageParams & { authorId?: number }
): Promise<Page<any>> {
  const response = await apiFetch(`/comments${buildQuery(params)}`)
  if (!response.ok) throw new Error("Failed to fetch comments")
  return response.json()
}

export async function createComment(workItemId: number, content: string) {
  const response = await apiFetch("/comments", {
    method: "POST",
    body: JSON.stringify({ content, workItemId }),
  })
  if (!response.ok) throw new Error("Failed to create comment")
  return response.json()
}

export async function updateComment(commentId: number, content: string) {
  const response = await apiFetch(`/comments/${commentId}`, {
    method: "PUT",
    body: JSON.stringify({ content }),
  })
  if (!response.ok) throw new Error("Failed to update comment")
  return response.json()
}

export async function deleteComment(commentId: number) {
  const response = await apiFetch(`/comments/${commentId}`, { method: "DELETE" })
  if (!response.ok) throw new Error("Failed to delete comment")
}