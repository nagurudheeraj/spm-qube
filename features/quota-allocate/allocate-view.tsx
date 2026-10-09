"use client"

import { useEffect, useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ChevronDown, Download, FileSpreadsheet, FileText, Loader2, Lock, MoreHorizontal, Plus, Trash2 } from "lucide-react"

import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { PlaceholderScreen } from "@/components/common/placeholder-screen"
import { FullHeightPage } from "@/components/common/page-layout"
import {
  DataTable,
  DataTablePagination,
  DataTableToolbar,
  useCellEdits,
  useDataTable,
} from "@/components/data-table"
import { HeaderActions } from "@/components/layout/header-actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/toast"
import { exportCsv } from "@/lib/export-csv"
import { currentPeriod, formatPeriod, periodKey, type Period } from "@/lib/period"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { setContext, setFilter, setPeriod } from "@/store/slices/allocate-slice"
import { ChannelPicker, ViewPicker } from "./allocate-context-picker"
import { AllocateFilterBar } from "./allocate-filter-bar"
import { findView } from "./catalog"
import { REPORT_EXPORTS } from "./options"
import { allocateKeys, removeUnassignedVaults, saveVaultChanges, vaultsQueryOptions } from "./api"
import { PINNED_COLUMNS, vaultColumns } from "./columns"
import type { AllocateFilters, TeamQuotaVault, VaultChanges, VaultsQuery } from "./types"

const EMPTY: TeamQuotaVault[] = []

export function AllocateView() {
  const dispatch = useAppDispatch()
  const { period, ...filters } = useAppSelector((s) => s.allocate)

  // The current period depends on the clock, so it is set on the client.
  useEffect(() => {
    if (!period) dispatch(setPeriod(currentPeriod()))
  }, [dispatch, period])

  if (!period) {
    return (
      <FullHeightPage>
        <Skeleton className="h-7 w-full max-w-3xl" />
        <Skeleton className="h-8 w-72" />
        <Skeleton className="flex-1 rounded-lg" />
      </FullHeightPage>
    )
  }
  return <AllocateScreen filters={filters} period={period} />
}

