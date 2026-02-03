import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { UsersManagement } from "./users-management"

export const metadata = {
  title: "Users Management | MILANO Admin",
}

export default async function UsersPage() {
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

  // Fetch all users from auth
  const { data: allUsers = [] } = await supabase.auth.admin.listUsers()

  return <UsersManagement users={allUsers.users || []} />
}
