"use client"

import { useEffect, useId, useState, useSyncExternalStore } from "react"
import { useMutation } from "@tanstack/react-query"

import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { DatePicker } from "@/components/common/date-picker"
import { PageContainer } from "@/components/common/page-layout"
import { PageHeader } from "@/components/common/page-header"
import { PeriodStepper } from "@/components/common/period-stepper"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/toast"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { CATALOGS, findCatalog } from "@/config/catalogs"
import { AREAS } from "@/features/quota-allocate/options"
import { currentPeriod, formatPeriod, shiftPeriod, type Period } from "@/lib/period"
import { cn } from "@/lib/utils"
import { createPlanner } from "./api"
import { EmployeePicker } from "./employee-picker"
import { compPlansFor, effectiveStartDate, formatDate, jobTitlesFor, periodStart, validate } from "./options"
import { PlannerSummary } from "./planner-summary"
import type { EmployeeType, NewEmployee, PlannerDraft, PlannerField } from "./types"

const EMPTY_NEW: NewEmployee = { hrNumber: "", salesId: "", firstName: "", lastName: "" }

const makeDraft = (period: Period, scope?: Pick<PlannerDraft, "catalog" | "channel" | "area">): PlannerDraft => ({
  catalog: scope?.catalog ?? "direct",
  channel: scope?.channel ?? "business",
  area: scope?.area ?? "east",
  period,
  employeeType: "existing",
  existing: null,
  newEmployee: EMPTY_NEW,
  jobTitle: null,
  compPlan: null,
  startDate: null,
})

// Order the errors are focused in when saving.
const FIELD_ORDER: PlannerField[] = ["employee", "firstName", "lastName", "hrNumber", "jobTitle", "compPlan", "startDate"]
const fieldId = (field: PlannerField) => `planner-${field}`

// Segmented-control option; the selected one is solid so it reads at a glance.
const segment =
  "flex-1 data-pressed:border-primary data-pressed:bg-primary data-pressed:text-primary-foreground data-pressed:hover:bg-primary/90"

const noopSubscribe = () => () => {}

export function DefineView() {
  // Planners are set up for the coming month; the default depends on the clock, so pick it on the client.
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false)
  return (
    <PageContainer className="max-w-6xl">
      <PageHeader title="New quota planner" description="Set up quota planning for an existing employee or a new hire." />
      {mounted ? <PlannerForm initialPeriod={shiftPeriod(currentPeriod(), 1)} /> : <PlannerSkeleton />}
    </PageContainer>
  )
}

function PlannerSkeleton() {
  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <Skeleton className="h-[40rem] rounded-xl" />
      <Skeleton className="h-96 rounded-xl" />
    </div>
  )
}

