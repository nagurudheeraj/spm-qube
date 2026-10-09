import type { FilterOption } from "@/components/common/filter-select"
import type { AdjustmentStage } from "./types"

/** Workflow order. */
export const STAGES: (FilterOption & { value: AdjustmentStage })[] = [
  { value: "allocate", label: "Allocate" },
  { value: "freeze", label: "Freeze" },
  { value: "request-approval", label: "Request approval" },
  { value: "approved", label: "Approved" },
  { value: "load", label: "Load" },
  { value: "loaded", label: "Loaded" },
]

/** Everything not yet loaded (legacy "All pending"). */
export const PENDING_STAGES: AdjustmentStage[] = STAGES.map((s) => s.value).filter((s) => s !== "loaded")

export const stageLabel = (stage: AdjustmentStage) => STAGES.find((s) => s.value === stage)?.label ?? stage

// TODO: load adjustment types / sub-types from reference data.
export const TYPES: (FilterOption & { subTypes: string[] })[] = [
  { value: "retail-store", label: "Retail store", subTypes: ["Head count change", "Store open", "Store close"] },
  { value: "employee", label: "Employee", subTypes: ["Transfer", "Leave of absence", "New hire"] },
  { value: "team-vault", label: "Team vault", subTypes: ["Target change", "Weight change"] },
  { value: "territory", label: "Territory", subTypes: ["Realignment", "Account move"] },
]

export const typeLabel = (type: string) => TYPES.find((t) => t.value === type)?.label ?? type
