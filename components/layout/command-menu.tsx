"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { House } from "lucide-react"

import {
  CommandDialog,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command"
import { flattenScreens, moduleHref, navigation } from "@/config/navigation"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { setCommandOpen, toggleCommand } from "@/store/slices/ui-slice"

const screens = flattenScreens()

/** ⌘K palette – jump to any module or screen. */
export function CommandMenu() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const open = useAppSelector((s) => s.ui.commandOpen)

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        dispatch(toggleCommand())
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [dispatch])

  const go = (href: string) => {
    dispatch(setCommandOpen(false))
    router.push(href)
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={(value) => dispatch(setCommandOpen(value))}
      title="Search QUBE"
      description="Jump to any module or screen"
    >
      <Command>
        <CommandInput placeholder="Search screens…" />
        <CommandList>
          <CommandEmpty>No screens found.</CommandEmpty>
          <CommandGroup heading="General">
            <CommandItem value="home" onSelect={() => go("/")}>
              <House />
              Home
            </CommandItem>
          </CommandGroup>
          {navigation.map((module) => (
            <CommandGroup key={module.slug} heading={module.title}>
              <CommandItem value={`${module.title} overview`} onSelect={() => go(moduleHref(module))}>
                <module.icon />
                {module.title} overview
              </CommandItem>
              {screens
                .filter((s) => s.module.slug === module.slug)
                .map((s) => (
                  <CommandItem key={s.href} value={s.breadcrumb.join(" ")} onSelect={() => go(s.href)}>
                    <s.item.icon />
                    {s.item.title}
                    {s.path.length > 1 && (
                      <CommandShortcut className="tracking-normal">{s.breadcrumb.slice(1, -1).join(" / ")}</CommandShortcut>
                    )}
                  </CommandItem>
                ))}
            </CommandGroup>
          ))}
        </CommandList>
      </Command>
    </CommandDialog>
  )
}
