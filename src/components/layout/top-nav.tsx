import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import type { CourseData } from "@/types"
import { cn } from "@/lib/utils"
import { Brain, Menu, X, ChevronDown } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

interface TopNavProps {
  data: CourseData
  activeSection: string
}

const STATIC_NAV_ITEMS = [
  { id: "overview", label: "Overview" },
  { id: "course-map", label: "Course Map" },
  { id: "projects", label: "Projects" },
  { id: "templates", label: "Templates" },
  { id: "policies", label: "Policies" },
]

export function TopNav({ data, activeSection }: TopNavProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [projectsDropdownOpen, setProjectsDropdownOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const handleNav = (id: string) => {
    if (location.pathname !== "/") {
      // Navigate to home with hash; home-page.tsx useEffect handles the scroll
      navigate(`/#${id}`)
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
    }
    setMobileMenuOpen(false)
    setProjectsDropdownOpen(false)
  }

  const isStaticActive = (itemId: string) => {
    // If we're on a project page, the "projects" section should stay highlighted
    if (itemId === "projects" && location.pathname.startsWith("/projects")) {
      return true
    }
    return activeSection === itemId
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-nav-bg backdrop-blur-lg transition-all">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-6 sm:px-10 lg:px-12">
        {/* Logo and Course Info */}
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 shadow-sm">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <div className="hidden sm:block">
            <p className="text-[10px] font-bold tracking-widest text-text-muted uppercase leading-none mb-1">
              {data.metadata.program ?? "Course"} / {data.metadata.courseCode}
            </p>
            <h1 className="text-sm font-bold leading-none text-text-primary">
              {data.metadata.courseTitle}
            </h1>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8 relative">
          {STATIC_NAV_ITEMS.map(({ id, label }) => {

            // Render a Dropdown Menu for "Projects"
            if (id === "projects") {
              return (
                <div
                  key={id}
                  className="relative group"
                  onMouseEnter={() => setProjectsDropdownOpen(true)}
                  onMouseLeave={() => setProjectsDropdownOpen(false)}
                >
                  <button
                    onClick={() => handleNav(id)}
                    aria-haspopup="true"
                    aria-expanded={projectsDropdownOpen}
                    className={cn(
                      "flex items-center gap-1 text-sm font-semibold transition-colors hover:text-violet-400 outline-none pb-5 pt-5",
                      isStaticActive(id)
                        ? "text-violet-400 border-b-2 border-violet-600 -mb-[2px]"
                        : "text-text-tertiary"
                    )}
                  >
                    {label}
                    <ChevronDown className="w-4 h-4 text-text-faint group-hover:text-violet-400 transition-colors" />
                  </button>

                  {/* Dropdown Popover */}
                  {projectsDropdownOpen && (
                    <div className="absolute top-[60px] left-1/2 -translate-x-1/2 w-64 bg-background/95 backdrop-blur-xl border border-border shadow-xl rounded-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                      {data.projects.map((p) => (
                        <Link
                          key={p.projectNumber}
                          to={`/projects/P${p.projectNumber}`}
                          onClick={() => setProjectsDropdownOpen(false)}
                          className={cn(
                            "block px-5 py-3 text-sm font-medium transition-colors hover:bg-highlight hover:text-violet-300",
                            location.pathname === `/projects/P${p.projectNumber}` ? "bg-highlight text-violet-300" : "text-text-secondary"
                          )}
                        >
                          P{p.projectNumber}: {p.projectTitle}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )
            }

            // Normal Navigation Links
            return (
              <button
                key={id}
                onClick={() => handleNav(id)}
                className={cn(
                  "text-sm font-semibold transition-colors hover:text-violet-400 outline-none",
                  isStaticActive(id)
                    ? "text-violet-400 border-b-2 border-violet-600 py-5 -mb-[2px]"
                    : "text-text-tertiary py-5"
                )}
              >
                {label}
              </button>
            )
          })}
          <button
            onClick={() => handleNav("weeks")}
            className={cn(
              "text-sm font-semibold transition-colors hover:text-violet-400 outline-none",
              activeSection.startsWith("week-")
                ? "text-violet-400 border-b-2 border-violet-600 py-5 -mb-[2px]"
                : "text-text-tertiary py-5"
            )}
          >
            Weekly Content
          </button>
        </nav>

        {/* Theme Toggle + Mobile Menu Toggle */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            className="lg:hidden flex items-center justify-center p-2 text-text-tertiary hover:text-text-primary"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-16 left-0 w-full max-h-[calc(100vh-4rem)] overflow-y-auto bg-background/95 backdrop-blur-xl border-b border-border shadow-lg py-6 px-6 flex flex-col gap-2 z-40">
          {STATIC_NAV_ITEMS.map(({ id, label }) => {
            if (id === "projects") {
              return (
                <div key={id} className="flex flex-col gap-1">
                  <button
                    onClick={() => handleNav(id)}
                    className={cn(
                      "text-left text-lg font-semibold px-4 py-3 rounded-xl transition-colors",
                      isStaticActive(id)
                        ? "bg-highlight text-violet-300"
                        : "text-text-secondary hover:bg-surface"
                    )}
                  >
                    {label}
                  </button>
                  {/* Nested Project Links for Mobile */}
                  <div className="flex flex-col gap-1 pl-4 border-l-2 border-border-subtle ml-6 pb-2">
                    {data.projects.map((p) => (
                      <Link
                        key={p.projectNumber}
                        to={`/projects/P${p.projectNumber}`}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          "block px-4 py-2.5 text-base font-medium rounded-xl transition-colors",
                          location.pathname === `/projects/P${p.projectNumber}` ? "bg-highlight text-violet-300" : "text-text-tertiary hover:text-violet-300 hover:bg-surface"
                        )}
                      >
                        P{p.projectNumber}: {p.projectTitle}
                      </Link>
                    ))}
                  </div>
                </div>
              )
            }

            return (
              <button
                key={id}
                onClick={() => handleNav(id)}
                className={cn(
                  "text-left text-lg font-semibold px-4 py-3 rounded-xl transition-colors",
                  isStaticActive(id)
                    ? "bg-highlight text-violet-300"
                    : "text-text-secondary hover:bg-surface"
                )}
              >
                {label}
              </button>
            )
          })}
          <button
            onClick={() => handleNav("weeks")}
            className={cn(
              "text-left text-lg font-semibold px-4 py-3 rounded-xl transition-colors",
              activeSection.startsWith("week-")
                ? "bg-highlight text-violet-300"
                : "text-text-secondary hover:bg-surface"
            )}
          >
            Weekly Content
          </button>
        </div>
      )}
    </header>
  )
}
