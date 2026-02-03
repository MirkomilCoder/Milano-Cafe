"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Coffee, Home, LogOut, Mail, Menu, Package, ShoppingBag, Users, Settings, Trash2, Shield, Ban, Layers, Eye, Clock, MapPin, Phone, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface User {
  id: string
  email: string
  user_metadata?: {
    is_admin?: boolean
    banned?: boolean
    ban_reason?: string | null
    banned_at?: string | null
    full_name?: string
    phone?: string
    address?: string
    location?: string
  }
  created_at: string
  last_sign_in_at: string
}

interface OnlineUser extends User {
  last_activity: string
}

interface UsersManagementProps {
  users: User[]
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

interface UserSession {
  id: string
  user_id: string
  user_email: string
  user_metadata: any
  last_activity: string
  created_at: string
}

export function UsersManagement({ users: initialUsers }: UsersManagementProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [users, setUsers] = useState(initialUsers)
  const [onlineUsers, setOnlineUsers] = useState<UserSession[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [loadingUsers, setLoadingUsers] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    // Real-time online users tracking from database
    const channelName = `user-sessions-${Date.now()}`
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_sessions",
        },
        (payload: any) => {
          console.log("📡 User session change:", payload)
          
          if (payload.eventType === "INSERT") {
            console.log("✅ User came online:", payload.new)
            setOnlineUsers((prev) => {
              const exists = prev.find(u => u.user_id === payload.new.user_id)
              if (exists) return prev
              return [...prev, payload.new as UserSession]
            })
          } else if (payload.eventType === "UPDATE") {
            console.log("📝 User activity updated:", payload.new)
            setOnlineUsers((prev) =>
              prev.map(u => u.user_id === payload.new.user_id ? payload.new as UserSession : u)
            )
          } else if (payload.eventType === "DELETE") {
            console.log("👋 User went offline:", payload.old)
            setOnlineUsers((prev) =>
              prev.filter(u => u.user_id !== payload.old.user_id)
            )
          }
        }
      )
      .subscribe((status) => {
        console.log("📡 User sessions subscription status:", status)
      })

    // Initial fetch of online users
    const fetchOnlineUsers = async () => {
      try {
        setLoadingUsers(true)
        const { data, error } = await supabase
          .from("user_sessions")
          .select("*")
          .gt("last_activity", new Date(Date.now() - 5 * 60 * 1000).toISOString())
          .order("last_activity", { ascending: false })

        if (error) {
          console.error("Error fetching online users:", error)
          return
        }

        console.log("🟢 Online users fetched:", data)
        setOnlineUsers(data as UserSession[])
      } catch (error) {
        console.error("Error:", error)
      } finally {
        setLoadingUsers(false)
      }
    }

    fetchOnlineUsers()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  const handleMakeAdmin = async (userId: string) => {
    const supabase = createClient()

    try {
      const { error } = await supabase.auth.admin.updateUserById(userId, {
        user_metadata: { is_admin: true },
      })

      if (error) {
        toast({
          title: "Xatolik",
          description: "Foydalanuvchi admin qilinmadi",
          variant: "destructive",
        })
        return
      }

      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? { ...u, user_metadata: { ...u.user_metadata, is_admin: true } }
            : u
        )
      )

