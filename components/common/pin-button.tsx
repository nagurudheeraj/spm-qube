"use client"

import { Pin, PinOff } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useMounted } from "@/hooks/use-mounted"
import { cn } from "@/lib/utils"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { togglePin } from "@/store/slices/ui-slice"

type PinButtonProps = {
  href: string
  title: string
  /** `icon` shows on card hover; `button` is an always-visible labelled button. */
  variant?: "icon" | "button"
  className?: string
}

export function PinButton({ href, title, variant = "icon", className }: PinButtonProps) {
  const dispatch = useAppDispatch()
  const mounted = useMounted()
  const pinned = useAppSelector((s) => s.ui.pinned.includes(href)) && mounted
  const toggle = () => dispatch(togglePin(href))

  if (variant === "button") {
    return (
      <Button variant="outline" size="sm" aria-pressed={pinned} onClick={toggle} className={className}>
        {pinned ? <PinOff /> : <Pin />}
        {pinned ? "Unpin" : "Pin"}
      </Button>
    )
  }

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label={pinned ? `Unpin ${title}` : `Pin ${title}`}
            aria-pressed={pinned}
            onClick={toggle}
            className={cn(
              pinned ? "text-foreground" : "text-muted-foreground opacity-0 group-hover/card:opacity-100 focus-visible:opacity-100",
              className
            )}
          />
        }
      >
        <Pin className={cn(pinned && "fill-current")} />
      </TooltipTrigger>
      <TooltipContent>{pinned ? "Unpin" : "Pin"}</TooltipContent>
    </Tooltip>
  )
}
