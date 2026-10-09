"use client"

import * as React from "react"
import { Provider } from "react-redux"

import { makeStore } from "@/store"
import { hydrate } from "@/store/slices/ui-slice"

const STORAGE_KEY = "qube:ui"

// Default pins are added once per browser (existing users included), then remembered as seeded so
// anything the user unpins stays unpinned. Recents are only seeded on a first visit.
const DEFAULT_PINS = ["/quota/allocate", "/quota/dashboard"]
const DEFAULT_RECENT = ["/quota/adjustments", "/quota/find", "/quota/periods"]

// Created at module scope: Redux's init probes call Math.random(), which Next's
// prerender rejects inside render. Safe because this store only holds client-side
// UI state and is never dispatched to on the server.
const store = makeStore()

export function StoreProvider({ children }: { children: React.ReactNode }) {

  // Restore + persist user preferences (recent / pinned screens).
  React.useEffect(() => {
    let pinsSeeded = false
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      const saved = raw ? JSON.parse(raw) : { recent: DEFAULT_RECENT }
      pinsSeeded = saved.pinsSeeded === true
      store.dispatch(hydrate(pinsSeeded ? saved : { ...saved, pinned: [...(saved.pinned ?? []), ...DEFAULT_PINS] }))
    } catch {}

    const persist = () => {
      const { recent, pinned } = store.getState().ui
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ recent, pinned, pinsSeeded: true }))
      } catch {}
    }
    // Save straight away so the seeded pins are recorded even if nothing else changes.
    if (!pinsSeeded) persist()

    return store.subscribe(persist)
  }, [])

  return <Provider store={store}>{children}</Provider>
}
