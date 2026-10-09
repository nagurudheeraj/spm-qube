import { Suspense } from "react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { PageContainer } from "@/components/common/page-layout"
import { PageHeader } from "@/components/common/page-header"
import { PageSkeleton } from "@/components/common/page-skeleton"
import { PinButton } from "@/components/common/pin-button"
import { PlaceholderScreen } from "@/components/common/placeholder-screen"
import { ScreenCard } from "@/components/common/screen-card"
import { TrackVisit } from "@/components/common/track-visit"
import { HeaderActions } from "@/components/layout/header-actions"
import { flattenScreens, resolveScreen, screenHref } from "@/config/navigation"

type Props = { params: Promise<{ module: string; screen: string[] }> }

export function generateStaticParams() {
  return flattenScreens().map((s) => ({ module: s.module.slug, screen: s.path }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { module, screen } = await params
  return { title: resolveScreen(module, screen)?.screen?.title }
}

export default function ScreenPage({ params }: Props) {
  return (
    <PageContainer>
      <Suspense fallback={<PageSkeleton />}>
        <ScreenPageContent params={params} />
      </Suspense>
    </PageContainer>
  )
}

async function ScreenPageContent({ params }: Props) {
  const { module: moduleSlug, screen: path } = await params
  const resolved = resolveScreen(moduleSlug, path)
  if (!resolved?.screen) notFound()

  const { module: mod, screen } = resolved
  const href = screenHref(mod.slug, path)

  return (
    <div className="space-y-10">
      <TrackVisit href={href} />
      <HeaderActions>
        <PinButton variant="button" href={href} title={screen.title} />
      </HeaderActions>
      <PageHeader title={screen.title} description={screen.description} />

      {screen.children?.length ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {screen.children.map((child) => (
            <ScreenCard key={child.slug} item={child} href={screenHref(mod.slug, [...path, child.slug])} />
          ))}
        </div>
      ) : (
        <PlaceholderScreen
          description={
            screen.hasSubmenu
              ? "This screen groups several sub-screens in the legacy app. They'll be catalogued and redesigned here."
              : undefined
          }
        />
      )}
    </div>
  )
}
