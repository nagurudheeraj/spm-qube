"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight, House, LayoutGrid, Search, type LucideIcon } from "lucide-react"

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Kbd } from "@/components/ui/kbd"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { moduleHref, screenHref, type NavItem, type NavModule } from "@/config/navigation"
import { cn } from "@/lib/utils"
import { useAppDispatch } from "@/store/hooks"
import { setCommandOpen } from "@/store/slices/ui-slice"
import { NavPinned } from "./nav-pinned"
import { navFlyoutContent, navFlyoutItem, navItem, navSubItem } from "./nav-styles"

const isWithin = (pathname: string, href: string) =>
  pathname === href || pathname.startsWith(`${href}/`)

export function NavMain({ modules }: { modules: NavModule[] }) {
  const pathname = usePathname()
  const dispatch = useAppDispatch()

  return (
    <>
      <SidebarGroup className="pt-1">
        <SidebarMenu className="gap-0.5">
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Search  ⌘K"
              onClick={() => dispatch(setCommandOpen(true))}
              className={cn(
                navItem,
                "mb-2 bg-background text-muted-foreground shadow-xs ring-1 ring-sidebar-border hover:bg-background hover:text-foreground dark:bg-sidebar-accent/50",
                "group-data-[collapsible=icon]:mb-1 group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:shadow-none group-data-[collapsible=icon]:ring-0"
              )}
            >
              <Search />
              <span>Search</span>
              <Kbd className="ml-auto h-5 bg-transparent px-1 text-[11px] text-muted-foreground/80">⌘K</Kbd>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Home" isActive={pathname === "/"} render={<Link href="/" />} className={navItem}>
              <House />
              <span>Home</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>

      <NavPinned />

      <SidebarGroup>
        <SidebarGroupLabel className="h-7 text-[11px] font-medium tracking-wide text-sidebar-foreground/50 uppercase">
          Modules
        </SidebarGroupLabel>
        <SidebarMenu className="gap-0.5">
          {modules.map((mod) => (
            <ModuleNavItem key={mod.slug} module={mod} pathname={pathname} />
          ))}
        </SidebarMenu>
      </SidebarGroup>
    </>
  )
}

function ModuleNavItem({ module: mod, pathname }: { module: NavModule; pathname: string }) {
  const { state, isMobile } = useSidebar()
  const href = moduleHref(mod)
  const inModule = isWithin(pathname, href)
  const Icon = mod.icon

  // Controlled so navigating into a module can expand it without Base UI's defaultOpen warning.
  const [open, setOpen] = useState(inModule)
  const [prevInModule, setPrevInModule] = useState(inModule)
  if (inModule !== prevInModule) {
    setPrevInModule(inModule)
    if (inModule) setOpen(true)
  }

  // Collapsed rail: show the module's screens in a flyout instead of an inline tree.
  if (state === "collapsed" && !isMobile) {
    return (
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<SidebarMenuButton isActive={inModule} aria-label={mod.title} className={navItem} />}
          >
            <Icon />
            <span>{mod.title}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="start" sideOffset={10} className={cn("w-60", navFlyoutContent)}>
            <DropdownMenuGroup>
              <DropdownMenuLabel className="flex items-center gap-2 px-2 pt-1.5 pb-2 text-[11px] font-medium tracking-wide uppercase">
                {mod.title}
              </DropdownMenuLabel>
              <FlyoutLink href={href} pathname={pathname} icon={LayoutGrid} title="Overview" exact />
            </DropdownMenuGroup>
            {mod.items.length > 0 && <DropdownMenuSeparator className="mx-1 my-1.5" />}
            <DropdownMenuGroup className="flex flex-col gap-0.5">
              {mod.items.map((item) => {
                const itemHref = screenHref(mod.slug, [item.slug])
                if (!item.children?.length) {
                  return <FlyoutLink key={item.slug} href={itemHref} pathname={pathname} icon={item.icon} title={item.title} />
                }
                return (
                  <DropdownMenuSub key={item.slug}>
                    <DropdownMenuSubTrigger
                      aria-current={isWithin(pathname, itemHref) ? "page" : undefined}
                      className={cn(navFlyoutItem, "[&>svg:last-child]:size-3.5")}
                    >
                      <item.icon />
                      {item.title}
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent sideOffset={14} alignOffset={-6} className={cn("w-56", navFlyoutContent)}>
                      <DropdownMenuGroup>
                        <DropdownMenuLabel className="px-2 pt-1.5 pb-2 text-[11px] font-medium tracking-wide uppercase">
                          {item.title}
                        </DropdownMenuLabel>
                        <FlyoutLink href={itemHref} pathname={pathname} icon={LayoutGrid} title="Overview" exact />
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator className="mx-1 my-1.5" />
                      <DropdownMenuGroup className="flex flex-col gap-0.5">
                        {item.children.map((child) => (
                          <FlyoutLink
                            key={child.slug}
                            href={screenHref(mod.slug, [item.slug, child.slug])}
                            pathname={pathname}
                            icon={child.icon}
                            title={child.title}
                          />
                        ))}
                      </DropdownMenuGroup>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                )
              })}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    )
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen} render={<SidebarMenuItem />}>
      <CollapsibleTrigger
        render={
          <SidebarMenuButton
            className={cn(navItem, inModule && "font-medium text-sidebar-accent-foreground [&_svg]:text-sidebar-accent-foreground")}
          />
        }
      >
        <Icon />
        <span>{mod.title}</span>
        <ChevronRight className="ml-auto size-3.5! opacity-0 transition-[transform,opacity] duration-200 group-hover/menu-item:opacity-60 group-data-panel-open/menu-button:rotate-90 group-data-panel-open/menu-button:opacity-60" />
      </CollapsibleTrigger>
      <CollapsibleContent className="h-(--collapsible-panel-height) overflow-hidden transition-[height] duration-200 ease-out data-ending-style:h-0 data-starting-style:h-0">
        <SidebarMenuSub className="mr-0 ml-4 gap-0.5 border-sidebar-border/80 py-1 pr-0 pl-2">
          <SidebarMenuSubItem>
            <SidebarMenuSubButton isActive={pathname === href} render={<Link href={href} />} className={navSubItem}>
              <span>Overview</span>
            </SidebarMenuSubButton>
          </SidebarMenuSubItem>
          {mod.items.map((item) => {
            const itemHref = screenHref(mod.slug, [item.slug])
            if (item.children?.length) {
              return <NestedNavItem key={item.slug} moduleSlug={mod.slug} item={item} pathname={pathname} />
            }
            return (
              <SidebarMenuSubItem key={item.slug}>
                <SidebarMenuSubButton isActive={isWithin(pathname, itemHref)} render={<Link href={itemHref} />} className={navSubItem}>
                  <span>{item.title}</span>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            )
          })}
        </SidebarMenuSub>
      </CollapsibleContent>
    </Collapsible>
  )
}

