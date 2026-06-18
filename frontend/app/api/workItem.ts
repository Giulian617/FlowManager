import apiFetch, { buildQuery, fetchAllPages } from "./utils"
import type {
  WorkItemCreateDto,
  WorkItemUpdateDto,
} from "../types/workItem"
import type { Page, PageParams } from "../types/page"

export type WorkItemPageParams = PageParams & {
  itemType?: string[]
  status?: string[]
  severity?: string[]
  reporterId?: string[]
  assigneeId?: string[]
  unassigned?: string
}

export async function getWorkItems() {
  return fetchAllPages("/work-items")
}

export async function getWorkItemsPage(params: WorkItemPageParams): Promise<Page<any>> {
  const response = await apiFetch(`/work-items${buildQuery(params)}`)
  if (!response.ok) throw new Error("Failed to fetch work items")
  return response.json()
}

export async function getWorkItemComments(workItemId: number){
  const response = await apiFetch(`/work-items/${workItemId}/comments`)
  if (!response.ok) throw new Error("Failed to fetch comments")
  return response.json()
}

export async function getWorkItemById(workItemId: number) {
  const response = await apiFetch(`/work-items/${workItemId}`)
  if (!response.ok) throw new Error("Failed to fetch work item")
  return response.json()
}

export async function createWorkItem(data: WorkItemCreateDto) {
  const response = await apiFetch("/work-items", {
    method: "POST",
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error("Failed to create work item")
  return response.json()
}

export async function updateWorkItem(workItemId: number, data: WorkItemUpdateDto) {
  const response = await apiFetch(`/work-items/${workItemId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error("Failed to update work item")
  return response.json()
}

export async function setWorkItemParent(childId: number, parentId: number) {
  const response = await apiFetch(`/work-items/${childId}/parent/${parentId}`, {
    method: "PUT",
  })
  if (!response.ok) throw new Error("Failed to set parent")
  return response.json()
}

export async function removeWorkItemParent(childId: number) {
  const response = await apiFetch(`/work-items/${childId}/parent`, {
    method: "PUT",
  })
  if (!response.ok) throw new Error("Failed to remove parent")
  return response.json()
}

export async function deleteWorkItem(workItemId: number) {
  const response = await apiFetch(`/work-items/${workItemId}`, {
    method: "DELETE",
  })
  if (!response.ok) throw new Error("Failed to delete work item")
}