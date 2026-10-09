"use client"

import { useMutation } from "@tanstack/react-query"
import { FileSpreadsheet, Loader2 } from "lucide-react"

import { MultiSelectFilter } from "@/components/common/multi-select-filter"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/toast"
import { formatPeriod, type Period } from "@/lib/period"
import { cn } from "@/lib/utils"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { updateDiscrepancyFilters } from "@/store/slices/dashboard-slice"
import { generateDiscrepancyReports } from "./api"
import { DashboardPanel } from "./dashboard-panel"
import { DiscrepancyEmployees } from "./discrepancy-employees"
import { CHANNEL_OPTIONS, dashboardTab, DISCREPANCY_REPORTS, DISCREPANCY_VIEWS } from "./options"
import type { DiscrepancyFilters, DiscrepancyReport, DiscrepancyView, EmployeeDiscrepancyView } from "./types"

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`

/** Discrepancies: report generation plus three employee lists, as sub-tabs. */
export function DiscrepanciesTab({ period }: { period: Period }) {
  const dispatch = useAppDispatch()
  const filters = useAppSelector((s) => s.dashboard.discrepancies)
  const update = (patch: Partial<DiscrepancyFilters>) => dispatch(updateDiscrepancyFilters(patch))
  const tab = dashboardTab("discrepancies")

  const generate = useMutation({
    mutationFn: generateDiscrepancyReports,
    onSuccess: ({ queued }) =>
      toast.add({
        title: `${plural(queued, "report")} queued`,
        description: "You'll find them in Manage → Report Queue when they're ready.",
        type: "success",
      }),
    onError: () => toast.add({ title: "Couldn't queue reports", description: "Please try again.", type: "error" }),
  })

  const { reports, channels } = filters
  const missing = !reports.length ? "Choose at least one report" : !channels.length ? "Choose at least one channel" : null

  return (
    <Tabs
      value={filters.view}
      onValueChange={(view) => update({ view: view as DiscrepancyView })}
      className="min-h-0 flex-1 gap-0"
    >
      <DashboardPanel
        icon={tab.icon}
        title={tab.label}
        description={tab.description}
        toolbar={
          <div className="-mx-1 max-w-full overflow-x-auto px-1 [scrollbar-width:none]">
            <TabsList aria-label="Discrepancy views">
              {DISCREPANCY_VIEWS.map((v) => (
                <TabsTrigger key={v.value} value={v.value} className="flex-none px-3 text-[13px]">
                  {v.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        }
        footer={
          filters.view === "reports" ? (
            <>
              <p className="mr-auto text-[13px] text-muted-foreground">
                {missing ?? (
                  <>
                    <span className="font-medium text-foreground">{plural(reports.length, "report")}</span> for{" "}
                    <span className="font-medium text-foreground">{plural(channels.length, "channel")}</span> ·{" "}
                    {formatPeriod(period)}
                  </>
                )}
              </p>
              <Button
                disabled={Boolean(missing) || generate.isPending}
                title={missing ?? undefined}
                onClick={() => generate.mutate({ period, reports, channels })}
              >
                {generate.isPending ? <Loader2 className="animate-spin" /> : <FileSpreadsheet />}
                Generate {reports.length > 1 ? "reports" : "report"}
              </Button>
            </>
          ) : undefined
        }
      >
        <TabsContent value="reports" className="flex min-h-0 flex-col overflow-y-auto">
          <ReportsForm
            reports={reports}
            channels={channels}
            onReportsChange={(next) => update({ reports: next })}
            onChannelsChange={(next) => update({ channels: next })}
          />
        </TabsContent>
        {DISCREPANCY_VIEWS.filter((v) => v.value !== "reports").map((v) => (
          <TabsContent key={v.value} value={v.value} className="flex min-h-0 flex-col">
            <DiscrepancyEmployees view={v.value as EmployeeDiscrepancyView} period={period} />
          </TabsContent>
        ))}
      </DashboardPanel>
    </Tabs>
  )
}

type ReportsFormProps = {
  reports: DiscrepancyReport[]
  channels: string[]
  onReportsChange: (reports: DiscrepancyReport[]) => void
  onChannelsChange: (channels: string[]) => void
}

/** Step 1: pick reports. Step 2: pick channels. Generate lives in the panel footer. */
function ReportsForm({ reports, channels, onReportsChange, onChannelsChange }: ReportsFormProps) {
  const all = reports.length === DISCREPANCY_REPORTS.length
  const some = reports.length > 0 && !all

  const toggle = (value: DiscrepancyReport, checked: boolean) =>
    // Keep the declared order.
    onReportsChange(DISCREPANCY_REPORTS.map((r) => r.value).filter((r) => (r === value ? checked : reports.includes(r))))

  return (
    <div className="max-w-4xl space-y-6 px-4 pt-1 pb-6">
      <section className="space-y-3">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <h3 className="flex items-center gap-2 text-[13px] font-medium">
            <Step n={1} />
            Reports
          </h3>
          <span className="text-xs text-muted-foreground tabular-nums">
            {reports.length} of {DISCREPANCY_REPORTS.length} selected
          </span>
          <Label className="ml-auto flex cursor-pointer items-center gap-2 text-[13px] font-normal">
            <Checkbox
              checked={all}
              indeterminate={some}
              onCheckedChange={(checked) => onReportsChange(checked ? DISCREPANCY_REPORTS.map((r) => r.value) : [])}
            />
            Select all
          </Label>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 sm:grid-flow-col sm:grid-rows-4">
          {DISCREPANCY_REPORTS.map((r) => {
            const checked = reports.includes(r.value)
            return (
              <Label
                key={r.value}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-lg border bg-background px-3 py-2.5 text-[13px] font-normal transition-colors hover:bg-muted/50",
                  checked && "border-primary/40 bg-primary/5 hover:bg-primary/10"
                )}
              >
                <Checkbox checked={checked} onCheckedChange={(next) => toggle(r.value, Boolean(next))} />
                {r.label}
              </Label>
            )
          })}
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="flex items-center gap-2 text-[13px] font-medium">
          <Step n={2} />
          Channels
        </h3>
        <MultiSelectFilter
          label="Channels"
          options={CHANNEL_OPTIONS}
          value={channels}
          onChange={onChannelsChange}
          columns={2}
        />
      </section>
    </div>
  )
}

function Step({ n }: { n: number }) {
  return (
    <span
      aria-hidden
      className="inline-flex size-5 items-center justify-center rounded-full bg-muted text-[11px] font-semibold text-muted-foreground tabular-nums"
    >
      {n}
    </span>
  )
}
