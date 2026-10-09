"use client"

import { useState } from "react"
import { CircleCheck, CircleDashed, Loader2, Lock, Play, ScrollText, TriangleAlert, OctagonX } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { formatPeriod, type Period } from "@/lib/period"
import { cn } from "@/lib/utils"
import { taskLabel, TASKS } from "./options"
import type { PeriodTask, TaskId, TaskLog } from "./types"

const when = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })

type TasksCardProps = {
  period: Period
  tasks: PeriodTask[]
  logs: TaskLog[]
  /** Task currently running, if any. */
  running: TaskId | null
  onRun: (task: TaskId) => void
}

/** Period tasks in run order; each unlocks the next. Logs open in a side sheet. */
export function TasksCard({ period, tasks, logs, running, onRun }: TasksCardProps) {
  const [logsOpen, setLogsOpen] = useState(false)

  return (
    <section aria-label="Tasks" className="overflow-hidden rounded-xl border bg-card">
      <header className="flex items-center gap-2 border-b px-4 py-3">
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold">Tasks</h2>
          <p className="text-[13px] text-muted-foreground">Run in order; each unlocks the next.</p>
        </div>
        <Button variant="outline" onClick={() => setLogsOpen(true)}>
          <ScrollText />
          View logs
        </Button>
      </header>

      <ol className="divide-y">
        {TASKS.map((def, i) => {
          const task = tasks.find((t) => t.id === def.id)!
          const isRunning = running === def.id
          const StateIcon = task.state === "done" ? CircleCheck : task.state === "ready" ? CircleDashed : Lock
          return (
            <li key={def.id} className={cn("flex gap-3 px-4 py-3", task.state === "blocked" && "text-muted-foreground")}>
              <StateIcon
                aria-label={task.state === "done" ? "Done" : task.state === "ready" ? "Ready to run" : "Locked"}
                className={cn(
                  "mt-0.5 size-4 shrink-0",
                  task.state === "done" && "text-emerald-600 dark:text-emerald-400",
                  task.state === "ready" && "text-primary"
                )}
              />
              <div className="min-w-0 flex-1">
                <p className={cn("text-[13px] font-medium", task.state === "blocked" && "font-normal")}>
                  <span className="mr-1.5 text-muted-foreground tabular-nums">{i + 1}.</span>
                  {def.label}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {task.state === "blocked" ? `Waits for “${TASKS[i - 1]?.label ?? ""}”.` : def.description}
                </p>
                {task.lastRun && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <ResultIcon result={task.lastRun.result} />
                    Last run {when.format(new Date(task.lastRun.at))} by {task.lastRun.by}
                  </p>
                )}
              </div>
              <Button
                variant={task.state === "ready" ? "default" : "outline"}
                disabled={task.state === "blocked" || running !== null}
                onClick={() => onRun(def.id)}
                className="shrink-0 self-center"
              >
                {isRunning ? <Loader2 className="animate-spin" /> : <Play />}
                {task.state === "done" ? "Run again" : "Run"}
              </Button>
            </li>
          )
        })}
      </ol>

      <Sheet open={logsOpen} onOpenChange={setLogsOpen}>
        <SheetContent className="w-full gap-0 sm:max-w-md">
          <SheetHeader className="border-b">
            <SheetTitle>Logs</SheetTitle>
            <SheetDescription>Task runs and changes for {formatPeriod(period)}, newest first.</SheetDescription>
          </SheetHeader>
          {logs.length ? (
            <ol className="flex-1 divide-y overflow-y-auto">
              {logs.map((l) => (
                <li key={l.id} className="flex gap-3 px-4 py-3">
                  <ResultIcon result={l.result} className="mt-0.5 size-4" />
                  <div className="min-w-0 flex-1">
                    <p className="flex items-baseline gap-2 text-[13px]">
                      <span className="font-medium">{taskLabel(l.task)}</span>
                      <span className="ml-auto shrink-0 text-xs text-muted-foreground tabular-nums">{when.format(new Date(l.at))}</span>
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{l.message}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{l.by}</p>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <p className="p-4 text-[13px] text-muted-foreground">Nothing has run for this period yet.</p>
          )}
        </SheetContent>
      </Sheet>
    </section>
  )
}

function ResultIcon({ result, className }: { result: TaskLog["result"]; className?: string }) {
  if (result === "error") return <OctagonX aria-label="Failed" className={cn("size-3 shrink-0 text-destructive", className)} />
  if (result === "warning")
    return <TriangleAlert aria-label="Completed with warnings" className={cn("size-3 shrink-0 text-amber-600 dark:text-amber-400", className)} />
  return <CircleCheck aria-label="Succeeded" className={cn("size-3 shrink-0 text-emerald-600 dark:text-emerald-400", className)} />
}
