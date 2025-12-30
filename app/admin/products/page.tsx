import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ProductsManagement } from "./products-management"

export const metadata = {
  title: "Mahsulotlar boshqaruvi | Admin Dashboard",
}

export default async function ProductsPage() {
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

  const [{ data: products }, { data: categories }] = await Promise.all([
    supabase.from("products").select("*, category:categories(*)").order("created_at", { ascending: false }),
    supabase.from("categories").select("*").order("name"),
  ])

  return <ProductsManagement products={products || []} categories={categories || []} />
}
