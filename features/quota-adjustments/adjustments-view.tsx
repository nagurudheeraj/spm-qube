"use client"

import { useQuery } from "@tanstack/react-query"
import { Plus, RotateCcw } from "lucide-react"

import { FullHeightPage } from "@/components/common/page-layout"
import {
  DataTable,
  DataTableColumnsMenu,
  DataTablePagination,
  DataTableSearch,
  useDataTable,
} from "@/components/data-table"
import { HeaderActions } from "@/components/layout/header-actions"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { resetAdjustments, submitAdjustments, updateAdjustmentsDraft } from "@/store/slices/adjustments-slice"
import { AdjustmentsSearchBar } from "./adjustments-search-bar"
import { adjustmentsQueryOptions } from "./api"
import { adjustmentColumns } from "./columns"
import type { Adjustment, AdjustmentCriteria } from "./types"

const EMPTY: Adjustment[] = []

export function AdjustmentsView() {
  const dispatch = useAppDispatch()
  const { draft, submitted } = useAppSelector((s) => s.adjustments)
  const dirty = JSON.stringify(draft) !== JSON.stringify(submitted)

  return (
    <FullHeightPage>
      <HeaderActions>
        <Button
          // TODO: new-adjustment flow.
          onClick={() => toast.add({ title: "New adjustment", description: "Coming soon.", type: "info" })}
        >
          <Plus />
          New<span className="hidden sm:inline"> adjustment</span>
        </Button>
      </HeaderActions>

      <AdjustmentsSearchBar
        draft={draft}
        dirty={dirty}
        onChange={(patch) => dispatch(updateAdjustmentsDraft(patch))}
        onSubmit={() => dispatch(submitAdjustments())}
      />

      {/* A new search starts fresh: no sort, no result filter. */}
      <AdjustmentResults key={JSON.stringify(submitted)} criteria={submitted} onReset={() => dispatch(resetAdjustments())} />
    </FullHeightPage>
  )
}

function AdjustmentResults({ criteria, onReset }: { criteria: AdjustmentCriteria; onReset: () => void }) {
  const { data, isPending, isFetching } = useQuery(adjustmentsQueryOptions(criteria))
  const rows = data ?? EMPTY

  const table = useDataTable({
    columns: adjustmentColumns,
    data: rows,
    getRowId: (row) => row.id,
    initialState: { sorting: [{ id: "created", desc: true }] },
  })

  const shown = table.getPrePaginatedRowModel().rows.length
  const filtering = Boolean(table.state.globalFilter)

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <DataTableSearch table={table} placeholder="Filter description, reason, reference…" />
        <span className="text-[13px] text-muted-foreground">
          {isPending ? (
            "Searching…"
          ) : (
            <>
              {filtering && <span className="tabular-nums">{shown} of </span>}
              <span className="font-medium text-foreground tabular-nums">{rows.length}</span>{" "}
              {rows.length === 1 ? "adjustment" : "adjustments"}
            </>
          )}
        </span>
        <div className="ml-auto flex items-center gap-2">
          <DataTableColumnsMenu table={table} />
        </div>
      </div>
      <DataTable
        fill
        table={table}
        isLoading={isPending}
        isFetching={isFetching}
        emptyMessage={
          filtering ? "No adjustments match this filter." : "No adjustments for these criteria. Try more stages, all periods, or another channel."
        }
      />
      {!isPending && rows.length === 0 && (
        <div className="-mt-1 flex justify-center">
          <Button variant="ghost" onClick={onReset}>
            <RotateCcw />
            Reset to defaults
          </Button>
        </div>
      )}
      <DataTablePagination table={table} />
    </>
  )
}
