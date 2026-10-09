import type { Period } from "@/lib/period"

export type AdjustmentStage = "allocate" | "freeze" | "request-approval" | "approved" | "load" | "loaded"

/** What the user searches with; submitted as a whole when they press Search. */
export type AdjustmentCriteria = {
  catalog: string
  /** Channel id or "all". */
  channel: string
  /** When false, only `period` is searched. */
  allPeriods: boolean
  period: Period | null
  /** Empty = every type. */
  types: string[]
  stages: AdjustmentStage[]
  /** "Last, First" (partial match). */
  createdBy: string
}

export type Adjustment = {
  id: string
  group: string
  locale: string
  period: string
  type: string
  subType: string
  /** ISO timestamps. */
  created: string
  createdBy: string
  size: number
  stage: AdjustmentStage
  description: string
  reason: string
  reference: string
  modified: string
  modifiedBy: string
  shared: boolean
}
