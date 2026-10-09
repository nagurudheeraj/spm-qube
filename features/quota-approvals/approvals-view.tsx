"use client"

import { useEffect, useState } from "react"
import { useIsFetching, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { BadgeCheck, CircleCheck, Loader2, MoreHorizontal, RefreshCw, Undo2 } from "lucide-react"

import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { FullHeightPage } from "@/components/common/page-layout"
import { PeriodStepper } from "@/components/common/period-stepper"
import { HeaderActions } from "@/components/layout/header-actions"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/toast"
import { currentPeriod, formatPeriod, type Period } from "@/lib/period"
import { cn } from "@/lib/utils"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { setApprovalsChannel, setApprovalsPeriod } from "@/store/slices/approvals-slice"
import { approvalKeys, approvalsQueryOptions, setApproval } from "./api"
import { AreaCard, selectableIds } from "./area-card"
import { APPROVAL_CHANNELS } from "./options"
import type { AreaApprovals } from "./types"

const NO_AREAS: AreaApprovals[] = []

export function ApprovalsView() {
  const dispatch = useAppDispatch()
  const period = useAppSelector((s) => s.approvals.period)

  // The current period depends on the clock, so it is set on the client.
  useEffect(() => {
    if (!period) dispatch(setApprovalsPeriod(currentPeriod()))
  }, [dispatch, period])

  if (!period) {
    return (
      <FullHeightPage>
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-9 w-full max-w-4xl" />
        <Skeleton className="flex-1 rounded-lg" />
      </FullHeightPage>
    )
  }
  return <ApprovalsScreen period={period} />
}

function ApprovalsScreen({ period }: { period: Period }) {
  const dispatch = useAppDispatch()
  const queryClient = useQueryClient()
  const channel = useAppSelector((s) => s.approvals.channel)
  const { data, isPending } = useQuery(approvalsQueryOptions(period))
  const refreshing = useIsFetching({ queryKey: approvalKeys.all }) > 0

  // Selection belongs to one period + channel.
  const [selection, setSelection] = useState<{ key: string; ids: Set<string> }>({ key: "", ids: new Set() })
  const selectionKey = `${formatPeriod(period)}|${channel}`
  const selected = selection.key === selectionKey ? selection.ids : new Set<string>()
  const clear = () => setSelection({ key: selectionKey, ids: new Set() })
  const select = (ids: string[], on: boolean) => {
    const next = new Set(selected)
    for (const id of ids) {
      if (on) next.add(id)
      else next.delete(id)
    }
    setSelection({ key: selectionKey, ids: next })
  }

  const areas = data?.[channel] ?? NO_AREAS
  const directors = areas.flatMap((a) => a.directors)
  const chosen = directors.filter((d) => selected.has(d.id))
  const toApprove = chosen.filter((d) => d.status === "pending")
  const toRevoke = chosen.filter((d) => d.status === "approved")
  const selectable = areas.flatMap(selectableIds)
  const allSelected = selectable.length > 0 && selectable.every((id) => selected.has(id))

  const total = directors.length
  const approved = directors.filter((d) => d.status === "approved").length
  const loaded = directors.filter((d) => d.status === "loaded").length
  const pending = total - approved - loaded

  const [confirm, setConfirm] = useState(false)
  const mutation = useMutation({
    mutationFn: setApproval,
    onSuccess: ({ updated }, { approved: on }) => {
      clear()
      toast.add({
        title: on ? "Approved for load" : "Approval removed",
        description: `${updated} ${updated === 1 ? "director" : "directors"} updated.`,
        type: "success",
      })
    },
    onError: () => toast.add({ title: "Couldn't update approvals", description: "Please try again.", type: "error" }),
    onSettled: () => queryClient.invalidateQueries({ queryKey: approvalKeys.all }),
  })

  const plural = (n: number) => `${n} ${n === 1 ? "director" : "directors"}`
  const channelLabel = APPROVAL_CHANNELS.find((c) => c.id === channel)?.label ?? channel

  return (
    <FullHeightPage>
      {/* Period for every channel. */}
      <HeaderActions>
        <PeriodStepper value={period} onChange={(p) => dispatch(setApprovalsPeriod(p))} />
        <Button
          variant="outline"
          size="icon"
          aria-label="Refresh"
          title={`Reload ${formatPeriod(period)}`}
          disabled={refreshing}
          onClick={() => queryClient.invalidateQueries({ queryKey: approvalKeys.all })}
        >
          <RefreshCw className={cn(refreshing && "animate-spin")} />
        </Button>
      </HeaderActions>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border bg-card">
        {/* Channels; the badge is how many directors are still pending. */}
        <Tabs value={channel} onValueChange={(v) => dispatch(setApprovalsChannel(v as string))} className="shrink-0">
          <div className="overflow-x-auto border-b bg-muted/40 px-1.5 [scrollbar-width:none]">
            <TabsList variant="line" className="h-10 gap-0 p-0">
              {APPROVAL_CHANNELS.map((c) => {
                const left = data?.[c.id]?.flatMap((a) => a.directors).filter((d) => d.status === "pending").length
                return (
                  <TabsTrigger
                    key={c.id}
                    value={c.id}
                    className="h-10 flex-none rounded-none px-2.5 text-[13px] after:bottom-0! data-active:font-medium"
                  >
                    {c.label}
                    {left !== undefined &&
                      (left > 0 ? (
                        <span
                          title={`${left} pending`}
                          className="rounded-full bg-amber-500/15 px-1.5 text-[11px] font-medium text-amber-700 tabular-nums dark:text-amber-400"
                        >
                          {left}
                        </span>
                      ) : (
                        <CircleCheck aria-label="All approved" className="size-3.5! text-emerald-600 dark:text-emerald-400" />
                      ))}
                  </TabsTrigger>
                )
              })}
            </TabsList>
          </div>
        </Tabs>

        {/* Channel summary + actions. */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b px-4 py-3">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold">{channelLabel}</h2>
            <p className="text-[13px] text-muted-foreground">
              {isPending ? (
                "Loading…"
              ) : (
                <>
                  <span className={cn("font-medium tabular-nums", chosen.length ? "text-foreground" : "")}>{chosen.length}</span> of{" "}
                  {plural(selectable.length)} selected
                  {approved + loaded > 0 && <> · {approved + loaded} approved</>}
                  {pending > 0 && (
                    <>
                      {" "}
                      · <span className="font-medium text-amber-700 dark:text-amber-400">{pending} not approved</span>
                    </>
                  )}
                </>
              )}
            </p>
          </div>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            {/* Legacy "All Areas": select / clear every director in the channel. */}
            <Button
              variant="outline"
              disabled={!selectable.length || mutation.isPending}
              onClick={() => select(selectable, !allSelected)}
              aria-pressed={allSelected}
              className={cn(allSelected && "border-primary/40 bg-primary/10 hover:bg-primary/15")}
            >
              <Checkbox
                tabIndex={-1}
                aria-hidden
                checked={allSelected}
                indeterminate={chosen.length > 0 && !allSelected}
                className="pointer-events-none"
              />
              All areas
            </Button>
            {chosen.length > 0 && (
              <Button variant="ghost" className="text-muted-foreground" onClick={clear}>
                Clear
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="outline" size="icon" aria-label="More actions" />}>
                <MoreHorizontal />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-auto min-w-52 [&_[role=menuitem]]:whitespace-nowrap">
                <DropdownMenuItem
                  disabled={!toRevoke.length || mutation.isPending}
                  onClick={() => mutation.mutate({ period, ids: toRevoke.map((d) => d.id), approved: false })}
                >
                  <Undo2 />
                  Remove approval
                  {toRevoke.length > 0 && <span className="ml-auto pl-4 text-xs tabular-nums opacity-70">{toRevoke.length}</span>}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              disabled={!toApprove.length || mutation.isPending}
              onClick={() => setConfirm(true)}
              title={chosen.length && !toApprove.length ? "Everyone selected is already approved" : undefined}
            >
              {mutation.isPending && mutation.variables?.approved ? <Loader2 className="animate-spin" /> : <BadgeCheck />}
              Approve for load
              {toApprove.length > 0 && (
                <span className="rounded bg-primary-foreground/20 px-1 text-[11px] tabular-nums">{toApprove.length}</span>
              )}
            </Button>
          </div>
        </div>

        {/* Areas. */}
        <div className="min-h-0 flex-1 overflow-y-auto bg-muted/20 p-4">
          {isPending ? (
            <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(min(100%,300px),1fr))]">
              {[0, 1].map((i) => (
                <Skeleton key={i} className="h-80 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid items-start gap-4 [grid-template-columns:repeat(auto-fill,minmax(min(100%,300px),1fr))]">
              {areas.map((area) => (
                <AreaCard key={area.id} area={area} selected={selected} onSelect={select} disabled={mutation.isPending} />
              ))}
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirm}
        onOpenChange={setConfirm}
        title={`Approve ${plural(toApprove.length)} for load?`}
        description={
          <>
            Their {channelLabel} quotas for {formatPeriod(period)} will be marked ready to load.
            {chosen.length > toApprove.length && ` ${plural(chosen.length - toApprove.length)} already approved will be skipped.`}
          </>
        }
        confirmLabel="Approve for load"
        onConfirm={() => mutation.mutate({ period, ids: toApprove.map((d) => d.id), approved: true })}
      />
    </FullHeightPage>
  )
}
