"use client"

import { ChevronDown, ChevronsUpDown } from "lucide-react"

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
import { CATALOG_TREE, findView } from "./catalog"

type ContextPickerProps = {
  catalog: string
  channel: string
  view: string
  onChange: (next: { catalog: string; channel: string; view?: string }) => void
}

/**
 * "Direct / Business ⇕" — catalog + channel in one menu: one click opens all
 * channels grouped by catalog, one click picks.
 */
export function ChannelPicker({ catalog, channel, view, onChange }: ContextPickerProps) {
  const current = findView(catalog, channel, view)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            aria-label={`Channel: ${current.catalog.label}, ${current.channel.label}`}
            className="shrink-0 gap-1.5 px-2 font-medium"
          />
        }
      >
        <span className="text-muted-foreground">{current.catalog.label}</span>
        <span className="text-muted-foreground/50">/</span>
        {current.channel.label}
        <ChevronsUpDown className="text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuRadioGroup
          value={`${current.catalog.id}:${current.channel.id}`}
          onValueChange={(value: string) => {
            const [nextCatalog, nextChannel] = value.split(":")
            onChange({ catalog: nextCatalog, channel: nextChannel })
          }}
        >
          {CATALOG_TREE.map((cat, i) => (
            <DropdownMenuGroup key={cat.id}>
              {i > 0 && <DropdownMenuSeparator />}
              <DropdownMenuLabel>{cat.label}</DropdownMenuLabel>
              {cat.channels.map((ch) => (
                <DropdownMenuRadioItem key={ch.id} value={`${cat.id}:${ch.id}`}>
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

/** "View  Team quota vaults ▾" — the selected channel's views. */
export function ViewPicker({ catalog, channel, view, onChange }: ContextPickerProps) {
  const current = findView(catalog, channel, view)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            aria-label={`View: ${current.view.label}`}
            className="shrink-0 gap-1.5 font-normal"
          />
        }
      >
        <span className="text-muted-foreground">View</span>
        <span className="font-medium">{current.view.label}</span>
        <ChevronDown className="text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>{current.channel.label} views</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={current.view.id}
            onValueChange={(next: string) =>
              onChange({
                catalog: current.catalog.id,
                channel: current.channel.id,
                view: next,
              })
            }
          >
            {current.channel.views.map((v) => (
              <DropdownMenuRadioItem key={v.id} value={v.id}>
                {v.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
