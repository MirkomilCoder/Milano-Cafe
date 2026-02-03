import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { MessagesManagement } from "./messages-management"

export const metadata = {
  title: "Xabarlar | Admin Dashboard",
}

export default async function AdminMessagesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.user_metadata?.is_admin !== true) {
    redirect("/")
  }

  const { data: messages } = await supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false })

  return <MessagesManagement messages={messages || []} />
}
