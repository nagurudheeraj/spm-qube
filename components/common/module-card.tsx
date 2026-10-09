import Link from "next/link"

import { moduleHref, type NavModule } from "@/config/navigation"
import { IconTile } from "./icon-tile"

export function ModuleCard({ module: mod }: { module: NavModule }) {
  const count = mod.items.length

  return (
    <Link
      href={moduleHref(mod)}
      className="group flex flex-col gap-4 rounded-lg border bg-card p-4 transition-all hover:border-foreground/15 hover:shadow-sm focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      <IconTile icon={mod.icon} className="transition-colors group-hover:text-foreground" />
      <div className="space-y-1">
        <h3 className="font-medium">{mod.title}</h3>
        <p className="line-clamp-2 text-[13px] text-muted-foreground">{mod.description}</p>
      </div>
      <p className="mt-auto text-xs text-muted-foreground/80 tabular-nums">
        {count > 0 ? `${count} screens` : "Coming soon"}
      </p>
    </Link>
  )
}