/** A screen with sub-screens (e.g. Sync → Sync IA / Sync MBO): link plus an expandable nested list. */
function NestedNavItem({ moduleSlug, item, pathname }: { moduleSlug: string; item: NavItem; pathname: string }) {
  const href = screenHref(moduleSlug, [item.slug])
  const inItem = isWithin(pathname, href)

  const [open, setOpen] = useState(inItem)
  const [prevInItem, setPrevInItem] = useState(inItem)
  if (inItem !== prevInItem) {
    setPrevInItem(inItem)
    if (inItem) setOpen(true)
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen} render={<SidebarMenuSubItem />}>
      <SidebarMenuSubButton isActive={pathname === href} render={<Link href={href} />} className={cn(navSubItem, "pr-7")}>
        <span>{item.title}</span>
      </SidebarMenuSubButton>
      <CollapsibleTrigger
        aria-label={`${open ? "Collapse" : "Expand"} ${item.title}`}
        className="absolute top-1 right-1 flex size-5 items-center justify-center rounded-md text-sidebar-foreground/60 outline-none hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring data-panel-open:[&>svg]:rotate-90"
      >
        <ChevronRight className="size-3.5 transition-transform duration-200" />
      </CollapsibleTrigger>
      <CollapsibleContent className="h-(--collapsible-panel-height) overflow-hidden transition-[height] duration-200 ease-out data-ending-style:h-0 data-starting-style:h-0">
        <SidebarMenuSub className="mx-0 mr-0 ml-2.5 gap-0.5 border-sidebar-border/80 py-0.5 pr-0 pl-2">
          {item.children!.map((child) => {
            const childHref = screenHref(moduleSlug, [item.slug, child.slug])
            return (
              <SidebarMenuSubItem key={child.slug}>
                <SidebarMenuSubButton isActive={isWithin(pathname, childHref)} render={<Link href={childHref} />} className={navSubItem}>
                  <span>{child.title}</span>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            )
          })}
        </SidebarMenuSub>
      </CollapsibleContent>
    </Collapsible>
  )
}

function FlyoutLink({
  href,
  pathname,
  icon: Icon,
  title,
  exact,
}: {
  href: string
  pathname: string
  icon: LucideIcon
  title: string
  /** Only highlight on the exact page (for "Overview" rows). */
  exact?: boolean
}) {
  const current = exact ? pathname === href : isWithin(pathname, href)
  return (
    <DropdownMenuItem
      render={<Link href={href} />}
      aria-current={current ? "page" : undefined}
      className={navFlyoutItem}
    >
      <Icon />
      {title}
    </DropdownMenuItem>
  )
}