      toast({
        title: "Muvaffaqiyatli",
        description: "Foydalanuvchi admin qilindi",
      })
    } catch (error) {
      console.error("Error:", error)
    }
  }

  const handleRemoveAdmin = async (userId: string) => {
    const supabase = createClient()

    try {
      const { error } = await supabase.auth.admin.updateUserById(userId, {
        user_metadata: { is_admin: false },
      })

      if (error) {
        toast({
          title: "Xatolik",
          description: "Admin huquqi olib tashlandi",
          variant: "destructive",
        })
        return
      }

      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? { ...u, user_metadata: { ...u.user_metadata, is_admin: false } }
            : u
        )
      )

      toast({
        title: "Muvaffaqiyatli",
        description: "Admin huquqi olib tashlandi",
      })
    } catch (error) {
      console.error("Error:", error)
    }
  }

  const handleBanUser = async (userId: string) => {
    const supabase = createClient()

    try {
      const { error } = await supabase.auth.admin.updateUserById(userId, {
        user_metadata: {
          banned: true,
          ban_reason: "Admin tomonidan bloklangan",
          banned_at: new Date().toISOString(),
        },
      })

      if (error) {
        toast({
          title: "Xatolik",
          description: "Foydalanuvchi bloklanmadi",
          variant: "destructive",
        })
        return
      }

      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? {
                ...u,
                user_metadata: {
                  ...u.user_metadata,
                  banned: true,
                  ban_reason: "Admin tomonidan bloklangan",
                  banned_at: new Date().toISOString(),
                },
              }
            : u
        )
      )

      toast({
        title: "Muvaffaqiyatli",
        description: "Foydalanuvchi bloklandi",
      })
    } catch (error) {
      console.error("Error:", error)
    }
  }

  const handleUnbanUser = async (userId: string) => {
    const supabase = createClient()

    try {
      const { error } = await supabase.auth.admin.updateUserById(userId, {
        user_metadata: {
          banned: false,
          ban_reason: null,
          banned_at: null,
        },
      })

      if (error) {
        toast({
          title: "Xatolik",
          description: "Foydalanuvchi blokdan chiqarilmadi",
          variant: "destructive",
        })
        return
      }

      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? {
                ...u,
                user_metadata: {
                  ...u.user_metadata,
                  banned: false,
                  ban_reason: null,
                  banned_at: null,
                },
              }
            : u
        )
      )

      toast({
        title: "Muvaffaqiyatli",
        description: "Foydalanuvchi blokdan chiqarildi",
      })
    } catch (error) {
      console.error("Error:", error)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    const supabase = createClient()

    try {
      const { error } = await supabase.auth.admin.deleteUser(userId)

      if (error) {
        toast({
          title: "Xatolik",
          description: "Foydalanuvchi o'chirilmadi",
          variant: "destructive",
        })
        return
      }

      setUsers((prev) => prev.filter((u) => u.id !== userId))
      setDeleteDialogOpen(false)
      setSelectedUser(null)

      toast({
        title: "Muvaffaqiyatli",
        description: "Foydalanuvchi o'chirildi",
      })
    } catch (error) {
      console.error("Error:", error)
    }
  }

  const UserCard = ({ user, isOnline = false }: { user: User; isOnline?: boolean }) => (
    <Card className="border-amber-200/20 hover:border-amber-300/40 transition-all">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-slate-900">{user.email}</p>
              {isOnline && <Badge className="bg-green-500 text-white"><Eye className="h-3 w-3 mr-1" />Online</Badge>}
            </div>
            {user.user_metadata?.full_name && (
              <p className="text-sm text-slate-600 mt-1">
                <User className="h-3 w-3 inline mr-1" />
                {user.user_metadata.full_name}
              </p>
            )}
            <p className="text-sm text-slate-500 mt-1">
              {new Date(user.created_at).toLocaleDateString("uz-UZ")} da ro'yxatdan o'tgan
            </p>
            {user.last_sign_in_at && (
              <p className="text-sm text-slate-500">
                <Clock className="h-3 w-3 inline mr-1" />
                Oxirgi kirish: {new Date(user.last_sign_in_at).toLocaleDateString("uz-UZ")}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {user.user_metadata?.banned ? (
              <Badge className="bg-red-600/20 text-red-700 border border-red-300">
                🚫 Bloklangan
              </Badge>
            ) : null}
            
            {user.user_metadata?.is_admin ? (
              <Badge className="bg-amber-600/20 text-amber-700 border border-amber-300">
                <Shield className="h-3 w-3 mr-1" />
                Admin
              </Badge>
            ) : (
              <Badge className="bg-slate-200 text-slate-700">Foydalanuvchi</Badge>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedUser(user)
                setDetailsDialogOpen(true)
              }}
              className="text-blue-600 hover:bg-blue-100"
            >
              <Eye className="h-4 w-4 mr-1" />
              Detallar
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (user.user_metadata?.is_admin) {
                  handleRemoveAdmin(user.id)
                } else {
                  handleMakeAdmin(user.id)
                }
              }}
              className={user.user_metadata?.is_admin ? "text-orange-600 hover:bg-orange-100" : "text-amber-600 hover:bg-amber-100"}
            >
              {user.user_metadata?.is_admin ? "Admin dan o'chirib tashla" : "Admin qil"}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (user.user_metadata?.banned) {
                  handleUnbanUser(user.id)
                } else {
                  handleBanUser(user.id)
                }
              }}
              className={user.user_metadata?.banned ? "text-green-600 hover:bg-green-100" : "text-red-600 hover:bg-red-100"}
            >
              {user.user_metadata?.banned ? "🔓 Blokdan chiqar" : "🚫 Blokla"}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedUser(user)
                setDeleteDialogOpen(true)
              }}
              className="text-red-600 hover:bg-red-100"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const Sidebar = () => (
    <div className="flex h-full flex-col bg-gradient-to-b from-green-950 to-green-900 border-r border-green-800">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-green-800">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-green-600 to-green-700">
          <div className="text-white font-bold text-lg">🌿</div>
        </div>
        <div>
          <div className="font-serif text-sm font-bold text-yellow-400">MILANO</div>
          <div className="text-xs text-green-400 font-semibold tracking-wider">ADMIN</div>
        </div>
      </div>

      <nav className="flex-1 space-y-2 px-4 py-6">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all ${
              item.href === "/admin/users"
                ? "bg-green-600/20 text-yellow-400 border-l-2 border-green-500"
                : "text-green-400 hover:text-white hover:bg-green-800/50"
            }`}
          >
            <item.icon className="h-5 w-5" />
            {item.name}
          </Link>
        ))}
      </nav>

      <div className="border-t border-green-800 p-4">
        <Button
          variant="ghost"
          className="w-full justify-start text-green-400 hover:text-white hover:bg-green-800"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
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

      <div className="lg:pl-72">
        <div className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-white/95 backdrop-blur-sm shadow-md px-4 lg:hidden">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <span className="font-serif font-bold text-slate-900">Foydalanuvchilar</span>
          <div></div>
        </div>

        <main className="p-6 lg:p-8">
          <div className="mb-8">
            <h1 className="font-serif text-4xl font-bold text-slate-900 lg:text-5xl bg-gradient-to-r from-amber-900 to-orange-700 bg-clip-text text-transparent">
              Foydalanuvchilar
            </h1>
            <p className="text-slate-600 mt-2 font-light">
              Jami {users.length} ta foydalanuvchi, {onlineUsers.length} ta online
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="all">
                Barcha foydalanuvchilar ({users.length})
              </TabsTrigger>
              <TabsTrigger value="online">
                <Eye className="h-4 w-4 mr-2" />
                Online ({onlineUsers.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {users.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center text-slate-500">
                    Hech qanday foydalanuvchi yo'q
                  </CardContent>
                </Card>
              ) : (
                users.map((user) => (
                  <UserCard key={user.id} user={user} isOnline={onlineUsers.some(u => u.id === user.id)} />
                ))
              )}
            </TabsContent>

            <TabsContent value="online" className="space-y-4">
              {loadingUsers ? (
                <Card>
                  <CardContent className="pt-6 text-center text-slate-500">
                    Foydalanuvchilar yuklanmoqda...
                  </CardContent>
                </Card>
              ) : onlineUsers.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center text-slate-500">
                    Hozirda hech qanday foydalanuvchi online emas
                  </CardContent>
                </Card>
              ) : (
                onlineUsers.map((session) => {
                  const user = users.find(u => u.id === session.user_id)
                  if (!user) return null
                  return (
                    <UserCard key={session.user_id} user={user} isOnline={true} />
                  )
                })
              )}
            </TabsContent>
          </Tabs>
        </main>
      </div>

      {/* User Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Foydalanuvchi ma'lumotlari</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-600">Email</p>
                  <p className="text-slate-900 font-semibold">{selectedUser.email}</p>
                </div>

                {selectedUser.user_metadata?.full_name && (
                  <div>
                    <p className="text-sm font-medium text-slate-600">To'liq ismi</p>
                    <p className="text-slate-900 font-semibold">{selectedUser.user_metadata.full_name}</p>
                  </div>
                )}

                {selectedUser.user_metadata?.phone && (
                  <div>
                    <p className="text-sm font-medium text-slate-600">Telefon</p>
                    <p className="text-slate-900 font-semibold flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      {selectedUser.user_metadata.phone}
                    </p>
                  </div>
                )}

                {selectedUser.user_metadata?.address && (
                  <div>
                    <p className="text-sm font-medium text-slate-600">Manzil</p>
                    <p className="text-slate-900 font-semibold">{selectedUser.user_metadata.address}</p>
                  </div>
                )}

                {selectedUser.user_metadata?.location && (
                  <div>
                    <p className="text-sm font-medium text-slate-600">Joylashuvi</p>
                    <p className="text-slate-900 font-semibold flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {selectedUser.user_metadata.location}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-sm font-medium text-slate-600">Ro'yxatdan o'tgan sana</p>
                  <p className="text-slate-900 font-semibold">
                    {new Date(selectedUser.created_at).toLocaleDateString("uz-UZ")}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-slate-600">Oxirgi kirish</p>
                  <p className="text-slate-900 font-semibold">
                    {selectedUser.last_sign_in_at
                      ? new Date(selectedUser.last_sign_in_at).toLocaleDateString("uz-UZ")
                      : "Hali kirishmagan"}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-slate-600">Status</p>
                  <div className="flex gap-2 mt-1">
                    {selectedUser.user_metadata?.banned ? (
                      <Badge className="bg-red-600/20 text-red-700">🚫 Bloklangan</Badge>
                    ) : (
                      <Badge className="bg-green-600/20 text-green-700">✅ Faol</Badge>
                    )}
                    {selectedUser.user_metadata?.is_admin && (
                      <Badge className="bg-amber-600/20 text-amber-700">
                        <Shield className="h-3 w-3 mr-1" />
                        Admin
                      </Badge>
                    )}
                  </div>
                </div>

                {selectedUser.user_metadata?.ban_reason && (
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-slate-600">Bloklash sababi</p>
                    <p className="text-slate-900">{selectedUser.user_metadata.ban_reason}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setDetailsDialogOpen(false)}>
                  Yopish
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Foydalanuvchini o'chirib tashlashni tasdiqlash</DialogTitle>
          </DialogHeader>
          <p className="text-slate-600 my-4">
            Siz {selectedUser?.email} ni o'chirib tashlamochisiz? Bu amalni qaytarib bo'lmaydi.
          </p>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Bekor qilish
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedUser && handleDeleteUser(selectedUser.id)}
            >
              O'chirib tashla
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
