"use client"

import { useEffect, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Database, Download, Loader2, Save } from "lucide-react"

import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { FullHeightPage } from "@/components/common/page-layout"
import { PeriodStepper } from "@/components/common/period-stepper"
import {
  DataTable,
  DataTableColumnsMenu,
  DataTablePagination,
  DataTableSearch,
  useCellEdits,
  useDataTable,
  type EditMap,
} from "@/components/data-table"
import { HeaderActions } from "@/components/layout/header-actions"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/toast"
import { exportCsv } from "@/lib/export-csv"
import { comparePeriods, currentPeriod, formatPeriod, periodKey, type Period } from "@/lib/period"
import { cn } from "@/lib/utils"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { initIaSync, loadIaSync, setIaSegment, setIaSyncDraft } from "@/store/slices/ia-sync-slice"
import { iaSyncKeys, iaSyncQueryOptions, saveIaSync } from "./api"
import { IA_PINNED, iaSyncColumns } from "./columns"
import type { IaSegment, IaSyncRow } from "./types"

const EMPTY: IaSyncRow[] = []

const SEGMENTS: { value: IaSegment; label: string }[] = [
  { value: "business", label: "Business" },
  { value: "consumer", label: "Consumer" },
]

export function IaSyncView() {
  const dispatch = useAppDispatch()
  const { draft, loaded } = useAppSelector((s) => s.iaSync)

  // The current period depends on the clock, so it is set on the client.
  useEffect(() => {
    dispatch(initIaSync(currentPeriod()))
  }, [dispatch])

  if (!draft || !loaded) {
    return (
      <FullHeightPage>
        <Skeleton className="h-8 w-80" />
        <Skeleton className="h-8 w-full max-w-2xl" />
        <Skeleton className="flex-1 rounded-lg" />
      </FullHeightPage>
    )
  }
  return <IaSyncScreen draft={draft} loaded={loaded} />
}

