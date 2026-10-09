"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { findScreenByHref } from "@/config/navigation"
import { useMounted } from "@/hooks/use-mounted"
import { useAppSelector } from "@/store/hooks"
import { ScreenList } from "./screen-list"
import { Section } from "./section"

const copy = {
  pinned: { title: "Pinned", empty: "Pin a screen to keep it here." },
  recent: { title: "Recent", empty: "Screens you open will appear here." },
} as const

/** Pinned / recent screens from the store. */
export function ScreenShortcuts({ kind }: { kind: keyof typeof copy }) {
  const mounted = useMounted()
  const hrefs = useAppSelector((s) => s.ui[kind])
  const screens = hrefs.map(findScreenByHref).filter((s) => s !== undefined)
  const text = copy[kind]

  return (
    <Section title={text.title}>
      {!mounted ? (
        <Skeleton className="h-11 rounded-lg" />
      ) : screens.length === 0 ? (
        <p className="flex h-11 items-center rounded-lg border border-dashed px-3.5 text-[13px] text-muted-foreground">
          {text.empty}
        </p>
      ) : (
        <ScreenList screens={screens} />
      )}
    </Section>
  )
}
