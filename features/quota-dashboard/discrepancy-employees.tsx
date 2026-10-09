"use client"

import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Download, Play, Search, TriangleAlert, UserSearch } from "lucide-react"

import {
  createDataTableColumnHelper,
  DataTable,
  DataTableColumnHeader,
  DataTableColumnsMenu,
  useDataTable,
} from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { exportCsv } from "@/lib/export-csv"
import { formatPeriod, periodKey, type Period } from "@/lib/period"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { runDiscrepancyQuery } from "@/store/slices/dashboard-slice"
import { discrepancyEmployeesQueryOptions } from "./api"
import { DISCREPANCY_VIEWS } from "./options"
import type { DiscrepancyEmployee, EmployeeDiscrepancyView } from "./types"

const col = createDataTableColumnHelper<DiscrepancyEmployee>()

const text = (id: keyof DiscrepancyEmployee, title: string, size: number, mono = false) =>
  col.accessor(id, {
    header: ({ header }) => <DataTableColumnHeader header={header} title={title} />,
    meta: { label: title },
    size,
    cell: ({ getValue }) => <span className={mono ? "font-mono text-xs" : "truncate"}>{getValue()}</span>,
  })

const COLUMNS = col.columns([
  text("hrNumber", "HR number", 112, true),
  text("salesId", "Sales ID", 104, true),
  col.accessor("name", {
    header: ({ header }) => <DataTableColumnHeader header={header} title="Name" />,
    meta: { label: "Name" },
    size: 200,
    enableHiding: false,
    cell: ({ getValue }) => <span className="truncate font-medium">{getValue()}</span>,
  }),
  text("jobTitle", "Job title", 220),
  text("compPlan", "Compensation plan", 180),
  text("locale", "Locale", 112, true),
  col.accessor("ccrsAlert", {
    header: ({ header }) => <DataTableColumnHeader header={header} title="CCRS alert" />,
    meta: { label: "CCRS alert" },
    size: 240,
    cell: ({ getValue }) => (
      <span className="inline-flex min-w-0 items-center gap-1.5 text-amber-700 dark:text-amber-400">
        <TriangleAlert aria-hidden className="size-3.5 shrink-0" />
        <span className="truncate">{getValue()}</span>
      </span>
    ),
  }),
])

const EMPTY: DiscrepancyEmployee[] = []

/** Search box + Run query, then the matching employees. Shared by the three employee lists. */
export function DiscrepancyEmployees({ view, period }: { view: EmployeeDiscrepancyView; period: Period }) {
  const dispatch = useAppDispatch()
  const submitted = useAppSelector((s) => s.dashboard.discrepancies.queries[view])
  const [term, setTerm] = useState(submitted ?? "")
  const def = DISCREPANCY_VIEWS.find((v) => v.value === view)!

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <form
        className="flex flex-wrap items-center gap-2 px-4 pb-3"
        onSubmit={(e) => {
          e.preventDefault()
          dispatch(runDiscrepancyQuery({ view, term: term.trim() }))
        }}
      >
        <p className="mr-auto w-full text-[13px] text-muted-foreground sm:w-auto">{def.description}</p>
        <InputGroup className="h-8 w-full sm:w-64">
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupInput
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="HR number, sales ID, name…"
            aria-label="Search"
          />
        </InputGroup>
        <Button type="submit">
          <Play />
          Run query
        </Button>
      </form>

      {submitted === undefined ? (
        <Empty className="mx-4 mb-4 flex-1 rounded-lg border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <UserSearch strokeWidth={1.75} />
            </EmptyMedia>
            <EmptyTitle className="text-sm">Run a query to see {def.label.toLowerCase()}</EmptyTitle>
            <EmptyDescription className="text-[13px]">
              Leave the search empty to list everyone for {formatPeriod(period)}.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <Results view={view} period={period} term={submitted} label={def.label} />
      )}
    </div>
  )
}

function Results({ view, period, term, label }: { view: EmployeeDiscrepancyView; period: Period; term: string; label: string }) {
  const query = useMemo(() => ({ view, period, term }), [view, period, term])
  const { data, isPending, isFetching } = useQuery(discrepancyEmployeesQueryOptions(query))
  const rows = data ?? EMPTY

  const table = useDataTable({
    columns: COLUMNS,
    data: rows,
    getRowId: (row) => row.id,
    initialState: { columnPinning: { start: ["hrNumber"], end: [] } },
  })

  return (
    <>
      <div className="flex items-center gap-2 border-t px-4 py-2">
        <p className="mr-auto text-[13px] text-muted-foreground">
          {isPending ? (
            "Loading…"
          ) : (
            <>
              <span className="font-medium text-foreground tabular-nums">{rows.length}</span>{" "}
              {rows.length === 1 ? "employee" : "employees"}
              {term && (
                <>
                  {" "}
                  matching “<span className="text-foreground">{term}</span>”
                </>
              )}
            </>
          )}
        </p>
        <Button
          variant="outline"
          disabled={!rows.length}
          onClick={() =>
            exportCsv(`${view}-${periodKey(period)}.csv`, rows, [
              { header: "HR number", value: (r) => r.hrNumber },
              { header: "Sales ID", value: (r) => r.salesId },
              { header: "Name", value: (r) => r.name },
              { header: "Job title", value: (r) => r.jobTitle },
              { header: "Compensation plan", value: (r) => r.compPlan },
              { header: "Locale", value: (r) => r.locale },
              { header: "CCRS alert", value: (r) => r.ccrsAlert },
            ])
          }
        >
          <Download />
          <span className="hidden sm:inline">Export</span>
        </Button>
        <DataTableColumnsMenu table={table} />
      </div>
      <DataTable
        fill
        table={table}
        isLoading={isPending}
        isFetching={isFetching}
        className="rounded-none border-x-0 border-b-0"
        emptyMessage={term ? `No ${label.toLowerCase()} match “${term}”.` : `No ${label.toLowerCase()} for ${formatPeriod(period)}.`}
      />
    </>
  )
}
