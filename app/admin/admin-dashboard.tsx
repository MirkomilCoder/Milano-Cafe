"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Coffee, Home, LogOut, Mail, Menu, Package, ShoppingBag, TrendingUp, X, Bell, Volume2, VolumeX, Users, Settings, Shield, Layers, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { ThemeToggle } from "@/components/theme-toggle"
import { createClient } from "@/lib/supabase/client"
import { formatDate, formatPrice, getStatusColor, getStatusLabel } from "@/lib/format"
import type { ContactMessage, Order, AnalyticsStats } from "@/lib/types"
import { AdminStatusCard } from "@/components/admin-status-card"

interface AdminDashboardProps {
  stats: {
    productsCount: number
    ordersCount: number
    messagesCount: number
    totalRevenue: number
  }
  recentOrders: Order[]
  recentMessages: ContactMessage[]
}

interface Notification {
  id: string
  type: "order" | "message"
  title: string
  message: string
  createdAt: Date
  timeoutId?: NodeJS.Timeout
  audioRef?: HTMLAudioElement
}

const navigation = [
  { name: "Dashboard", href: "/admin", icon: Home },
  { name: "Mahsulotlar", href: "/admin/products", icon: Package },
  { name: "Kategoriyalar", href: "/admin/categories", icon: Layers },
  { name: "Buyurtmalar", href: "/admin/orders", icon: ShoppingBag },
  { name: "Xabarlar", href: "/admin/messages", icon: Mail },
  { name: "Foydalanuvchilar", href: "/admin/users", icon: Users },
  { name: "Statistika", href: "/admin/status", icon: Activity },
  { name: "Sozlamalar", href: "/admin/settings", icon: Settings },
]

