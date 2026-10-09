import type { Period } from "@/lib/period"

/** Dashboard tabs, in legacy order. */
export type DashboardTab =
  | "quota-stage"
  | "discrepancies"
  | "temporary-sales-ids"
  | "suspendable-accounts"
  | "unused-vacant-accounts"
  | "reports"
  | "load-errors"
  | "rif-employees"

/** TODO: confirm the full list of stages with the business (legacy screenshot only shows "Finalized"). */
export type QuotaStage = "not-started" | "in-progress" | "submitted" | "finalized"

export type Severity = "fatal" | "warning" | "info"

/** Quota Stage filters (the period is shared by every tab). */
export type QuotaStageFilters = {
  catalog: string
  channel: string
  area: string
  stages: QuotaStage[]
  /** Only show directors with these validation results; empty = no filter. */
  severities: Severity[]
}

export type QuotaStageQuery = QuotaStageFilters & { period: Period }

/** One director's quota for the period. */
export type DirectorStage = {
  id: string
  director: string
  catalog: string
  channel: string
  area: string
  stage: QuotaStage
  approved: boolean
  executeLoad: boolean
  validation: Record<Severity, number>
}

export type DiscrepancyView = "reports" | "incentive-allowance" | "missing-employees" | "extra-employees"

export type DiscrepancyReport =
  | "quota-sales-ids-vs-ccrs"
  | "quota-sales-ids-vs-non-quota"
  | "non-quota-sales-ids-vs-ccrs"
  | "qube-quota-vs-ccrs-quota"
  | "quota-rollups-vs-ccrs-rollups"
  | "quota-rollups-vs-non-quota"
  | "non-quota-rollups-vs-ccrs"
  | "channel-specific-check"

export type DiscrepancyFilters = {
  view: DiscrepancyView
  reports: DiscrepancyReport[]
  /** "catalog:channel" ids. */
  channels: string[]
  /** Last run search per employee list; absent until the user runs a query. */
  queries: Partial<Record<EmployeeDiscrepancyView, string>>
}

export type EmployeeDiscrepancyView = Exclude<DiscrepancyView, "reports">

/** An employee flagged by a discrepancy check (incentive allowance, missing, extra). */
export type DiscrepancyEmployee = {
  id: string
  hrNumber: string
  salesId: string
  name: string
  jobTitle: string
  compPlan: string
  locale: string
  ccrsAlert: string
}
