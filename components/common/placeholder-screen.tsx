import { Hammer } from "lucide-react"

import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"

type PlaceholderScreenProps = {
  title?: string
  description?: string
  children?: React.ReactNode
}

/** Stand-in body for screens that haven't been migrated yet. */
export function PlaceholderScreen({
  title = "Not built yet",
  description = "This screen is being redesigned as part of the QUBE migration.",
  children,
}: PlaceholderScreenProps) {
  return (
    <Empty className="min-h-72 rounded-lg border border-dashed bg-muted/20">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Hammer strokeWidth={1.75} />
        </EmptyMedia>
        <EmptyTitle className="text-sm">{title}</EmptyTitle>
        <EmptyDescription className="text-[13px]">{description}</EmptyDescription>
      </EmptyHeader>
      {children && <EmptyContent>{children}</EmptyContent>}
    </Empty>
  )
}
