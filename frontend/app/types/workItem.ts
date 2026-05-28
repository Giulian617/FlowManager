import type { ItemType, Severity, Status } from "./enums"

export interface WorkItemSummaryDto {
  id: number
  title: string
  description: string
  itemType: ItemType
  status: Status
  severity: Severity
  createdAt: string
  projectId: number
}