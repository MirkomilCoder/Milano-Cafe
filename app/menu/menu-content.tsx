"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Search, SlidersHorizontal, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ProductCard } from "@/components/product-card"
import { createClient } from "@/lib/supabase/client"
import type { Category, Product } from "@/lib/types"

export function MenuContent() {
  const searchParams = useSearchParams()
  const initialCategory = searchParams.get("category") || ""

  const [mounted, setMounted] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState(initialCategory)
  const [sortBy, setSortBy] = useState("name")

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const supabase = createClient()

      // Fetch categories
      const { data: categoriesData } = await supabase.from("categories").select("*").order("name")

      if (categoriesData) {
        setCategories(categoriesData)
      }

      // Fetch products
      let query = supabase.from("products").select("*, category:categories(*)").eq("is_available", true)

      if (selectedCategory) {
        const category = categoriesData?.find((c) => c.slug === selectedCategory)
        if (category) {
          query = query.eq("category_id", category.id)
        }
      }

      if (search) {
        query = query.ilike("name", `%${search}%`)
      }

      if (sortBy === "price_asc") {
        query = query.order("price", { ascending: true })
      } else if (sortBy === "price_desc") {
        query = query.order("price", { ascending: false })
      } else {
        query = query.order("name")
      }

      const { data: productsData } = await query

      if (productsData) {
        setProducts(productsData)
      }

      setLoading(false)
    }

    fetchData()
  }, [selectedCategory, search, sortBy])

  const clearFilters = () => {
    setSearch("")
    setSelectedCategory("")
    setSortBy("name")
  }

  const hasActiveFilters = search || selectedCategory || sortBy !== "name"

  return (
    <div>
      {/* Filters */}
      <div className="mb-8 space-y-3 md:space-y-4">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Qidiruv..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 w-full"
          />
        </div>

        <div className="flex gap-2 w-full">
          {/* Desktop Filters */}
          <div className="hidden gap-2 md:flex md:flex-1">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="flex-1 md:w-[200px]">
                <SelectValue placeholder="Kategoriya" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Barcha kategoriyalar</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.slug}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="flex-1 md:w-[200px]">
                <SelectValue placeholder="Saralash" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Nomi bo'yicha</SelectItem>
                <SelectItem value="price_asc">Narx (arzon)</SelectItem>
                <SelectItem value="price_desc">Narx (qimmat)</SelectItem>
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="mr-1 h-4 w-4" />
                Tozalash
              </Button>
            )}
          </div>

          {/* Mobile Filters */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="outline" size="icon" className="h-10 w-10">
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-auto max-h-[80vh]">
              <SheetHeader>
                <SheetTitle className="text-xl">Filterlar</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-4 pb-20">
                <div>
                  <label className="mb-2 block text-sm font-medium">Kategoriya</label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Kategoriya tanlang" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Barcha kategoriyalar</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.slug}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Saralash</label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Saralash turi" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Nomi bo'yicha</SelectItem>
                      <SelectItem value="price_asc">Narx (arzon)</SelectItem>
                      <SelectItem value="price_desc">Narx (qimmat)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {hasActiveFilters && (
                  <Button variant="outline" className="w-full" onClick={clearFilters}>
                    <X className="mr-2 h-4 w-4" />
                    Filterlarni tozalash
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="mb-6 flex flex-wrap gap-2">
          {selectedCategory && (
            <Badge variant="secondary" className="gap-1">
              {categories.find((c) => c.slug === selectedCategory)?.name}
              <button onClick={() => setSelectedCategory("")}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {search && (
            <Badge variant="secondary" className="gap-1">
              Qidiruv: {search}
              <button onClick={() => setSearch("")}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}

      {/* Products Grid */}
      {loading ? (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse space-y-4">
              <div className="aspect-square rounded-xl bg-muted" />
              <div className="h-4 w-3/4 rounded bg-muted" />
              <div className="h-4 w-1/2 rounded bg-muted" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-lg text-muted-foreground">Hech qanday mahsulot topilmadi</p>
          {hasActiveFilters && (
            <Button variant="link" onClick={clearFilters} className="mt-2">
              Filterlarni tozalash
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
