import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

/**
 * Cron job endpoint to automatically transition pending orders to completed after 5 days
 * 
 * This should be called daily by a cron service (Vercel Cron, GitHub Actions, etc.)
 * 
 * Usage:
 * POST /api/admin/orders/auto-transition
 * Header: Authorization: Bearer <CRON_SECRET>
 */

export async function POST(request: NextRequest) {
  try {
    // Verify authorization
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

    // 1. Auto-transition pending orders (5 days -> completed)
    const { data: transitioned, error: transitionError } = await supabase
      .rpc("auto_transition_pending_orders")

    if (transitionError) {
      console.error("Auto-transition error:", transitionError)
      return NextResponse.json(
        { error: "Failed to transition orders", details: transitionError.message },
        { status: 500 }
      )
    }

    // 2. Get updated statistics
    const { data: stats, error: statsError } = await supabase
      .from("order_statistics")
      .select("*")
      .single()

    if (statsError) {
      console.error("Stats error:", statsError)
    }

    const result = {
      success: true,
      timestamp: new Date().toISOString(),
      transitioned: transitioned?.[0]?.transitioned_count || 0,
      statistics: stats || {
        pending_count: 0,
        confirmed_count: 0,
        preparing_count: 0,
        ready_count: 0,
        completed_count: 0,
        cancelled_count: 0,
        deleted_count: 0,
        total_count: 0,
      },
    }

    console.log("✅ Auto-transition completed:", result)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Auto-transition API error:", error)
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
 * GET endpoint to check orders pending auto-transition
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get pending orders approaching auto-transition
    const { data: orders, error } = await supabase
      .from("orders")
      .select("id, status, created_at, auto_transition_at, deleted_at")
      .eq("status", "pending")
      .eq("deleted_at", null)
      .not("auto_transition_at", "is", null)
      .order("auto_transition_at", { ascending: true })
      .limit(10)

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch orders", details: error.message },
        { status: 500 }
      )
    }

    const now = new Date()
    
    return NextResponse.json({
      success: true,
      orders_pending_transition: orders?.map((order) => {
        const transitionDate = new Date(order.auto_transition_at)
        const daysRemaining = Math.ceil((transitionDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        
        return {
          id: order.id,
          status: order.status,
          created_at: order.created_at,
          auto_transition_at: order.auto_transition_at,
          days_remaining: daysRemaining,
          will_transition_soon: daysRemaining <= 1,
        }
      }) || [],
      total_pending_transition: orders?.length || 0,
    })
  } catch (error) {
    console.error("GET auto-transition status error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
