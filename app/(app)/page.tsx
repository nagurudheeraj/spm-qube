import { ModuleCard } from "@/components/common/module-card"
import { PageContainer } from "@/components/common/page-layout"
import { PageHeader } from "@/components/common/page-header"
import { ScreenShortcuts } from "@/components/common/screen-shortcuts"
import { Section } from "@/components/common/section"
import { mockUser } from "@/config/app"
import { navigation } from "@/config/navigation"

export default function HomePage() {
  return (
    <PageContainer className="space-y-12">
      <PageHeader title={`Welcome back, ${mockUser.firstName}`} description="Pick a module to get started, or press ⌘K to jump anywhere." />

      <Section title="Modules">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {navigation.map((mod) => (
            <ModuleCard key={mod.slug} module={mod} />
          ))}
        </div>
      </Section>

      <div className="grid gap-10 lg:grid-cols-2">
        <ScreenShortcuts kind="pinned" />
        <ScreenShortcuts kind="recent" />
      </div>
    </PageContainer>
  )
}
