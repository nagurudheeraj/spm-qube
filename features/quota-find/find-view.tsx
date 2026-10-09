"use client"

import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import type { PaginationState, SortingState } from "@tanstack/react-table"
import { SearchCheck } from "lucide-react"

import { FullHeightPage } from "@/components/common/page-layout"
import { PlaceholderScreen } from "@/components/common/placeholder-screen"
import { DataTable, DataTablePagination, DataTableToolbar, useDataTable } from "@/components/data-table"
import { Checkbox } from "@/components/ui/checkbox"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { useMounted } from "@/hooks/use-mounted"
import { currentPeriod } from "@/lib/period"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { initDraft, setChannel, setSearchFor, submit, updateDraft } from "@/store/slices/find-slice"
import { findResultsQueryOptions } from "./api"
import { employeeResultColumns, FIND_PINNED } from "./columns"
import { FindSearchBar } from "./find-search-bar"
import { searchType } from "./options"
import type { EmployeeResult, FindCriteria } from "./types"

const EMPTY: EmployeeResult[] = []

export function FindView() {
  const dispatch = useAppDispatch()
  const { draft, submitted } = useAppSelector((s) => s.find)
  // Defaults depend on today's date, so they're only read on the client.
  const mounted = useMounted()
  const currentYear = mounted ? currentPeriod().year : null

  useEffect(() => {
    const now = currentPeriod()
    dispatch(initDraft({ year: now.year, period: now.month + 1 }))
  }, [dispatch])

  if (!draft || currentYear === null) {
    return (
      <FullHeightPage>
        <Skeleton className="h-8 w-full max-w-3xl" />
        <Skeleton className="h-7 w-full max-w-xl" />
        <Skeleton className="flex-1 rounded-lg" />
      </FullHeightPage>
    )
  }

  return (
    <FullHeightPage>
      <FindSearchBar
        draft={draft}
        currentYear={currentYear}
        onChange={(patch) => dispatch(updateDraft(patch))}
        onSearchForChange={(value) => dispatch(setSearchFor(value))}
        onChannelChange={(value) => dispatch(setChannel(value))}
        onSubmit={() => dispatch(submit())}
      />
      {!submitted ? (
        <Empty className="flex-1 rounded-lg border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <SearchCheck strokeWidth={1.75} />
            </EmptyMedia>
            <EmptyTitle className="text-sm">Find quota records</EmptyTitle>
            <EmptyDescription className="text-[13px]">
              Search for an employee, store, agent or quota planner, then press Search.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : searchType(submitted.searchFor).ready ? (
        // A new search starts fresh: page 1, no sort, no result filter.
        <EmployeeResults key={JSON.stringify(submitted)} criteria={submitted} />
      ) : (
        <PlaceholderScreen
          title={`${searchType(submitted.searchFor).label} results aren't built yet`}
          description="Employee search is available now."
        />
      )}
    </FullHeightPage>
  )
}

/** Server-paged results: page, sort and filter are sent to the server via the query key. */
function EmployeeResults({ criteria }: { criteria: FindCriteria }) {
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 50 })
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState("")
  const filter = useDebouncedValue(globalFilter)

  const { data, isPending, isFetching } = useQuery(
    findResultsQueryOptions({
      criteria,
      pageIndex: pagination.pageIndex,
      pageSize: pagination.pageSize,
      sorting,
      filter,
    })
  )

  const table = useDataTable({
    columns: employeeResultColumns,
    data: data?.rows ?? EMPTY,
    rowCount: data?.total ?? 0,
    getRowId: (row) => row.id,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    state: { pagination, sorting, globalFilter },
    onPaginationChange: setPagination,
    onSortingChange: (updater) => {
      setSorting(updater)
      setPagination((p) => ({ ...p, pageIndex: 0 }))
    },
    onGlobalFilterChange: (value) => {
      setGlobalFilter(String(typeof value === "function" ? value(globalFilter) : value ?? ""))
      setPagination((p) => ({ ...p, pageIndex: 0 }))
    },
    initialState: {
      columnVisibility: { realSalesId: false },
      columnPinning: { start: FIND_PINNED, end: [] },
    },
  })

  const showRealSalesId = table.state.columnVisibility.realSalesId !== false

  return (
    <>
      <DataTableToolbar table={table} searchPlaceholder="Filter results…">
        <Label className="flex h-8 cursor-pointer items-center gap-2 px-1 text-[13px] font-normal text-muted-foreground">
          <Checkbox
            checked={showRealSalesId}
            onCheckedChange={(checked) => table.getColumn("realSalesId")?.toggleVisibility(Boolean(checked))}
          />
          Show real temporary sales ID
        </Label>
      </DataTableToolbar>
      <DataTable
        fill
        table={table}
        isLoading={isPending}
        isFetching={isFetching}
        emptyMessage="No matches. Try fewer fields, a partial term, or more periods."
      />
      <DataTablePagination table={table} />
    </>
  )
}
