"use client"

import { ChevronsUpDown, Search, User } from "lucide-react"

import { MultiSelectFilter } from "@/components/common/multi-select-filter"
import { PeriodStepper } from "@/components/common/period-stepper"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { currentPeriod } from "@/lib/period"
import { CATALOGS } from "@/config/catalogs"
import { PENDING_STAGES, STAGES, TYPES } from "./options"
import type { AdjustmentCriteria, AdjustmentStage } from "./types"

type AdjustmentsSearchBarProps = {
  draft: AdjustmentCriteria
  /** Draft differs from the last search. */
  dirty: boolean
  onChange: (patch: Partial<AdjustmentCriteria>) => void
  onSubmit: () => void
}

const sameSet = (a: string[], b: string[]) => a.length === b.length && a.every((v) => b.includes(v))

/** Where (catalog, channel, period), what (types, stages), who (created by) → Search. */
export function AdjustmentsSearchBar({ draft, dirty, onChange, onSubmit }: AdjustmentsSearchBarProps) {
  return (
    <form
      className="flex flex-wrap items-center gap-2"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit()
      }}
    >
      <CatalogChannelPicker
        catalog={draft.catalog}
        channel={draft.channel}
        onChange={(catalog, channel) => onChange({ catalog, channel })}
      />
      <div aria-hidden className="mx-1 hidden h-5 w-px bg-border sm:block" />

      <Label className="flex h-8 cursor-pointer items-center gap-2 px-1 text-[13px] font-normal">
        <Switch
          size="sm"
          checked={draft.allPeriods}
          onCheckedChange={(allPeriods) => onChange({ allPeriods, period: draft.period ?? currentPeriod() })}
        />
        All periods
      </Label>
      {!draft.allPeriods && draft.period && (
        <PeriodStepper value={draft.period} onChange={(period) => onChange({ period })} />
      )}

      <div aria-hidden className="mx-1 hidden h-5 w-px bg-border sm:block" />

      <MultiSelectFilter
        label="Types"
        options={TYPES}
        value={draft.types}
        onChange={(types) => onChange({ types })}
        summarize={(s) => (s.length === 0 || s.length === TYPES.length ? "All" : s.length <= 2 ? s.map((o) => o.label).join(", ") : `${s.length} selected`)}
      />
      <MultiSelectFilter
        label="Stages"
        options={STAGES}
        value={draft.stages}
        onChange={(stages) => onChange({ stages: stages as AdjustmentStage[] })}
        presets={[{ label: "Pending", value: PENDING_STAGES }]}
        summarize={(s) => {
          const v = s.map((o) => o.value)
          if (v.length === 0 || v.length === STAGES.length) return "All"
          if (sameSet(v, PENDING_STAGES)) return "All pending"
          return v.length <= 2 ? s.map((o) => o.label).join(", ") : `${v.length} selected`
        }}
      />
      <InputGroup className="h-8 w-full sm:w-48">
        <InputGroupAddon>
          <User />
        </InputGroupAddon>
        <InputGroupInput
          value={draft.createdBy}
          onChange={(e) => onChange({ createdBy: e.target.value })}
          placeholder="Created by (last, first)"
          aria-label="Created by"
        />
      </InputGroup>
      <Button type="submit" variant={dirty ? "default" : "outline"}>
        <Search />
        Search
      </Button>
    </form>
  )
}

/** "Direct / All channels ⇕" — catalog + channel in one menu, with an "All channels" choice per catalog. */
function CatalogChannelPicker({
  catalog,
  channel,
  onChange,
}: {
  catalog: string
  channel: string
  onChange: (catalog: string, channel: string) => void
}) {
  const cat = CATALOGS.find((c) => c.id === catalog) ?? CATALOGS[0]
  const channelLabel = cat.channels.find((c) => c.id === channel)?.label ?? "All channels"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            aria-label={`Channel: ${cat.label}, ${channelLabel}`}
            className="shrink-0 gap-1.5 font-normal"
          />
        }
      >
        <span className="text-muted-foreground">{cat.label}</span>
        <span className="text-muted-foreground/50">/</span>
        <span className="font-medium">{channelLabel}</span>
        <ChevronsUpDown className="text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuRadioGroup
          value={`${cat.id}:${channel}`}
          onValueChange={(value: string) => {
            const [nextCatalog, nextChannel] = value.split(":")
            onChange(nextCatalog, nextChannel)
          }}
        >
          {CATALOGS.map((c, i) => (
            <DropdownMenuGroup key={c.id}>
              {i > 0 && <DropdownMenuSeparator />}
              <DropdownMenuLabel>{c.label}</DropdownMenuLabel>
              <DropdownMenuRadioItem value={`${c.id}:all`}>All channels</DropdownMenuRadioItem>
              {c.channels.map((ch) => (
                <DropdownMenuRadioItem key={ch.id} value={`${c.id}:${ch.id}`}>
                  {ch.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuGroup>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
