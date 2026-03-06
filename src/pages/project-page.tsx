import { useParams, Navigate, Link } from "react-router-dom"
import type { CourseData } from "@/types"
import { ArrowLeft, Clock, Target, CalendarDays, CheckCircle2 } from "lucide-react"

interface ProjectPageProps {
    data: CourseData
}

export function ProjectPage({ data }: ProjectPageProps) {
    const { projectId } = useParams<{ projectId: string }>()

    const project = data.projects.find((p) => `P${p.projectNumber}` === projectId)

    if (!project) {
        return <Navigate to="/" replace />
    }

    return (
        <div className="mx-auto w-full max-w-[1400px] px-6 sm:px-10 lg:px-12 py-10 space-y-10">

            {/* Back Navigation */}
            <div>
                <Link
                    to="/#projects"
                    className="inline-flex items-center text-sm font-medium text-text-muted hover:text-violet-400 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to all projects
                </Link>
            </div>

            {/* Project Header */}
            <div className="bg-card rounded-3xl border border-border p-8 md:p-12 shadow-sm relative overflow-hidden">
                {/* Subtle decorative background */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-highlight rounded-full blur-3xl opacity-60 -mr-20 -mt-20 pointer-events-none" />

                <div className="relative z-10 space-y-6">
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="inline-flex px-3 py-1 rounded-full text-sm font-semibold bg-highlight text-violet-300">
                            Project {project.projectNumber}
                        </span>
                        <span className="inline-flex px-3 py-1 rounded-full text-sm font-semibold bg-blue-500/15 text-blue-300">
                            {project.weight} of grade
                        </span>
                    </div>

                    <h1 className="text-3xl md:text-5xl font-bold text-text-primary tracking-tight">
                        {project.projectTitle}
                    </h1>

                    <p className="text-lg md:text-xl text-text-tertiary max-w-3xl leading-relaxed">
                        {project.overview}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-border-subtle">
                        <div className="flex items-start gap-3">
                            <CalendarDays className="w-5 h-5 text-text-faint shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-text-primary">Module</p>
                                <p className="text-sm text-text-muted">Weeks {project.weeks.join("-")}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Clock className="w-5 h-5 text-text-faint shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-text-primary">Due Date</p>
                                <p className="text-sm text-text-muted">{project.dueDate}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Target className="w-5 h-5 text-text-faint shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-text-primary">Primary Goal</p>
                                <p className="text-sm text-text-muted pl-4 border-l-2 border-border ml-1 mt-1 pb-1">
                                    {project.assessmentCriteria?.[0] || "Synthesis"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Project Content (Deliverables & Assessment) */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

                {/* Left Col: Details */}
                <div className="lg:col-span-3 space-y-8">
                    <div className="bg-card rounded-3xl border border-border p-8 min-h-full">
                        <h2 className="text-xl font-bold text-text-primary mb-6">Deliverables</h2>
                        <ul className="space-y-4">
                            {project.deliverables?.map((item, idx) => (
                                <li key={idx} className="flex gap-4">
                                    <CheckCircle2 className="w-6 h-6 text-violet-500 shrink-0" />
                                    <span className="text-text-secondary leading-relaxed text-base">{item}</span>
                                </li>
                            ))}
                        </ul>
                        <div className="mt-8 pt-8 border-t border-border-subtle">
                            <h3 className="text-lg font-bold text-text-primary mb-4">Assessment Criteria</h3>
                            <ul className="list-disc list-outside ml-5 space-y-2 text-text-tertiary text-base">
                                {project.assessmentCriteria?.map((criteria, idx) => (
                                    <li key={idx} className="pl-2 leading-relaxed">{criteria}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Right Col: AI Policy & Resources */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-surface rounded-2xl p-6 border border-border relative overflow-hidden">
                        {/* Yellow warning strip */}
                        <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
                        <h3 className="text-base font-semibold text-text-primary mb-3 flex items-center gap-2">
                            AI Policy Details
                        </h3>
                        <p className="text-sm text-text-tertiary leading-relaxed">
                            {project.aiUse.restrictions || "Refer to general syllabus policies for this assignment."}
                        </p>
                    </div>

                    {project.resources && project.resources.length > 0 && (
                        <div className="bg-card rounded-2xl p-6 border border-border">
                            <h3 className="text-base font-semibold text-text-primary mb-4">Provided Resources</h3>
                            <div className="space-y-3">
                                {project.resources.map((res, idx) =>
                                    res.url ? (
                                        <a
                                            key={idx}
                                            href={res.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="block p-4 rounded-xl border border-border-subtle hover:border-highlight-border hover:bg-highlight0/10 transition-colors group"
                                        >
                                            <p className="text-sm font-semibold text-text-primary group-hover:text-violet-300 transition-colors line-clamp-1">{res.title}</p>
                                            {res.description && <p className="text-xs text-text-muted mt-1 uppercase tracking-wide">{res.description}</p>}
                                        </a>
                                    ) : (
                                        <div
                                            key={idx}
                                            className="block p-4 rounded-xl border border-border-subtle"
                                        >
                                            <p className="text-sm font-semibold text-text-primary line-clamp-1">{res.title}</p>
                                            {res.description && <p className="text-xs text-text-muted mt-1 uppercase tracking-wide">{res.description}</p>}
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
