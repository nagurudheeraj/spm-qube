"use client"

import { useEffect } from "react"
import { useIsFetching, useQueryClient } from "@tanstack/react-query"
import { RefreshCw } from "lucide-react"

import { FullHeightPage } from "@/components/common/page-layout"
import { PeriodStepper } from "@/components/common/period-stepper"
import { PlaceholderScreen } from "@/components/common/placeholder-screen"
import { HeaderActions } from "@/components/layout/header-actions"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { currentPeriod, formatPeriod, type Period } from "@/lib/period"
import { cn } from "@/lib/utils"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { setDashboardPeriod, setDashboardTab } from "@/store/slices/dashboard-slice"
import { dashboardKeys } from "./api"
import { DashboardPanel } from "./dashboard-panel"
import { DiscrepanciesTab } from "./discrepancies-tab"
import { DASHBOARD_TABS } from "./options"
import { QuotaStageTab } from "./quota-stage-tab"
import type { DashboardTab } from "./types"

export function DashboardView() {
  const dispatch = useAppDispatch()
  const period = useAppSelector((s) => s.dashboard.period)

  // The current period depends on the clock, so it is set on the client.
  useEffect(() => {
    if (!period) dispatch(setDashboardPeriod(currentPeriod()))
  }, [dispatch, period])

  if (!period) {
    return (
      <FullHeightPage>
        <Skeleton className="h-8 w-full max-w-4xl" />
        <Skeleton className="h-7 w-full max-w-xl" />
        <Skeleton className="flex-1 rounded-lg" />
      </FullHeightPage>
    )
  }
  return <DashboardScreen period={period} />
}

/** One period for every tab; each tab brings its own header, filters, actions and body. */
function DashboardScreen({ period }: { period: Period }) {
  const dispatch = useAppDispatch()
  const queryClient = useQueryClient()
  const tab = useAppSelector((s) => s.dashboard.tab)
  const refreshing = useIsFetching({ queryKey: dashboardKeys.all }) > 0

  return (
    <FullHeightPage>
      {/* The period every tab reads. */}
      <HeaderActions>
        <PeriodStepper value={period} onChange={(p) => dispatch(setDashboardPeriod(p))} />
        <Button
          variant="outline"
          size="icon"
          aria-label="Refresh"
          title={`Reload ${formatPeriod(period)}`}
          disabled={refreshing}
          onClick={() => queryClient.invalidateQueries({ queryKey: dashboardKeys.all })}
        >
          <RefreshCw className={cn(refreshing && "animate-spin")} />
        </Button>
      </HeaderActions>

      <Tabs
        value={tab}
        onValueChange={(value) => dispatch(setDashboardTab(value as DashboardTab))}
        className="min-h-0 flex-1 gap-0 overflow-hidden rounded-xl border bg-card"
      >
        {/* Scrolls sideways on narrow screens instead of wrapping. */}
        <div className="shrink-0 overflow-x-auto border-b bg-muted/40 px-1.5 [scrollbar-width:none]">
          <TabsList variant="line" className="h-10 gap-0 p-0">
            {DASHBOARD_TABS.map(({ value, label, short, icon: Icon }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="h-10 flex-none rounded-none px-2.5 text-[13px] after:bottom-0! data-active:font-medium"
              >
                <Icon strokeWidth={1.75} className="text-muted-foreground in-data-active:text-foreground" />
                <span className={cn(short && "hidden lg:inline")}>{label}</span>
                {short && <span className="lg:hidden">{short}</span>}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {DASHBOARD_TABS.map((t) => (
          <TabsContent key={t.value} value={t.value} className="flex min-h-0 flex-col">
            {t.value === "quota-stage" ? (
              <QuotaStageTab period={period} />
            ) : t.value === "discrepancies" ? (
              <DiscrepanciesTab period={period} />
            ) : (
              <DashboardPanel icon={t.icon} title={t.label} description={t.description}>
                <div className="flex flex-1 p-4 pt-0">
                  <PlaceholderScreen
                    title={`${t.label} isn't built yet`}
                    description={`This section will show ${formatPeriod(period)} data.`}
                  />
                </div>
              </DashboardPanel>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </FullHeightPage>
  )
}
