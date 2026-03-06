import type { CourseMetadata, LearningOutcome, GradingComponent, CourseStructure, Project } from "@/types"
import { getUnitStyle } from "@/lib/unit-colors"
import { Brain, Zap, Eye, Layers } from "lucide-react"
import { DeadlineCards } from "./deadline-cards"

interface CourseOverviewProps {
  metadata: CourseMetadata
  outcomes: LearningOutcome[]
  grading: GradingComponent[]
  structure: CourseStructure
  projects: Project[]
}

const UNIT_ICONS = [Brain, Zap, Eye, Layers]

const QUICK_LINKS = [
  {
    label: "Course Map",
    labelGradient: "from-violet-500 to-blue-500",
    description: "Week-by-week schedule showing units, themes, and active projects across the 10-week quarter.",
    href: "#course-map",
  },
  {
    label: "Projects",
    labelGradient: "from-blue-500 to-emerald-500",
    description: "Detailed briefs, deliverables, and assessment criteria for all four course projects.",
    href: "#project-1",
  },
  {
    label: "ESF Framework",
    labelGradient: "from-emerald-500 to-amber-500",
    description: "Epistemic Stewardship Framework integration: Position Statement, Five Questions, Records of Resistance.",
    href: "#policies",
  },
  {
    label: "Templates & Tools",
    labelGradient: "from-amber-500 to-violet-500",
    description: "AI Use Log, Position Statement, and Record of Resistance templates ready to download.",
    href: "#templates",
  },
]

function smoothScrollTo(id: string) {
  const el = document.getElementById(id.replace("#", ""))
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" })
  }
}

