import { useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { createUserSession, updateUserActivity, deleteUserSession } from "@/app/auth/session-actions"

export function useUserPresence() {
  useEffect(() => {
    const supabase = createClient()
    let heartbeatInterval: NodeJS.Timeout | null = null

    const setupPresence = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      console.log("👤 Setting up presence for user:", user.email)

      // Create initial session in database
      const sessionResult = await createUserSession()
      console.log("Session created:", sessionResult)

      // Update activity every 30 seconds
      heartbeatInterval = setInterval(async () => {
        const result = await updateUserActivity()
        console.log("Activity updated:", result)
      }, 30000)
    }

    setupPresence()

    return () => {
      if (heartbeatInterval) {
        clearInterval(heartbeatInterval)
      }
      // Clean up session when component unmounts (user logs out)
      deleteUserSession().catch(console.error)
    }
  }, [])
}
