"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Plus, Edit, Trash2, Home, LogOut, Menu, Package, ShoppingBag, Mail, Users, Settings, Layers } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import type { Category } from "@/lib/types"

interface CategoriesManagementProps {
  categories: Category[]
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

const emptyCategory = {
  name: "",
  slug: "",
  description: "",
  icon: "☕",
}

export function CategoriesManagement({ categories: initialCategories }: CategoriesManagementProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [categories, setCategories] = useState(initialCategories)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState(emptyCategory)
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Real-time categories subscription
    const supabase = createClient()

    const channel = supabase
      .channel(`categories-updates-${Date.now()}`, {
        config: { broadcast: { self: true } },
      })
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "categories",
        },
        (payload: any) => {
          if (payload.eventType === "INSERT") {
            setCategories((prev) => {
              const exists = prev.some((c) => c.id === payload.new.id)
              if (exists) return prev
              return [payload.new, ...prev]
            })
          } else if (payload.eventType === "UPDATE") {
            setCategories((prev) =>
              prev.map((c) => (c.id === payload.new.id ? payload.new : c))
            )
          } else if (payload.eventType === "DELETE") {
            setCategories((prev) => prev.filter((c) => c.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const openDialog = (category?: Category) => {
    if (category) {
      setSelectedCategory(category)
      setFormData({
        name: category.name,
        slug: category.slug,
        description: category.description || "",
        icon: category.icon || "☕",
      })
    } else {
      setSelectedCategory(null)
      setFormData(emptyCategory)
    }
    setDialogOpen(true)
  }

  const handleSaveCategory = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Xato",
        description: "Kategoriya nomini kiriting",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    const supabase = createClient()

    try {
      if (selectedCategory) {
        // Update
        const { error } = await supabase
          .from("categories")
          .update({
            name: formData.name,
            slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, "-"),
            description: formData.description,
            icon: formData.icon,
          })
          .eq("id", selectedCategory.id)

        if (error) throw error

        toast({
          title: "Muvaffaqiyatli",
          description: "Kategoriya yangilandi",
        })
      } else {
        // Insert
        const { error } = await supabase.from("categories").insert({
          name: formData.name,
          slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, "-"),
          description: formData.description,
          icon: formData.icon,
        })

        if (error) throw error

        toast({
          title: "Muvaffaqiyatli",
          description: "Kategoriya qo'shildi",
        })
      }

      setDialogOpen(false)
      setFormData(emptyCategory)
      router.refresh()
    } catch (error: any) {
      toast({
        title: "Xato",
        description: error.message || "Saqlashda xato yuz berdi",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCategory = async () => {
    if (!selectedCategory) return

    setLoading(true)
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from("categories")
        .delete()
        .eq("id", selectedCategory.id)

      if (error) throw error

      toast({
        title: "Muvaffaqiyatli",
        description: "Kategoriya o'chirildi",
      })

      setDeleteDialogOpen(false)
      setSelectedCategory(null)
      router.refresh()
    } catch (error: any) {
      toast({
        title: "Xato",
        description: error.message || "O'chirishda xato yuz berdi",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const Sidebar = () => (
    <div className="flex h-full flex-col bg-gradient-to-b from-slate-950 to-slate-900 border-r border-slate-800">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-800">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-600 to-amber-700">
          <ShoppingBag className="h-5 w-5 text-white" />
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
              item.href === "/admin/categories"
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
          onClick={async () => {
            const supabase = createClient()
            await supabase.auth.signOut()
            router.push("/")
          }}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Chiqish
        </Button>
      </div>
    </div>
  )

  if (!mounted) return null

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
        <div className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm shadow-md px-4 lg:hidden">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <span className="font-serif font-bold text-slate-900 dark:text-slate-50">Kategoriyalar</span>
          <div></div>
        </div>

        <main className="p-6 lg:p-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="font-serif text-4xl font-bold text-slate-900 dark:text-slate-50 lg:text-5xl bg-gradient-to-r from-amber-900 to-orange-700 dark:from-amber-400 dark:to-orange-400 bg-clip-text text-transparent">
                Kategoriyalar
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2 font-light">Mahsulot kategoriyalarini boshqarish</p>
            </div>
            <Button
              onClick={() => openDialog()}
              className="gap-2 bg-amber-600 hover:bg-amber-700"
              size="lg"
            >
              <Plus className="h-5 w-5" />
              Kategoriya qo'shish
            </Button>
          </div>

          {/* Categories Grid */}
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {categories.length === 0 ? (
              <div className="col-span-full py-16 text-center">
                <p className="text-lg text-slate-500">Kategoriyalar mavjud emas</p>
              </div>
            ) : (
              categories.map((category) => (
                <Card key={category.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="text-4xl">{category.icon || "☕"}</div>
                      <div className="flex-1">
                        <h3 className="font-serif text-xl font-semibold text-slate-900 dark:text-slate-50">
                          {category.name}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{category.slug}</p>
                      </div>
                    </div>
                    {category.description && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                        {category.description}
                      </p>
                    )}
                    <div className="flex gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => openDialog(category)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Tahrir
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 flex-1"
                        onClick={() => {
                          setSelectedCategory(category)
                          setDeleteDialogOpen(true)
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        O'chirish
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </main>
      </div>

      {/* Edit/Add Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {selectedCategory ? "Kategoriyani tahrir qilish" : "Yangi kategoriya qo'shish"}
            </DialogTitle>
            <DialogDescription>
              {selectedCategory ? "Kategoriya ma'lumotlarini yangilang" : "Yangi kategoriya yarating"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Kategoriya nomi</Label>
              <Input
                placeholder="Masalan: Kofeler"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <Label>Slug (URL uchun)</Label>
              <Input
                placeholder="kofeler"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              />
            </div>

            <div>
              <Label>Tavsif</Label>
              <Textarea
                placeholder="Kategoriya haqida ma'lumot"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div>
              <Label>Emoji ikoni</Label>
              <Input
                placeholder="☕"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                maxLength={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Bekor qilish
            </Button>
            <Button
              onClick={handleSaveCategory}
              disabled={loading}
              className="bg-amber-600 hover:bg-amber-700"
            >
              {loading ? "Saqlash..." : "Saqlash"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kategoriyani o'chirish</DialogTitle>
            <DialogDescription>
              Siz "{selectedCategory?.name}" kategoriyasini o'chirishni xohlaysizmi? Bu amalni qaytarish mumkin emas.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Bekor qilish
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteCategory}
              disabled={loading}
            >
              {loading ? "O'chirilmoqda..." : "O'chirish"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
