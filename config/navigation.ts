import {
  ArrowLeftRight,
  BadgeCheck,
  BookOpen,
  Briefcase,
  Building2,
  CalendarRange,
  FileBarChart,
  FileText,
  Globe,
  Goal,
  Grid3x3,
  Headset,
  History,
  IdCard,
  Info,
  Layers,
  LayoutDashboard,
  LifeBuoy,
  ListChecks,
  ListOrdered,
  ListTree,
  MapPin,
  PencilRuler,
  ReceiptText,
  RefreshCw,
  ScanEye,
  ScrollText,
  Search,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Store,
  Tags,
  Target,
  Users,
  Video,
  Wrench,
  type LucideIcon,
} from "lucide-react"

export type NavItem = {
  slug: string
  title: string
  description: string
  icon: LucideIcon
  /** Nested screens (e.g. Configure → Admin → …). */
  children?: NavItem[]
  /** Legacy menu showed a flyout here; sub-screens not yet catalogued. */
  hasSubmenu?: boolean
}

export type NavModule = {
  slug: string
  title: string
  description: string
  icon: LucideIcon
  items: NavItem[]
}

export const navigation: NavModule[] = [
  {
    slug: "quota",
    title: "Quota",
    description: "Allocate, track and approve sales quotas across periods.",
    icon: Target,
    items: [
      { slug: "allocate", title: "Allocate", description: "Distribute quota targets to teams and employees.", icon: Target },
      { slug: "find", title: "Find", description: "Search existing quota assignments.", icon: Search },
      { slug: "dashboard", title: "Dashboard", description: "Attainment and allocation at a glance.", icon: LayoutDashboard },
      { slug: "adjustments", title: "Adjustments", description: "Apply and review quota adjustments.", icon: SlidersHorizontal },
      {
        slug: "sync",
        title: "Sync",
        description: "Synchronise quota data with downstream systems.",
        icon: RefreshCw,
        children: [
          { slug: "ia", title: "Sync IA", description: "Synchronise IA quota data with downstream systems.", icon: RefreshCw },
          { slug: "mbo", title: "Sync MBO", description: "Synchronise MBO quota data with downstream systems.", icon: Goal },
        ],
      },
      { slug: "approvals", title: "Approvals", description: "Review and approve pending quota changes.", icon: BadgeCheck },
      { slug: "periods", title: "Periods", description: "Manage quota periods and their status.", icon: CalendarRange },
      { slug: "define", title: "Define", description: "Define quota types, metrics and rules.", icon: PencilRuler },
    ],
  },
  {
    slug: "manage",
    title: "Manage",
    description: "Employees, stores, agents and their history.",
    icon: Users,
    items: [
      { slug: "employees", title: "Employees", description: "Browse and maintain employee records.", icon: Users },
      { slug: "stores", title: "Stores", description: "Store hierarchy and details.", icon: Store, hasSubmenu: true },
      { slug: "agents", title: "Agents", description: "Indirect and partner agents.", icon: Headset },
      { slug: "weekly-reports", title: "Weekly Reports", description: "Scheduled weekly performance reports.", icon: FileBarChart },
      { slug: "hr-history", title: "HR History", description: "Historical HR changes per employee.", icon: History },
      { slug: "sales-id-history", title: "Sales ID History", description: "Sales ID assignments over time.", icon: IdCard },
      { slug: "assignment-history", title: "Assignment History", description: "Territory and role assignment changes.", icon: ArrowLeftRight },
      { slug: "tier-vault-history", title: "Tier / Vault History", description: "Tier and vault changes over time.", icon: Layers },
      { slug: "employee-attributes", title: "Employee Attributes", description: "Custom attributes attached to employees.", icon: Tags },
      { slug: "report-queue", title: "Report Queue", description: "Queued and completed report jobs.", icon: ListOrdered },
      { slug: "wholeview", title: "WholeView", description: "Consolidated view across hierarchies.", icon: ScanEye },
      { slug: "zipcode-mapping", title: "Zipcode Mapping", description: "Map zip codes to territories.", icon: MapPin },
      { slug: "quota-relief", title: "Quota Relief", description: "Grant and track quota relief.", icon: LifeBuoy },
    ],
  },
  {
    slug: "configure",
    title: "Configure",
    description: "System-wide settings, reference data and policies.",
    icon: Settings2,
    items: [
      { slug: "admin", title: "Admin", description: "Users, roles and application settings.", icon: ShieldCheck, hasSubmenu: true },
      { slug: "attributes", title: "Attributes", description: "Attribute definitions and values.", icon: ListTree, hasSubmenu: true },
      { slug: "centers", title: "Centers", description: "Cost and sales centers.", icon: Building2, hasSubmenu: true },
      { slug: "dollar-sales-matrix", title: "Dollar Sales Matrix", description: "Dollar-based sales matrix configuration.", icon: Grid3x3, hasSubmenu: true },
      { slug: "jobs", title: "Jobs", description: "Job codes and job families.", icon: Briefcase, hasSubmenu: true },
      { slug: "locales", title: "Locales", description: "Regions, markets and locales.", icon: Globe, hasSubmenu: true },
      { slug: "mbo", title: "MBO", description: "Management-by-objective setup.", icon: Goal, hasSubmenu: true },
      { slug: "rtw-ia-policies", title: "RTW IA Policies", description: "Return-to-work IA policies.", icon: ScrollText },
      { slug: "chargeback-periods", title: "Chargeback Periods", description: "Chargeback period calendar.", icon: ReceiptText },
    ],
  },
  {
    slug: "tasks",
    title: "Tasks",
    description: "Operational tasks and background jobs.",
    icon: ListChecks,
    // TODO: legacy TASKS menu items not yet captured.
    items: [],
  },
  {
    slug: "about",
    title: "About",
    description: "Documentation, manuals and training material.",
    icon: Info,
    items: [
      {
        slug: "documentation",
        title: "Documentation",
        description: "User manuals for every channel.",
        icon: BookOpen,
        children: [
          { slug: "business-enterprise", title: "Business / Enterprise Manual", description: "Guide for Business and Enterprise channels.", icon: FileText },
          { slug: "retail", title: "Retail Manual", description: "Guide for the Retail channel.", icon: FileText },
          { slug: "retail-smb", title: "Retail SMB Manual", description: "Guide for Retail small & medium business.", icon: FileText },
          { slug: "retail-smb-video", title: "Retail SMB Walkthrough", description: "Video walkthrough for Retail SMB.", icon: Video },
          { slug: "telesales", title: "Telesales Manual", description: "Guide for the Telesales channel.", icon: FileText },
          { slug: "indirect-local", title: "Indirect Local Manual", description: "Guide for the Indirect Local channel.", icon: FileText },
          { slug: "indirect-local-video", title: "Indirect Local Walkthrough", description: "Video walkthrough for Indirect Local.", icon: Video },
        ],
      },
    ],
  },
]

