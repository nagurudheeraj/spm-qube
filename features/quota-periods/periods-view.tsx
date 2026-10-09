"use client"

import { useEffect, useState } from "react"
import { useIsFetching, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { RefreshCw } from "lucide-react"

import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { FullHeightPage } from "@/components/common/page-layout"
import { PeriodStepper } from "@/components/common/period-stepper"
import { HeaderActions } from "@/components/layout/header-actions"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/toast"
import { currentPeriod, formatPeriod, periodKey, shiftPeriod, type Period } from "@/lib/period"
import { cn } from "@/lib/utils"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { setPeriodsPeriod } from "@/store/slices/periods-slice"
import { periodConfigQueryOptions, periodKeys, promote, runTask, saveSettings } from "./api"
import { nextStatus, taskLabel, TASKS } from "./options"
import { SettingsCard } from "./settings-card"
import { StatusCard } from "./status-card"
import { TasksCard } from "./tasks-card"
import type { PeriodConfig, PeriodSettings, TaskId } from "./types"

export function PeriodsView() {
  const dispatch = useAppDispatch()
  const period = useAppSelector((s) => s.periods.period)

  // Periods are set up a month ahead, so default to next month (client-only: depends on the clock).
  useEffect(() => {
    if (!period) dispatch(setPeriodsPeriod(shiftPeriod(currentPeriod(), 1)))
  }, [dispatch, period])

  if (!period) return <PeriodsSkeleton />
  return <PeriodsScreen period={period} />
}

function PeriodsSkeleton() {
  return (
    <FullHeightPage>
      <Skeleton className="h-8 w-72" />
      <Skeleton className="h-28 w-full rounded-xl" />
      <Skeleton className="flex-1 rounded-xl" />
    </FullHeightPage>
  )
}

type Confirm = { title: string; description: string; confirmLabel: string; run: () => void; destructive?: boolean }

function PeriodsScreen({ period }: { period: Period }) {
  const dispatch = useAppDispatch()
  const queryClient = useQueryClient()
  const { data } = useQuery(periodConfigQueryOptions(period))
  const refreshing = useIsFetching({ queryKey: periodKeys.all }) > 0

  // Unsaved form edits for this period (cleared when the period changes or after save).
  const key = periodKey(period)
  const [draft, setDraft] = useState<{ key: string; settings: PeriodSettings } | null>(null)
  const settings = draft?.key === key ? draft.settings : data?.settings
  const dirty = Boolean(data && draft?.key === key && JSON.stringify(draft.settings) !== JSON.stringify(data.settings))
  const [confirm, setConfirm] = useState<Confirm | null>(null)

  useEffect(() => {
    if (!dirty) return
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener("beforeunload", onBeforeUnload)
    return () => window.removeEventListener("beforeunload", onBeforeUnload)
  }, [dirty])

  const invalidate = () => queryClient.invalidateQueries({ queryKey: periodKeys.all })
  const fail = (title: string) => () => toast.add({ title, description: "Please try again.", type: "error" })

  const save = useMutation({
    mutationFn: saveSettings,
    onSuccess: async () => {
      await invalidate()
      setDraft(null)
      toast.add({ title: "Configuration saved", type: "success" })
    },
    onError: fail("Couldn't save configuration"),
  })
  const promotion = useMutation({
    mutationFn: promote,
    onSuccess: (next) => toast.add({ title: `Promoted to ${next.label.toLowerCase()}`, type: "success" }),
    onError: fail("Couldn't promote the period"),
    onSettled: invalidate,
  })
  const task = useMutation({
    mutationFn: runTask,
    onSuccess: (_, { task: id }) => toast.add({ title: `${taskLabel(id)} completed`, type: "success" }),
    onError: fail("Task failed"),
    onSettled: invalidate,
  })

  const changePeriod = (next: Period) => {
    const go = () => {
      setDraft(null)
      dispatch(setPeriodsPeriod(next))
    }
    if (!dirty) return go()
    setConfirm({
      title: "Discard unsaved changes?",
      description: `Your configuration changes for ${formatPeriod(period)} haven't been saved.`,
      confirmLabel: "Discard changes",
      destructive: true,
      run: go,
    })
  }

  const confirmPromote = (config: PeriodConfig) => {
    const next = nextStatus(config.status)!
    setConfirm({
      title: `Promote ${formatPeriod(period)} to ${next.label.toLowerCase()}?`,
      description: "The period moves to the next stage of its lifecycle. This is recorded in the logs.",
      confirmLabel: `Promote to ${next.label.toLowerCase()}`,
      run: () => promotion.mutate({ period }),
    })
  }

  const confirmTask = (id: TaskId) => {
    const def = TASKS.find((t) => t.id === id)!
    setConfirm({
      title: `${def.label} for ${formatPeriod(period)}?`,
      description: def.description,
      confirmLabel: def.label,
      run: () => task.mutate({ period, task: id }),
    })
  }

  return (
    <FullHeightPage className="gap-0 p-0 md:p-0">
      <HeaderActions>
        <PeriodStepper value={period} onChange={changePeriod} />
        <Button
          variant="outline"
          size="icon"
          aria-label="Refresh"
          title={`Reload ${formatPeriod(period)}`}
          disabled={refreshing}
          onClick={invalidate}
        >
          <RefreshCw className={cn(refreshing && "animate-spin")} />
        </Button>
      </HeaderActions>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {!data || !settings ? (
          <div className="grid gap-4 p-3 md:p-4 xl:grid-cols-[minmax(0,1fr)_400px]">
            <Skeleton className="h-[32rem] rounded-xl" />
            <Skeleton className="h-96 rounded-xl" />
          </div>
        ) : (
          <div className="grid items-start gap-4 p-3 md:p-4 xl:grid-cols-[minmax(0,1fr)_400px]">
            <div className="space-y-4">
              <StatusCard
                status={data.status}
                history={data.history}
                promoting={promotion.isPending}
                blockedReason={dirty ? "Save or reset your configuration changes first" : undefined}
                onPromote={() => confirmPromote(data)}
              />
              <SettingsCard
                period={period}
                value={settings}
                dirty={dirty}
                saving={save.isPending}
                onChange={(patch) => setDraft({ key, settings: { ...settings, ...patch } })}
                onReset={() => setDraft(null)}
                onSave={() => save.mutate({ period, settings })}
              />
            </div>
            <div className="xl:sticky xl:top-4">
              <TasksCard
                period={period}
                tasks={data.tasks}
                logs={data.logs}
                running={task.isPending ? (task.variables?.task ?? null) : null}
                onRun={confirmTask}
              />
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirm !== null}
        onOpenChange={(open) => !open && setConfirm(null)}
        title={confirm?.title ?? ""}
        description={confirm?.description ?? ""}
        confirmLabel={confirm?.confirmLabel}
        destructive={confirm?.destructive}
        onConfirm={() => confirm?.run()}
      />
    </FullHeightPage>
  )
}
