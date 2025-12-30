"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Clock, Flame, Minus, Plus, ShoppingBag } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { ProductCard } from "@/components/product-card"
import { useCart } from "@/lib/cart-context"
import { formatPrice } from "@/lib/format"
import { useToast } from "@/hooks/use-toast"
import type { Product } from "@/lib/types"

interface ProductDetailsProps {
  product: Product
  relatedProducts: Product[]
}

export function ProductDetails({ product, relatedProducts }: ProductDetailsProps) {
  const [quantity, setQuantity] = useState(1)
  const [notes, setNotes] = useState("")
  const { addItem } = useCart()
  const { toast } = useToast()

  const handleAddToCart = () => {
    addItem(product, quantity, notes)
    toast({
      title: "Savatga qo'shildi",
      description: `${product.name} (${quantity} dona) savatga qo'shildi`,
    })
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <div className="mb-8">
        <Link
          href="/menu"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Menu ga qaytish
        </Link>
      </div>

      {/* Product Details */}
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted">
          <Image
            src={product.image_url || "/placeholder.svg?height=600&width=600&query=coffee"}
            alt={product.name}
            fill
            className="object-cover"
            priority
          />
          {product.is_featured && <Badge className="absolute top-4 left-4 bg-primary">Tavsiya etiladi</Badge>}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          {product.category && (
            <Link
              href={`/menu?category=${product.category.slug}`}
              className="mb-2 text-sm text-primary hover:underline"
            >
              {product.category.name}
            </Link>
          )}

          <h1 className="mb-4 font-serif text-3xl font-bold text-foreground lg:text-4xl">{product.name}</h1>

          <p className="mb-6 text-lg text-muted-foreground">{product.description}</p>

          {/* Meta info */}
          <div className="mb-6 flex flex-wrap gap-4">
            <div className="flex items-center gap-2 rounded-full bg-muted px-4 py-2">
              <Clock className="h-4 w-4 text-primary" />
              <span className="text-sm">{product.preparation_time} daqiqa</span>
            </div>
            {product.calories && (
              <div className="flex items-center gap-2 rounded-full bg-muted px-4 py-2">
                <Flame className="h-4 w-4 text-primary" />
                <span className="text-sm">{product.calories} kkal</span>
              </div>
            )}
          </div>

          {/* Price */}
          <div className="mb-6">
            <span className="font-serif text-3xl font-bold text-primary" suppressHydrationWarning>{formatPrice(product.price)}</span>
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium">Qo'shimcha izoh (ixtiyoriy)</label>
            <Textarea
              placeholder="Masalan: shakar kamroq, muz ko'proq..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Quantity & Add to Cart */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center rounded-lg border border-border">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-12 text-center font-medium">{quantity}</span>
              <Button variant="ghost" size="icon" onClick={() => setQuantity(quantity + 1)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <Button onClick={handleAddToCart} disabled={!product.is_available} className="flex-1 gap-2" size="lg">
              <ShoppingBag className="h-5 w-5" />
              <span suppressHydrationWarning>Savatga qo'shish — {formatPrice(product.price * quantity)}</span>
            </Button>
          </div>

          {!product.is_available && (
            <p className="mt-4 text-center text-sm text-destructive">Bu mahsulot hozirda mavjud emas</p>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-16 lg:mt-24">
          <h2 className="mb-8 font-serif text-2xl font-bold text-foreground">O'xshash mahsulotlar</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
