"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Coffee, Edit, Home, LogOut, Mail, Menu, Package, Plus, ShoppingBag, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { formatPrice } from "@/lib/format"
import { useToast } from "@/hooks/use-toast"
import type { Category, Product } from "@/lib/types"

interface ProductsManagementProps {
  products: Product[]
  categories: Category[]
}

const navigation = [
  { name: "Dashboard", href: "/admin", icon: Home },
  { name: "Mahsulotlar", href: "/admin/products", icon: Package },
  { name: "Buyurtmalar", href: "/admin/orders", icon: ShoppingBag },
  { name: "Xabarlar", href: "/admin/messages", icon: Mail },
]

const emptyProduct = {
  name: "",
  slug: "",
  description: "",
  price: 0,
  image_url: "",
  category_id: "",
  is_available: true,
  is_featured: false,
  preparation_time: 10,
  calories: 0,
}

export function ProductsManagement({ products: initialProducts, categories }: ProductsManagementProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [products, setProducts] = useState(initialProducts)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState(emptyProduct)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Real-time products subscription
    const supabase = createClient()
    console.log("📡 Creating Supabase client for products...")
    
    const channelName = `products-updates-${Date.now()}`
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
          table: "products",
        },
        (payload: any) => {
          console.log("🔔 PRODUCT PAYLOAD RECEIVED:", JSON.stringify(payload, null, 2))
          console.log("📋 Event type:", payload.eventType)
          
          if (payload.eventType === "INSERT") {
            console.log("✅ INSERT event detected for product:", payload.new.id)
            setProducts((prev) => {
              const exists = prev.some((p) => p.id === payload.new.id)
              console.log("🔍 Product exists in state?", exists)
              if (exists) return prev
              console.log("✨ Adding new product to state")
              return [payload.new as Product, ...prev]
            })
          } else if (payload.eventType === "UPDATE") {
            console.log("✏️ UPDATE event detected for product:", payload.new.id)
            setProducts((prev) =>
              prev.map((product) => (product.id === payload.new.id ? (payload.new as Product) : product))
            )
          } else if (payload.eventType === "DELETE") {
            console.log("🗑️ DELETE event detected for product:", payload.old.id)
            setProducts((prev) => prev.filter((product) => product.id !== payload.old.id))
          }
        }
      )
      .subscribe((status) => {
        console.log("📡 Products subscription status:", status)
        if (status === "SUBSCRIBED") {
          console.log("✅ Successfully subscribed to products!")
        } else if (status === "CHANNEL_ERROR") {
          console.log("❌ Channel error!")
        }
      })

    return () => {
      console.log("🔌 Cleaning up products subscription")
      supabase.removeChannel(channel)
    }
  }, [])

  if (!mounted) return null

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
  }

  const openCreateDialog = () => {
    setSelectedProduct(null)
    setFormData(emptyProduct)
    setDialogOpen(true)
  }

  const openEditDialog = (product: Product) => {
    setSelectedProduct(product)
    setFormData({
      name: product.name,
      slug: product.slug,
      description: product.description || "",
      price: product.price,
      image_url: product.image_url || "",
      category_id: product.category_id || "",
      is_available: product.is_available,
      is_featured: product.is_featured,
      preparation_time: product.preparation_time,
      calories: product.calories || 0,
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formData.name || !formData.price || !formData.category_id) {
      toast({
        title: "Xatolik",
        description: "Iltimos, barcha majburiy maydonlarni to'ldiring",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    const supabase = createClient()

    try {
      const productData = {
        name: formData.name,
        slug: formData.slug || generateSlug(formData.name),
        description: formData.description || null,
        price: formData.price,
        image_url: formData.image_url || null,
        category_id: formData.category_id,
        is_available: formData.is_available,
        is_featured: formData.is_featured,
        preparation_time: formData.preparation_time,
        calories: formData.calories || null,
        updated_at: new Date().toISOString(),
      }

      if (selectedProduct) {
        // Update existing
        const { error } = await supabase.from("products").update(productData).eq("id", selectedProduct.id)

        if (error) throw error

        setProducts((prev) =>
          prev.map((p) =>
            p.id === selectedProduct.id
              ? { ...p, ...productData, category: categories.find((c) => c.id === formData.category_id) }
              : p,
          ),
        )

        toast({ title: "Muvaffaqiyatli", description: "Mahsulot yangilandi" })
      } else {
        // Create new
        const { data, error } = await supabase
          .from("products")
          .insert(productData)
          .select("*, category:categories(*)")
          .single()

        if (error) throw error

        setProducts((prev) => [data, ...prev])
        toast({ title: "Muvaffaqiyatli", description: "Yangi mahsulot qo'shildi" })
      }

      setDialogOpen(false)
    } catch (error) {
      console.error("Save error:", error)
      toast({
        title: "Xatolik",
        description: "Ma'lumotni saqlashda xatolik yuz berdi",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedProduct) return

    setLoading(true)
    const supabase = createClient()

    try {
      const { error } = await supabase.from("products").delete().eq("id", selectedProduct.id)

      if (error) throw error

      setProducts((prev) => prev.filter((p) => p.id !== selectedProduct.id))
      toast({ title: "Muvaffaqiyatli", description: "Mahsulot o'chirildi" })
      setDeleteDialogOpen(false)
      setSelectedProduct(null)
    } catch (error) {
      console.error("Delete error:", error)
      toast({
        title: "Xatolik",
        description: "O'chirishda xatolik yuz berdi",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === "all" || product.category_id === categoryFilter
    return matchesSearch && matchesCategory
  })

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
              item.href === "/admin/products"
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
    <div className="min-h-screen bg-muted/30 dark:bg-slate-950">
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SheetTitle className="sr-only">Admin Menu</SheetTitle>
          <Sidebar />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Mobile Header */}
        <div className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-card px-4 lg:hidden">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <span className="font-serif font-bold">Mahsulotlar</span>
        </div>

        <main className="p-4 lg:p-8">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-serif text-2xl font-bold text-foreground lg:text-3xl">Mahsulotlar</h1>
              <p className="text-muted-foreground">Barcha mahsulotlarni boshqaring</p>
            </div>
            <Button onClick={openCreateDialog} className="gap-2">
              <Plus className="h-4 w-4" />
              Yangi mahsulot
            </Button>
          </div>

          {/* Filters */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row">
            <Input
              placeholder="Qidiruv..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-xs"
            />
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Kategoriya" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Barcha kategoriyalar</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Products Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.length === 0 ? (
              <div className="col-span-full py-16 text-center">
                <Package className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">Mahsulotlar topilmadi</p>
              </div>
            ) : (
              filteredProducts.map((product) => (
                <Card key={product.id} className="overflow-hidden">
                  <div className="relative aspect-square bg-muted">
                    <Image
                      src={product.image_url || "/placeholder.svg?height=200&width=200&query=food"}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                    {!product.is_available && (
                      <div className="absolute inset-0 flex items-center justify-center bg-foreground/50">
                        <Badge variant="secondary">Mavjud emas</Badge>
                      </div>
                    )}
                    {product.is_featured && <Badge className="absolute top-2 left-2 bg-primary">Tavsiya</Badge>}
                  </div>
                  <CardContent className="p-4">
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-medium line-clamp-1">{product.name}</h3>
                        <p className="text-sm text-muted-foreground">{product.category?.name}</p>
                      </div>
                      <span className="font-bold text-primary">{formatPrice(product.price)}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 bg-transparent"
                        onClick={() => openEditDialog(product)}
                      >
                        <Edit className="mr-1 h-3 w-3" />
                        Tahrir
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-destructive hover:bg-destructive hover:text-destructive-foreground bg-transparent"
                        onClick={() => {
                          setSelectedProduct(product)
                          setDeleteDialogOpen(true)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </main>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedProduct ? "Mahsulotni tahrirlash" : "Yangi mahsulot"}</DialogTitle>
            <DialogDescription>
              {selectedProduct ? "Mahsulot ma'lumotlarini o'zgartiring" : "Yangi mahsulot qo'shing"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nomi *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    name: e.target.value,
                    slug: generateSlug(e.target.value),
                  })
                }}
                placeholder="Mahsulot nomi"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="mahsulot-nomi"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Tavsif</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Mahsulot haqida qisqacha..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="price">Narx (so'm) *</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Kategoriya *</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(v) => setFormData({ ...formData, category_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tanlang" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="image_url">Rasm URL</Label>
              <Input
                id="image_url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="preparation_time">Tayyorlash vaqti (daq)</Label>
                <Input
                  id="preparation_time"
                  type="number"
                  value={formData.preparation_time}
                  onChange={(e) => setFormData({ ...formData, preparation_time: Number(e.target.value) })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="calories">Kaloriya</Label>
                <Input
                  id="calories"
                  type="number"
                  value={formData.calories}
                  onChange={(e) => setFormData({ ...formData, calories: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <Label htmlFor="is_available">Mavjud</Label>
                <p className="text-sm text-muted-foreground">Mahsulot sotuvda</p>
              </div>
              <Switch
                id="is_available"
                checked={formData.is_available}
                onCheckedChange={(checked) => setFormData({ ...formData, is_available: checked })}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <Label htmlFor="is_featured">Tavsiya etiladi</Label>
                <p className="text-sm text-muted-foreground">Bosh sahifada ko'rsatiladi</p>
              </div>
              <Switch
                id="is_featured"
                checked={formData.is_featured}
                onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Bekor qilish
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? "Saqlanmoqda..." : "Saqlash"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>O'chirishni tasdiqlang</DialogTitle>
            <DialogDescription>
              "{selectedProduct?.name}" mahsulotini o'chirmoqchimisiz? Bu amalni ortga qaytarib bo'lmaydi.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Bekor qilish
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={loading}>
              {loading ? "O'chirilmoqda..." : "O'chirish"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
