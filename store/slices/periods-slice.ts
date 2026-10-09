import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

import type { Period } from "@/lib/period"

export type PeriodsState = {
  /** `null` until the client sets the default (next) period. */
  period: Period | null
}

const initialState: PeriodsState = { period: null }

export const periodsSlice = createSlice({
  name: "periods",
  initialState,
  reducers: {
    setPeriodsPeriod(state, action: PayloadAction<Period>) {
      state.period = action.payload
    },
  },
})

export const { setPeriodsPeriod } = periodsSlice.actions
