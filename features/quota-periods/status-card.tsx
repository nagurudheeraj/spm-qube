"use client"

import { ArrowRight, Check, Loader2, Lock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { nextStatus, statusIndex, STATUSES } from "./options"
import type { PeriodConfig, PeriodStatus } from "./types"

const when = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" })

/** "Molina, Amari" → "Molina, A." */
const shortName = (name: string) => {
  const [last, first] = name.split(", ")
  return first ? `${last}, ${first[0]}.` : name
}

type StatusCardProps = {
  status: PeriodStatus
  history: PeriodConfig["history"]
  onPromote: () => void
  promoting: boolean
  /** Why promoting is blocked (e.g. unsaved configuration). */
  blockedReason?: string
}

/**
 * The period's lifecycle as one segmented bar: finished steps show when and by
 * whom they were reached, the current step is highlighted, and Promote moves
 * to the next one.
 */
export function StatusCard({ status, history, onPromote, promoting, blockedReason }: StatusCardProps) {
  const current = statusIndex(status)
  const next = nextStatus(status)

  return (
    <section aria-label="Period status" className="rounded-xl border bg-card">
      <header className="flex flex-wrap items-center gap-3 px-4 pt-4">
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold">Status</h2>
          <p className="text-[13px] text-muted-foreground">
            Step {current + 1} of {STATUSES.length}
            {next ? (
              <>
                {" "}
                · Next: <span className="text-foreground">{next.label}</span>
              </>
            ) : (
              " · Period closed"
            )}
          </p>
        </div>
        {next ? (
          <Button onClick={onPromote} disabled={promoting || Boolean(blockedReason)} title={blockedReason}>
            {promoting ? <Loader2 className="animate-spin" /> : null}
            Promote to {next.label.toLowerCase()}
            {!promoting && <ArrowRight />}
          </Button>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground">
            <Lock className="size-3.5" />
            Closed
          </span>
        )}
      </header>

      <ol aria-label="Lifecycle" className="grid grid-cols-5 gap-1.5 px-4 pt-4 pb-4 max-sm:pb-2">
        {STATUSES.map((s, i) => {
          const done = i < current
          const active = i === current
          const entered = history[s.value]
          return (
            <li key={s.value} aria-current={active ? "step" : undefined} className="min-w-0">
              <div
                className={cn(
                  "h-1.5 rounded-full",
                  done && "bg-emerald-500",
                  active && "bg-primary",
                  !done && !active && "bg-muted"
                )}
              />
              <div className="mt-2.5 hidden min-w-0 sm:block">
                <p
                  className={cn(
                    "flex items-center gap-1 truncate text-[13px]",
                    active ? "font-semibold" : done ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {done && <Check aria-hidden className="size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />}
                  <span className="truncate">{s.label}</span>
                </p>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {entered ? (
                    <span title={`${new Date(entered.at).toLocaleString()} · ${entered.by}`}>
                      {active ? "Since " : ""}
                      {when.format(new Date(entered.at))} · {shortName(entered.by)}
                    </span>
                  ) : i === current + 1 ? (
                    "Up next"
                  ) : (
                    "—"
                  )}
                </p>
              </div>
            </li>
          )
        })}
      </ol>
      {/* Phones: one line for the current step instead of five cramped columns. */}
      <p className="px-4 pb-4 text-[13px] sm:hidden">
        <span className="font-semibold">{STATUSES[current].label}</span>
        {history[status] && (
          <span className="text-muted-foreground">
            {" "}
            · since {when.format(new Date(history[status]!.at))} · {shortName(history[status]!.by)}
          </span>
        )}
      </p>
    </section>
  )
}
