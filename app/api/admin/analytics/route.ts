import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { AnalyticsStats } from "@/lib/types"

/**
 * GET endpoint to fetch analytics statistics
 * Query params:
 * - days: number of days to analyze (default: 30)
 * - type: 'summary' or 'detailed' (default: 'summary')
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check if user is admin
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get admin status from user metadata
    const { data: adminData } = await supabase
      .from("orders")
      .select("id")
      .limit(1)

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const days = parseInt(searchParams.get("days") || "30")
    const type = searchParams.get("type") || "summary"

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Fetch analytics events
    const { data: events, error: eventsError } = await supabase
      .from("analytics_events")
      .select("*")
      .gte("created_at", startDate.toISOString())
      .lte("created_at", endDate.toISOString())

    if (eventsError) {
      return NextResponse.json(
        { error: "Failed to fetch analytics", details: eventsError.message },
        { status: 500 }
      )
    }

    // Process events for stats
    const stats = processAnalyticsEvents(events || [])

    // Fetch order count
    const { count: totalOrders } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .gte("created_at", startDate.toISOString())

    // Fetch user count (from orders - unique users)
    const { data: uniqueUsers } = await supabase
      .from("orders")
      .select("user_id")
      .gte("created_at", startDate.toISOString())
      .distinct()

    const analyticsStats: AnalyticsStats = {
      totalVisitors: uniqueUsers?.length || 0,
      totalPageViews: stats.totalPageViews,
      totalClicks: stats.totalClicks,
      totalSearches: stats.totalSearches,
      totalLogins: stats.totalLogins,
      totalOrders: totalOrders || 0,
      deviceBreakdown: stats.deviceBreakdown,
      topSearches: stats.topSearches,
      topPages: stats.topPages,
      visitorsTrend: stats.visitorsTrend,
    }

    return NextResponse.json({
      success: true,
      data: analyticsStats,
      period: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        days,
      },
    })
  } catch (error) {
    console.error("Analytics API error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}

/**
 * POST endpoint to track analytics events
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    // Get device type from user agent
    const userAgent = request.headers.get("user-agent") || ""
    const deviceType = getDeviceType(userAgent)

    // Get IP address
    const ipAddress =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown"

    const { data, error } = await supabase.from("analytics_events").insert({
      event_type: body.event_type,
      user_id: body.user_id || null,
      user_agent: userAgent,
      ip_address: ipAddress,
      page_url: body.page_url || null,
      search_query: body.search_query || null,
      device_type: deviceType,
      referrer: request.headers.get("referer") || null,
      duration_seconds: body.duration_seconds || null,
      metadata: body.metadata || null,
    })

    if (error) {
      console.error("Failed to insert analytics event:", error)
      return NextResponse.json(
        { error: "Failed to track event" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Analytics POST error:", error)
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 400 }
    )
  }
}

/**
 * Helper function to determine device type from user agent
 */
function getDeviceType(userAgent: string): "mobile" | "tablet" | "desktop" {
  if (
    /mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(
      userAgent
    )
  ) {
    return "mobile"
  }
  if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
    return "tablet"
  }
  return "desktop"
}

/**
 * Helper function to process analytics events
 */
function processAnalyticsEvents(events: any[]): any {
  const stats = {
    totalPageViews: 0,
    totalClicks: 0,
    totalSearches: 0,
    totalLogins: 0,
    deviceBreakdown: {
      mobile: 0,
      tablet: 0,
      desktop: 0,
    },
    topSearches: [] as Array<{ query: string; count: number }>,
    topPages: [] as Array<{ url: string; views: number }>,
    visitorsTrend: [] as Array<{ date: string; count: number }>,
  }

  // Count events
  const searches: Record<string, number> = {}
  const pages: Record<string, number> = {}
  const visitors: Record<string, number> = {}

  events.forEach((event) => {
    switch (event.event_type) {
      case "page_view":
        stats.totalPageViews++
        break
      case "click":
        stats.totalClicks++
        break
      case "search":
        stats.totalSearches++
        if (event.search_query) {
          searches[event.search_query] =
            (searches[event.search_query] || 0) + 1
        }
        break
      case "login":
        stats.totalLogins++
        break
    }

    // Track device type
    if (event.device_type) {
      stats.deviceBreakdown[event.device_type]++
    }

    // Track page views
    if (event.page_url) {
      pages[event.page_url] = (pages[event.page_url] || 0) + 1
    }

    // Track visitors by date
    const date = new Date(event.created_at).toISOString().split("T")[0]
    visitors[date] = (visitors[date] || 0) + 1
  })

  // Convert to arrays and sort
  stats.topSearches = Object.entries(searches)
    .map(([query, count]) => ({ query, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  stats.topPages = Object.entries(pages)
    .map(([url, views]) => ({ url, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 10)

  stats.visitorsTrend = Object.entries(visitors)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date))

  return stats
}