export function CourseOverview({ metadata, outcomes, grading, structure, projects }: CourseOverviewProps) {
  const totalWeight = grading.reduce((sum, g) => sum + g.weight, 0)

  return (
    <section id="overview" className="w-full">

      {/* 1. Hero Banner - Full Bleed */}
      <div className="relative w-full bg-[#12112A] text-white pt-16 pb-24 overflow-hidden mb-12">
        <div className="absolute inset-0 pointer-events-none select-none opacity-20 bg-gradient-to-br from-violet-600 via-blue-700 to-transparent" />

        {/* Inner Header Container */}
        <div className="relative z-10 mx-auto max-w-[1400px] px-6 sm:px-10 lg:px-12 space-y-6">
          {/* Program pill */}
          <span className="inline-block text-xs md:text-sm font-semibold tracking-wider uppercase bg-white/10 text-white/80 rounded-full px-4 py-1.5 backdrop-blur-sm border border-white/20">
            {metadata.program ?? "Applied AI Program"} · {metadata.quarter} {metadata.year}
          </span>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl lg:text-[4rem] font-bold tracking-tight leading-[1.1] max-w-4xl text-balance text-white">
            {metadata.courseCode}: {metadata.courseTitle}
          </h1>

          {/* Subtitle */}
          <p className="text-lg lg:text-xl text-white/80 max-w-2xl leading-relaxed font-light mt-4">
            {metadata.courseDescription}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 pt-4">
            {["Non-technical", "No coding required", "AI introduced progressively", `${metadata.totalWeeks} weeks`].map(
              (tag) => (
                <span
                  key={tag}
                  className="text-sm font-medium bg-white/10 text-white/80 rounded-full px-4 py-1.5 backdrop-blur-sm border border-white/10"
                >
                  {tag}
                </span>
              )
            )}
          </div>
        </div>
      </div>

      {/* Rest of the Overview content inside standard width container */}
      <div className="mx-auto max-w-[1400px] px-6 sm:px-10 lg:px-12 space-y-12">

        {/* Deadline Cards */}
        <DeadlineCards projects={projects} />

        {/* 2–3. About + Learning Outcomes (3-col bento on wide screens) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* About — spans 2 cols */}
          <div className="lg:col-span-2 bg-card rounded-[2rem] border border-border p-10 space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">About This Course</h2>
            <p className="text-base text-text-tertiary leading-relaxed">{metadata.courseDescription}</p>

            {/* Positioning callout */}
            <div className="bg-highlight border border-highlight-border rounded-xl px-6 py-4">
              <p className="text-sm font-medium text-violet-300 leading-relaxed">
                AI 180 is the THINK phase of the Applied AI degree. The course does not treat AI as the subject
                matter. It treats your thinking as the subject matter. AI is one tool among many; introduced
                only after you have mapped your own cognitive patterns.
              </p>
            </div>

            {/* Non-technical note */}
            <p className="text-base text-text-muted italic bg-surface rounded-2xl px-8 py-5 leading-relaxed">
              No prior AI experience or technical background is required. If you completed AI 101, you are well
              positioned. If you did not, you will catch up quickly. The course is designed for creative thinkers,
              not engineers.
            </p>
          </div>

          {/* Learning Outcomes — 1 col */}
          <div className="bg-card rounded-[2rem] border border-border p-10 space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">Learning Outcomes</h2>
            <p className="text-sm text-text-muted font-medium">By the end of this course, you will be able to:</p>
            <ol className="space-y-4">
              {outcomes.map((o) => (
                <li key={o.id} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-violet-600 text-white text-xs font-bold flex items-center justify-center mt-0.5">
                    {o.id}
                  </span>
                  <span className="text-text-secondary text-sm leading-relaxed">{o.outcome}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* 4. Cognitive Ladder (Course Structure) */}
        <div className="space-y-8 mt-16">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">Course Structure</h2>
            {structure.cognitiveProgression && (
              <p className="text-sm text-text-muted">{structure.cognitiveProgression}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {structure.units.map((unit, index) => {
              const styles = getUnitStyle(unit.unitName)
              const Icon = UNIT_ICONS[index] ?? Brain
              const weekLabel =
                unit.weeks.length === 1
                  ? `Week ${unit.weeks[0]}`
                  : `Weeks ${unit.weeks[0]}–${unit.weeks[unit.weeks.length - 1]}`

              const weekCount = unit.weeks.length
              const weekCountLabel = weekCount === 1 ? "1 week" : `${weekCount} weeks`

              return (
                <div
                  key={unit.unitNumber}
                  className="bg-card rounded-[2rem] border border-border overflow-hidden flex flex-col hover:shadow-lg transition-shadow portal-glow"
                >
                  {/* Colored top border strip */}
                  <div className={`h-1 w-full ${styles.bg}`} />

                  <div className="p-6 flex flex-col gap-3 flex-1">
                    {/* Icon square */}
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${styles.light}`}>
                      <Icon className={`w-5 h-5 ${styles.icon}`} />
                    </div>

                    {/* Unit number + week range */}
                    <p className="text-sm text-text-faint font-bold tracking-wider uppercase mb-1">
                      Unit {unit.unitNumber} · {weekLabel}
                    </p>

                    {/* Unit name */}
                    <h3 className={`text-xl font-bold leading-tight ${styles.color}`}>
                      {unit.unitName}
                    </h3>

                    {/* Description */}
                    {unit.description && (
                      <p className="text-xs text-text-tertiary leading-relaxed">{unit.description}</p>
                    )}

                    {/* Theme */}
                    <p className="text-xs text-text-muted leading-relaxed flex-1">{unit.theme}</p>

                    {/* Footer: week count + AI badge */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-medium text-text-faint">
                        {weekCountLabel}
                      </span>
                      <span
                        className={`text-xs font-medium rounded-full px-2.5 py-0.5 ${unit.aiPresent
                          ? styles.badge
                          : "bg-surface-hover text-text-muted"
                          }`}
                      >
                        {unit.aiPresent ? "AI active" : "AI absent"}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Unit 1 rationale */}
          <p className="text-base text-text-muted italic bg-surface rounded-2xl px-8 py-5 leading-relaxed mt-6">
            AI is intentionally absent in Unit 1. You observe your own thinking first, without outside
            augmentation. This is not a restriction — it is the pedagogical foundation that makes the rest of
            the course meaningful.
          </p>
        </div>

        {/* 5–6. Grading + Quick Links (3-col: grading spans 1, quick links span 2) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-16 pt-8 border-t border-border-subtle">
          {/* Grading Table */}
          <div className="bg-card rounded-[2rem] border border-border p-10 space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">Grading</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border-subtle">
                    <th className="text-left py-2 pr-4 font-medium text-text-muted pb-3">Component</th>
                    <th className="text-left py-2 pr-4 font-medium text-text-muted pb-3">Weight</th>
                    <th className="text-left py-2 font-medium text-text-muted pb-3">Due</th>
                  </tr>
                </thead>
                <tbody>
                  {grading.map((g) => (
                    <tr key={g.component} className="border-b border-border-subtle last:border-0">
                      <td className="py-3 pr-4 text-text-secondary">{g.component}</td>
                      <td className="py-3 pr-4">
                        <span className="inline-block bg-surface-hover text-text-tertiary text-xs font-semibold rounded-full px-2.5 py-0.5">
                          {g.weight}%
                        </span>
                      </td>
                      <td className="py-3 text-text-muted">
                        {g.dueWeek ? `Week ${g.dueWeek}` : "Ongoing"}
                      </td>
                    </tr>
                  ))}
                  {/* Total row */}
                  <tr className="border-t border-border">
                    <td className="py-3 pr-4 font-semibold text-text-primary">Total</td>
                    <td className="py-3 pr-4">
                      <span className="inline-block bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900 text-xs font-semibold rounded-full px-2.5 py-0.5">
                        {totalWeight}%
                      </span>
                    </td>
                    <td />
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Links Grid — spans 2 cols */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">Course Sections</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {QUICK_LINKS.map((link) => (
                <div
                  key={link.label}
                  className="bg-card rounded-[2rem] border border-border p-6 flex flex-col gap-3 hover:shadow-lg transition-shadow portal-glow"
                >
                  {/* Gradient pill label */}
                  <span
                    className={`self-start text-sm font-bold tracking-wide text-white rounded-full px-4 py-1.5 bg-gradient-to-r ${link.labelGradient}`}
                  >
                    {link.label}
                  </span>

                  {/* Description */}
                  <p className="text-base text-text-tertiary leading-relaxed flex-1 mt-2">{link.description}</p>

                  {/* Link */}
                  <a
                    href={link.href}
                    className="text-sm font-medium text-violet-400 hover:text-violet-300 transition-colors"
                    onClick={(e) => {
                      e.preventDefault()
                      smoothScrollTo(link.href)
                    }}
                  >
                    View →
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </section>
  )
}
