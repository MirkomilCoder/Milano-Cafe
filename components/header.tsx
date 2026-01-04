"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, ShoppingBag, User, Settings } from "lucide-react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { useCart } from "@/lib/cart-context"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/theme-toggle"
import type { User as SupabaseUser } from "@supabase/supabase-js"

const navigation = [
  { name: "Bosh sahifa", href: "/" },
  { name: "Menu", href: "/menu" },
  { name: "Kategoriyalar", href: "/categories" },
  { name: "Biz haqimizda", href: "/about" },
  { name: "Aloqa", href: "/contact" },
]

const adminNavigation = [
  { name: "Admin Panel", href: "/admin", icon: Settings },
]

export function Header() {
  const pathname = usePathname()
  const { totalItems } = useCart()
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setIsAdmin(user?.user_metadata?.is_admin === true)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
      setIsAdmin(session?.user?.user_metadata?.is_admin === true)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled ? "bg-card/95 dark:bg-slate-900/95 backdrop-blur-md shadow-md" : "bg-transparent",
      )}
    >
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-11 w-11 flex items-center justify-center">
              <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="h-11 w-11">
                <defs>
                  <linearGradient id="milanogreen" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{stopColor:"#16a34a",stopOpacity:1}} />
                    <stop offset="50%" style={{stopColor:"#22c55e",stopOpacity:1}} />
                    <stop offset="100%" style={{stopColor:"#15803d",stopOpacity:1}} />
                  </linearGradient>
                </defs>
                {/* Leaf shapes for plant theme */}
                <ellipse cx="60" cy="50" rx="25" ry="35" fill="#22c55e" opacity="0.8" transform="rotate(-30 60 50)"/>
                <ellipse cx="140" cy="60" rx="28" ry="38" fill="#16a34a" opacity="0.7" transform="rotate(25 140 60)"/>
                <ellipse cx="100" cy="35" rx="30" ry="40" fill="#4ade80" opacity="0.6" transform="rotate(-10 100 35)"/>
                
                {/* Main circle background */}
                <circle cx="100" cy="100" r="95" fill="url(#milanogreen)" stroke="#15803d" strokeWidth="2"/>
                
                {/* MILANO text in yellow */}
                <text x="100" y="120" fontFamily="Arial, sans-serif" fontSize="48" fontWeight="bold" fill="#fbbf24" textAnchor="middle" opacity="0.95">
                  M
                </text>
              </svg>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-serif text-xl font-bold bg-gradient-to-r from-green-700 to-green-500 dark:from-green-400 dark:to-yellow-400 bg-clip-text text-transparent">MILANO</span>
              <span className="text-xs font-light text-green-700 dark:text-green-400 tracking-widest">KAFE</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:gap-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  pathname === item.href ? "text-primary" : "text-foreground/80",
                )}
              >
                {item.name}
              </Link>
            ))}
            
            {/* Admin Menu - Faqat adminga ko'rinadi */}
            {isAdmin && (
              <div className="border-l border-border pl-8 ml-4">
                {adminNavigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "inline-flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary",
                      pathname === item.href ? "text-primary" : "text-foreground/80",
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingBag className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {totalItems}
                  </span>
                )}
                <span className="sr-only">Savat</span>
              </Button>
            </Link>

            {user ? (
              <Link href="/profile">
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                  <span className="sr-only">Profil</span>
                </Button>
              </Link>
            ) : (
              <Link href="/auth/login" className="hidden sm:block">
                <Button variant="outline" size="sm">
                  Kirish
                </Button>
              </Link>
            )}

            {/* Mobile menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen} suppressHydrationWarning>
              <SheetTrigger asChild className="lg:hidden" suppressHydrationWarning>
                <Button variant="ghost" size="icon" className="h-10 w-10">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[320px] bg-card p-0">
                <SheetTitle className="sr-only">Menu</SheetTitle>
                <div className="flex flex-col h-full">
                  {/* Header */}
                  <div className="border-b border-border p-4">
                    <Link href="/" onClick={() => setIsOpen(false)} className="flex items-center gap-2">
                      <div className="h-9 w-9 flex items-center justify-center">
                        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="h-9 w-9">
                          <defs>
                            <linearGradient id="coffeegradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" style={{stopColor:"#d4a574",stopOpacity:1}} />
                              <stop offset="50%" style={{stopColor:"#c19a6b",stopOpacity:1}} />
                              <stop offset="100%" style={{stopColor:"#8b6f47",stopOpacity:1}} />
                            </linearGradient>
                          </defs>
                          <circle cx="100" cy="100" r="98" fill="url(#coffeegradient2)" stroke="#6F4E37" strokeWidth="2"/>
                          <path d="M 60 50 L 55 130 Q 55 145 70 145 L 130 145 Q 145 145 145 130 L 140 50 Q 140 40 130 40 L 70 40 Q 60 40 60 50 Z" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinejoin="round"/>
                          <ellipse cx="100" cy="120" rx="40" ry="12" fill="#4A2511" opacity="0.9"/>
                        </svg>
                      </div>
                      <div className="flex flex-col leading-tight">
                        <span className="font-serif font-bold text-amber-900 dark:text-amber-300">MILANO</span>
                        <span className="text-xs font-light text-amber-700 dark:text-amber-500">KAFE</span>
                      </div>
                    </Link>
                  </div>

                  {/* Navigation */}
                  <div className="flex-1 overflow-y-auto">
                    <div className="px-2 py-4 space-y-1">
                      {navigation.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className={cn(
                            "block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
                            pathname === item.href 
                              ? "bg-primary/10 text-primary" 
                              : "text-foreground/70 hover:text-primary hover:bg-primary/5",
                          )}
                        >
                          {item.name}
                        </Link>
                      ))}
                      
                      {/* Admin Menu Mobil */}
                      {isAdmin && (
                        <>
                          <div className="border-t border-border my-2" />
                          <div className="px-2 pt-2">
                            {adminNavigation.map((item) => (
                              <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className={cn(
                                  "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
                                  pathname === item.href 
                                    ? "bg-primary/20 text-primary" 
                                    : "text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30",
                                )}
                              >
                                <item.icon className="h-4 w-4" />
                                {item.name}
                              </Link>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="border-t border-border p-4">
                    {user ? (
                      <Link href="/profile" onClick={() => setIsOpen(false)}>
                        <Button className="w-full">Profilim</Button>
                      </Link>
                    ) : (
                      <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                        <Button className="w-full">Kirish</Button>
                      </Link>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    </header>
  )
}
