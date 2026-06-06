import apiFetch from "./utils"
import type {
  WorkItemCreateDto,
  WorkItemUpdateDto,
  WorkItemSummaryDto,
  WorkItemResponseDto,
} from "../types/workItem"
import type { CommentResponseWorkItemDto } from "../types/comment"
import type { ItemType, Severity, Status } from "../types/enums"

export async function getWorkItems(filters?: {
  itemType?: ItemType
  status?: Status
  severity?: Severity
}): Promise<WorkItemSummaryDto[]> {
  const params = new URLSearchParams()
  if (filters?.itemType) params.append("itemType", filters.itemType)
  if (filters?.status)   params.append("status", filters.status)
  if (filters?.severity) params.append("severity", filters.severity)

  const query = params.toString() ? `?${params.toString()}` : ""
  const response = await apiFetch(`/work-items${query}`)
  if (!response.ok) throw new Error("Failed to fetch work items")
  return response.json()
}

export async function getWorkItemComments(workItemId: number): Promise<CommentResponseWorkItemDto[]> {
  const response = await apiFetch(`/work-items/${workItemId}/comments`)
  if (!response.ok) throw new Error("Failed to fetch comments")
  return response.json()
}

export async function getWorkItemById(workItemId: number): Promise<WorkItemResponseDto> {
  const response = await apiFetch(`/work-items/${workItemId}`)
  if (!response.ok) throw new Error("Failed to fetch work item")
  return response.json()
}

export async function createWorkItem(data: WorkItemCreateDto): Promise<WorkItemResponseDto> {
  const response = await apiFetch("/work-items", {
    method: "POST",
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error("Failed to create work item")
  return response.json()
}

export async function updateWorkItem(workItemId: number, data: WorkItemUpdateDto): Promise<WorkItemResponseDto> {
  const response = await apiFetch(`/work-items/${workItemId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error("Failed to update work item")
  return response.json()
}

export async function setWorkItemParent(childId: number, parentId: number): Promise<WorkItemResponseDto> {
  const response = await apiFetch(`/work-items/${childId}/parent/${parentId}`, {
    method: "PUT",
  })
  if (!response.ok) throw new Error("Failed to set parent")
  return response.json()
}

export async function removeWorkItemParent(childId: number): Promise<WorkItemResponseDto> {
  const response = await apiFetch(`/work-items/${childId}/parent`, {
    method: "PUT",
  })
  if (!response.ok) throw new Error("Failed to remove parent")
  return response.json()
}

export async function deleteWorkItem(workItemId: number): Promise<void> {
  const response = await apiFetch(`/work-items/${workItemId}`, {
    method: "DELETE",
  })
  if (!response.ok) throw new Error("Failed to delete work item")
}