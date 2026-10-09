import Link from "next/link"
import { ChevronRight } from "lucide-react"

import type { NavItem } from "@/config/navigation"
import { cn } from "@/lib/utils"
import { PinButton } from "./pin-button"

type ScreenCardProps = {
  item: NavItem
  href: string
  className?: string
}

export function ScreenCard({ item, href, className }: ScreenCardProps) {
  const Icon = item.icon
  return (
    <div
      className={cn(
        "group/card relative flex items-start gap-3 rounded-lg border bg-card p-4 transition-all hover:border-foreground/15 hover:shadow-sm",
        className
      )}
    >
      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
      <div className="min-w-0 flex-1 space-y-1">
        <Link href={href} className="flex items-center gap-1 font-medium after:absolute after:inset-0 after:rounded-lg focus-visible:outline-none">
          {item.title}
          {item.hasSubmenu || item.children?.length ? (
            <ChevronRight className="size-3.5 text-muted-foreground/60" />
          ) : null}
        </Link>
        <p className="line-clamp-2 text-[13px] text-muted-foreground">{item.description}</p>
      </div>
      <PinButton href={href} title={item.title} className="relative z-10 -mt-1 -mr-1" />
    </div>
  )
}
