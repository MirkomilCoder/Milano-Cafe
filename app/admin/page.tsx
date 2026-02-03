import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminDashboard } from "./admin-dashboard"

export const metadata = {
  title: "Admin Dashboard | Milano Kafe",
}

export default async function AdminPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const isAdmin = user.user_metadata?.is_admin === true

  if (!isAdmin) {
    redirect("/")
  }

  // Fetch statistics
  const [
    { count: productsCount },
    { count: ordersCount },
    { count: messagesCount },
    { data: recentOrders },
    { data: recentMessages },
  ] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase.from("contact_messages").select("*", { count: "exact", head: true }).eq("is_read", false),
    supabase
      .from("orders")
      .select(`
        *,
        order_items (
          *,
          product:products (name)
        )
      `)
      .order("created_at", { ascending: false })
      .limit(10),
    supabase.from("contact_messages").select("*").order("created_at", { ascending: false }).limit(5),
  ])

  // Calculate total revenue
  const { data: allOrders } = await supabase.from("orders").select("total_amount").eq("status", "completed")

  const totalRevenue = allOrders?.reduce((sum, order) => sum + order.total_amount, 0) || 0

  return (
    <AdminDashboard
      stats={{
        productsCount: productsCount || 0,
        ordersCount: ordersCount || 0,
        messagesCount: messagesCount || 0,
        totalRevenue,
      }}
      recentOrders={recentOrders || []}
      recentMessages={recentMessages || []}
    />
  )
}
