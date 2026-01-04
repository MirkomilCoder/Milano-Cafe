import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { CategoriesManagement } from "./categories-management"

export const metadata = {
  title: "Kategoriyalar boshqaruvi | Admin Dashboard",
}

export default async function CategoriesPage() {
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

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name")

  return <CategoriesManagement categories={categories || []} />
}
