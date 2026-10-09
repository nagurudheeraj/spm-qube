import { SidebarTrigger } from "@/components/ui/sidebar"
import { AppBreadcrumbs } from "./app-breadcrumbs"
import { HeaderSlotOutlet } from "./header-actions"

export function AppHeader() {
  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b px-3 md:px-4">
      <SidebarTrigger className="text-muted-foreground" />
      <AppBreadcrumbs />
      <HeaderSlotOutlet className="ml-auto" />
    </header>
  )
}
