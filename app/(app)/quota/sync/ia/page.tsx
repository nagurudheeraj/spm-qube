import type { Metadata } from "next"

import { TrackVisit } from "@/components/common/track-visit"
import { IaSyncView } from "@/features/ia-sync/ia-sync-view"

export const metadata: Metadata = { title: "Sync IA" }

export default function IaSyncPage() {
  return (
    <>
      <TrackVisit href="/quota/sync/ia" />
      <IaSyncView />
    </>
  )
}
