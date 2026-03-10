import { useState, useMemo } from "react"
import type { Week, Project } from "@/types"
import { getUnitStyle } from "@/lib/unit-colors"
import { ChevronDown, ChevronUp, Clock, Package, Sparkles } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface WeekAccordionProps {
  weeks: Week[]
  projects?: Project[]
}

export function WeekAccordion({ weeks, projects = [] }: WeekAccordionProps) {
  // Derive submission weeks from project due weeks (last week in each project's span)
  const submissionWeeks = useMemo(() => {
    const set = new Set<number>()
    for (const p of projects) {
      if (p.weeks.length > 0) set.add(Math.max(...p.weeks))
    }
    return set
  }, [projects])
  const [openWeek, setOpenWeek] = useState<number | null>(null)

  function toggleWeek(weekNumber: number) {
    setOpenWeek((prev) => (prev === weekNumber ? null : weekNumber))
  }

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold tracking-tight">Weekly Content</h2>
      <div className="space-y-2">
        {weeks.map((week) => {
          const style = getUnitStyle(week.unitName)
          const isOpen = openWeek === week.weekNumber
          const isSubmission = submissionWeeks.has(week.weekNumber)

          // applyIt is not present in the current data model; guard defensively
          const applyIt = (week as unknown as Record<string, unknown>).applyIt as
            | { prompt: string; repoPath: string }
            | undefined

          return (
            <div
              key={week.weekNumber}
              id={`week-${week.weekNumber}`}
              className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm"
            >
              {/* Collapsed header / toggle button */}
              <button
                type="button"
                onClick={() => toggleWeek(week.weekNumber)}
                className="w-full text-left px-4 py-4 flex items-center gap-3 hover:bg-white/5 transition-colors"
                aria-expanded={isOpen}
                aria-controls={`week-content-${week.weekNumber}`}
              >
                {/* Week number square */}
                <span
                  className={`flex-none inline-flex items-center justify-center w-9 h-9 rounded-xl text-white text-sm font-bold ${style.bg}`}
                >
                  {week.weekNumber}
                </span>

                {/* Badges + title block */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 mb-1">
                    {/* Unit badge */}
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style.badge}`}
                    >
                      {week.unitName}
                    </span>

                    {/* Submission badge */}
                    {isSubmission && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300">
                        Submission
                      </span>
                    )}

                    {/* Apply It badge — only if data exists */}
                    {applyIt && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300">
                        <Sparkles className="h-3 w-3" />
                        Apply It
                      </span>
                    )}
                  </div>

                  <div className="font-semibold text-text-secondary text-sm leading-snug truncate">
                    {week.theme}
                  </div>

                  {week.deliverables.length > 0 && (
                    <div className="text-xs text-text-muted mt-0.5 truncate">
                      {week.deliverables[0].deliverable}
                    </div>
                  )}
                </div>

                {/* Chevron */}
                <span className="flex-none text-text-faint">
                  {isOpen ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </span>
              </button>

              {/* Expanded content */}
              {isOpen && (
                <div
                  id={`week-content-${week.weekNumber}`}
                  className="border-t border-border-subtle px-4 pb-5 pt-4"
                >
                  {/* Overview */}
                  {week.overview && (
                    <p className="text-sm text-text-tertiary leading-relaxed mb-5">{week.overview}</p>
                  )}

                  {/* Tabbed content */}
                  <Tabs defaultValue="sessions">
                    <TabsList className="bg-surface-hover rounded-xl p-1">
                      <TabsTrigger value="sessions" className="rounded-lg text-xs">
                        Sessions
                      </TabsTrigger>
                      <TabsTrigger value="deliverables" className="rounded-lg text-xs">
                        Deliverables
                      </TabsTrigger>
                      <TabsTrigger value="looking-ahead" className="rounded-lg text-xs">
                        Looking Ahead
                      </TabsTrigger>
                    </TabsList>

                    {/* Sessions tab */}
                    <TabsContent value="sessions" className="mt-4 space-y-3">
                      {week.sessions.map((session) => (
                        <div
                          key={session.sessionNumber}
                          className={`rounded-2xl border p-4 hover:shadow-md transition-shadow ${style.light} ${style.border}`}
                        >
                          {/* Session header */}
                          <div className="flex items-center gap-2 mb-3">
                            <span
                              className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-white text-xs font-semibold flex-none ${style.bg}`}
                            >
                              {session.sessionNumber}
                            </span>
                            <span className={`text-sm font-semibold ${style.color}`}>
                              {session.sessionTitle}
                            </span>
                          </div>

                          {/* Activities */}
                          <div className="space-y-3 pl-2">
                            {session.activities.map((activity, i) => (
                              <div key={i} className="space-y-0.5">
                                <div className="text-xs font-semibold text-text-secondary">
                                  {activity.activityName}
                                  <span className="ml-1.5 font-normal text-text-faint">
                                    {activity.duration}
                                  </span>
                                </div>
                                <p className="text-xs text-text-tertiary leading-relaxed">
                                  {activity.description}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}

                      {/* Apply It card — only rendered if data exists */}
                      {applyIt && (
                        <div className="rounded-2xl border border-orange-200 bg-orange-50 dark:border-orange-800/40 dark:bg-orange-950/30 p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="h-4 w-4 text-orange-600 dark:text-orange-400 flex-none" />
                            <span className="text-sm font-semibold text-orange-800 dark:text-orange-200">Apply It</span>
                          </div>
                          <p className="text-sm text-orange-900 dark:text-orange-100 leading-relaxed mb-1">
                            {applyIt.prompt}
                          </p>
                          {applyIt.repoPath && (
                            <p className="text-xs text-orange-600 dark:text-orange-400 font-mono">{applyIt.repoPath}</p>
                          )}
                        </div>
                      )}
                    </TabsContent>

                    {/* Deliverables tab */}
                    <TabsContent value="deliverables" className="mt-4">
                      {week.deliverables.length > 0 ? (
                        <div className="rounded-2xl border border-border bg-surface p-5">
                          <div className="flex items-center gap-2 mb-4">
                            <Package className="h-4 w-4 text-text-muted flex-none" />
                            <span className="text-sm font-semibold text-text-secondary">Deliverables</span>
                          </div>
                          <ul className="space-y-3">
                            {week.deliverables.map((d, i) => (
                              <li key={i} className="flex items-start gap-3 text-sm text-text-secondary">
                                <span className={`flex-none w-1.5 h-1.5 rounded-full mt-1.5 ${style.bg}`} />
                                <div>
                                  <span className="font-medium">{d.deliverable}</span>
                                  {d.dueDate && (
                                    <span className="block text-xs text-text-muted mt-0.5">{d.dueDate}</span>
                                  )}
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <p className="text-sm text-text-muted">No deliverables this week.</p>
                      )}
                    </TabsContent>

                    {/* Looking Ahead tab */}
                    <TabsContent value="looking-ahead" className="mt-4">
                      {week.lookingAhead ? (
                        <div className="rounded-2xl border border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/10 p-5">
                          <div className="flex items-center gap-2 mb-3">
                            <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-none" />
                            <span className="text-sm font-semibold text-amber-900 dark:text-amber-300">Looking Ahead</span>
                          </div>
                          <p className="text-sm text-amber-800 dark:text-amber-200 leading-relaxed">{week.lookingAhead}</p>
                        </div>
                      ) : (
                        <p className="text-sm text-text-muted">No preview available for this week.</p>
                      )}
                    </TabsContent>
                  </Tabs>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
