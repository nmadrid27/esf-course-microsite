import { useState, useEffect } from "react"
import { Sun, Moon } from "lucide-react"

export function ThemeToggle() {
    const [isDark, setIsDark] = useState(() => {
        if (typeof window !== "undefined") {
            return document.documentElement.classList.contains("dark")
        }
        return true
    })

    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add("dark")
            localStorage.setItem("theme", "dark")
        } else {
            document.documentElement.classList.remove("dark")
            localStorage.setItem("theme", "light")
        }
    }, [isDark])

    // On mount, check saved preference
    useEffect(() => {
        const saved = localStorage.getItem("theme")
        if (saved === "light") {
            setIsDark(false)
        } else {
            setIsDark(true)
        }
    }, [])

    return (
        <button
            onClick={() => setIsDark(!isDark)}
            className="flex items-center justify-center w-9 h-9 rounded-xl bg-surface-hover hover:bg-surface text-text-muted hover:text-text-primary transition-colors"
            aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
            title={isDark ? "Switch to light theme" : "Switch to dark theme"}
        >
            {isDark ? (
                <Sun className="h-4 w-4" />
            ) : (
                <Moon className="h-4 w-4" />
            )}
        </button>
    )
}
