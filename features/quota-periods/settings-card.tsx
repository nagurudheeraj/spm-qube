"use client"

import { Loader2 } from "lucide-react"

import { DatePicker, DateTimePicker } from "@/components/common/date-picker"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { formatPeriod, shiftPeriod, type Period } from "@/lib/period"
import type { PeriodSettings } from "./types"

type SettingsCardProps = {
  period: Period
  value: PeriodSettings
  dirty: boolean
  saving: boolean
  onChange: (patch: Partial<PeriodSettings>) => void
  onSave: () => void
  onReset: () => void
}

function Field({ id, label, hint, children }: { id: string; label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-[13px]">
        {label}
      </Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

function Group({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-4 border-t px-4 py-5 first:border-t-0 2xl:grid-cols-[200px_minmax(0,1fr)]">
      <div>
        <h3 className="text-[13px] font-semibold">{title}</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </div>
      {children}
    </div>
  )
}

/** Period configuration: key dates, display schedule, activation option. */
export function SettingsCard({ period, value, dirty, saving, onChange, onSave, onReset }: SettingsCardProps) {
  const deactivateMonth = formatPeriod(shiftPeriod(period, -2)).split(" ")[0]

  return (
    <section aria-label="Configuration" className="overflow-hidden rounded-xl border bg-card">
      <header className="border-b px-4 py-3">
        <h2 className="text-sm font-semibold">Configuration</h2>
        <p className="text-[13px] text-muted-foreground">Dates and options for {formatPeriod(period)}.</p>
      </header>

      <Group title="Key dates" description="Deadlines that drive this period's processing.">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <Field id="cutoff" label="Cutoff date">
            <DatePicker id="cutoff" value={value.cutoffDate} onChange={(cutoffDate) => onChange({ cutoffDate })} />
          </Field>
          <Field id="deactivate" label={`Deactivate sales IDs (${deactivateMonth})`}>
            <DatePicker
              id="deactivate"
              value={value.deactivateSalesIdsDate}
              onChange={(deactivateSalesIdsDate) => onChange({ deactivateSalesIdsDate })}
            />
          </Field>
          <Field id="relief" label="Relief date">
            <DatePicker id="relief" value={value.reliefDate} onChange={(reliefDate) => onChange({ reliefDate })} />
          </Field>
        </div>
      </Group>

      <Group title="Display schedule" description="When loaded and reloaded quotas become visible to users.">
        <div className="grid gap-4 md:grid-cols-2">
          <Field id="display-load" label="Display load">
            <DateTimePicker id="display-load" label="Display load time" value={value.displayLoad} onChange={(displayLoad) => onChange({ displayLoad })} />
          </Field>
          <Field id="display-reload" label="Display reload">
            <DateTimePicker id="display-reload" label="Display reload time" value={value.displayReload} onChange={(displayReload) => onChange({ displayReload })} />
          </Field>
          <Field id="display-vbg" label="Display VBG reload">
            <DateTimePicker id="display-vbg" label="Display VBG reload time" value={value.displayVbgReload} onChange={(displayVbgReload) => onChange({ displayVbgReload })} />
          </Field>
          <Field id="display-vcg" label="Display VCG reload">
            <DateTimePicker id="display-vcg" label="Display VCG reload time" value={value.displayVcgReload} onChange={(displayVcgReload) => onChange({ displayVcgReload })} />
          </Field>
        </div>
      </Group>

      <Group title="Activation" description="Checks that run before quotas go live.">
        <Label className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 font-normal">
          <Switch checked={value.runStageCheck} onCheckedChange={(runStageCheck) => onChange({ runStageCheck })} className="mt-0.5" />
          <span>
            <span className="block text-[13px] font-medium">Run stage check prior to quota activation</span>
            <span className="mt-0.5 block text-xs text-muted-foreground">
              Activate quotas will wait until a stage check has completed for this period.
            </span>
          </span>
        </Label>
      </Group>

      <footer className="flex items-center gap-2 border-t bg-muted/30 px-4 py-2.5">
        <p className="mr-auto text-[13px] text-muted-foreground">
          {dirty ? (
            <span className="inline-flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
              <span className="size-1.5 rounded-full bg-amber-500" />
              Unsaved changes
            </span>
          ) : (
            "All changes saved"
          )}
        </p>
        <Button variant="ghost" disabled={!dirty || saving} onClick={onReset}>
          Reset
        </Button>
        <Button disabled={!dirty || saving} onClick={onSave}>
          {saving && <Loader2 className="animate-spin" />}
          Save changes
        </Button>
      </footer>
    </section>
  )
}
