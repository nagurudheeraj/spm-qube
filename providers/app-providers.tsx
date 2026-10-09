"use client"

import { ThemeProvider } from "next-themes"

import { Toaster } from "@/components/ui/toast"
import { TooltipProvider } from "@/components/ui/tooltip"
import { QueryProvider } from "./query-provider"
import { StoreProvider } from "./store-provider"

/**
 * Redux holds client/UI state (pinned screens, palette…);
 * TanStack Query owns everything fetched from the server.
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <QueryProvider>
        <StoreProvider>
          <Toaster>
            <TooltipProvider>{children}</TooltipProvider>
          </Toaster>
        </StoreProvider>
      </QueryProvider>
    </ThemeProvider>
  )
}
