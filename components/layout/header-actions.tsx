"use client"

import { createContext, useContext, useState } from "react"
import { createPortal } from "react-dom"

import { cn } from "@/lib/utils"

const SlotContext = createContext<HTMLElement | null>(null)
const SetSlotContext = createContext<(el: HTMLElement | null) => void>(() => {})

/** Lets pages render actions into the app header (see `HeaderActions`). */
export function HeaderSlotProvider({ children }: { children: React.ReactNode }) {
  const [slot, setSlot] = useState<HTMLElement | null>(null)
  return (
    <SetSlotContext.Provider value={setSlot}>
      <SlotContext.Provider value={slot}>{children}</SlotContext.Provider>
    </SetSlotContext.Provider>
  )
}

/** Where page actions appear; rendered once by `AppHeader`. */
export function HeaderSlotOutlet({ className }: { className?: string }) {
  const setSlot = useContext(SetSlotContext)
  return <div ref={setSlot} className={cn("flex shrink-0 items-center gap-1.5 sm:gap-2", className)} />
}

/** Renders its children in the app header's right side. */
export function HeaderActions({ children }: { children: React.ReactNode }) {
  const slot = useContext(SlotContext)
  return slot ? createPortal(children, slot) : null
}
