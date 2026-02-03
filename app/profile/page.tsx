import { redirect } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProfileContent } from "./profile-content"
import { createClient } from "@/lib/supabase/server"

export const metadata = {
  title: "Profil | Milano Kafe",
}

export default async function ProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch user's orders
  const { data: orders } = await supabase
    .from("orders")
    .select(`
      *,
      order_items (
        *,
        product:products (*)
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen dark:bg-slate-950">
      <Header />
      <main className="pb-16 pt-24 lg:pt-28">
        <ProfileContent user={user} orders={orders || []} />
      </main>
      <Footer />
    </div>
  )
}
