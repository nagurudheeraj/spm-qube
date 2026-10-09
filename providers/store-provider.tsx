"use client"

import * as React from "react"
import { Provider } from "react-redux"

import { makeStore } from "@/store"
import { hydrate } from "@/store/slices/ui-slice"

const STORAGE_KEY = "qube:ui"

// Created at module scope: Redux's init probes call Math.random(), which Next's
// prerender rejects inside render. Safe because this store only holds client-side
// UI state and is never dispatched to on the server.
const store = makeStore()

export function StoreProvider({ children }: { children: React.ReactNode }) {

  // Restore + persist user preferences (recent / pinned screens).
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) store.dispatch(hydrate(JSON.parse(saved)))
    } catch {}

    return store.subscribe(() => {
      const { recent, pinned } = store.getState().ui
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ recent, pinned }))
      } catch {}
    })
  }, [])

  return <Provider store={store}>{children}</Provider>
}
