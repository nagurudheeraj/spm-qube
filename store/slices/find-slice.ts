import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

import { defaultSearchBy } from "@/features/quota-find/options"
import type { FindCriteria, SearchFor } from "@/features/quota-find/types"

export type FindState = {
  /** The form. `null` until the client fills in date-based defaults (year/period). */
  draft: FindCriteria | null
  /** The criteria of the last search; results are shown for these. */
  submitted: FindCriteria | null
}

const initialState: FindState = { draft: null, submitted: null }

export const findSlice = createSlice({
  name: "find",
  initialState,
  reducers: {
    initDraft(state, action: PayloadAction<{ year: number; period: number }>) {
      state.draft ??= {
        searchFor: "employee",
        searchBy: defaultSearchBy("employee"),
        term: "",
        exact: false,
        catalog: "all",
        channel: "all",
        market: "all",
        locale: "all",
        year: action.payload.year,
        periods: [action.payload.period],
        relief: false,
        adjustments: false,
      }
    },
    updateDraft(state, action: PayloadAction<Partial<FindCriteria>>) {
      if (!state.draft) return
      Object.assign(state.draft, action.payload)
    },
    /** Changing what you search for resets "Search by" to that type's defaults. */
    setSearchFor(state, action: PayloadAction<SearchFor>) {
      if (!state.draft) return
      state.draft.searchFor = action.payload
      state.draft.searchBy = defaultSearchBy(action.payload)
    },
    /** Catalog → channel → market cascade: changing a level clears the levels below it. */
    setCatalog(state, action: PayloadAction<string>) {
      if (!state.draft) return
      state.draft.catalog = action.payload
      state.draft.channel = "all"
      state.draft.market = "all"
    },
    setChannel(state, action: PayloadAction<string>) {
      if (!state.draft) return
      state.draft.channel = action.payload
      state.draft.market = "all"
    },
    submit(state) {
      state.submitted = state.draft ? { ...state.draft, periods: [...state.draft.periods], searchBy: [...state.draft.searchBy] } : null
    },
  },
})

export const { initDraft, updateDraft, setSearchFor, setCatalog, setChannel, submit } = findSlice.actions
