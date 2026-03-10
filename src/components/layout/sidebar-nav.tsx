import { useState } from "react"
import type { CourseData } from "@/types"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import { unitStyles } from "@/lib/unit-colors"
import {
  Brain,
  BookOpen,
  Map,
  FolderOpen,
  FileText,
  ScrollText,
  ChevronRight,
  CircleDot,
} from "lucide-react"

interface SidebarNavProps {
  data: CourseData
  activeSection: string
}

const STATIC_NAV_ITEMS = [
  { id: "overview", label: "Overview", icon: BookOpen },
  { id: "course-map", label: "Course Map", icon: Map },
  { id: "projects", label: "Projects", icon: FolderOpen },
  { id: "templates", label: "Templates", icon: FileText },
  { id: "policies", label: "Policies", icon: ScrollText },
]

function getSubmissionWeeks(data: CourseData): number[] {
  return data.projects
    .filter((p) => p.weeks.length > 0)
    .map((p) => Math.max(...p.weeks))
}

function getActiveUnitForSection(
  activeSection: string,
  weeks: CourseData["weeks"]
): string | null {
  if (!activeSection.startsWith("week-")) return null
  const weekNum = parseInt(activeSection.replace("week-", ""), 10)
  const week = weeks.find((w) => w.weekNumber === weekNum)
  return week?.unitName ?? null
}

export function SidebarNav({ data, activeSection }: SidebarNavProps) {
  const activeUnit = getActiveUnitForSection(activeSection, data.weeks)
  const submissionWeeks = getSubmissionWeeks(data)
  const firstUnitName = data.courseStructure.units[0]?.unitName ?? ""

  // Start with the active unit open, or the first unit
  const [openUnits, setOpenUnits] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    for (const unit of data.courseStructure.units) {
      initial[unit.unitName] = unit.unitName === (activeUnit ?? firstUnitName)
    }
    return initial
  })

  const handleNav = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
  }

  const toggleUnit = (unitName: string) => {
    setOpenUnits((prev) => ({ ...prev, [unitName]: !prev[unitName] }))
  }

  const isStaticActive = (itemId: string) => {
    if (itemId === "projects") return activeSection.startsWith("project-")
    return activeSection === itemId
  }

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border pl-4 pr-6 pt-5 pb-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center shrink-0">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-sidebar-foreground/50 text-xs uppercase tracking-widest leading-none mb-0.5">
              {data.metadata.program ?? data.metadata.courseCode}
            </p>
            <p className="text-sidebar-foreground font-semibold text-sm leading-none">
              {data.metadata.courseCode}
            </p>
          </div>
        </div>
        <h1 className="text-sidebar-foreground text-lg font-medium leading-snug">
          {data.metadata.courseTitle}
        </h1>
        <p className="text-sidebar-foreground/40 text-xs mt-1">
          {data.metadata.quarter} {data.metadata.year}
        </p>
      </SidebarHeader>

      <SidebarContent>
        {/* Static nav items */}
        <SidebarGroup>
          <SidebarMenu>
            {STATIC_NAV_ITEMS.map(({ id, label, icon: Icon }) => (
              <SidebarMenuItem key={id}>
                <SidebarMenuButton
                  isActive={isStaticActive(id)}
                  onClick={() => handleNav(id)}
                  tooltip={label}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        {/* Unit tree with collapsible week groups */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/30 text-xs uppercase tracking-widest px-2">
            Weekly Content
          </SidebarGroupLabel>
          <SidebarMenu>
            {data.courseStructure.units.map((unit) => {
              const style = unitStyles[unit.unitName]
              const isOpen = openUnits[unit.unitName] ?? false
              const unitWeeks = data.weeks.filter((w) =>
                unit.weeks.includes(w.weekNumber)
              )
              const hasActiveWeek = unitWeeks.some(
                (w) => activeSection === `week-${w.weekNumber}`
              )

              return (
                <Collapsible
                  key={unit.unitName}
                  open={isOpen}
                  onOpenChange={() => toggleUnit(unit.unitName)}
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        tooltip={unit.unitName}
                        className={cn(
                          "w-full",
                          hasActiveWeek && !isOpen && style?.light
                        )}
                      >
                        <span
                          className={cn(
                            "w-2 h-2 rounded-full shrink-0",
                            style?.dot
                          )}
                        />
                        <span className="flex-1 truncate text-sm font-medium">
                          {unit.unitName}
                        </span>
                        <ChevronRight
                          className={cn(
                            "h-3.5 w-3.5 shrink-0 text-sidebar-foreground/40 transition-transform duration-200",
                            isOpen && "rotate-90"
                          )}
                        />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <div className="ml-3 border-l border-sidebar-border pl-2 py-1">
                        {unitWeeks.map((week) => {
                          const isWeekActive =
                            activeSection === `week-${week.weekNumber}`
                          const isSubmission = submissionWeeks.includes(
                            week.weekNumber
                          )

                          return (
                            <SidebarMenuButton
                              key={week.weekNumber}
                              isActive={isWeekActive}
                              onClick={() =>
                                handleNav(`week-${week.weekNumber}`)
                              }
                              tooltip={`Week ${week.weekNumber}: ${week.theme}`}
                              className="w-full"
                            >
                              <span className="text-xs text-sidebar-foreground/50 w-5 shrink-0 tabular-nums">
                                {week.weekNumber}
                              </span>
                              <span className="flex-1 truncate text-xs">
                                {week.theme}
                              </span>
                              {isSubmission && (
                                <CircleDot
                                  className={cn(
                                    "h-3 w-3 shrink-0",
                                    style?.icon
                                  )}
                                />
                              )}
                            </SidebarMenuButton>
                          )
                        })}
                      </div>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border pl-4 pr-6 pt-4 pb-5">
        <SidebarGroupLabel className="text-sidebar-foreground/30 text-xs uppercase tracking-widest mb-3 px-0">
          Units
        </SidebarGroupLabel>
        <div className="space-y-2">
          {data.courseStructure.units.map((unit) => {
            const style = unitStyles[unit.unitName]
            return (
              <div key={unit.unitName} className="flex items-center gap-2.5">
                <span className={cn("w-2 h-2 rounded-full shrink-0", style?.dot)} />
                <span className="text-sidebar-foreground/40 text-xs">
                  {unit.unitName}
                </span>
              </div>
            )
          })}
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
