import { useEffect } from "react"
import { useLocation } from "react-router-dom"
import type { CourseData } from "@/types"
import { CourseOverview } from "@/components/course-overview"
import { CourseMap } from "@/components/course-map"
import { WeekAccordion } from "@/components/week-accordion"
import { ProjectCards } from "@/components/project-cards"
import { TemplatesSection } from "@/components/templates-section"
import { PoliciesTabs } from "@/components/policies-tabs"

interface HomePageProps {
    data: CourseData
}

export function HomePage({ data }: HomePageProps) {
    const location = useLocation()

    // Handle hash scrolling when navigating back from another page with a hash
    useEffect(() => {
        if (location.hash) {
            setTimeout(() => {
                const id = location.hash.replace("#", "")
                const element = document.getElementById(id)
                if (element) {
                    element.scrollIntoView({ behavior: "smooth" })
                }
            }, 100)
        }
    }, [location])

    return (
        <>
            <CourseOverview
                metadata={data.metadata}
                site={data.site}
                outcomes={data.learningOutcomes}
                grading={data.grading.components}
                structure={data.courseStructure}
                projects={data.projects}
            />

            <div className="mx-auto w-full max-w-[1400px] px-6 sm:px-10 lg:px-12 pb-20 pt-10 space-y-16">
                <CourseMap entries={data.courseMap} courseCode={data.metadata.courseCode} />

                <section id="weeks">
                    <WeekAccordion weeks={data.weeks} projects={data.projects} />
                </section>

                <section id="projects">
                    <ProjectCards projects={data.projects} units={data.courseStructure.units} />
                </section>

                <section id="templates">
                    <TemplatesSection templates={data.templates} />
                </section>

                <section id="policies">
                    <PoliciesTabs policies={data.policies} />
                </section>
            </div>
        </>
    )
}
