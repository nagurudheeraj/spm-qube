import Link from "next/link"

import { PageContainer } from "@/components/common/page-layout"
import { PlaceholderScreen } from "@/components/common/placeholder-screen"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <PageContainer>
      <PlaceholderScreen title="Page not found" description="That screen doesn't exist in QUBE.">
      <Button render={<Link href="/" />} nativeButton={false}>Back to home</Button>
      </PlaceholderScreen>
    </PageContainer>
  )
}
