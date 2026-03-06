import type { Policies } from "@/types"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getUnitStyle } from "@/lib/unit-colors"
import { cn } from "@/lib/utils"

interface PoliciesTabsProps {
  policies: Policies
}

function getUnitStyleForProgression(unit: string) {
  return getUnitStyle(unit)
}

function AiStatusBadge({ unit, status }: { unit: string; status: string }) {
  const style = getUnitStyleForProgression(unit)

  if (style) {
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
          style.badge
        )}
      >
        {status}
      </span>
    )
  }

  // Fallback for unrecognized units
  return (
    <Badge variant="secondary" className="rounded-full text-xs">
      {status}
    </Badge>
  )
}

function StatusBadge({ status }: { status: string }) {
  const config = {
    Prohibited: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
    Allowed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  } as Record<string, string>

  const className = config[status] ?? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        className
      )}
    >
      {status}
    </span>
  )
}

export function PoliciesTabs({ policies }: PoliciesTabsProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold tracking-tight">Course Policies</h2>

      <Tabs defaultValue="ai-use">
        <TabsList className="bg-surface-hover rounded-xl p-1">
          <TabsTrigger
            value="ai-use"
            className="rounded-lg text-sm data-[state=active]:bg-card data-[state=active]:shadow-sm"
          >
            AI Use
          </TabsTrigger>
          <TabsTrigger
            value="late-work"
            className="rounded-lg text-sm data-[state=active]:bg-card data-[state=active]:shadow-sm"
          >
            Late Work
          </TabsTrigger>
          <TabsTrigger
            value="attendance"
            className="rounded-lg text-sm data-[state=active]:bg-card data-[state=active]:shadow-sm"
          >
            Attendance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ai-use" className="space-y-4 mt-4">
          {policies.aiUse.principles.length > 0 && (
            <div className="space-y-2">
              {policies.aiUse.principles.map((p, i) => (
                <p key={i} className="text-sm text-text-secondary leading-relaxed">{p}</p>
              ))}
            </div>
          )}

          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="px-5 pt-4 pb-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-text-faint">
                AI Progression by Unit
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border-subtle">
                    <th className="text-left px-5 py-2.5 text-xs font-semibold text-text-muted">Unit</th>
                    <th className="text-left px-5 py-2.5 text-xs font-semibold text-text-muted">Weeks</th>
                    <th className="text-left px-5 py-2.5 text-xs font-semibold text-text-muted">AI Status</th>
                    <th className="text-left px-5 py-2.5 text-xs font-semibold text-text-muted">Guidance</th>
                  </tr>
                </thead>
                <tbody>
                  {policies.aiUse.unitProgression.map((u, i) => (
                    <tr
                      key={i}
                      className="border-b border-border-subtle last:border-0 hover:bg-surface transition-colors"
                    >
                      <td className="px-5 py-3 font-medium text-text-secondary">{u.unit}</td>
                      <td className="px-5 py-3 text-text-muted">{u.weeks}</td>
                      <td className="px-5 py-3">
                        <AiStatusBadge unit={u.unit} status={u.aiStatus} />
                      </td>
                      <td className="px-5 py-3 text-text-muted">{u.guidance}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="px-5 pt-4 pb-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-text-faint">
                AI Permission by Project
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border-subtle">
                    <th className="text-left px-5 py-2.5 text-xs font-semibold text-text-muted">Project</th>
                    <th className="text-left px-5 py-2.5 text-xs font-semibold text-text-muted">Consultative</th>
                    <th className="text-left px-5 py-2.5 text-xs font-semibold text-text-muted">Transformative</th>
                    <th className="text-left px-5 py-2.5 text-xs font-semibold text-text-muted">Generative</th>
                  </tr>
                </thead>
                <tbody>
                  {policies.aiUse.projectMatrix.map((p, i) => (
                    <tr
                      key={i}
                      className="border-b border-border-subtle last:border-0 hover:bg-surface transition-colors"
                    >
                      <td className="px-5 py-3 font-medium text-text-secondary">{p.project}</td>
                      <td className="px-5 py-3">
                        <StatusBadge status={p.consultative} />
                      </td>
                      <td className="px-5 py-3">
                        <StatusBadge status={p.transformative} />
                      </td>
                      <td className="px-5 py-3">
                        <StatusBadge status={p.generativePrimary} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="late-work" className="mt-4">
          <div className="bg-card rounded-2xl border border-border px-5 py-4">
            <p className="text-sm text-text-secondary leading-relaxed">{policies.lateWork}</p>
          </div>
        </TabsContent>

        <TabsContent value="attendance" className="mt-4">
          <div className="bg-card rounded-2xl border border-border px-5 py-4">
            <p className="text-sm text-text-secondary leading-relaxed">{policies.attendance}</p>
          </div>
        </TabsContent>
      </Tabs>
    </section>
  )
}
