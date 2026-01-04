"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Coffee, Home, LogOut, Mail, Package, ShoppingBag, Users, Settings, Layers } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

const navigationItems = [
  { name: "Dashboard", href: "/admin", icon: Home },
  { name: "Mahsulotlar", href: "/admin/products", icon: Package },
  { name: "Kategoriyalar", href: "/admin/categories", icon: Layers },
  { name: "Buyurtmalar", href: "/admin/orders", icon: ShoppingBag },
  { name: "Xabarlar", href: "/admin/messages", icon: Mail },
  { name: "Foydalanuvchilar", href: "/admin/users", icon: Users },
  { name: "Sozlamalar", href: "/admin/settings", icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <div className="flex h-full flex-col bg-gradient-to-b from-green-950 to-green-900 border-r border-green-800">
      {/* Logo Section */}
      <Link href="/admin" className="flex items-center gap-3 px-6 py-4 border-b border-green-800 hover:bg-green-800/50 transition-colors">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-green-600 to-emerald-700 shadow-lg">
          <div className="text-white font-bold text-lg">🌿</div>
        </div>
        <div>
          <div className="font-serif text-sm font-bold text-yellow-400">MILANO</div>
          <div className="text-xs text-green-400 font-semibold tracking-wider">ADMIN</div>
        </div>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-6 overflow-y-auto">
        {navigationItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin" && pathname?.startsWith(item.href))
          const Icon = item.icon

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-gradient-to-r from-green-600/30 to-emerald-600/30 text-yellow-400 border-l-2 border-green-500 shadow-md"
                  : "text-green-400 hover:text-white hover:bg-green-800/60"
              }`}
            >
              <Icon className={`h-5 w-5 flex-shrink-0 ${isActive ? "text-yellow-400" : "text-green-500 group-hover:text-green-300"}`} />
              <span className="flex-1">{item.name}</span>
              {isActive && <div className="h-2 w-2 rounded-full bg-yellow-400"></div>}
            </Link>
          )
        })}
      </nav>

      {/* Logout Button */}
      <div className="border-t border-green-800 p-4 space-y-3">
        <Button
          variant="ghost"
          className="w-full justify-start text-green-400 hover:text-white hover:bg-green-800/80 transition-all"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2 flex-shrink-0" />
          Chiqish
        </Button>
      </div>
    </div>
  )
}
