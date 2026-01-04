"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Coffee, Home, Mail, Package, ShoppingBag, Menu, LogOut, Trash2, Check, Layers, Users, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { formatDate } from "@/lib/format"
import type { ContactMessage } from "@/lib/types"

interface MessagesManagementProps {
  messages: ContactMessage[]
}

const navigation = [
  { name: "Dashboard", href: "/admin", icon: Home },
  { name: "Mahsulotlar", href: "/admin/products", icon: Package },
  { name: "Kategoriyalar", href: "/admin/categories", icon: Layers },
  { name: "Buyurtmalar", href: "/admin/orders", icon: ShoppingBag },
  { name: "Xabarlar", href: "/admin/messages", icon: Mail },
  { name: "Foydalanuvchilar", href: "/admin/users", icon: Users },
  { name: "Sozlamalar", href: "/admin/settings", icon: Settings },
]

export function MessagesManagement({
  messages: initialMessages,
}: MessagesManagementProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [messages, setMessages] = useState(initialMessages)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Real-time messages subscription
    const supabase = createClient()
    console.log("📡 Creating Supabase client for messages...")
    
    const channelName = `messages-updates-${Date.now()}`
    console.log("📢 Channel name:", channelName)
    
    const channel = supabase
      .channel(channelName, {
        config: { broadcast: { self: true } },
      })
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "contact_messages",
        },
        (payload: any) => {
          console.log("🔔 MESSAGE PAYLOAD RECEIVED:", JSON.stringify(payload, null, 2))
          console.log("📋 Event type:", payload.eventType)
          
          if (payload.eventType === "INSERT") {
            console.log("✅ INSERT event detected for message:", payload.new.id)
            setMessages((prev) => {
              const exists = prev.some((m) => m.id === payload.new.id)
              console.log("🔍 Message exists in state?", exists)
              if (exists) return prev
              console.log("✨ Adding new message to state")
              return [payload.new as ContactMessage, ...prev]
            })
          } else if (payload.eventType === "UPDATE") {
            console.log("✏️ UPDATE event detected for message:", payload.new.id)
            setMessages((prev) =>
              prev.map((message) => (message.id === payload.new.id ? (payload.new as ContactMessage) : message))
            )
          } else if (payload.eventType === "DELETE") {
            console.log("🗑️ DELETE event detected for message:", payload.old.id)
            setMessages((prev) => prev.filter((message) => message.id !== payload.old.id))
          }
        }
      )
      .subscribe((status) => {
        console.log("📡 Messages subscription status:", status)
        if (status === "SUBSCRIBED") {
          console.log("✅ Successfully subscribed to messages!")
        } else if (status === "CHANNEL_ERROR") {
          console.log("❌ Channel error!")
        }
      })

    return () => {
      console.log("🔌 Cleaning up messages subscription")
      supabase.removeChannel(channel)
    }
  }, [])

  if (!mounted) return null

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  const markAsRead = async (messageId: string) => {
    const supabase = createClient()

    const { error } = await supabase
      .from("contact_messages")
      .update({ is_read: true })
      .eq("id", messageId)

    if (error) {
      toast({
        title: "Xatolik",
        description: "Xabar yangilanmadi",
        variant: "destructive",
      })
      return
    }

    setMessages((prev) =>
      prev.map((msg) => (msg.id === messageId ? { ...msg, is_read: true } : msg))
    )

    if (selectedMessage?.id === messageId) {
      setSelectedMessage((prev) => (prev ? { ...prev, is_read: true } : null))
    }
  }

  const deleteMessage = async (messageId: string) => {
    const supabase = createClient()

    const { error } = await supabase
      .from("contact_messages")
      .delete()
      .eq("id", messageId)

    if (error) {
      toast({
        title: "Xatolik",
        description: "Xabar o'chirilmadi",
        variant: "destructive",
      })
      return
    }

    setMessages((prev) => prev.filter((msg) => msg.id !== messageId))
    setSelectedMessage(null)

    toast({
      title: "O'chirildi",
      description: "Xabar muvaffaqiyatli o'chirildi",
    })
  }

  const openMessage = (message: ContactMessage) => {
    setSelectedMessage(message)
    if (!message.is_read) {
      markAsRead(message.id)
    }
  }

  const Sidebar = () => (
    <div className="flex h-full flex-col bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-r border-amber-900/20">
      <div className="flex h-20 items-center gap-3 px-6 border-b border-amber-900/20">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-amber-600 to-orange-600 shadow-lg">
          <Coffee className="h-6 w-6 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="font-serif text-base font-bold text-amber-300">MILANO</span>
          <span className="text-xs font-light text-amber-200">Admin</span>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-6 overflow-y-auto">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-slate-300 transition-all hover:text-amber-300 hover:bg-amber-600/10 group"
          >
            <item.icon className="h-5 w-5 group-hover:text-amber-400" />
            {item.name}
          </Link>
        ))}
      </nav>

      <div className="border-t border-amber-900/20 p-3 space-y-2">
        <Link href="/">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-slate-300 hover:bg-blue-600/10 hover:text-blue-300 transition-all"
          >
            <Home className="h-5 w-5" />
            Saytga qaytish
          </Button>
        </Link>
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start gap-3 text-slate-300 hover:bg-red-900/20 hover:text-red-400 transition-all"
        >
          <LogOut className="h-5 w-5" />
          Chiqish
        </Button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col shadow-2xl">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-72 p-0 bg-slate-900">
          <SheetTitle className="sr-only">Admin Menu</SheetTitle>
          <Sidebar />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="lg:pl-72">
        {/* Mobile Header */}
        <div className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-white/95 backdrop-blur-sm shadow-md px-4 lg:hidden">
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
          </Sheet>
          <span className="font-serif font-bold text-slate-900">Xabarlar</span>
        </div>

        <main className="p-6 lg:p-8">
          <div className="mb-8">
            <h1 className="font-serif text-4xl font-bold text-slate-900 bg-gradient-to-r from-amber-900 to-orange-700 bg-clip-text text-transparent">
              Xabarlar
            </h1>
            <p className="text-slate-600 mt-2 font-light">Mijozlardan kelgan xabarlarni boshqarish</p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Messages List */}
            <div className="lg:col-span-1">
              <Card className="shadow-card border-0 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-white border-b">
                  <CardTitle className="text-slate-900 font-serif">Xabarlar ({messages.length})</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {messages.length === 0 ? (
                    <div className="p-6 text-center text-slate-500">
                      <p>Xabarlar yo'q</p>
                    </div>
                  ) : (
                    <div className="divide-y max-h-[600px] overflow-y-auto">
                      {messages.map((message) => (
                        <button
                          key={message.id}
                          onClick={() => openMessage(message)}
                          className={`w-full text-left p-4 hover:bg-amber-50 transition-colors border-l-4 ${
                            selectedMessage?.id === message.id
                              ? "border-l-amber-600 bg-amber-50"
                              : "border-l-transparent"
                          } ${!message.is_read ? "bg-blue-50" : ""}`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-slate-900 truncate text-sm">
                                {message.name}
                              </p>
                              <p className="text-xs text-slate-500 truncate">{message.email}</p>
                              <p className="text-xs text-slate-600 truncate">{message.subject}</p>
                            </div>
                            {!message.is_read && (
                              <div className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-500 mt-1" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Message Detail */}
            <div className="lg:col-span-2">
              {selectedMessage ? (
                <Card className="shadow-card border-0 overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-slate-50 to-white border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-slate-900 font-serif">{selectedMessage.subject}</CardTitle>
                        <p className="text-sm text-slate-600 mt-1" suppressHydrationWarning>
                          {formatDate(selectedMessage.created_at)}
                        </p>
                      </div>
                      {!selectedMessage.is_read && (
                        <Badge className="bg-blue-100 text-blue-800">Yangi</Badge>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="p-6 space-y-6">
                    {/* Sender Info */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-slate-600 font-semibold uppercase">Ism</p>
                        <p className="text-slate-900 font-medium">{selectedMessage.name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 font-semibold uppercase">Email</p>
                        <a
                          href={`mailto:${selectedMessage.email}`}
                          className="text-amber-600 hover:text-amber-700 font-medium"
                        >
                          {selectedMessage.email}
                        </a>
                      </div>
                      {selectedMessage.phone && (
                        <div>
                          <p className="text-xs text-slate-600 font-semibold uppercase">Telefon</p>
                          <a
                            href={`tel:${selectedMessage.phone}`}
                            className="text-amber-600 hover:text-amber-700 font-medium"
                          >
                            {selectedMessage.phone}
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent" />

                    {/* Message Content */}
                    <div>
                      <p className="text-xs text-slate-600 font-semibold uppercase mb-3">Xabar</p>
                      <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                        {selectedMessage.message}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t border-slate-200">
                      {!selectedMessage.is_read && (
                        <Button
                          onClick={() => markAsRead(selectedMessage.id)}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Check className="h-4 w-4 mr-2" />
                          O'qildi deb belgilash
                        </Button>
                      )}
                      <Button
                        onClick={() => deleteMessage(selectedMessage.id)}
                        variant="destructive"
                        className="flex-1"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        O'chirish
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="shadow-card border-0 flex items-center justify-center h-96">
                  <CardContent className="text-center">
                    <p className="text-slate-500 text-lg">Xabar tanlang ko'rish uchun</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
