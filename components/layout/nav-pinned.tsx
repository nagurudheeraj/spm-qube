"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { findScreenByHref } from "@/config/navigation"
import { useMounted } from "@/hooks/use-mounted"
import { useAppSelector } from "@/store/hooks"
import { navItem } from "./nav-styles"

/** User's pinned screens. Hidden until something is pinned. */
export function NavPinned() {
  const pathname = usePathname()
  const mounted = useMounted()
  const pinned = useAppSelector((s) => s.ui.pinned)
  const screens = pinned.map(findScreenByHref).filter((s) => s !== undefined)

  if (!mounted || screens.length === 0) return null

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="h-7 text-[11px] font-medium tracking-wide text-sidebar-foreground/50 uppercase">
        Pinned
      </SidebarGroupLabel>
      <SidebarMenu className="gap-0.5">
        {screens.map((s) => (
          <SidebarMenuItem key={s.href}>
            <SidebarMenuButton
              tooltip={s.breadcrumb.join(" / ")}
              isActive={pathname === s.href}
              render={<Link href={s.href} />}
              className={navItem}
            >
              <s.item.icon />
              <span>{s.item.title}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
