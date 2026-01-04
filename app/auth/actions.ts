"use server"

import { createClient as createSupabaseClient } from "@supabase/supabase-js"

export async function checkEmailExists(email: string) {
  try {
    // Create admin client with service role key
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY || ""
    )

    // Query auth.users table to check if email exists
    const { data: { users }, error } = await supabase.auth.admin.listUsers()
    
    if (error) {
      console.error("Auth error:", error)
      // If error, fallback to database check
      const { data: existingUsers, error: dbError } = await supabase
        .from("users")
        .select("email")
        .ilike("email", email)
        .limit(1)
      
      if (!dbError && existingUsers && existingUsers.length > 0) {
        return { exists: true }
      }
      
      return { exists: false }
    }

    // Check if email exists in auth users (case-insensitive)
    const emailExists = users.some(user => user.email?.toLowerCase() === email.toLowerCase())
    return { exists: emailExists }
  } catch (error) {
    console.error("Error checking email:", error)
    // Fallback: assume email might exist to prevent duplicates
    return { exists: true }
  }
}
