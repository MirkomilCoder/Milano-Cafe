"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Check, ChevronDown, Coffee, Eye, Home, LogOut, Mail, Menu, Package, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { createClient } from "@/lib/supabase/client"
import { formatDate, formatPrice, getStatusColor, getStatusLabel } from "@/lib/format"
import { useToast } from "@/hooks/use-toast"
import type { Order } from "@/lib/types"

interface OrdersManagementProps {
  orders: Order[]
}

const navigation = [
  { name: "Dashboard", href: "/admin", icon: Home },
  { name: "Mahsulotlar", href: "/admin/products", icon: Package },
  { name: "Buyurtmalar", href: "/admin/orders", icon: ShoppingBag },
  { name: "Xabarlar", href: "/admin/messages", icon: Mail },
]

const statuses = [
  { value: "pending", label: "Kutilmoqda" },
  { value: "confirmed", label: "Tasdiqlangan" },
  { value: "preparing", label: "Tayyorlanmoqda" },
  { value: "ready", label: "Tayyor" },
  { value: "completed", label: "Yakunlangan" },
  { value: "cancelled", label: "Bekor qilingan" },
]

export function OrdersManagement({ orders: initialOrders }: OrdersManagementProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [orders, setOrders] = useState(initialOrders)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    console.log("🔧 OrdersManagement component mounted")

    // Real-time orders subscription
    const supabase = createClient()
    console.log("📡 Creating Supabase client for orders...")
    
    const channelName = `orders-updates-${Date.now()}`
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
          table: "orders",
        },
        (payload: any) => {
          console.log("🔔 PAYLOAD RECEIVED:", JSON.stringify(payload, null, 2))
          console.log("📋 Event type:", payload.eventType)
          console.log("📋 New order data:", payload.new)
          
          if (payload.eventType === "INSERT") {
            console.log("✅ INSERT event detected for order:", payload.new.id)
            setOrders((prev) => {
              const exists = prev.some((o) => o.id === payload.new.id)
              console.log("🔍 Order exists in state?", exists)
              if (exists) return prev
              console.log("✨ Adding new order to state")
              return [payload.new as Order, ...prev]
            })
          } else if (payload.eventType === "UPDATE") {
            console.log("✏️ UPDATE event detected for order:", payload.new.id)
            setOrders((prev) =>
              prev.map((order) => (order.id === payload.new.id ? (payload.new as Order) : order))
            )
          } else if (payload.eventType === "DELETE") {
            console.log("🗑️ DELETE event detected for order:", payload.old.id)
            setOrders((prev) => prev.filter((order) => order.id !== payload.old.id))
          }
        }
      )
      .subscribe((status) => {
        console.log("📡 Orders subscription status:", status)
        if (status === "SUBSCRIBED") {
          console.log("✅ Successfully subscribed to orders!")
        } else if (status === "CHANNEL_ERROR") {
          console.log("❌ Channel error!")
        } else if (status === "CLOSED") {
          console.log("⚠️ Channel closed!")
        } else if (status === "TIMED_OUT") {
          console.log("⏱️ Connection timed out!")
        }
      })

    return () => {
      console.log("🔌 Cleaning up orders subscription")
      supabase.removeChannel(channel)
    }
  }, [])

  if (!mounted) return null

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const supabase = createClient()

    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", orderId)

    if (error) {
      toast({
        title: "Xatolik",
        description: "Status yangilanmadi",
        variant: "destructive",
      })
      return
    }

    setOrders((prev) =>
      prev.map((order) => (order.id === orderId ? { ...order, status: newStatus as Order["status"] } : order)),
    )

    if (selectedOrder?.id === orderId) {
      setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus as Order["status"] } : null))
    }

    toast({
      title: "Yangilandi",
      description: "Buyurtma statusi muvaffaqiyatli yangilandi",
    })
  }

  const filteredOrders = statusFilter !== "all" ? orders.filter((order) => order.status === statusFilter) : orders

  const Sidebar = () => (
    <div className="flex h-full flex-col bg-gradient-to-b from-slate-950 to-slate-900 border-r border-slate-800">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-800">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-600 to-amber-700">
          <Coffee className="h-5 w-5 text-white" />
        </div>
        <div>
          <div className="font-serif text-sm font-bold text-amber-400">MILANO</div>
          <div className="text-xs text-amber-600 font-semibold tracking-wider">KAFE</div>
        </div>
      </div>

      <nav className="flex-1 space-y-2 px-4 py-6">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all ${
              item.href === "/admin/orders"
                ? "bg-amber-500/10 text-amber-400 border-l-2 border-amber-400"
                : "text-slate-300 hover:text-amber-300 hover:bg-slate-800/50"
            }`}
          >
            <item.icon className="h-5 w-5" />
            {item.name}
          </Link>
        ))}
      </nav>

      <div className="border-t border-slate-800 p-4 space-y-2">
        <Link href="/">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-slate-300 hover:text-amber-300 hover:bg-slate-800"
          >
            <Home className="h-5 w-5" />
            Saytga qaytish
          </Button>
        </Link>
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start gap-3 text-slate-300 hover:text-amber-300 hover:bg-slate-800"
        >
          <LogOut className="h-5 w-5" />
          Chiqish
        </Button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetTitle className="sr-only">Admin Menu</SheetTitle>
          <Sidebar />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="lg:pl-72">
        {/* Mobile Header */}
        <div className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-card px-4 lg:hidden">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <span className="font-serif font-bold">Buyurtmalar</span>
        </div>

        <main className="p-4 lg:p-8">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-serif text-2xl font-bold text-foreground lg:text-3xl">Buyurtmalar</h1>
              <p className="text-muted-foreground">Barcha buyurtmalarni boshqaring</p>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Barcha statuslar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Barcha statuslar</SelectItem> {/* Updated value prop */}
                {statuses.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-4 py-3 text-left text-sm font-medium">Buyurtma</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Mijoz</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Turi</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Summa</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Sana</th>
                      <th className="px-4 py-3 text-right text-sm font-medium">Amallar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-muted-foreground">
                          Buyurtmalar topilmadi
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-muted/30">
                          <td className="px-4 py-3">
                            <span className="font-mono text-sm font-medium">#{order.id.slice(0, 8).toUpperCase()}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div>
                              <p className="font-medium">{order.customer_name}</p>
                              <p className="text-sm text-muted-foreground">{order.phone}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant="outline">
                              {order.delivery_type === "delivery" ? "Yetkazish" : "Olib ketish"}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 font-medium" suppressHydrationWarning>{formatPrice(order.total_amount)}</td>
                          <td className="px-4 py-3">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className={`gap-1 ${getStatusColor(order.status)}`}>
                                  {getStatusLabel(order.status)}
                                  <ChevronDown className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                {statuses.map((status) => (
                                  <DropdownMenuItem
                                    key={status.value}
                                    onClick={() => updateOrderStatus(order.id, status.value)}
                                  >
                                    {order.status === status.value && <Check className="mr-2 h-4 w-4" />}
                                    {status.label}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground" suppressHydrationWarning>{formatDate(order.created_at)}</td>
                          <td className="px-4 py-3 text-right">
                            <Button variant="ghost" size="icon" onClick={() => setSelectedOrder(order)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Buyurtma #{selectedOrder?.id.slice(0, 8).toUpperCase()}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Mijoz</p>
                  <p className="font-medium">{selectedOrder.customer_name}</p>
                  <p className="text-sm">{selectedOrder.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Yetkazish turi</p>
                  <p className="font-medium">
                    {selectedOrder.delivery_type === "delivery" ? "Yetkazib berish" : "Olib ketish"}
                  </p>
                  {selectedOrder.delivery_address && <p className="text-sm">{selectedOrder.delivery_address}</p>}
                </div>
              </div>

              <div>
                <p className="mb-3 text-sm font-medium text-muted-foreground">Buyurtma tarkibi</p>
                <div className="space-y-3">
                  {selectedOrder.order_items?.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 rounded-lg bg-muted/50 p-3">
                      <div className="relative h-12 w-12 overflow-hidden rounded bg-muted">
                        <Image
                          src={item.product?.image_url || "/placeholder.svg?height=48&width=48&query=coffee"}
                          alt={item.product?.name || ""}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{item.product?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.quantity} x {formatPrice(item.unit_price)}
                        </p>
                      </div>
                      <p className="font-medium">{formatPrice(item.total_price)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {selectedOrder.notes && (
                <div>
                  <p className="text-sm text-muted-foreground">Izoh</p>
                  <p>{selectedOrder.notes}</p>
                </div>
              )}

              <div className="flex items-center justify-between border-t pt-4">
                <p className="text-lg font-semibold">Jami</p>
                <p className="text-xl font-bold text-primary">{formatPrice(selectedOrder.total_amount)}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