export function AdminDashboard({ stats, recentOrders, recentMessages }: AdminDashboardProps) {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [orders, setOrders] = useState<Order[]>(recentOrders)
  const [messages, setMessages] = useState<ContactMessage[]>(recentMessages)
  const [audioSupported, setAudioSupported] = useState(true)
  const [soundMuted, setSoundMuted] = useState(false)
  const [analyticsStats, setAnalyticsStats] = useState<AnalyticsStats | null>(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(true)
  const [analyticsError, setAnalyticsError] = useState<string | null>(null)
  const currentAudioRef = useRef<HTMLAudioElement | null>(null)
  const currentTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Fetch analytics stats on mount
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setAnalyticsLoading(true)
        const response = await fetch("/api/admin/analytics/stats?days=30")
        if (response.ok) {
          const { data } = await response.json()
          setAnalyticsStats(data)
        } else {
          setAnalyticsError("Statistika yuklash muvaffaq bo'lmadi")
        }
      } catch (err) {
        setAnalyticsError("Statistika yuklash xatosi")
        console.error(err)
      } finally {
        setAnalyticsLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  useEffect(() => {
    const supabase = createClient()
    let ordersChannel: any = null
    let messagesChannel: any = null

    const setupSubscriptions = async () => {
      // Real-time orders subscription
      ordersChannel = supabase
        .channel(`admin-orders-${Date.now()}`, {
          config: { broadcast: { self: true } },
        })
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "orders",
          },
          (payload: any) => {
            console.log("New order:", payload)
            const newOrder = payload.new as Order
            setOrders((prev) => {
              const exists = prev.some((o) => o.id === newOrder.id)
              if (exists) return prev
              return [newOrder, ...prev.slice(0, 4)]
            })

            // Add notification with sound
            const notificationId = `order-${newOrder.id}`
            const notification: Notification = {
              id: notificationId,
              type: "order",
              title: "Yangi Buyurtma!",
              message: `${newOrder.customer_name} - ${formatPrice(newOrder.total_amount)}`,
              createdAt: new Date(),
            }
            
            setNotifications((prev) => [notification, ...prev])
            
            // Sound plays from admin layout globally
            // Just schedule dismiss
            scheduleNotificationDismiss(notificationId)
            // Auto-dismiss after 10 seconds
            setTimeout(() => {
              setNotifications((prev) => prev.filter((n) => n.id !== notification.id))
            }, 10000)
          }
        )
        .subscribe((status) => {
          console.log("Orders subscription status:", status)
        })

      // Real-time messages subscription
      messagesChannel = supabase
        .channel(`admin-messages-${Date.now()}`, {
          config: { broadcast: { self: true } },
        })
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "contact_messages",
          },
          (payload: any) => {
            console.log("New message:", payload)
            const newMessage = payload.new as ContactMessage
            setMessages((prev) => {
              const exists = prev.some((m) => m.id === newMessage.id)
              if (exists) return prev
              return [newMessage, ...prev.slice(0, 4)]
            })

            // Add notification with sound
            const notificationId = `message-${newMessage.id}`
            const notification: Notification = {
              id: notificationId,
              type: "message",
              title: "Yangi Xabar!",
              message: `${newMessage.name} - ${newMessage.subject}`,
              createdAt: new Date(),
            }
            setNotifications((prev) => [notification, ...prev])
            
            // Sound plays from admin layout globally
            // Just schedule dismiss
            scheduleNotificationDismiss(notificationId)
          }
        )
        .subscribe((status) => {
          console.log("Messages subscription status:", status)
        })
    }

    setupSubscriptions()

    return () => {
      if (ordersChannel) {
        supabase.removeChannel(ordersChannel)
      }
      if (messagesChannel) {
        supabase.removeChannel(messagesChannel)
      }
      
      // Cleanup sound va timeout
      return () => {
        stopNotificationSound()
        if (currentTimeoutRef.current) {
          clearTimeout(currentTimeoutRef.current)
        }
      }
    }
    
    return () => {
      stopNotificationSound()
      if (currentTimeoutRef.current) {
        clearTimeout(currentTimeoutRef.current)
      }
    }
  }, [])

  const playNotificationSound = () => {
    try {
      // Stop previous sound
      if (currentAudioRef.current) {
        currentAudioRef.current.pause()
        currentAudioRef.current.currentTime = 0
      }
      
      const audio = new Audio("/ring.mp3")
      audio.volume = 0.7
      currentAudioRef.current = audio
      
      audio.play().catch((err) => {
        console.log("Audio playback failed:", err)
        playFallbackSound()
      })
    } catch (error) {
      console.error("Audio error:", error)
      playFallbackSound()
    }
  }

  const stopNotificationSound = () => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause()
      currentAudioRef.current.currentTime = 0
      currentAudioRef.current = null
    }
  }

  const scheduleNotificationDismiss = (notificationId: string) => {
    // Clear previous timeout
    if (currentTimeoutRef.current) {
      clearTimeout(currentTimeoutRef.current)
    }
    
    // Notification stays for 30 seconds
    const NOTIFICATION_DURATION = 30000 // 30 seconds
    
    currentTimeoutRef.current = setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
      stopNotificationSound()
    }, NOTIFICATION_DURATION)
  }

  const playFallbackSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.value = 800
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.5)
    } catch (error) {
      console.error("Fallback audio error:", error)
    }
  }

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
    stopNotificationSound()
    if (currentTimeoutRef.current) {
      clearTimeout(currentTimeoutRef.current)
      currentTimeoutRef.current = null
    }
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  const Sidebar = () => (
    <div className="flex h-full flex-col bg-gradient-to-b from-green-950 via-green-900 to-green-950 border-r border-green-900/20">
      <div className="flex h-20 items-center gap-3 px-6 border-b border-green-900/20">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-green-600 to-emerald-600 shadow-lg">
          <div className="text-white font-bold text-xl">🌿</div>
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
            className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-green-300 transition-all hover:text-yellow-300 hover:bg-green-600/10 group"
          >
            <item.icon className="h-5 w-5 group-hover:text-yellow-400" />
            {item.name}
          </Link>
        ))}
      </nav>

      <div className="border-t border-green-900/20 p-3 space-y-2">
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 dark:from-green-950 dark:via-green-900 dark:to-green-950">
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
        {/* Desktop Header with Sound Control */}
        <div className="sticky top-0 z-40 hidden lg:flex h-16 items-center justify-between border-b bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm shadow-md px-6">
          <span className="font-serif font-bold text-slate-900 dark:text-slate-50">MILANO Admin Panel</span>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setSoundMuted(!soundMuted)
                const { setGlobalSoundMuted } = require("./layout")
                setGlobalSoundMuted(!soundMuted)
              }}
              title={soundMuted ? "Ovozni yoqish" : "Ovozni o'chirish"}
              className="text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-900/20"
            >
              {soundMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Header */}
        <div className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm shadow-md px-4 lg:hidden">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <span className="font-serif font-bold text-slate-900 dark:text-slate-50">MILANO Admin</span>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setSoundMuted(!soundMuted)
                const { setGlobalSoundMuted } = require("./layout")
                setGlobalSoundMuted(!soundMuted)
              }}
              title={soundMuted ? "Ovozni yoqish" : "Ovozni o'chirish"}
              className="text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-900/20"
            >
              {soundMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Notifications - Large visible notifications */}
        <div className="fixed top-20 right-4 z-50 space-y-3 max-w-sm">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`rounded-xl shadow-2xl p-5 flex items-start justify-between gap-4 animate-in slide-in-from-right duration-300 border-2 ${
                notification.type === "order"
                  ? "bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 dark:from-green-950 dark:via-emerald-950 dark:to-green-900 border-green-400 dark:border-green-600 ring-2 ring-green-300 dark:ring-green-700"
                  : "bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 dark:from-blue-950 dark:via-cyan-950 dark:to-blue-900 border-blue-400 dark:border-blue-600 ring-2 ring-blue-300 dark:ring-blue-700"
              }`}
            >
              <div className="flex items-start gap-3 flex-1">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                  notification.type === "order"
                    ? "bg-green-100 dark:bg-green-900/50"
                    : "bg-blue-100 dark:bg-blue-900/50"
                }`}>
                  {notification.type === "order" ? (
                    <ShoppingBag className={`h-5 w-5 ${notification.type === "order" ? "text-green-600 dark:text-green-400" : "text-blue-600 dark:text-blue-400"}`} />
                  ) : (
                    <Mail className={`h-5 w-5 ${notification.type === "order" ? "text-green-600 dark:text-green-400" : "text-blue-600 dark:text-blue-400"}`} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold text-sm ${
                    notification.type === "order" ? "text-green-900 dark:text-green-100" : "text-blue-900 dark:text-blue-100"
                  }`}>
                    {notification.title}
                  </p>
                  <p className={`text-xs mt-1 truncate ${
                    notification.type === "order" ? "text-green-700 dark:text-green-300" : "text-blue-700 dark:text-blue-300"
                  }`}>
                    {notification.message}
                  </p>
                </div>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => stopNotificationSound()}
                  title="Ovozni to'xtat"
                >
                  <VolumeX className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => dismissNotification(notification.id)}
                  title="Bildirishnomani yopish"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <main className="p-6 lg:p-8">
          <div className="mb-8">
            <h1 className="font-serif text-4xl font-bold text-slate-900 dark:text-slate-50 lg:text-5xl bg-gradient-to-r from-green-900 to-emerald-700 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent">Dashboard</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2 font-light">Kafe statistikasi va so'nggi ma'lumotlar</p>
          </div>

          {/* Stats */}
          <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="shadow-card hover:shadow-elevated transition-all border-0 bg-gradient-to-br from-white to-blue-50 dark:from-slate-800 dark:to-blue-900/30">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-200 to-blue-100 dark:from-blue-900 dark:to-blue-800">
                  <Package className="h-7 w-7 text-blue-700 dark:text-blue-300" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Mahsulotlar</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-slate-50">{stats.productsCount}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card hover:shadow-elevated transition-all border-0 bg-gradient-to-br from-white to-green-50 dark:from-slate-800 dark:to-green-900/30">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-green-200 to-green-100 dark:from-green-900 dark:to-green-800">
                  <ShoppingBag className="h-7 w-7 text-green-700 dark:text-green-300" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Buyurtmalar</p>
                  <p className="text-3xl font-bold text-slate-900">{stats.ordersCount}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card hover:shadow-elevated transition-all border-0 bg-gradient-to-br from-white to-amber-50">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-amber-200 to-amber-100">
                  <Mail className="h-7 w-7 text-amber-700" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Yangi xabarlar</p>
                  <p className="text-3xl font-bold text-slate-900">{stats.messagesCount}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card hover:shadow-elevated transition-all border-0 bg-gradient-to-br from-amber-50 to-orange-50">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-orange-300 to-amber-200">
                  <TrendingUp className="h-7 w-7 text-orange-800" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Umumiy daromad</p>
                  <p className="text-3xl font-bold text-slate-900">{formatPrice(stats.totalRevenue)}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Analytics Status Card */}
          <div className="mb-8">
            <AdminStatusCard stats={analyticsStats || undefined} loading={analyticsLoading} error={analyticsError || undefined} />
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Recent Orders */}
            <Card className="shadow-card border-0 overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between border-b bg-gradient-to-r from-slate-50 to-white p-6">
                <CardTitle className="text-slate-900 font-serif text-xl">So'nggi buyurtmalar</CardTitle>
                <Link href="/admin/orders">
                  <Button variant="ghost" size="sm" className="text-amber-700 hover:text-amber-900 hover:bg-amber-50">
                    Barchasi
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {orders.length === 0 ? (
                    <p className="text-center text-slate-500">Buyurtmalar yo'q</p>
                  ) : (
                    orders.slice(0, 5).map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between border-b border-slate-100 pb-4 last:border-0 last:pb-0 hover:bg-slate-50 -mx-6 px-6 py-3 transition-colors"
                      >
                        <div>
                          <p className="font-medium text-slate-900">#{order.id.slice(0, 8).toUpperCase()}</p>
                          <p className="text-sm text-slate-500" suppressHydrationWarning>
                            {order.customer_name} - {formatDate(order.created_at)}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(order.status)}>{getStatusLabel(order.status)}</Badge>
                          <p className="mt-1 text-sm font-bold text-amber-700">{formatPrice(order.total_amount)}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Messages */}
            <Card className="shadow-card border-0 overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between border-b bg-gradient-to-r from-slate-50 to-white p-6">
                <CardTitle className="text-slate-900 font-serif text-xl">So'nggi xabarlar</CardTitle>
                <Link href="/admin/messages">
                  <Button variant="ghost" size="sm" className="text-amber-700 hover:text-amber-900 hover:bg-amber-50">
                    Barchasi
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {messages.length === 0 ? (
                    <p className="text-center text-slate-500">Xabarlar yo'q</p>
                  ) : (
                    messages.map((message) => (
                      <div key={message.id} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0 hover:bg-slate-50 -mx-6 px-6 py-3 transition-colors">
                        <div className="mb-1 flex items-center justify-between">
                          <p className="font-medium text-slate-900">{message.name}</p>
                          {!message.is_read && <Badge className="bg-amber-100 text-amber-800">Yangi</Badge>}
                        </div>
                        <p className="text-sm text-slate-600">{message.subject}</p>
                        <p className="mt-1 text-xs text-muted-foreground" suppressHydrationWarning>{formatDate(message.created_at)}</p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
