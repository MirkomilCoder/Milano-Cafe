"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Coffee, Home, LogOut, Mail, Menu, Package, ShoppingBag, Users, Settings, Trash2, Shield, Ban, Layers } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
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
  }
  created_at: string
  last_sign_in_at: string
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

export function UsersManagement({ users: initialUsers }: UsersManagementProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [users, setUsers] = useState(initialUsers)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

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

  const Sidebar = () => (
    <div className="flex h-full flex-col bg-gradient-to-b from-slate-950 to-slate-900 border-r border-slate-800">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-800">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-600 to-amber-700">
          <Coffee className="h-5 w-5 text-white" />
        </div>
        <div>
          <div className="font-serif text-sm font-bold text-amber-400">MILANO</div>
          <div className="text-xs text-amber-600 font-semibold tracking-wider">ADMIN</div>
        </div>
      </div>

      <nav className="flex-1 space-y-2 px-4 py-6">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all ${
              item.href === "/admin/users"
                ? "bg-amber-600/20 text-amber-600 border-l-2 border-amber-600"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            }`}
          >
            <item.icon className="h-5 w-5" />
            {item.name}
          </Link>
        ))}
      </nav>

      <div className="border-t border-slate-800 p-4">
        <Button
          variant="ghost"
          className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-800"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
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
            <p className="text-slate-600 mt-2 font-light">Jami {users.length} ta foydalanuvchi</p>
          </div>

          <div className="grid gap-4">
            {users.map((user) => (
              <Card key={user.id} className="border-amber-200/20 hover:border-amber-300/40 transition-all">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">{user.email}</p>
                      <p className="text-sm text-slate-500">
                        {new Date(user.created_at).toLocaleDateString("uz-UZ")} da ro'yxatdan o'tgan
                      </p>
                      {user.last_sign_in_at && (
                        <p className="text-sm text-slate-500">
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
            ))}
          </div>
        </main>
      </div>

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
