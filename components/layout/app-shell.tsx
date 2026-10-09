import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppHeader } from "./app-header"
import { AppSidebar } from "./app-sidebar"
import { CommandMenu } from "./command-menu"
import { HeaderSlotProvider } from "./header-actions"

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider style={{ "--sidebar-width": "15rem" } as React.CSSProperties}>
      <AppSidebar variant="inset" />
      <HeaderSlotProvider>
        <SidebarInset className="md:h-[calc(100svh-1rem)] md:overflow-hidden md:shadow-xs md:ring-1 md:ring-border/70">
          <AppHeader />
          {/* Pages pick a layout: `PageContainer` (scrolling) or `FullHeightPage` (fills the screen). */}
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">{children}</div>
        </SidebarInset>
      </HeaderSlotProvider>
      <CommandMenu />
    </SidebarProvider>
  )
}
