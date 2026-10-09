import { cn } from "@/lib/utils"

type SectionProps = {
  title: string
  actions?: React.ReactNode
  className?: string
  children: React.ReactNode
}

export function Section({ title, actions, className, children }: SectionProps) {
  return (
    <section className={cn("space-y-3", className)}>
      <div className="flex h-7 items-center justify-between gap-4">
        <h2 className="text-[13px] font-medium text-muted-foreground">{title}</h2>
        {actions}
      </div>
      {children}
    </section>
  )
}
