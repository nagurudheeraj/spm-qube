import { cn } from "@/lib/utils"

/** Centered, readable-width page that scrolls with its content. */
export function PageContainer({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("mx-auto w-full max-w-6xl px-4 py-8 md:px-10 md:py-10", className)}>{children}</div>
}

/**
 * Full-width page locked to the viewport; give the main region (e.g. a
 * `DataTable` with `fill`) `flex-1` so it scrolls internally instead of the page.
 */
export function FullHeightPage({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("flex min-h-[32rem] flex-1 flex-col gap-3 p-3 md:min-h-0 md:p-4", className)}>{children}</div>
}
