import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const error = searchParams.get("error")
  const error_description = searchParams.get("error_description")

  console.log("OAuth callback:", { code: code?.substring(0, 10), error })

  if (error) {
    return NextResponse.redirect(
      new URL(`/auth/login?error=${encodeURIComponent(error_description || error)}`, request.url)
    )
  }

  if (!code) {
    return NextResponse.redirect(new URL("/auth/login?error=Code not found", request.url))
  }

  try {
    const cookieStore = await cookies()
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll().map(cookie => ({
              name: cookie.name,
              value: cookie.value
            }))
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      }
    )

    console.log("Exchanging code for session...")
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError || !data.session) {
      console.error("Exchange error:", exchangeError)
      return NextResponse.redirect(
        new URL(
          `/auth/login?error=${encodeURIComponent(exchangeError?.message || "Session exchange failed")}`,
          request.url
        )
      )
    }

    console.log("✅ User authenticated:", data.session.user.id)

    return NextResponse.redirect(new URL("/", request.url))
  } catch (error) {
    console.error("Callback error:", error)
    return NextResponse.redirect(
      new URL(
        `/auth/login?error=${encodeURIComponent(error instanceof Error ? error.message : "Auth error")}`,
        request.url
      )
    )
  }
}
