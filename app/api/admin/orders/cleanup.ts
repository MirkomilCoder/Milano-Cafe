import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

/**
 * Cron job endpoint to automatically clean up expired orders
 * - Cancelled orders: deleted after 10 days
 * - Completed orders: deleted after 30 days
 * 
 * This should be called daily by a cron service (Vercel Cron, GitHub Actions, etc.)
 * 
 * Usage:
 * POST /api/admin/orders/cleanup
 * Header: Authorization: Bearer <CRON_SECRET>
 */

export async function POST(request: NextRequest) {
  try {
    // Verify the request has authorization header (for security)
    const authHeader = request.headers.get("authorization")
    const cronSecret = process.env.CRON_SECRET

    if (!cronSecret) {
      return NextResponse.json(
        { error: "CRON_SECRET not configured" },
        { status: 500 }
      )
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const supabase = await createClient()

    // 1. Cleanup expired orders (soft delete)
    const { data: cleanedOrders, error: cleanupError } = await supabase
      .rpc("cleanup_expired_orders")

    if (cleanupError) {
      console.error("Cleanup error:", cleanupError)
      return NextResponse.json(
        { error: "Failed to cleanup orders", details: cleanupError.message },
        { status: 500 }
      )
    }

    // 2. Get cleanup statistics
    const { data: stats, error: statsError } = await supabase
      .from("orders")
      .select("status, deleted_at")

    if (statsError) {
      console.error("Stats error:", statsError)
    }

    const result = {
      success: true,
      timestamp: new Date().toISOString(),
      cleaned: cleanedOrders?.[0]?.deleted_count || 0,
      statistics: {
        total_orders: stats?.length || 0,
        deleted_orders: stats?.filter((o) => o.deleted_at).length || 0,
        active_orders: stats?.filter((o) => !o.deleted_at).length || 0,
      },
    }

    console.log("✅ Order cleanup completed:", result)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Cleanup API error:", error)
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

/**
 * GET endpoint to check cleanup status (for monitoring)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get orders approaching deletion
    const { data: orders, error } = await supabase
      .from("orders")
      .select("id, status, scheduled_deletion, deleted_at, created_at")
      .eq("deleted_at", null)
      .not("scheduled_deletion", "is", null)
      .order("scheduled_deletion", { ascending: true })
      .limit(10)

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch orders", details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      orders_pending_deletion: orders?.map((order) => ({
        id: order.id,
        status: order.status,
        created_at: order.created_at,
        scheduled_deletion: order.scheduled_deletion,
        days_until_deletion: Math.ceil(
          (new Date(order.scheduled_deletion).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        ),
      })) || [],
      total_pending_deletion: orders?.length || 0,
    })
  } catch (error) {
    console.error("GET cleanup status error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
