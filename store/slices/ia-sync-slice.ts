import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

import type { IaSegment } from "@/features/ia-sync/types"
import type { Period } from "@/lib/period"

export type IaSyncState = {
  /** Period picked in the form. `null` until the client sets the current period. */
  draft: Period | null
  /** Period whose data is shown ("Get data"). */
  loaded: Period | null
  segment: IaSegment
}

const initialState: IaSyncState = { draft: null, loaded: null, segment: "business" }

export const iaSyncSlice = createSlice({
  name: "iaSync",
  initialState,
  reducers: {
    initIaSync(state, action: PayloadAction<Period>) {
      state.draft ??= action.payload
      state.loaded ??= action.payload
    },
    setIaSyncDraft(state, action: PayloadAction<Period>) {
      state.draft = action.payload
    },
    loadIaSync(state) {
      state.loaded = state.draft
    },
    setIaSegment(state, action: PayloadAction<IaSegment>) {
      state.segment = action.payload
    },
  },
})

export const { initIaSync, setIaSyncDraft, loadIaSync, setIaSegment } = iaSyncSlice.actions
