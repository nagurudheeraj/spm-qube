"use client"

import { useState } from "react"
import { Search } from "lucide-react"

import { FilterSelect } from "@/components/common/filter-select"
import { MultiSelectFilter } from "@/components/common/multi-select-filter"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectTrigger } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import {
  catalogOptions,
  channelOptions,
  localeCode,
  localeSelectionFromValue,
  marketOptions,
  PERIOD_OPTIONS,
  SEARCH_TYPES,
  searchType,
  summarizePeriods,
  yearOptions,
} from "./options"
import type { FindCriteria, SearchFor } from "./types"

type FindSearchBarProps = {
  draft: FindCriteria
  currentYear: number
  onChange: (patch: Partial<FindCriteria>) => void
  onSearchForChange: (value: SearchFor) => void
  onChannelChange: (value: string) => void
  onSubmit: () => void
}

function LocaleFilter({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const initial = localeSelectionFromValue(value)
  const [catalog, setCatalog] = useState(initial.catalog)
  const [channel, setChannel] = useState(initial.channel)
  const [market, setMarket] = useState(initial.market)

  const selectedLocale = catalog === "all" ? "All" : localeCode(catalog, channel, market)

  return (
    <Select value={value} onValueChange={(next) => onChange(next ?? value)}>
      <SelectTrigger aria-label="Locale" className="gap-1.5">
        <span className="text-muted-foreground">Locale</span>
        <span className="font-medium text-foreground">{value === "all" ? "All" : selectedLocale}</span>
      </SelectTrigger>
      <SelectContent alignItemWithTrigger={false} align="start" className="w-[420px] max-w-[calc(100vw-2rem)]">
        <div className="space-y-3 p-2">
          <div className="flex flex-wrap items-center gap-2">
            <FilterSelect
              label="Catalog"
              value={catalog}
              options={catalogOptions}
              onChange={(nextCatalog) => {
                setCatalog(nextCatalog)
                setChannel("all")
                setMarket("all")
                onChange(nextCatalog === "all" ? "all" : "all")
              }}
            />
            {catalog !== "all" && (
              <FilterSelect
                label="Channel"
                value={channel}
                options={channelOptions(catalog)}
                onChange={(nextChannel) => {
                  setChannel(nextChannel)
                  setMarket("all")
                  onChange(nextChannel === "all" ? "all" : "all")
                }}
              />
            )}
            {catalog !== "all" && channel !== "all" && (
              <FilterSelect
                label="Market"
                value={market}
                options={marketOptions(catalog, channel)}
                onChange={(nextMarket) => {
                  setMarket(nextMarket)
                  onChange(nextMarket === "all" ? "all" : localeCode(catalog, channel, nextMarket))
                }}
              />
            )}
          </div>
          <div className="rounded-md border bg-muted/40 px-2.5 py-1.5 text-[13px]">
            <div className="text-muted-foreground">Selected locale</div>
            <div className="mt-0.5 font-medium text-foreground">{selectedLocale}</div>
          </div>
        </div>
      </SelectContent>
    </Select>
  )
}

/**
 * Row 1 — what to find: type, fields to match, term (+ exact), Search.
 * Row 2 — where to look: catalog → channel → market (each shown once its parent is
 * picked), locale, year, periods, and include relief/adjustments.
 */
export function FindSearchBar({
  draft,
  currentYear,
  onChange,
  onSearchForChange,
  onChannelChange,
  onSubmit,
}: FindSearchBarProps) {
  const type = searchType(draft.searchFor)
  const missing =
    !draft.term.trim() ? "Enter something to search for" : !draft.searchBy.length ? "Pick at least one field to search by" : !draft.periods.length ? "Pick at least one period" : null

  return (
    <form
      className="space-y-2"
      onSubmit={(e) => {
        e.preventDefault()
        if (!missing) onSubmit()
      }}
    >
      <div className="flex flex-wrap items-center gap-2">
        <FilterSelect
          label="Search for"
          value={draft.searchFor}
          options={SEARCH_TYPES}
          onChange={(v) => onSearchForChange(v as SearchFor)}
        />
        <MultiSelectFilter
          label="Search by"
          options={type.searchBy}
          value={draft.searchBy}
          onChange={(searchBy) => onChange({ searchBy })}
        />
        <InputGroup className="h-8 w-full sm:w-80">
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupInput
            value={draft.term}
            onChange={(e) => onChange({ term: e.target.value })}
            placeholder={`${type.searchBy
              .filter((o) => draft.searchBy.includes(o.value))
              .map((o) => o.label)
              .join(", ") || "Search"}…`}
            aria-label="Search term"
          />
          <InputGroupAddon align="inline-end">
            <Label className="flex cursor-pointer items-center gap-1.5 pr-1 text-xs font-normal text-muted-foreground">
              <Checkbox checked={draft.exact} onCheckedChange={(exact) => onChange({ exact: Boolean(exact) })} />
              Exact
            </Label>
          </InputGroupAddon>
        </InputGroup>
        <Button type="submit" size="default" disabled={Boolean(missing)} title={missing ?? undefined}>
          <Search />
          Search
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {draft.catalog !== "all" && (
          <FilterSelect
            label="Channel"
            value={draft.channel}
            options={channelOptions(draft.catalog)}
            onChange={onChannelChange}
          />
        )}
        {draft.catalog !== "all" && draft.channel !== "all" && (
          <FilterSelect
            label="Market"
            value={draft.market}
            options={marketOptions(draft.catalog, draft.channel)}
            onChange={(market) => onChange({ market })}
          />
        )}
        <LocaleFilter key={draft.locale} value={draft.locale} onChange={(locale) => onChange({ locale })} />
        <FilterSelect
          label="Year"
          value={String(draft.year)}
          options={yearOptions(currentYear)}
          onChange={(v) => onChange({ year: Number(v) })}
        />
        <MultiSelectFilter
          label="Periods"
          options={PERIOD_OPTIONS}
          value={draft.periods.map(String)}
          onChange={(v) => onChange({ periods: v.map(Number) })}
          summarize={(selected) => summarizePeriods(selected.map((o) => Number(o.value)))}
          columns={4}
        />
        <Separator orientation="vertical" className="mx-1 hidden data-vertical:h-5 data-vertical:self-center sm:block" />
        <Label className="flex h-8 cursor-pointer items-center gap-2 px-1 font-normal">
          <Switch size="sm" checked={draft.relief} onCheckedChange={(relief) => onChange({ relief })} />
          Relief
        </Label>
        <Label className="flex h-8 cursor-pointer items-center gap-2 px-1 font-normal">
          <Switch size="sm" checked={draft.adjustments} onCheckedChange={(adjustments) => onChange({ adjustments })} />
          Adjustments
        </Label>
      </div>
    </form>
  )
}
