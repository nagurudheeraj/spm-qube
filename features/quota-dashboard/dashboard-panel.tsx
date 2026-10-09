import type { LucideIcon } from "lucide-react"

import { IconTile } from "@/components/common/icon-tile"
import { cn } from "@/lib/utils"

type DashboardPanelProps = {
  icon: LucideIcon
  title: string
  description: string
  /** Tab-level actions, top right (e.g. exports). */
  actions?: React.ReactNode
  /** Filters and other controls between the header and the body. */
  toolbar?: React.ReactNode
  /** Pinned under the body (e.g. actions on selected rows). */
  footer?: React.ReactNode
  className?: string
  children: React.ReactNode
}

/**
 * One tab's content: header (what this tab is + its actions), toolbar, body,
 * footer. Every tab uses it so the user always sees which section they're in,
 * whatever the body is (grid, report list, empty state…).
 */
export function DashboardPanel({ icon, title, description, actions, toolbar, footer, className, children }: DashboardPanelProps) {
  return (
    <section aria-label={title} className={cn("flex min-h-0 flex-1 flex-col", className)}>
      <header className="flex flex-wrap items-start gap-3 px-4 pt-4 pb-3">
        <IconTile icon={icon} />
        <div className="min-w-0 flex-1">
          <h2 className="text-sm leading-tight font-semibold">{title}</h2>
          <p className="mt-0.5 text-[13px] text-muted-foreground">{description}</p>
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </header>
      {toolbar && <div className="flex flex-wrap items-center gap-2 px-4 pb-3">{toolbar}</div>}
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      {footer && (
        <footer className="flex flex-wrap items-center gap-2 border-t bg-muted/30 px-4 py-2.5">{footer}</footer>
      )}
    </section>
  )
}
