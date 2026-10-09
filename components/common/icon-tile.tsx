import type { LucideIcon } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const iconTileVariants = cva(
  "inline-flex shrink-0 items-center justify-center rounded-md border bg-background text-muted-foreground shadow-xs",
  {
    variants: {
      size: {
        sm: "size-7 [&_svg]:size-3.5",
        md: "size-8 [&_svg]:size-4",
        lg: "size-10 [&_svg]:size-5",
      },
    },
    defaultVariants: { size: "md" },
  }
)

export function IconTile({
  icon: Icon,
  size,
  className,
}: { icon: LucideIcon; className?: string } & VariantProps<typeof iconTileVariants>) {
  return (
    <span className={cn(iconTileVariants({ size }), className)}>
      <Icon strokeWidth={1.75} />
    </span>
  )
}
