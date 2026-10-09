"use client"

import { CircleCheck, CircleDashed, Download, Info, OctagonX, TriangleAlert } from "lucide-react"

import { createDataTableColumnHelper, DataTableColumnHeader } from "@/components/data-table"
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
import { cn } from "@/lib/utils"
import { STAGE_EXPORTS, stageLabel } from "./options"
import type { DirectorStage, QuotaStage, Severity } from "./types"

const col = createDataTableColumnHelper<DirectorStage>()

const STAGE_ORDER: Record<QuotaStage, number> = { "not-started": 0, "in-progress": 1, submitted: 2, finalized: 3 }

const STAGE_DOT: Record<QuotaStage, string> = {
  "not-started": "bg-muted-foreground/40",
  "in-progress": "bg-sky-500",
  submitted: "bg-amber-500",
  finalized: "bg-emerald-500",
}

export function StageBadge({ stage }: { stage: QuotaStage }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span aria-hidden className={cn("size-1.5 rounded-full", STAGE_DOT[stage])} />
      {stageLabel(stage)}
    </span>
  )
}

/** Yes / no flag with an icon, so it reads without colour. */
function Flag({ on, label }: { on: boolean; label: string }) {
  return on ? (
    <span className="inline-flex items-center gap-1.5">
      <CircleCheck aria-hidden className="size-3.5 text-emerald-600 dark:text-emerald-400" />
      {label}
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 text-muted-foreground">
      <CircleDashed aria-hidden className="size-3.5" />
      No
    </span>
  )
}

const SEVERITY_STYLE: Record<Severity, { icon: typeof Info; className: string; label: string }> = {
  fatal: { icon: OctagonX, label: "Fatal", className: "border-destructive/30 bg-destructive/10 text-destructive" },
  warning: {
    icon: TriangleAlert,
    label: "Warning",
    className: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  },
  info: { icon: Info, label: "Info", className: "border-border bg-muted/50 text-muted-foreground" },
}

/** Fatal · Warning · Info counts; zero counts are left out. */
export function ValidationStats({ validation }: { validation: DirectorStage["validation"] }) {
  const items = (["fatal", "warning", "info"] as const).filter((s) => validation[s] > 0)
  if (!items.length) return <span className="text-muted-foreground">Clean</span>
  return (
    <span className="flex items-center gap-1">
      {items.map((s) => {
        const { icon: Icon, className, label } = SEVERITY_STYLE[s]
        return (
          <span
            key={s}
            title={`${validation[s]} ${label.toLowerCase()}`}
            className={cn("inline-flex h-5 items-center gap-1 rounded-md border px-1.5 text-xs font-medium tabular-nums", className)}
          >
            <Icon aria-hidden className="size-3" />
            <span className="sr-only">{label}</span>
            {validation[s]}
          </span>
        )
      })}
    </span>
  )
}

export function requestExport(kind: string, scope: string) {
  // TODO: call the export endpoint.
  toast.add({ title: `Export ${kind.toLowerCase()}`, description: `${scope} — export isn't connected yet.`, type: "info" })
}

const code = (id: "catalog" | "channel" | "area", title: string) =>
  col.accessor(id, {
    header: ({ header }) => <DataTableColumnHeader header={header} title={title} />,
    meta: { label: title },
    size: 80,
    cell: ({ getValue }) => <span className="font-mono text-xs">{getValue()}</span>,
  })

export const directorStageColumns = col.columns([
  col.accessor("approved", {
    header: ({ header }) => <DataTableColumnHeader header={header} title="Approved for load" />,
    meta: { label: "Approved for load" },
    size: 130,
    enableGlobalFilter: false,
    cell: ({ getValue }) => <Flag on={getValue()} label="Approved" />,
  }),
  col.accessor("executeLoad", {
    header: ({ header }) => <DataTableColumnHeader header={header} title="Execute load" />,
    meta: { label: "Execute load" },
    size: 116,
    enableGlobalFilter: false,
    cell: ({ getValue }) => <Flag on={getValue()} label="Set" />,
  }),
  code("catalog", "Catalog"),
  code("channel", "Channel"),
  code("area", "Area"),
  col.accessor("director", {
    header: ({ header }) => <DataTableColumnHeader header={header} title="Director" />,
    meta: { label: "Director", divider: true },
    size: 220,
    enableHiding: false,
    cell: ({ getValue }) => <span className="truncate font-medium">{getValue()}</span>,
  }),
  col.accessor("stage", {
    header: ({ header }) => <DataTableColumnHeader header={header} title="Stage" />,
    meta: { label: "Stage" },
    size: 140,
    sortFn: (a, b) => STAGE_ORDER[a.original.stage] - STAGE_ORDER[b.original.stage],
    cell: ({ getValue }) => <StageBadge stage={getValue()} />,
  }),
  col.accessor((d) => d.validation.fatal * 100 + d.validation.warning, {
    id: "validation",
    header: ({ header }) => <DataTableColumnHeader header={header} title="Validation" />,
    meta: { label: "Validation" },
    size: 170,
    enableGlobalFilter: false,
    cell: ({ row }) => <ValidationStats validation={row.original.validation} />,
  }),
  col.display({
    id: "actions",
    size: 56,
    enableHiding: false,
    meta: { align: "center" },
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label={`Export for ${row.original.director}`}
              className="text-muted-foreground"
              onClick={(e) => e.stopPropagation()}
            />
          }
        >
          <Download />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Export</DropdownMenuLabel>
            {STAGE_EXPORTS.map((e) => (
              <DropdownMenuItem key={e.id} onClick={() => requestExport(e.label, row.original.director)}>
                {e.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  }),
])
