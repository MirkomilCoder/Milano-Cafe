import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { OrdersManagement } from "./orders-management"

export const metadata = {
  title: "Buyurtmalar | Admin Dashboard",
}

export default async function AdminOrdersPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.user_metadata?.is_admin !== true) {
    redirect("/")
  }

  const { data: orders } = await supabase
    .from("orders")
    .select(`
      *,
      order_items (
        *,
        product:products (name, image_url)
      )
    `)
    .order("created_at", { ascending: false })

  return <OrdersManagement orders={orders || []} />
}