export const placeholderIcon: LucideIcon = Wrench

/* ---------- helpers ---------- */

export function getModule(slug: string) {
  return navigation.find((m) => m.slug === slug)
}

export function moduleHref(module: NavModule) {
  return `/${module.slug}`
}

export function screenHref(moduleSlug: string, path: string[]) {
  return `/${moduleSlug}/${path.join("/")}`
}

/** Resolve `/[module]/[...path]` into its module and the chain of items. */
export function resolveScreen(moduleSlug: string, path: string[]) {
  const mod = getModule(moduleSlug)
  if (!mod) return null

  const trail: NavItem[] = []
  let level: NavItem[] | undefined = mod.items
  for (const segment of path) {
    const item: NavItem | undefined = level?.find((i) => i.slug === segment)
    if (!item) return null
    trail.push(item)
    level = item.children
  }
  return { module: mod, trail, screen: trail.at(-1) }
}

export type FlatScreen = {
  module: NavModule
  item: NavItem
  path: string[]
  href: string
  /** Titles from module down to the item, for display. */
  breadcrumb: string[]
}

export function flattenScreens(): FlatScreen[] {
  const out: FlatScreen[] = []
  const walk = (module: NavModule, items: NavItem[], parents: NavItem[]) => {
    for (const item of items) {
      const chain = [...parents, item]
      const path = chain.map((i) => i.slug)
      out.push({
        module,
        item,
        path,
        href: screenHref(module.slug, path),
        breadcrumb: [module.title, ...chain.map((i) => i.title)],
      })
      if (item.children) walk(module, item.children, chain)
    }
  }
  for (const mod of navigation) walk(mod, mod.items, [])
  return out
}

export function findScreenByHref(href: string) {
  return flattenScreens().find((s) => s.href === href)
}
