import type { Project, Unit } from "@/types"
import { getUnitStyle } from "@/lib/unit-colors"
import { CalendarClock } from "lucide-react"

interface DeadlineCardsProps {
  projects: Project[]
  units: Unit[]
}

function getUnitForProject(project: Project, units: Unit[]): string {
  const firstWeek = Math.min(...project.weeks)
  for (const unit of units) {
    if (unit.weeks.includes(firstWeek)) return unit.unitName
  }
  return units[0]?.unitName ?? "Unit"
}

export function DeadlineCards({ projects, units }: DeadlineCardsProps) {
  // Show all projects as upcoming deadlines, sorted by project number
  const deadlines = [...projects]
    .sort((a, b) => a.projectNumber - b.projectNumber)
    .slice(0, 3)

  if (deadlines.length === 0) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <CalendarClock className="w-5 h-5 text-text-faint" />
        <h2 className="text-lg font-semibold text-text-primary">Upcoming Deadlines</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {deadlines.map((project) => {
          const unitName = getUnitForProject(project, units)
          const style = getUnitStyle(unitName)

          return (
            <div
              key={project.projectNumber}
              className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden"
            >
              <div className="flex h-full">
                {/* Left accent border */}
                <div className={`w-1 shrink-0 ${style.bg}`} />

                <div className="p-4 flex flex-col gap-2">
                  <h3 className="text-sm font-semibold text-text-primary">
                    P{project.projectNumber}: {project.projectTitle}
                  </h3>
                  <p className="text-xs text-text-muted">{project.dueDate}</p>
                  <span
                    className={`self-start text-xs font-medium rounded-full px-2.5 py-0.5 ${style.badge}`}
                  >
                    {project.weight}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
