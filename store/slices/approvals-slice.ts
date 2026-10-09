import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

import type { Period } from "@/lib/period"

export type ApprovalsState = {
  /** `null` until the client sets the current period. */
  period: Period | null
  channel: string
}

const initialState: ApprovalsState = { period: null, channel: "business" }

export const approvalsSlice = createSlice({
  name: "approvals",
  initialState,
  reducers: {
    setApprovalsPeriod(state, action: PayloadAction<Period>) {
      state.period = action.payload
    },
    setApprovalsChannel(state, action: PayloadAction<string>) {
      state.channel = action.payload
    },
  },
})

export const { setApprovalsPeriod, setApprovalsChannel } = approvalsSlice.actions
