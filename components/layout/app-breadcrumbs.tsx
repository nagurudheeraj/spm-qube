"use client"

import { Fragment } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { moduleHref, resolveScreen, screenHref } from "@/config/navigation"

type Crumb = { label: string; href: string }

function useCrumbs(): Crumb[] {
  const [moduleSlug, ...path] = usePathname().split("/").filter(Boolean)
  const crumbs: Crumb[] = [{ label: "Home", href: "/" }]
  if (!moduleSlug) return crumbs

  const resolved = resolveScreen(moduleSlug, path)
  if (!resolved) return crumbs

  crumbs.push({ label: resolved.module.title, href: moduleHref(resolved.module) })
  resolved.trail.forEach((item, i) =>
    crumbs.push({ label: item.title, href: screenHref(moduleSlug, path.slice(0, i + 1)) })
  )
  return crumbs
}

export function AppBreadcrumbs() {
  const crumbs = useCrumbs()

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {crumbs.map((crumb, i) => {
          const last = i === crumbs.length - 1
          return (
            <Fragment key={crumb.href}>
              {/* On small screens only the current page is shown. */}
              <BreadcrumbItem className={last ? undefined : "hidden md:inline-flex"}>
                {last ? (
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink render={<Link href={crumb.href} />}>{crumb.label}</BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!last && <BreadcrumbSeparator className="hidden md:block" />}
            </Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
