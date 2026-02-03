"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

export function OAuthButtons() {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true)
      setError(null)
      const supabase = createClient()

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback`,
        },
      })

      if (error) throw error
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Google bilan kirish muvaffaqiyatsiz bo'ldi"
      setError(errorMessage)
      setIsGoogleLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Yoki</span>
        </div>
      </div>

      {error && <p className="text-sm text-destructive text-center">{error}</p>}

      <div className="flex flex-col gap-2">
        {/* Google Button */}
        <Button
          onClick={handleGoogleLogin}
          disabled={isGoogleLoading}
          variant="outline"
          className="w-full h-10 flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          <span>{isGoogleLoading ? "Kirilmoqda..." : "Google orqali"}</span>
        </Button>

        {/* Apple Button - Disabled with visual indicator */}
        <div className="relative group">
          <Button
            disabled={true}
            variant="outline"
            className="w-full h-10 flex items-center justify-center gap-2 opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-900"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 13.5c-.91 0-1.82.5-2.33 1.52-.43.86-.47 2.28.87 3.5.52.5 1.47 1.12 2.51 1.12 1.66 0 3.29-1.03 3.71-2.64.1-.4.16-.82.16-1.28-.79-.26-1.65-.22-2.92-.22zM12.05 5.69c.5-.66 1.19-1.59 1.19-2.87 0-1.22-.61-2.39-1.97-2.39-1.8 0-2.86 1.65-2.86 3.56 0 1.88.87 3.13 1.8 4.46h2.84M18 0h-3.72c-1.33 0-2.56.55-3.35 1.44C9.96.57 9.02.01 7.89.01 5.59.01 3.87 1.82 3.87 4.27c0 1.52.61 2.52 1.39 3.61-.3.49-.59.95-.59 1.65 0 .98.52 1.67 1.37 2.28-.85.58-1.74 1.44-1.74 3.02 0 2.14 1.93 3.99 5.07 3.99 1.16 0 2.22-.25 3.1-.73.88.48 1.94.73 3.1.73 3.14 0 5.07-1.85 5.07-3.99 0-1.58-.89-2.44-1.74-3.02.85-.61 1.37-1.3 1.37-2.28 0-.7-.29-1.16-.59-1.65.78-1.09 1.39-2.09 1.39-3.61 0-2.45-1.72-4.26-4.02-4.26z" />
            </svg>
            <span>Apple orqali</span>
          </Button>
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Hozircha mavjud emas
          </div>
        </div>
      </div>
    </div>
  )
}
