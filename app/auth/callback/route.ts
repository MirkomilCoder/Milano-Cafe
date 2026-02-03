import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const error = searchParams.get("error")
  const error_description = searchParams.get("error_description")

  // Handle OAuth errors
  if (error) {
    const errorMessage = error_description || "OAuth xatolik yuz berdi"
    return NextResponse.redirect(
      new URL(`/auth/login?error=${encodeURIComponent(errorMessage)}`, request.url)
    )
  }

  if (code) {
    try {
      const supabase = createClient()
      
      // Exchange code for session
      const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(code)

      if (sessionError) {
        return NextResponse.redirect(
          new URL(
            `/auth/login?error=${encodeURIComponent(sessionError.message)}`,
            request.url
          )
        )
      }

      // Get the user data
      const { data: { user }, error: userError } = await supabase.auth.getUser()

      if (userError || !user) {
        return NextResponse.redirect(
          new URL("/auth/login?error=Foydalanuvchi ma'lumotlari olib bo'lmadi", request.url)
        )
      }

      // Ensure user exists in public users table
      const { data: existingUser } = await supabase
        .from("users")
        .select("id")
        .eq("id", user.id)
        .single()

      if (!existingUser) {
        // Create user in public users table
        const { error: insertError } = await supabase.from("users").insert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
          avatar_url: user.user_metadata?.avatar_url || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

        if (insertError) {
          console.error("Error creating user:", insertError)
        }
      }

      // Redirect to home page
      return NextResponse.redirect(new URL("/", request.url))
    } catch (error) {
      console.error("Auth callback error:", error)
      return NextResponse.redirect(
        new URL(
          "/auth/login?error=Kirishdagi xatolik",
          request.url
        )
      )
    }
  }

  // No code provided
  return NextResponse.redirect(
    new URL("/auth/login?error=Kod topilmadi", request.url)
  )
}
