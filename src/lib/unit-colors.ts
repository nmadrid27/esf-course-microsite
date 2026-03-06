export interface UnitStyle {
  label: string
  color: string
  bg: string
  light: string
  border: string
  badge: string
  dot: string
  icon: string
}

/**
 * Four color palettes that rotate based on unit position.
 * Works with any unit names: colors are assigned by index, not by name.
 */
const COLOR_PALETTES: UnitStyle[] = [
  {
    label: "",
    color: "text-violet-400",
    bg: "bg-violet-600",
    light: "bg-highlight",
    border: "border-highlight-border",
    badge: "bg-highlight text-violet-300",
    dot: "bg-violet-500",
    icon: "text-violet-400",
  },
  {
    label: "",
    color: "text-blue-400",
    bg: "bg-blue-600",
    light: "bg-blue-500/15",
    border: "border-blue-500/30",
    badge: "bg-blue-500/20 text-blue-300",
    dot: "bg-blue-500",
    icon: "text-blue-400",
  },
  {
    label: "",
    color: "text-emerald-400",
    bg: "bg-emerald-600",
    light: "bg-emerald-500/15",
    border: "border-emerald-500/30",
    badge: "bg-emerald-500/20 text-emerald-300",
    dot: "bg-emerald-500",
    icon: "text-emerald-400",
  },
  {
    label: "",
    color: "text-amber-400",
    bg: "bg-amber-600",
    light: "bg-amber-500/15",
    border: "border-amber-500/30",
    badge: "bg-amber-500/20 text-amber-300",
    dot: "bg-amber-500",
    icon: "text-amber-400",
  },
]

// Runtime cache: maps unit name → style once resolved
const resolvedStyles: Record<string, UnitStyle> = {}
let registeredUnits: string[] = []

/**
 * Call once at app startup with the unit names from course data.
 * Assigns colors by position (unit 1 = violet, unit 2 = blue, etc.).
 */
export function registerUnits(unitNames: string[]) {
  registeredUnits = unitNames
  for (let i = 0; i < unitNames.length; i++) {
    const palette = COLOR_PALETTES[i % COLOR_PALETTES.length]
    resolvedStyles[unitNames[i]] = { ...palette, label: unitNames[i] }
  }
}

/**
 * Backwards-compatible: also expose as a record for components
 * that read unitStyles directly.
 */
export const unitStyles = resolvedStyles

export function getUnitStyle(unitName: string): UnitStyle {
  if (resolvedStyles[unitName]) return resolvedStyles[unitName]
  // Fallback: first palette
  return { ...COLOR_PALETTES[0], label: unitName }
}

export function getUnitOrder(): string[] {
  return registeredUnits
}
