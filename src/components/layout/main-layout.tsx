import { useState, useEffect } from "react"
import { Outlet, useLocation } from "react-router-dom"
import { TopNav } from "../layout/top-nav"
import type { CourseData } from "@/types"

interface MainLayoutProps {
    data: CourseData
}

const SECTION_IDS = ["overview", "course-map", "weeks", "projects", "templates", "policies"]

export function MainLayout({ data }: MainLayoutProps) {
    const [activeSection, setActiveSection] = useState("")
    const location = useLocation()

    useEffect(() => {
        // Only observe sections on the home page
        if (location.pathname !== "/") {
            setActiveSection("")
            return
        }

        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        setActiveSection(entry.target.id)
                    }
                }
            },
            { rootMargin: "-20% 0px -75% 0px", threshold: 0 }
        )

        // Small delay to let the DOM render after route change
        const timer = setTimeout(() => {
            for (const id of SECTION_IDS) {
                const el = document.getElementById(id)
                if (el) observer.observe(el)
            }
        }, 100)

        return () => {
            clearTimeout(timer)
            observer.disconnect()
        }
    }, [location.pathname])

    return (
        <div className="min-h-screen bg-background w-full flex flex-col font-sans">
            <TopNav data={data} activeSection={activeSection} />
            <main className="flex-1 w-full mx-auto">
                <Outlet />
            </main>

            {/* Footer is shared across all pages */}
            <footer className="mx-auto w-full max-w-[1400px] px-6 sm:px-10 lg:px-12 text-center text-xs text-text-faint py-10 border-t border-border mt-16">
                {data.metadata.courseCode}: {data.metadata.courseTitle} | {data.metadata.quarter} {data.metadata.year} | {data.metadata.program}
            </footer>
        </div>
    )
}
