import { createClient } from "@/lib/supabase/server"

export async function checkUserBan() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return null

    const isBanned = user.user_metadata?.banned === true

    if (isBanned) {
      return {
        banned: true,
        reason: user.user_metadata?.ban_reason || "Sizning akkauntingiz bloklangan",
        bannedAt: user.user_metadata?.banned_at,
      }
    }

    return { banned: false }
  } catch (error) {
    console.error("Ban check error:", error)
    return null
  }
}
