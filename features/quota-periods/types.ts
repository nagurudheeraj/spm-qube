/** TODO: confirm the full lifecycle with the business; legacy shows "Initialize Pending" + Promote. */
export type PeriodStatus = "initialize-pending" | "initialized" | "open" | "frozen" | "closed"

/** Editable period configuration. Dates are "yyyy-MM-dd"; date-times are local "yyyy-MM-ddTHH:mm". */
export type PeriodSettings = {
  cutoffDate: string
  deactivateSalesIdsDate: string
  reliefDate: string
  displayLoad: string
  displayReload: string
  displayVbgReload: string
  displayVcgReload: string
  runStageCheck: boolean
}

export type TaskId =
  | "deactivate-sales-ids"
  | "stage-check"
  | "activate-quotas"
  | "reactivate-sales-ids"
  | "init-alerts-to-notes"

export type PeriodTask = {
  id: TaskId
  state: "done" | "ready" | "blocked"
  /** ISO timestamp + user of the last run. */
  lastRun?: { at: string; by: string; result: "success" | "warning" | "error" }
}

export type TaskLog = {
  id: string
  at: string
  task: TaskId | "promote" | "settings"
  by: string
  result: "success" | "warning" | "error"
  message: string
}

export type PeriodConfig = {
  status: PeriodStatus
  /** When (and by whom) each reached status was entered. */
  history: Partial<Record<PeriodStatus, { at: string; by: string }>>
  settings: PeriodSettings
  tasks: PeriodTask[]
  logs: TaskLog[]
}
