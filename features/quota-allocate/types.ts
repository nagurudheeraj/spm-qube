import type { Period } from "@/lib/period"

export type Metric = "Sales Dollars" | "Gross Activations" | "Net Activations"

export type VaultComponent = {
  metric: Metric
  /** Percent weight in the comp plan (0–100). */
  weight: number
  target: number
}

export type TeamQuotaVault = {
  id: string
  name: string
  compPlan: string
  components: [VaultComponent, VaultComponent, VaultComponent]
  /** F/T count from the legacy grid. */
  ft: number
  notes: string
  /** Whether a rep is assigned to the vault. */
  assigned: boolean
}

export type AllocateFilters = {
  catalog: string
  channel: string
  area: string
  director: string
  view: string
  /** Legacy second "Period" dropdown: the selected period, or the following one. */
  scope: "current" | "next"
}

export type VaultsQuery = AllocateFilters & { period: Period }

export type PeriodStatus = "open" | "finalized"

export type VaultsResponse = {
  vaults: TeamQuotaVault[]
  status: PeriodStatus
  businessCenter: string | null
}

/** Pending edits keyed by vault id → field ("notes", "c0.target", …). */
export type VaultChanges = Record<string, Record<string, unknown>>
