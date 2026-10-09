import { cn } from "@/lib/utils"

/** QUBE mark: a minimal isometric cube. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex size-6 shrink-0 items-center justify-center rounded-md bg-foreground text-background", className)}>
      <svg viewBox="0 0 24 24" aria-hidden className="size-4 shrink-0">
        <path d="M12 3.5 19.5 7.75 12 12 4.5 7.75Z" fill="var(--brand)" />
        <path d="M4.5 7.75 12 12v8.5l-7.5-4.25Z" fill="currentColor" opacity=".95" />
        <path d="M19.5 7.75 12 12v8.5l7.5-4.25Z" fill="currentColor" opacity=".6" />
      </svg>
    </span>
  )
}
