import { configureStore } from "@reduxjs/toolkit"

import { adjustmentsSlice } from "./slices/adjustments-slice"
import { allocateSlice } from "./slices/allocate-slice"
import { approvalsSlice } from "./slices/approvals-slice"
import { dashboardSlice } from "./slices/dashboard-slice"
import { findSlice } from "./slices/find-slice"
import { iaSyncSlice } from "./slices/ia-sync-slice"
import { periodsSlice } from "./slices/periods-slice"
import { uiSlice } from "./slices/ui-slice"

export const makeStore = () =>
  configureStore({
    reducer: {
      ui: uiSlice.reducer,
      allocate: allocateSlice.reducer,
      find: findSlice.reducer,
      dashboard: dashboardSlice.reducer,
      adjustments: adjustmentsSlice.reducer,
      iaSync: iaSyncSlice.reducer,
      approvals: approvalsSlice.reducer,
      periods: periodsSlice.reducer,
    },
  })

export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore["getState"]>
export type AppDispatch = AppStore["dispatch"]
