import type { CourseMapEntry } from "@/types"
import { getUnitStyle } from "@/lib/unit-colors"
import { Clock } from "lucide-react"

interface CourseMapProps {
  entries: CourseMapEntry[]
  courseCode: string
}

export function CourseMap({ entries, courseCode }: CourseMapProps) {
  return (
    <section id="course-map" className="space-y-4">
      <h2 className="text-2xl font-bold tracking-tight">Your Path Through {courseCode}</h2>
      <p className="text-sm text-muted-foreground">
        Click any week to jump to its detailed content.
      </p>

      <div className="rounded-2xl bg-card border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-card">
                <th className="text-left py-3 px-4 font-medium text-text-tertiary">Week</th>
                <th className="text-left py-3 px-4 font-medium text-text-tertiary">Unit</th>
                <th className="text-left py-3 px-4 font-medium text-text-tertiary">Theme</th>
                <th className="text-left py-3 px-4 font-medium text-text-tertiary hidden sm:table-cell">Project</th>
                <th className="text-left py-3 px-4 font-medium text-text-tertiary hidden sm:table-cell">Key Deliverable</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => {
                const style = getUnitStyle(e.unit)
                return (
                  <tr
                    key={e.week}
                    tabIndex={0}
                    role="button"
                    className="border-b border-border-subtle last:border-0 hover:bg-surface-hover cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-violet-500 focus-visible:outline-offset-[-2px]"
                    onClick={() => {
                      document.getElementById(`week-${e.week}`)?.scrollIntoView({ behavior: "smooth" })
                    }}
                    onKeyDown={(ev) => {
                      if (ev.key === "Enter" || ev.key === " ") {
                        ev.preventDefault()
                        document.getElementById(`week-${e.week}`)?.scrollIntoView({ behavior: "smooth" })
                      }
                    }}
                  >
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-white text-xs font-semibold ${style.bg}`}
                      >
                        {e.week}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style.badge}`}
                      >
                        {e.unit}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-text-secondary">{e.theme}</td>
                    <td className="py-3 px-4 text-text-tertiary hidden sm:table-cell">{e.activeProject}</td>
                    <td className="py-3 px-4 text-text-muted hidden sm:table-cell">{e.keyDeliverable}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 border-t border-border bg-surface rounded-b-2xl">
          <div className="flex items-start gap-2 text-xs text-text-muted">
            <Clock className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <span>
              Project deadlines fall at the end of Weeks 3, 6, 9, and 10. Check each week for exact submission requirements.
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
