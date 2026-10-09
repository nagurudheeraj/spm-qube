import { Suspense } from "react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { PageContainer } from "@/components/common/page-layout"
import { PageHeader } from "@/components/common/page-header"
import { PageSkeleton } from "@/components/common/page-skeleton"
import { PlaceholderScreen } from "@/components/common/placeholder-screen"
import { ScreenCard } from "@/components/common/screen-card"
import { getModule, navigation, screenHref } from "@/config/navigation"

type Props = { params: Promise<{ module: string }> }

export function generateStaticParams() {
  return navigation.map((m) => ({ module: m.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: getModule((await params).module)?.title }
}

export default function ModulePage({ params }: Props) {
  return (
    <PageContainer>
      <Suspense fallback={<PageSkeleton />}>
        <ModulePageContent params={params} />
      </Suspense>
    </PageContainer>
  )
}

async function ModulePageContent({ params }: Props) {
  const mod = getModule((await params).module)
  if (!mod) notFound()

  return (
    <div className="space-y-10">
      <PageHeader title={mod.title} description={mod.description} />
      {mod.items.length === 0 ? (
        <PlaceholderScreen title="No screens yet" description={`Screens for ${mod.title} haven't been defined yet.`} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {mod.items.map((item) => (
            <ScreenCard key={item.slug} item={item} href={screenHref(mod.slug, [item.slug])} />
          ))}
        </div>
      )}
    </div>
  )
}
