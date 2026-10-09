import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

const MAX_RECENT = 6

export type UiState = {
  commandOpen: boolean
  /** Screen hrefs, most recent first. */
  recent: string[]
  /** Screen hrefs pinned by the user. */
  pinned: string[]
}

const initialState: UiState = {
  commandOpen: false,
  recent: [],
  pinned: [],
}

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setCommandOpen(state, action: PayloadAction<boolean>) {
      state.commandOpen = action.payload
    },
    toggleCommand(state) {
      state.commandOpen = !state.commandOpen
    },
    visitScreen(state, action: PayloadAction<string>) {
      state.recent = [
        action.payload,
        ...state.recent.filter((href) => href !== action.payload),
      ].slice(0, MAX_RECENT)
    },
    togglePin(state, action: PayloadAction<string>) {
      const href = action.payload
      state.pinned = state.pinned.includes(href)
        ? state.pinned.filter((h) => h !== href)
        : [...state.pinned, href]
    },
    /** Merge saved preferences; visits recorded before restore stay on top. */
    hydrate(state, action: PayloadAction<Partial<Pick<UiState, "recent" | "pinned">>>) {
      const { recent = [], pinned = [] } = action.payload
      state.recent = [...new Set([...state.recent, ...recent])].slice(0, MAX_RECENT)
      state.pinned = [...new Set([...state.pinned, ...pinned])]
    },
  },
})

export const { setCommandOpen, toggleCommand, visitScreen, togglePin, hydrate } =
  uiSlice.actions