function AllocateScreen({ filters, period }: { filters: AllocateFilters; period: Period }) {
  const dispatch = useAppDispatch()
  const queryClient = useQueryClient()
  const query: VaultsQuery = useMemo(() => ({ ...filters, period }), [filters, period])

  const { channel: channelDef, view: viewDef } = findView(filters.catalog, filters.channel, filters.view)
  const vaultsQuery = useQuery({
    ...vaultsQueryOptions(query),
    enabled: Boolean(viewDef.ready),
  })
  const { isPending, isFetching, isPlaceholderData } = vaultsQuery
  // Views without a grid yet have no data (ignore any kept-previous placeholder).
  const data = viewDef.ready ? vaultsQuery.data : undefined
  const finalized = data?.status === "finalized"
  const vaults = data?.vaults ?? EMPTY

  const { edits, changes, count, reset } = useCellEdits({ readOnly: finalized || isPlaceholderData })
  // Action waiting on a "discard changes?" confirmation, with the count at the time it was requested.
  const [pending, setPending] = useState<{ run: () => void; count: number } | null>(null)
  const [confirmRemove, setConfirmRemove] = useState(false)

  const table = useDataTable({
    columns: vaultColumns,
    rowControl: "expand",
    data: vaults,
    getRowId: (row) => row.id,
    meta: { edits },
    initialState: { columnPinning: { start: PINNED_COLUMNS, end: [] } },
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

  const changeFilter = <K extends keyof AllocateFilters>(key: K, value: AllocateFilters[K]) =>
    guard(() => {
      reset()
      table.resetRowSelection(true)
      dispatch(setFilter({ key, value }))
    })

  const changeContext = (next: { catalog: string; channel: string; view?: string }) =>
    guard(() => {
      reset()
      table.resetRowSelection(true)
      dispatch(setContext(next))
    })

  const contextProps = {
    catalog: filters.catalog,
    channel: filters.channel,
    view: filters.view,
    onChange: changeContext,
  }

  const changePeriod = (next: Period) =>
    guard(() => {
      reset()
      table.resetRowSelection(true)
      dispatch(setPeriod(next))
    })

  const save = useMutation({
    mutationFn: saveVaultChanges,
    onSuccess: ({ saved }) => {
      reset()
      toast.add({ title: "Changes saved", description: `Updated ${saved} ${saved === 1 ? "vault" : "vaults"}.`, type: "success" })
    },
    onError: () => toast.add({ title: "Couldn't save changes", description: "Please try again.", type: "error" }),
    onSettled: () => queryClient.invalidateQueries({ queryKey: allocateKeys.all }),
  })

  const removeUnassigned = useMutation({
    mutationFn: removeUnassignedVaults,
    onSuccess: ({ removed }) => {
      table.resetRowSelection(true)
      toast.add({ title: `Removed ${removed} unassigned ${removed === 1 ? "vault" : "vaults"}`, type: "success" })
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: allocateKeys.all }),
  })

  const unassignedCount = vaults.filter((v) => !v.assigned).length

  const exportRows = () => {
    const selected = table.state.rowSelection
    const rows = Object.keys(selected).length
      ? vaults.filter((v) => selected[v.id])
      : table.getPrePaginatedRowModel().rows.map((r) => r.original)
    exportVaults(`team-quota-vaults-${periodKey(period)}.csv`, rows, changes)
  }

  return (
    <FullHeightPage>
      {viewDef.ready && (
        <HeaderActions>
          {data && (
            <Badge variant="outline" className="h-8 gap-1.5 px-2.5 font-normal" title={finalized ? "Finalized" : "Open"}>
              {finalized ? <Lock className="size-3" /> : <span className="size-1.5 rounded-full bg-emerald-500" />}
              <span className="hidden sm:inline">{finalized ? "Finalized" : "Open"}</span>
            </Badge>
          )}
          <Separator orientation="vertical" className="mx-1 hidden data-vertical:h-4 data-vertical:self-center sm:block" />
          {count > 0 && (
            <Button variant="ghost" onClick={reset} disabled={save.isPending}>
              Discard
            </Button>
          )}
          <Button
            disabled={count === 0 || save.isPending}
            onClick={() => save.mutate({ query, changes })}
          >
            {save.isPending && <Loader2 className="animate-spin" />}
            Save<span className="hidden sm:inline"> changes</span>
            {count > 0 && (
              <span className="rounded bg-primary-foreground/20 px-1 text-[11px] tabular-nums">{count}</span>
            )}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="outline" size="icon" aria-label="More actions" />}>
              <MoreHorizontal />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-auto min-w-56 [&_[role=menuitem]]:whitespace-nowrap">
              <DropdownMenuItem
                disabled={finalized}
                onClick={() => toast.add({ title: "Add descriptor", description: "Coming soon.", type: "info" })}
              >
                <Plus />
                Add descriptor
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                disabled={finalized || unassignedCount === 0 || count > 0}
                onClick={() => setConfirmRemove(true)}
              >
                <Trash2 />
                Remove unassigned vaults
                {unassignedCount > 0 && <span className="ml-auto pl-4 text-xs tabular-nums opacity-70">{unassignedCount}</span>}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </HeaderActions>
      )}

      <AllocateFilterBar
        leading={<ChannelPicker {...contextProps} />}
        view={viewDef}
        filters={filters}
        period={period}
        onFilterChange={changeFilter}
        onPeriodChange={changePeriod}
      />

      {viewDef.ready ? (
        <>
          <DataTableToolbar
            table={table}
            leading={<ViewPicker {...contextProps} />}
            searchPlaceholder={`Search ${viewDef.label.toLowerCase()}…`}
            end={
              <DropdownMenu>
                <DropdownMenuTrigger render={<Button variant="outline" aria-label="Export" />}>
                  <Download />
                  <span className="hidden sm:inline">Export</span>
                  <ChevronDown className="text-muted-foreground" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-60">
                  <DropdownMenuItem onClick={exportRows} disabled={!vaults.length}>
                    <FileSpreadsheet />
                    Current grid (CSV)
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>Reports</DropdownMenuLabel>
                    {REPORT_EXPORTS.map((report) => (
                      <DropdownMenuItem
                        key={report.id}
                        onClick={() =>
                          toast.add({ title: report.label, description: "Report export isn't connected yet.", type: "info" })
                        }
                      >
                        <FileText />
                        {report.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            }
          />
          <DataTable
            fill
            table={table}
            isLoading={isPending}
            isFetching={isFetching}
            rowHeight={44}
            emptyMessage="No vaults for these filters."
            // TODO: vault details. Empty panel until the content is defined.
            renderExpanded={() => <div className="h-24" />}
          />
          <DataTablePagination table={table} />
        </>
      ) : (
        <>
          <div className="flex items-center gap-2">
            <ViewPicker {...contextProps} />
          </div>
          <PlaceholderScreen
            title={`${viewDef.label} isn't built yet`}
            description={`The ${channelDef.label} · ${viewDef.label} grid will appear here.`}
          />
        </>
      )}

      <ConfirmDialog
        open={pending !== null}
        onOpenChange={(open) => !open && setPending(null)}
        title="Discard unsaved changes?"
        description={`You have ${pending?.count} unsaved ${pending?.count === 1 ? "change" : "changes"}. Switching will discard them.`}
        confirmLabel="Discard changes"
        destructive
        onConfirm={() => pending?.run()}
      />

      <ConfirmDialog
        open={confirmRemove}
        onOpenChange={setConfirmRemove}
        title={`Remove ${unassignedCount} unassigned ${unassignedCount === 1 ? "vault" : "vaults"}?`}
        description={`Vaults without an assigned rep will be removed from ${formatPeriod(period)}. This can't be undone.`}
        confirmLabel="Remove vaults"
        destructive
        onConfirm={() => removeUnassigned.mutate({ query })}
      />
    </FullHeightPage>
  )
}

function exportVaults(filename: string, rows: TeamQuotaVault[], changes: VaultChanges) {
  exportCsv(filename, rows, [
    { header: "Team quota vault", value: (v) => v.name },
    { header: "Compensation plan", value: (v) => v.compPlan },
    ...[0, 1, 2].flatMap((i) => [
      { header: `Component ${i + 1} metric`, value: (v: TeamQuotaVault) => v.components[i].metric },
      { header: `Component ${i + 1} weight`, value: (v: TeamQuotaVault) => v.components[i].weight },
      {
        header: `Component ${i + 1} target`,
        value: (v: TeamQuotaVault) => (changes[v.id]?.[`c${i}.target`] as number | undefined) ?? v.components[i].target,
      },
    ]),
    { header: "F/T", value: (v) => v.ft },
    { header: "Notes", value: (v) => (changes[v.id]?.notes as string | undefined) ?? v.notes },
  ])
}
