"use client"

import { useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { BadgeCheck, ChevronDown, Download, Loader2, MoreHorizontal, Play, Undo2, X } from "lucide-react"

import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { FilterSelect } from "@/components/common/filter-select"
import { MultiSelectFilter } from "@/components/common/multi-select-filter"
import { DataTable, DataTableColumnsMenu, DataTableSearch, useDataTable } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/toast"
import { ChannelPicker } from "@/features/quota-allocate/allocate-context-picker"
import { formatPeriod, type Period } from "@/lib/period"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { updateStageFilters } from "@/store/slices/dashboard-slice"
import { dashboardKeys, quotaStageQueryOptions, setLoadFlag, type SetFlagInput } from "./api"
import { directorStageColumns, requestExport } from "./columns"
import { DashboardPanel } from "./dashboard-panel"
import { AREAS, dashboardTab, SEVERITIES, STAGE_EXPORTS, STAGES } from "./options"
import type { DirectorStage, QuotaStage, QuotaStageQuery, Severity } from "./types"

const EMPTY: DirectorStage[] = []

type PendingAction = { title: string; description: React.ReactNode; confirmLabel: string; input: SetFlagInput }

/** Directors' quota stage for the period, with validation results and load approval. */
export function QuotaStageTab({ period }: { period: Period }) {
  const dispatch = useAppDispatch()
  const queryClient = useQueryClient()
  const filters = useAppSelector((s) => s.dashboard.stage)
  const query: QuotaStageQuery = useMemo(() => ({ ...filters, period }), [filters, period])

  const { data, isPending, isFetching } = useQuery(quotaStageQueryOptions(query))
  const rows = data ?? EMPTY
  const [pending, setPending] = useState<PendingAction | null>(null)

  const table = useDataTable({
    columns: directorStageColumns,
    rowControl: "select",
    data: rows,
    getRowId: (row) => row.id,
    initialState: { columnPinning: { start: [], end: ["actions"] } },
  })

  const setFilters = (patch: Partial<typeof filters>) => {
    table.resetRowSelection(true)
    dispatch(updateStageFilters(patch))
  }

  const flag = useMutation({
    mutationFn: setLoadFlag,
    onSuccess: ({ updated }, { flag, value }) => {
      table.resetRowSelection(true)
      const what = flag === "approved" ? (value ? "Approved for load" : "Approval removed") : value ? "Execute load set" : "Execute load cleared"
      toast.add({ title: what, description: `${updated} ${updated === 1 ? "director" : "directors"} updated.`, type: "success" })
    },
    onError: () => toast.add({ title: "Couldn't update directors", description: "Please try again.", type: "error" }),
    onSettled: () => queryClient.invalidateQueries({ queryKey: dashboardKeys.all }),
  })

  const selected = rows.filter((r) => table.state.rowSelection[r.id])
  // Only finalized quotas can be approved, and only approved ones can be loaded.
  const approvable = selected.filter((r) => r.stage === "finalized" && !r.approved)
  const loadable = selected.filter((r) => r.approved && !r.executeLoad)
  const withFatal = approvable.filter((r) => r.validation.fatal > 0)

  const plural = (n: number) => `${n} ${n === 1 ? "director" : "directors"}`

  const confirmApprove = () =>
    setPending({
      title: `Approve ${plural(approvable.length)} for load?`,
      confirmLabel: "Approve for load",
      description: (
        <>
          Their {formatPeriod(period)} quotas will be marked ready to load.
          {approvable.length < selected.length && ` ${plural(selected.length - approvable.length)} not finalized or already approved will be skipped.`}
          {withFatal.length > 0 && (
            <span className="mt-2 block font-medium text-destructive">
              {plural(withFatal.length)} still {withFatal.length === 1 ? "has" : "have"} fatal validation errors:{" "}
              {withFatal.map((r) => r.director).join("; ")}.
            </span>
          )}
        </>
      ),
      input: { query, ids: approvable.map((r) => r.id), flag: "approved", value: true },
    })

  const confirmLoad = () =>
    setPending({
      title: `Set execute load for ${plural(loadable.length)}?`,
      confirmLabel: "Set execute load",
      description: (
        <>
          Their quotas will be included in the next {formatPeriod(period)} load.
          {loadable.length < selected.length && ` ${plural(selected.length - loadable.length)} not approved or already set will be skipped.`}
        </>
      ),
      input: { query, ids: loadable.map((r) => r.id), flag: "executeLoad", value: true },
    })

  const exportScope = selected.length ? plural(selected.length) : `All ${plural(rows.length)}`
  const filtered = filters.stages.length > 0 || filters.severities.length > 0
  const tab = dashboardTab("quota-stage")

  return (
    <DashboardPanel
      icon={tab.icon}
      title={tab.label}
      description={tab.description}
      actions={
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="outline" />}>
            <Download />
            Export
            <ChevronDown className="text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuGroup>
              <DropdownMenuLabel>{exportScope}</DropdownMenuLabel>
              {STAGE_EXPORTS.map((e) => (
                <DropdownMenuItem key={e.id} disabled={!rows.length} onClick={() => requestExport(e.label, exportScope)}>
                  {e.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      }
      toolbar={
        <>
          <ChannelPicker
            catalog={filters.catalog}
            channel={filters.channel}
            view=""
            onChange={({ catalog, channel }) => setFilters({ catalog, channel })}
          />
          <FilterSelect label="Area" value={filters.area} options={AREAS} onChange={(area) => setFilters({ area })} />
          <MultiSelectFilter
            label="Stage"
            options={STAGES}
            value={filters.stages}
            onChange={(v) => setFilters({ stages: v as QuotaStage[] })}
            summarize={(s) => (s.length === 0 || s.length === STAGES.length ? "All" : s.length <= 2 ? s.map((o) => o.label).join(", ") : `${s.length} selected`)}
          />
          <MultiSelectFilter
            label="Validation"
            options={SEVERITIES}
            value={filters.severities}
            onChange={(v) => setFilters({ severities: v as Severity[] })}
            summarize={(s) => (s.length === 0 ? "Any" : s.map((o) => o.label).join(", "))}
          />
          {filtered && (
            <Button variant="ghost" className="text-muted-foreground" onClick={() => setFilters({ stages: [], severities: [] })}>
              <X />
              Clear
            </Button>
          )}
          <div className="ml-auto flex items-center gap-2">
            <DataTableSearch table={table} placeholder="Search directors…" className="sm:w-56" />
            <DataTableColumnsMenu table={table} />
          </div>
        </>
      }
      footer={
        <>
          <div className="mr-auto flex items-center gap-1 text-[13px] text-muted-foreground">
            {selected.length ? (
              <>
                <span className="font-medium text-foreground tabular-nums">{selected.length}</span> of {plural(rows.length)} selected
                <Button variant="ghost" size="xs" className="text-muted-foreground" onClick={() => table.resetRowSelection(true)}>
                  Clear
                </Button>
              </>
            ) : (
              <span>Select directors to approve them for load or set the execute-load flag.</span>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" size="icon" aria-label="More actions" disabled={!selected.length} />}>
              <MoreHorizontal />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-auto min-w-52 [&_[role=menuitem]]:whitespace-nowrap">
              <DropdownMenuItem
                disabled={!selected.some((r) => r.approved) || flag.isPending}
                onClick={() =>
                  flag.mutate({ query, ids: selected.filter((r) => r.approved).map((r) => r.id), flag: "approved", value: false })
                }
              >
                <Undo2 />
                Remove approval
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={!selected.some((r) => r.executeLoad) || flag.isPending}
                onClick={() =>
                  flag.mutate({ query, ids: selected.filter((r) => r.executeLoad).map((r) => r.id), flag: "executeLoad", value: false })
                }
              >
                <Undo2 />
                Clear execute load
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="outline"
            disabled={!loadable.length || flag.isPending}
            onClick={confirmLoad}
            title={selected.length && !loadable.length ? "Select approved directors without the execute-load flag" : undefined}
          >
            {flag.isPending && flag.variables?.flag === "executeLoad" ? <Loader2 className="animate-spin" /> : <Play />}
            Set execute load
            {loadable.length > 0 && <span className="rounded bg-muted px-1 text-[11px] tabular-nums">{loadable.length}</span>}
          </Button>
          <Button
            disabled={!approvable.length || flag.isPending}
            onClick={confirmApprove}
            title={selected.length && !approvable.length ? "Select finalized directors that aren't approved yet" : undefined}
          >
            {flag.isPending && flag.variables?.flag === "approved" ? <Loader2 className="animate-spin" /> : <BadgeCheck />}
            Approve for load
            {approvable.length > 0 && (
              <span className="rounded bg-primary-foreground/20 px-1 text-[11px] tabular-nums">{approvable.length}</span>
            )}
          </Button>
        </>
      }
    >
      <DataTable
        fill
        table={table}
        isLoading={isPending}
        isFetching={isFetching}
        className="rounded-none border-x-0 border-b-0"
        emptyMessage={filtered ? "No directors match these filters." : `No directors for ${formatPeriod(period)}.`}
      />

      <ConfirmDialog
        open={pending !== null}
        onOpenChange={(open) => !open && setPending(null)}
        title={pending?.title ?? ""}
        description={pending?.description}
        confirmLabel={pending?.confirmLabel}
        onConfirm={() => pending && flag.mutate(pending.input)}
      />
    </DashboardPanel>
  )
}
