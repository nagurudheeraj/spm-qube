import Link from "next/link"
import { ChevronRight } from "lucide-react"

import type { FlatScreen } from "@/config/navigation"
import { cn } from "@/lib/utils"

/** Compact row list of screens, e.g. for pinned / recent. */
export function ScreenList({ screens, className }: { screens: FlatScreen[]; className?: string }) {
  return (
    <ul className={cn("divide-y rounded-lg border bg-card", className)}>
      {screens.map((s) => {
        const Icon = s.item.icon
        return (
          <li key={s.href}>
            <Link
              href={s.href}
              className="group flex h-11 items-center gap-3 px-3.5 transition-colors first:rounded-t-lg last:rounded-b-lg hover:bg-muted/50"
            >
              <Icon className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
              <span className="truncate font-medium">{s.item.title}</span>
              <span className="truncate text-[13px] text-muted-foreground">{s.breadcrumb.slice(0, -1).join(" / ")}</span>
              <ChevronRight className="ml-auto size-3.5 shrink-0 text-muted-foreground/0 transition-colors group-hover:text-muted-foreground" />
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
