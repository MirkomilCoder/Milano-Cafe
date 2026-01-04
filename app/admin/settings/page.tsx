"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Coffee, Home, LogOut, Mail, Menu, Package, ShoppingBag, Users, Settings, Bell, Zap, Layers } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

const navigation = [
  { name: "Dashboard", href: "/admin", icon: Home },
  { name: "Mahsulotlar", href: "/admin/products", icon: Package },
  { name: "Kategoriyalar", href: "/admin/categories", icon: Layers },
  { name: "Buyurtmalar", href: "/admin/orders", icon: ShoppingBag },
  { name: "Xabarlar", href: "/admin/messages", icon: Mail },
  { name: "Foydalanuvchilar", href: "/admin/users", icon: Users },
  { name: "Sozlamalar", href: "/admin/settings", icon: Settings },
]
export default function AdminSettings() {
  const router = useRouter()
  const { toast } = useToast()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [soundNotifications, setSoundNotifications] = useState(true)
  const [darkMode, setDarkMode] = useState(false)

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  const handleSave = () => {
    toast({
      title: "Muvaffaqiyatli",
      description: "Sozlamalar saqlandi",
    })
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
              item.href === "/admin/settings"
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
          <span className="font-serif font-bold text-slate-900">Sozlamalar</span>
          <div></div>
        </div>

        <main className="p-6 lg:p-8 max-w-2xl">
          <div className="mb-8">
            <h1 className="font-serif text-4xl font-bold text-slate-900 lg:text-5xl bg-gradient-to-r from-amber-900 to-orange-700 bg-clip-text text-transparent">
              Sozlamalar
            </h1>
            <p className="text-slate-600 mt-2 font-light">Admin panel sozlamalarini boshqarish</p>
          </div>

          {/* Notification Settings */}
          <Card className="border-amber-200/20 mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-amber-600" />
                Bildirishnomalar
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-900">Email bildirishnomalar</p>
                  <p className="text-sm text-slate-600">Yangi buyurtma va xabarlar haqida email olish</p>
                </div>
                <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
              </div>

              <div className="border-t border-slate-200 pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">Ovoz bildirishnomalar</p>
                    <p className="text-sm text-slate-600">Yangi buyurtma kelsa ringtone eshitish</p>
                  </div>
                  <Switch checked={soundNotifications} onCheckedChange={setSoundNotifications} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Display Settings */}
          <Card className="border-amber-200/20 mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-600" />
                Ko'rinish
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-900">Qora rejim</p>
                  <p className="text-sm text-slate-600">Qora fonda ishlash (keraksiz)</p>
                </div>
                <Switch checked={darkMode} onCheckedChange={setDarkMode} disabled />
              </div>
            </CardContent>
          </Card>

          {/* System Info */}
          <Card className="border-amber-200/20">
            <CardHeader>
              <CardTitle>Sistema Ma'lumotlari</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-slate-600">Platform:</span>
                <span className="font-semibold text-slate-900">MILANO Kafe</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Versiya:</span>
                <span className="font-semibold text-slate-900">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Admin Paneli:</span>
                <span className="font-semibold text-slate-900">Active</span>
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 flex gap-3">
            <Button onClick={handleSave} className="bg-amber-600 hover:bg-amber-700">
              Saqlash
            </Button>
            <Button variant="outline">Bekor qilish</Button>
          </div>
        </main>
      </div>
    </div>
  )
}
