import {
  OctagonAlert,
  Ban,
  FileBarChart,
  FileWarning,
  IdCard,
  ListChecks,
  UserMinus,
  UserX,
  type LucideIcon,
} from "lucide-react"

import type { FilterOption } from "@/components/common/filter-select"
import { CATALOGS } from "@/config/catalogs"
import type { DashboardTab, DiscrepancyReport, DiscrepancyView, QuotaStage, Severity } from "./types"

export { AREAS } from "@/features/quota-allocate/options"

type TabDef = {
  value: DashboardTab
  label: string
  /** Shorter label for narrow screens. */
  short?: string
  description: string
  icon: LucideIcon
  /** Built in this app; others show a placeholder. */
  ready?: boolean
}

export const DASHBOARD_TABS: TabDef[] = [
  {
    value: "quota-stage",
    label: "Quota stage",
    short: "Stage",
    description: "Where each director's quota is in the workflow, its validation results, and load approval.",
    icon: ListChecks,
    ready: true,
  },
  {
    value: "discrepancies",
    label: "Discrepancies",
    description: "Compare QUBE quota, sales IDs and rollups against CCRS and non-quota data.",
    icon: FileWarning,
    ready: true,
  },
  {
    value: "temporary-sales-ids",
    label: "Temporary sales IDs",
    short: "Temp IDs",
    description: "Reps still on a temporary sales ID for the period.",
    icon: IdCard,
  },
  {
    value: "suspendable-accounts",
    label: "Suspendable accounts",
    short: "Suspendable",
    description: "Accounts eligible for suspension.",
    icon: Ban,
  },
  {
    value: "unused-vacant-accounts",
    label: "Unused vacant accounts",
    short: "Vacant",
    description: "Vacant accounts with no quota activity.",
    icon: UserX,
  },
  {
    value: "reports",
    label: "Reports",
    description: "Period reports to run and download.",
    icon: FileBarChart,
  },
  {
    value: "load-errors",
    label: "Load errors",
    description: "Records rejected by the last quota load.",
    icon: OctagonAlert,
  },
  {
    value: "rif-employees",
    label: "RIF employees",
    short: "RIF",
    description: "Employees affected by a reduction in force who still hold quota.",
    icon: UserMinus,
  },
]

export const dashboardTab = (value: DashboardTab) => DASHBOARD_TABS.find((t) => t.value === value) ?? DASHBOARD_TABS[0]

export const STAGES: (FilterOption & { value: QuotaStage })[] = [
  { value: "not-started", label: "Not started" },
  { value: "in-progress", label: "In progress" },
  { value: "submitted", label: "Submitted" },
  { value: "finalized", label: "Finalized" },
]

export const stageLabel = (stage: QuotaStage) => STAGES.find((s) => s.value === stage)?.label ?? stage

export const SEVERITIES: (FilterOption & { value: Severity })[] = [
  { value: "fatal", label: "Fatal" },
  { value: "warning", label: "Warning" },
  { value: "info", label: "Info" },
]

/** Server-generated exports, per director or for the whole selection. TODO: wire to export endpoints. */
export const STAGE_EXPORTS = [
  { id: "assignments", label: "Assignments" },
  { id: "quotas", label: "Quotas" },
  { id: "attributes", label: "Attributes" },
] as const

export const DISCREPANCY_VIEWS: { value: DiscrepancyView; label: string; description: string }[] = [
  { value: "reports", label: "Reports", description: "Generate comparison reports." },
  {
    value: "incentive-allowance",
    label: "Incentive allowance",
    description: "Employees whose incentive allowance doesn't match CCRS.",
  },
  { value: "missing-employees", label: "Missing employees", description: "Employees in CCRS but missing from QUBE." },
  { value: "extra-employees", label: "Extra employees", description: "Employees in QUBE but not in CCRS." },
]

/** Legacy order: sales-ID checks in the first column, rollup checks in the second. */
export const DISCREPANCY_REPORTS: { value: DiscrepancyReport; label: string }[] = [
  { value: "quota-sales-ids-vs-ccrs", label: "Quota sales IDs vs CCRS" },
  { value: "quota-sales-ids-vs-non-quota", label: "Quota sales IDs vs (non-quota) sales IDs" },
  { value: "non-quota-sales-ids-vs-ccrs", label: "(Non-quota) sales IDs vs CCRS" },
  { value: "qube-quota-vs-ccrs-quota", label: "QUBE quota vs CCRS quota" },
  { value: "quota-rollups-vs-ccrs-rollups", label: "Quota rollups vs CCRS rollups" },
  { value: "quota-rollups-vs-non-quota", label: "Quota rollups vs (non-quota) rollups" },
  { value: "non-quota-rollups-vs-ccrs", label: "(Non-quota) rollups vs CCRS" },
  { value: "channel-specific-check", label: "Channel-specific check" },
]

/** Every channel across catalogs, as "catalog:channel". */
export const CHANNEL_OPTIONS: FilterOption[] = CATALOGS.flatMap((c) =>
  c.channels.map((ch) => ({ value: `${c.id}:${ch.id}`, label: ch.label }))
)
