"use client"

import { ChevronsUpDown, LogOut, Monitor, Moon, Network, Sun, SunMoon, UserRound } from "lucide-react"
import { useTheme } from "next-themes"

import { Avatar, AvatarBadge, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar"
import { mockUser } from "@/config/app"
import { cn } from "@/lib/utils"

const initials = `${mockUser.firstName[0]}${mockUser.lastName[0]}`
const fullName = `${mockUser.firstName} ${mockUser.lastName}`

function UserAvatar({ size = "sm" }: { size?: "sm" | "lg" }) {
  return (
    <Avatar className={cn("rounded-lg after:rounded-lg", size === "lg" ? "size-10" : "size-8")}>
      <AvatarFallback
        className={cn(
          "rounded-lg bg-foreground font-semibold tracking-wide text-background",
          size === "lg" ? "text-[13px]" : "text-[11px]"
        )}
      >
        {initials}
      </AvatarFallback>
      <AvatarBadge aria-label="Online" className="-right-0.5 -bottom-0.5 size-2.5 bg-emerald-500 ring-popover" />
    </Avatar>
  )
}

const menuItem = "gap-2.5 px-2 py-1.5 [&_svg]:text-muted-foreground"

export function NavUser() {
  const { isMobile } = useSidebar()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                aria-label={`Account: ${fullName}`}
                className={cn(
                  "h-12 gap-2.5 rounded-lg px-2",
                  // Raised card, like the search box above.
                  "bg-background shadow-xs ring-1 ring-sidebar-border hover:bg-background hover:ring-foreground/15 dark:bg-sidebar-accent/50",
                  "data-popup-open:ring-foreground/20",
                  "group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:p-0! group-data-[collapsible=icon]:shadow-none group-data-[collapsible=icon]:ring-0"
                )}
              />
            }
          >
            <UserAvatar />
            <div className="grid min-w-0 flex-1 text-left leading-tight">
              <span className="truncate text-[13px] font-medium text-sidebar-accent-foreground">{fullName}</span>
              <span className="truncate text-[11px] text-muted-foreground">{mockUser.role}</span>
            </div>
            <ChevronsUpDown className="ml-auto size-3.5! text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={10}
            className="w-72 rounded-xl p-1.5 shadow-lg"
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="mb-1 flex items-center gap-3 rounded-lg bg-muted/60 p-2.5 text-foreground">
                <UserAvatar size="lg" />
                <div className="grid min-w-0 flex-1 gap-1 leading-tight">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-sm font-semibold">{fullName}</span>
                    <span className="shrink-0 rounded-md bg-background px-1.5 py-px text-[10px] font-medium text-muted-foreground ring-1 ring-border">
                      {mockUser.role}
                    </span>
                  </div>
                  <span className="truncate text-xs font-normal text-muted-foreground">{mockUser.email}</span>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuGroup>
              <DropdownMenuItem className={menuItem}>
                <UserRound />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem className={menuItem}>
                <Network />
                Start proxy
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="my-1.5" />
            <ThemeSwitcher />
            <DropdownMenuSeparator className="my-1.5" />
            <DropdownMenuItem variant="destructive" className={menuItem}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

const themes = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const

/** Inline segmented control: one click to switch, and the menu stays open to preview it. */
function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  return (
    <div className="flex items-center justify-between gap-3 px-2 py-1">
      <span className="flex items-center gap-2.5 text-sm">
        <SunMoon className="size-4 text-muted-foreground" />
        Theme
      </span>
      <div role="radiogroup" aria-label="Theme" className="flex rounded-lg bg-muted p-0.5">
        {themes.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={theme === value}
            aria-label={label}
            title={label}
            onClick={() => setTheme(value)}
            className={cn(
              "flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50",
              theme === value && "bg-background text-foreground shadow-xs ring-1 ring-border"
            )}
          >
            <Icon className="size-3.5" />
          </button>
        ))}
      </div>
    </div>
  )
}