function IaSyncScreen({ draft, loaded }: { draft: Period; loaded: Period }) {
  const dispatch = useAppDispatch()
  const queryClient = useQueryClient()
  const segment = useAppSelector((s) => s.iaSync.segment)

  const { data, isPending, isFetching, isPlaceholderData } = useQuery(iaSyncQueryOptions(loaded))
  const rows = data?.[segment] ?? EMPTY

  const { edits, changes, count, reset } = useCellEdits({ readOnly: isPlaceholderData })
  const [pending, setPending] = useState<{ run: () => void; count: number } | null>(null)

  const table = useDataTable({
    columns: iaSyncColumns,
    data: rows,
    getRowId: (row) => row.id,
    meta: { edits },
    initialState: { columnPinning: { start: IA_PINNED, end: [] } },
  })

  // Warn before leaving the page with unsaved edits.
  useEffect(() => {
    if (!count) return
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener("beforeunload", onBeforeUnload)
    return () => window.removeEventListener("beforeunload", onBeforeUnload)
  }, [count])

  /** Runs `run` now, or after confirming that unsaved edits will be lost. */
  const guard = (run: () => void) => (count ? setPending({ run, count }) : run())

  const save = useMutation({
    mutationFn: saveIaSync,
    onSuccess: ({ saved }) => {
      reset()
      toast.add({ title: "IA sync saved", description: `Updated ${saved} ${saved === 1 ? "rep" : "reps"}.`, type: "success" })
    },
    onError: () => toast.add({ title: "Couldn't save IA sync", description: "Please try again.", type: "error" }),
    onSettled: () => queryClient.invalidateQueries({ queryKey: iaSyncKeys.all }),
  })

  const stale = comparePeriods(draft, loaded) !== 0
  const syncValue = (r: IaSyncRow, key: "qube" | "ccrs") =>
    (changes[r.id]?.[`${key}.sync`] as boolean | undefined) ?? r[key].sync
  const flips = (key: "qube" | "ccrs") => rows.filter((r) => syncValue(r, key) !== r[key].current).length

  return (
    <FullHeightPage>
      <HeaderActions>
        {/* Which period to reconcile. */}
        <form
          className="flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            guard(() => {
              reset()
              dispatch(loadIaSync())
              // "Get data" on the same period re-fetches it.
              if (!stale) queryClient.invalidateQueries({ queryKey: iaSyncKeys.period(loaded) })
            })
          }}
        >
          <PeriodStepper value={draft} onChange={(p) => dispatch(setIaSyncDraft(p))} />
          <Button
            type="submit"
            variant={stale ? "default" : "outline"}
            disabled={isFetching && !stale}
            aria-label="Get data"
            title={stale ? `Showing ${formatPeriod(loaded)}. Load ${formatPeriod(draft)}.` : `Reload ${formatPeriod(loaded)}`}
          >
            {isFetching && !isPending ? <Loader2 className="animate-spin" /> : <Database />}
            <span className="hidden md:inline">Get data</span>
          </Button>
        </form>
        <Separator orientation="vertical" className="mx-1 hidden data-vertical:h-5 data-vertical:self-center sm:block" />
        {count > 0 && (
          <Button variant="ghost" onClick={reset} disabled={save.isPending}>
            Discard
          </Button>
        )}
        <Button
          aria-label="Save changes"
          disabled={count === 0 || save.isPending}
          onClick={() => save.mutate({ period: loaded, segment, changes: changes as EditMap })}
        >
          {save.isPending ? <Loader2 className="animate-spin" /> : <Save />}
          <span className="hidden sm:inline">Save changes</span>
          {count > 0 && <span className="rounded bg-primary-foreground/20 px-1 text-[11px] tabular-nums">{count}</span>}
        </Button>
      </HeaderActions>

      <div className="flex flex-wrap items-center gap-2">
        <Tabs
          value={segment}
          onValueChange={(v) =>
            guard(() => {
              reset()
              dispatch(setIaSegment(v as IaSegment))
            })
          }
        >
          <TabsList className="h-8">
            {SEGMENTS.map((s) => {
              const n = data?.[s.value].length
              return (
                <TabsTrigger key={s.value} value={s.value} className="px-3 text-[13px]">
                  {s.label}
                  {n !== undefined && (
                    <span
                      className={cn(
                        "rounded-full bg-muted-foreground/15 px-1.5 text-[11px] font-medium tabular-nums",
                        n === 0 && "opacity-60"
                      )}
                    >
                      {n}
                    </span>
                  )}
                </TabsTrigger>
              )
            })}
          </TabsList>
        </Tabs>
        <DataTableSearch table={table} placeholder="Search sales ID, name, alert…" />
        {rows.length > 0 && (
          <span className="hidden text-[13px] text-muted-foreground lg:inline">
            Will change: <span className="font-medium text-foreground tabular-nums">{flips("qube")}</span> in QUBE ·{" "}
            <span className="font-medium text-foreground tabular-nums">{flips("ccrs")}</span> in CCRS
          </span>
        )}
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="outline"
            disabled={!rows.length}
            onClick={() =>
              exportCsv(`ia-sync-${segment}-${periodKey(loaded)}.csv`, table.getPrePaginatedRowModel().rows.map((r) => r.original), [
                { header: "Sales ID", value: (r) => r.salesId },
                { header: "Name", value: (r) => r.name },
                { header: "Job code/title", value: (r) => r.jobTitle },
                { header: "Channel", value: (r) => r.channel },
                { header: "Market", value: (r) => r.market },
                { header: "QUBE current", value: (r) => (r.qube.current ? "Y" : "N") },
                { header: "QUBE sync", value: (r) => (syncValue(r, "qube") ? "Y" : "N") },
                { header: "CCRS current", value: (r) => (r.ccrs.current ? "Y" : "N") },
                { header: "CCRS sync", value: (r) => (syncValue(r, "ccrs") ? "Y" : "N") },
                { header: "Alert", value: (r) => r.alert },
                { header: "Proposed corrections", value: (r) => (changes[r.id]?.proposed as string | undefined) ?? r.proposed },
              ])
            }
          >
            <Download />
            <span className="hidden sm:inline">Export</span>
          </Button>
          <DataTableColumnsMenu table={table} />
        </div>
      </div>

      <DataTable
        fill
        table={table}
        isLoading={isPending}
        isFetching={isFetching}
        emptyMessage={`No ${segment} IA discrepancies for ${formatPeriod(loaded)}.`}
      />
      <DataTablePagination table={table} />

      <ConfirmDialog
        open={pending !== null}
        onOpenChange={(open) => !open && setPending(null)}
        title="Discard unsaved changes?"
        description={`You have ${pending?.count} unsaved ${pending?.count === 1 ? "change" : "changes"}. Switching will discard them.`}
        confirmLabel="Discard changes"
        destructive
        onConfirm={() => pending?.run()}
      />
    </FullHeightPage>
  )
}
