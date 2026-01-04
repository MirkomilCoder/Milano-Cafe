"use server"

import { createClient } from "@/lib/supabase/server"

export async function createUserSession() {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: "User not found" }
    }

    // Insert or update user session in database
    const { data, error } = await supabase
      .from("user_sessions")
      .upsert(
        {
          user_id: user.id,
          user_email: user.email || "",
          user_metadata: user.user_metadata || {},
          last_activity: new Date().toISOString(),
        },
        {
          onConflict: "user_id",
        }
      )
      .select()

    if (error) {
      console.error("Error creating session:", error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Session creation error:", error)
    return { success: false, error: String(error) }
  }
}

export async function updateUserActivity() {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: "User not found" }
    }

    // Update last activity timestamp
    const { error } = await supabase
      .from("user_sessions")
      .update({
        last_activity: new Date().toISOString(),
      })
      .eq("user_id", user.id)

    if (error) {
      console.error("Error updating activity:", error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Activity update error:", error)
    return { success: false, error: String(error) }
  }
}

export async function deleteUserSession() {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: "User not found" }
    }

    // Delete user session
    const { error } = await supabase
      .from("user_sessions")
      .delete()
      .eq("user_id", user.id)

    if (error) {
      console.error("Error deleting session:", error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Session deletion error:", error)
    return { success: false, error: String(error) }
  }
}

export async function getAllUserSessions() {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user || user.user_metadata?.is_admin !== true) {
      return { success: false, error: "Unauthorized" }
    }

    // Get all active sessions (updated in last 5 minutes)
    const { data, error } = await supabase
      .from("user_sessions")
      .select("*")
      .gt("last_activity", new Date(Date.now() - 5 * 60 * 1000).toISOString())
      .order("last_activity", { ascending: false })

    if (error) {
      console.error("Error fetching sessions:", error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error getting sessions:", error)
    return { success: false, error: String(error) }
  }
}
