import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

import type {
  DashboardTab,
  DiscrepancyFilters,
  EmployeeDiscrepancyView,
  QuotaStageFilters,
} from "@/features/quota-dashboard/types"
import type { Period } from "@/lib/period"

export type DashboardState = {
  /** Shared by every tab. `null` until the client sets the current period. */
  period: Period | null
  tab: DashboardTab
  stage: QuotaStageFilters
  discrepancies: DiscrepancyFilters
}

const initialState: DashboardState = {
  period: null,
  tab: "quota-stage",
  stage: { catalog: "direct", channel: "business", area: "east", stages: [], severities: [] },
  discrepancies: { view: "reports", reports: [], channels: [], queries: {} },
}

export const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    setDashboardPeriod(state, action: PayloadAction<Period>) {
      state.period = action.payload
    },
    setDashboardTab(state, action: PayloadAction<DashboardTab>) {
      state.tab = action.payload
    },
    updateStageFilters(state, action: PayloadAction<Partial<QuotaStageFilters>>) {
      Object.assign(state.stage, action.payload)
    },
    updateDiscrepancyFilters(state, action: PayloadAction<Partial<DiscrepancyFilters>>) {
      Object.assign(state.discrepancies, action.payload)
    },
    runDiscrepancyQuery(state, action: PayloadAction<{ view: EmployeeDiscrepancyView; term: string }>) {
      state.discrepancies.queries[action.payload.view] = action.payload.term
    },
  },
})

export const { setDashboardPeriod, setDashboardTab, updateStageFilters, updateDiscrepancyFilters, runDiscrepancyQuery } = dashboardSlice.actions
