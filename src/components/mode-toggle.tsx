"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

export function ModeToggle() {
  const { theme, setTheme } = useTheme()

  // Wait until mounted to avoid hydration mismatch
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <Button
        variant="outline"
        size="icon"
        className="rounded-full w-14 h-14 shadow-lg bg-background border-border hover:bg-accent"
        onClick={toggleTheme}
      >
        {theme === "dark" ? (
          <Moon className="h-6 w-6" />
        ) : (
          <Sun className="h-6 w-6" />
        )}
        <span className="sr-only">Toggle theme</span>
      </Button>
    </div>
  )
}
