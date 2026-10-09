import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

import { findChannel } from "@/features/quota-allocate/catalog"
import { DIRECTORS } from "@/features/quota-allocate/options"
import type { AllocateFilters } from "@/features/quota-allocate/types"
import type { Period } from "@/lib/period"

export type AllocateState = AllocateFilters & {
  /** `null` until the client sets the current period (avoids Date during prerender). */
  period: Period | null
}

const initialState: AllocateState = {
  catalog: "direct",
  channel: "business",
  area: "east",
  director: DIRECTORS.east[0].value,
  view: "team-vaults",
  scope: "current",
  period: null,
}

export const allocateSlice = createSlice({
  name: "allocate",
  initialState,
  reducers: {
    setFilter<K extends keyof AllocateFilters>(state: AllocateState, action: PayloadAction<{ key: K; value: AllocateFilters[K] }>) {
      const { key, value } = action.payload
      ;(state as AllocateFilters)[key] = value
      // Directors belong to an area.
      if (key === "area") state.director = DIRECTORS[value as string]?.[0]?.value ?? "all"
    },
    /** Switch catalog/channel/view. Keeps the current view when the new channel has it. */
    setContext(state, action: PayloadAction<{ catalog: string; channel: string; view?: string }>) {
      const { catalog, channel } = findChannel(action.payload.catalog, action.payload.channel)
      const wanted = action.payload.view ?? state.view
      state.catalog = catalog.id
      state.channel = channel.id
      state.view = channel.views.some((v) => v.id === wanted) ? wanted : channel.views[0].id
    },
    setPeriod(state, action: PayloadAction<Period>) {
      state.period = action.payload
    },
  },
})

export const { setContext, setFilter, setPeriod } = allocateSlice.actions
