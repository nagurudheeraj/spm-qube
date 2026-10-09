"use client"

import Link from "next/link"

import { BrandMark } from "@/components/common/brand-mark"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { appConfig } from "@/config/app"
import { navigation } from "@/config/navigation"
import { NavMain } from "./nav-main"
import { NavUser } from "./nav-user"

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="pb-0">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              render={<Link href="/" />}
              tooltip={appConfig.fullName}
              className="h-11 gap-2.5 px-1.5 hover:bg-sidebar-accent/70 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0! group-data-[collapsible=icon]:[&>div]:hidden"
            >
              <BrandMark className="size-7" />
              <div className="grid min-w-0 flex-1 leading-tight">
                <span className="text-[13px] font-semibold tracking-tight text-sidebar-accent-foreground">{appConfig.name}</span>
                <span className="flex items-center gap-1.5 truncate text-[11px] text-sidebar-foreground/60">
                  <span className="size-1.5 shrink-0 rounded-full bg-amber-500" aria-hidden />
                  {appConfig.environment.replace("_", " ").toLowerCase()} · v{appConfig.version}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain modules={navigation} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