function PlannerForm({ initialPeriod }: { initialPeriod: Period }) {
  const [draft, setDraft] = useState(() => makeDraft(initialPeriod))
  const [showErrors, setShowErrors] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)

  const pristine = makeDraft(initialPeriod, draft)
  const dirty = JSON.stringify({ ...draft, period: null }) !== JSON.stringify({ ...pristine, period: null })
  const errors = validate(draft)
  const visibleErrors = showErrors ? errors : {}

  const jobTitles = jobTitlesFor(draft.catalog, draft.channel)
  const compPlans = compPlansFor(draft.catalog, draft.channel)
  const channels = findCatalog(draft.catalog)?.channels ?? []
  const selectedTitle = jobTitles.find((t) => t.value === draft.jobTitle)

  const update = (patch: Partial<PlannerDraft>) => setDraft((d) => ({ ...d, ...patch }))
  const updateNew = (patch: Partial<NewEmployee>) => setDraft((d) => ({ ...d, newEmployee: { ...d.newEmployee, ...patch } }))

  // Titles and plans are per channel, so a channel change clears them.
  const changeChannel = (catalog: string, channel: string) =>
    update({ catalog, channel, jobTitle: null, compPlan: null })

  const save = useMutation({
    mutationFn: createPlanner,
    onSuccess: (result) => {
      toast.add({
        title: "Quota planner created",
        description: `${result.name} · ${result.period}, starting ${formatDate(result.startDate)}.`,
        type: "success",
      })
      // Keep the scope so several planners can be set up in a row.
      setDraft((d) => makeDraft(d.period, d))
      setShowErrors(false)
    },
    onError: () => toast.add({ title: "Couldn't create the planner", description: "Please try again.", type: "error" }),
  })

  const submit = () => {
    if (save.isPending) return
    const first = FIELD_ORDER.find((f) => errors[f])
    if (first) {
      setShowErrors(true)
      document.getElementById(fieldId(first))?.focus()
      return
    }
    save.mutate(draft)
  }

  // ⌘↵ / Ctrl+↵ saves from anywhere on the form.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        const form = document.getElementById("planner-form") as HTMLFormElement | null
        form?.requestSubmit()
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  useEffect(() => {
    if (!dirty) return
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener("beforeunload", onBeforeUnload)
    return () => window.removeEventListener("beforeunload", onBeforeUnload)
  }, [dirty])

  return (
    <form
      id="planner-form"
      noValidate
      onSubmit={(e) => {
        e.preventDefault()
        submit()
      }}
      className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]"
    >
      <div className="overflow-hidden rounded-xl border bg-card">
        <Step number={1} title="Scope" description="Where the quota will be planned.">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Catalog">
              <ToggleGroup
                aria-label="Catalog"
                variant="outline"
                size="lg"
                value={[draft.catalog]}
                onValueChange={(next) => {
                  const catalog = next[0]
                  if (catalog) changeChannel(catalog, findCatalog(catalog)!.channels[0].id)
                }}
                className="w-full"
              >
                {CATALOGS.map((c) => (
                  <ToggleGroupItem key={c.id} value={c.id} className={segment}>
                    {c.label}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </FormField>
            <FormField label="Channel" id="planner-channel">
              <FormSelect
                id="planner-channel"
                value={draft.channel}
                items={channels.map((c) => ({ value: c.id, label: c.label }))}
                onChange={(channel) => changeChannel(draft.catalog, channel)}
              />
            </FormField>
            <FormField label="Area" id="planner-area">
              <FormSelect id="planner-area" value={draft.area} items={AREAS} onChange={(area) => update({ area })} />
            </FormField>
            <FormField label="For period">
              <PeriodStepper value={draft.period} onChange={(period) => update({ period })} className="w-full [&>button]:h-9 [&>button:nth-child(2)]:flex-1 [&>button:not(:nth-child(2))]:w-9" />
            </FormField>
          </div>
        </Step>

        <Step number={2} title="Employee" description="Find someone on file, or enter a new hire.">
          <div className="space-y-4">
            <ToggleGroup
              aria-label="Employee type"
              variant="outline"
              size="lg"
              value={[draft.employeeType]}
              onValueChange={(next) => next[0] && update({ employeeType: next[0] as EmployeeType })}
              className="w-full sm:w-72"
            >
              <ToggleGroupItem value="existing" className={segment}>
                Existing employee
              </ToggleGroupItem>
              <ToggleGroupItem value="new" className={segment}>
                New hire
              </ToggleGroupItem>
            </ToggleGroup>

            {draft.employeeType === "existing" ? (
              <FormField label="Search" id={fieldId("employee")} error={visibleErrors.employee}>
                <EmployeePicker
                  id={fieldId("employee")}
                  value={draft.existing}
                  onChange={(existing) => update({ existing })}
                  invalid={Boolean(visibleErrors.employee)}
                />
              </FormField>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="First name" id={fieldId("firstName")} error={visibleErrors.firstName}>
                  <TextInput
                    id={fieldId("firstName")}
                    value={draft.newEmployee.firstName}
                    onChange={(firstName) => updateNew({ firstName })}
                    invalid={Boolean(visibleErrors.firstName)}
                    autoComplete="off"
                  />
                </FormField>
                <FormField label="Last name" id={fieldId("lastName")} error={visibleErrors.lastName}>
                  <TextInput
                    id={fieldId("lastName")}
                    value={draft.newEmployee.lastName}
                    onChange={(lastName) => updateNew({ lastName })}
                    invalid={Boolean(visibleErrors.lastName)}
                    autoComplete="off"
                  />
                </FormField>
                <FormField label="HR number" id={fieldId("hrNumber")} error={visibleErrors.hrNumber}>
                  <TextInput
                    id={fieldId("hrNumber")}
                    value={draft.newEmployee.hrNumber}
                    onChange={(hrNumber) => updateNew({ hrNumber: hrNumber.replace(/\D/g, "") })}
                    invalid={Boolean(visibleErrors.hrNumber)}
                    inputMode="numeric"
                    className="font-mono tabular-nums"
                  />
                </FormField>
                <FormField label="Sales ID" id="planner-salesId" optional hint="Leave blank to assign one later.">
                  <TextInput
                    id="planner-salesId"
                    value={draft.newEmployee.salesId}
                    onChange={(salesId) => updateNew({ salesId: salesId.toUpperCase() })}
                    className="font-mono tabular-nums"
                  />
                </FormField>
              </div>
            )}
          </div>
        </Step>

        <Step number={3} title="Assignment" description="Role, pay plan and when the quota starts.">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Job title" id={fieldId("jobTitle")} error={visibleErrors.jobTitle} className="sm:col-span-2">
              <FormSelect
                id={fieldId("jobTitle")}
                value={draft.jobTitle}
                placeholder="Choose a job title"
                invalid={Boolean(visibleErrors.jobTitle)}
                items={jobTitles.map((t) => ({ value: t.value, label: `${t.code} – ${t.label}` }))}
                renderItem={(item) => {
                  const t = jobTitles.find((j) => j.value === item.value)!
                  return (
                    <>
                      <span className="w-20 shrink-0 font-mono text-xs text-muted-foreground">{t.code}</span>
                      {t.label}
                    </>
                  )
                }}
                // Picking a title suggests its usual plan.
                onChange={(jobTitle) =>
                  update({ jobTitle, compPlan: jobTitles.find((t) => t.value === jobTitle)?.defaultPlan ?? null })
                }
              />
            </FormField>
            <FormField
              label="Compensation plan"
              id={fieldId("compPlan")}
              error={visibleErrors.compPlan}
              hint={selectedTitle && draft.compPlan === selectedTitle.defaultPlan ? "Suggested for this job title." : undefined}
              className="sm:col-span-2"
            >
              <FormSelect
                id={fieldId("compPlan")}
                value={draft.compPlan}
                placeholder="Choose a plan"
                invalid={Boolean(visibleErrors.compPlan)}
                items={compPlans}
                onChange={(compPlan) => update({ compPlan })}
              />
            </FormField>
            <FormField
              label="Start date"
              id={fieldId("startDate")}
              error={visibleErrors.startDate}
              hint={draft.startDate ? undefined : `Defaults to the first day of ${formatPeriod(draft.period)}.`}
            >
              <DatePicker
                id={fieldId("startDate")}
                value={effectiveStartDate(draft)}
                // Choosing the period's first day goes back to following the period.
                onChange={(d) => update({ startDate: d === periodStart(draft.period) ? null : d })}
                className={cn("h-9", visibleErrors.startDate && "border-destructive ring-3 ring-destructive/20")}
              />
            </FormField>
          </div>
        </Step>
      </div>

      <PlannerSummary
        draft={draft}
        errors={errors}
        jobTitle={selectedTitle}
        compPlan={compPlans.find((p) => p.value === draft.compPlan)}
        saving={save.isPending}
        dirty={dirty}
        onReset={() => setConfirmReset(true)}
      />

      <ConfirmDialog
        open={confirmReset}
        onOpenChange={setConfirmReset}
        title="Discard this planner?"
        description="Everything you've entered will be cleared. The scope and period stay as they are."
        confirmLabel="Discard"
        destructive
        onConfirm={() => {
          setDraft((d) => makeDraft(d.period, d))
          setShowErrors(false)
        }}
      />
    </form>
  )
}

/* ---------- layout pieces ---------- */

function Step({ number, title, description, children }: { number: number; title: string; description: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={`step-${number}`} className="grid gap-5 border-t px-5 py-6 first:border-t-0 md:grid-cols-[180px_minmax(0,1fr)] md:gap-8">
      <div className="flex gap-3 md:block">
        <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-semibold text-muted-foreground tabular-nums md:mb-3">
          {number}
        </span>
        <div>
          <h2 id={`step-${number}`} className="text-sm font-semibold">
            {title}
          </h2>
          <p className="mt-0.5 text-[13px] text-muted-foreground">{description}</p>
        </div>
      </div>
      {children}
    </section>
  )
}

type FormFieldProps = {
  label: string
  id?: string
  hint?: string
  error?: string
  optional?: boolean
  className?: string
  children: React.ReactNode
}

function FormField({ label, id, hint, error, optional, className, children }: FormFieldProps) {
  // Same label element and spacing for every field, whether it labels one control (id) or a group.
  const labelId = useId()
  const labelClass = "text-[13px]"
  return (
    <div
      role={id ? undefined : "group"}
      aria-labelledby={id ? undefined : labelId}
      className={cn("flex min-w-0 flex-col gap-2", className)}
    >
      {id ? (
        <Label htmlFor={id} className={labelClass}>
          {label}
          {optional && <span className="font-normal text-muted-foreground">(optional)</span>}
        </Label>
      ) : (
        // Mirrors <Label>'s styles; a group has no single control for a <label> to point at.
        <span id={labelId} className={cn("flex items-center gap-2 leading-none font-medium select-none", labelClass)}>
          {label}
        </span>
      )}
      {children}
      {error ? (
        <p id={id && `${id}-error`} role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : (
        hint && <p className="text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  )
}

type TextInputProps = Omit<React.ComponentProps<typeof Input>, "onChange"> & {
  onChange: (value: string) => void
  invalid?: boolean
}

function TextInput({ id, onChange, invalid, className, ...props }: TextInputProps) {
  return (
    <Input
      id={id}
      aria-invalid={invalid || undefined}
      aria-describedby={invalid ? `${id}-error` : undefined}
      onChange={(e) => onChange(e.target.value)}
      className={cn("h-9", className)}
      {...props}
    />
  )
}

type Option = { value: string; label: string }

type FormSelectProps = {
  id: string
  value: string | null
  items: Option[]
  onChange: (value: string) => void
  placeholder?: string
  invalid?: boolean
  renderItem?: (item: Option) => React.ReactNode
}

function FormSelect({ id, value, items, onChange, placeholder, invalid, renderItem }: FormSelectProps) {
  return (
    <Select items={items} value={value} onValueChange={(v) => v !== null && onChange(v as string)}>
      <SelectTrigger
        id={id}
        aria-invalid={invalid || undefined}
        aria-describedby={invalid ? `${id}-error` : undefined}
        className="h-9 w-full data-[size=default]:h-9"
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent alignItemWithTrigger={false} align="start">
        <SelectGroup>
          {items.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {renderItem ? renderItem(item) : item.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
