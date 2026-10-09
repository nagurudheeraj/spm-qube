import { cn } from "@/lib/utils"

export type Stat = { label: string; value: React.ReactNode; hint?: React.ReactNode; tone?: "default" | "warning" }

/** Row of key figures in one bordered strip (2-up on mobile). */
export function StatStrip({ stats, className }: { stats: Stat[]; className?: string }) {
  return (
    <dl
      style={{ "--cols": `repeat(${stats.length}, minmax(0, 1fr))` } as React.CSSProperties}
      className={cn("grid grid-cols-2 gap-px overflow-hidden rounded-lg border bg-border md:grid-cols-(--cols)", className)}
    >
      {stats.map((s) => (
        <div key={s.label} className="space-y-1 bg-card px-4 py-3">
          <dt className="text-xs text-muted-foreground">{s.label}</dt>
          <dd className={cn("text-lg font-semibold tracking-tight tabular-nums", s.tone === "warning" && "text-amber-600 dark:text-amber-400")}>
            {s.value}
            {s.hint && <span className="ml-1.5 text-xs font-normal text-muted-foreground">{s.hint}</span>}
          </dd>
        </div>
      ))}
    </dl>
  )
}
