import type { PeriodStatus, TaskId } from "./types"

/** Lifecycle in order; Promote moves to the next one. */
export const STATUSES: { value: PeriodStatus; label: string }[] = [
  { value: "initialize-pending", label: "Initialize pending" },
  { value: "initialized", label: "Initialized" },
  { value: "open", label: "Open" },
  { value: "frozen", label: "Frozen" },
  { value: "closed", label: "Closed" },
]

export const statusIndex = (s: PeriodStatus) => STATUSES.findIndex((x) => x.value === s)
export const nextStatus = (s: PeriodStatus) => STATUSES[statusIndex(s) + 1]

/** Tasks in the order they're normally run. Each one unlocks the next. */
export const TASKS: { id: TaskId; label: string; description: string }[] = [
  { id: "deactivate-sales-ids", label: "Deactivate sales IDs", description: "Turn off sales IDs that ended before the deactivation date." },
  { id: "stage-check", label: "Perform stage check", description: "Validate every director's quota stage before activation." },
  { id: "activate-quotas", label: "Activate quotas", description: "Make the period's approved quotas live." },
  { id: "reactivate-sales-ids", label: "Reactivate sales IDs", description: "Bring back sales IDs that are active again this period." },
  { id: "init-alerts-to-notes", label: "Initialize alerts to notes", description: "Copy open alerts into notes for the new period." },
]

export const taskLabel = (id: TaskId | "promote" | "settings") =>
  id === "promote" ? "Promote" : id === "settings" ? "Configuration" : (TASKS.find((t) => t.id === id)?.label ?? id)
