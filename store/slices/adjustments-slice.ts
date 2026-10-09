import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

import { PENDING_STAGES } from "@/features/quota-adjustments/options"
import type { AdjustmentCriteria } from "@/features/quota-adjustments/types"

export type AdjustmentsState = {
  /** The form. */
  draft: AdjustmentCriteria
  /** The criteria of the last search; results are shown for these. */
  submitted: AdjustmentCriteria
}

// Legacy defaults: Direct, all channels, all periods, all pending stages. Searched on open.
const DEFAULTS: AdjustmentCriteria = {
  catalog: "direct",
  channel: "all",
  allPeriods: true,
  period: null,
  types: [],
  stages: PENDING_STAGES,
  createdBy: "",
}

const initialState: AdjustmentsState = { draft: DEFAULTS, submitted: DEFAULTS }

export const adjustmentsSlice = createSlice({
  name: "adjustments",
  initialState,
  reducers: {
    updateAdjustmentsDraft(state, action: PayloadAction<Partial<AdjustmentCriteria>>) {
      Object.assign(state.draft, action.payload)
    },
    submitAdjustments(state) {
      state.submitted = { ...state.draft, types: [...state.draft.types], stages: [...state.draft.stages] }
    },
    resetAdjustments(state) {
      state.draft = DEFAULTS
      state.submitted = DEFAULTS
    },
  },
})

export const { updateAdjustmentsDraft, submitAdjustments, resetAdjustments } = adjustmentsSlice.actions
