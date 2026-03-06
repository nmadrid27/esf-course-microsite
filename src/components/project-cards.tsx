import { Link } from "react-router-dom"
import type { Project, Unit } from "@/types"
import { ChevronRight } from "lucide-react"
import { getUnitStyle } from "@/lib/unit-colors"
import { cn } from "@/lib/utils"

interface ProjectCardsProps {
  projects: Project[]
  units: Unit[]
}

function getUnitNameFromWeeks(weeks: number[], units: Unit[]): string {
  const firstWeek = Math.min(...weeks)
  for (const unit of units) {
    if (unit.weeks.includes(firstWeek)) return unit.unitName
  }
  return units[0]?.unitName ?? "Unit"
}

export function ProjectCards({ projects, units }: ProjectCardsProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold tracking-tight">Projects</h2>
      <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
        {projects.map((project) => {
          const unitName = getUnitNameFromWeeks(project.weeks, units)
          const style = getUnitStyle(unitName)

          return (
            <Link
              key={project.projectNumber}
              to={`/projects/P${project.projectNumber}`}
              id={`project-${project.projectNumber}`}
              className={cn(
                "group relative flex flex-col bg-card rounded-[2rem] border overflow-hidden portal-glow hover:shadow-lg transition-shadow hover:border-highlight-border outline-none focus-visible:ring-2 focus-visible:ring-violet-500",
                style.border
              )}
            >
              {/* Subtle highlight effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-violet-50/50 dark:from-violet-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

              {/* Color strip at top */}
              <div className={cn("h-1 w-full", style.bg)} />

              {/* Card header */}
              <div className="px-6 pt-6 pb-4">
                <div className="flex items-center gap-2 flex-wrap mb-4">
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white", style.bg)}>
                    P{project.projectNumber}
                  </div>
                </div>
                <h3 className="text-lg font-bold text-text-primary leading-snug">
                  {project.projectTitle}
                </h3>

                {/* Metadata grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5 pt-5 border-t border-border-subtle">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-text-faint">Curr. Module</p>
                    <p className="text-sm font-semibold text-text-secondary mt-1">{unitName}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-text-faint">Due Date</p>
                    <p className="text-sm font-semibold text-text-secondary mt-1">{project.dueDate}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-text-faint">Weight</p>
                    <p className="text-sm font-semibold text-text-secondary mt-1">{project.weight}</p>
                  </div>
                </div>
              </div>
              {/* Card body */}
              <div className="px-6 pb-6 space-y-4 flex-1 flex flex-col justify-between">
                <p className="text-sm text-text-tertiary leading-relaxed line-clamp-3 mt-1">{project.overview}</p>

                <div className="mt-8 pt-6 border-t border-border-subtle flex items-center justify-between text-sm font-semibold text-violet-400 group-hover:text-violet-300 transition-colors">
                  <span>View Details</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
