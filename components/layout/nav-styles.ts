/** Shared sidebar item styles so every nav row looks and behaves the same. */

// Current page: raised "chip" on the grey sidebar.
const activeChip =
  "data-active:bg-background data-active:font-medium data-active:text-foreground data-active:shadow-xs data-active:ring-1 data-active:ring-sidebar-border dark:data-active:bg-sidebar-accent dark:data-active:ring-0"

export const navItem = [
  "h-8 gap-2.5 rounded-md px-2 text-[13px] text-sidebar-foreground transition-colors",
  "hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground",
  "[&_svg]:text-sidebar-foreground/65 hover:[&_svg]:text-sidebar-accent-foreground data-active:[&_svg]:text-foreground",
  activeChip,
].join(" ")

export const navSubItem = [
  "h-7 rounded-md px-2 text-[13px] text-sidebar-foreground/75 transition-colors",
  "hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground",
  activeChip,
].join(" ")

/** Rows in the collapsed-rail flyouts: roomy, icon-aligned, current page highlighted. */
export const navFlyoutContent = "rounded-xl p-1.5 shadow-lg"

export const navFlyoutItem = [
  "h-8 gap-2.5 rounded-md px-2 text-[13px]",
  "[&_svg]:text-muted-foreground focus:[&_svg]:text-accent-foreground data-popup-open:[&_svg]:text-accent-foreground",
  "aria-[current=page]:bg-accent aria-[current=page]:font-medium aria-[current=page]:text-accent-foreground aria-[current=page]:[&_svg]:text-accent-foreground",
].join(" ")
