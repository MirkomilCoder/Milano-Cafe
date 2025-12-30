"use client"

import type React from "react"

import Image from "next/image"
import Link from "next/link"
import { Clock, Flame, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/lib/cart-context"
import { formatPrice } from "@/lib/format"
import { useToast } from "@/hooks/use-toast"
import type { Product } from "@/lib/types"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart()
  const { toast } = useToast()

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addItem(product)
    toast({
      title: "Savatga qo'shildi",
      description: `${product.name} savatga qo'shildi`,
    })
  }

  return (
    <Link href={`/product/${product.slug}`}>
      <Card className="group overflow-hidden border-border/50 transition-all duration-300 hover:border-primary/30 hover:shadow-lg">
        <div className="relative aspect-square overflow-hidden bg-muted">
          <Image
            src={product.image_url || "/placeholder.svg?height=300&width=300&query=coffee"}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
          {product.is_featured && <Badge className="absolute top-3 left-3 bg-primary">Tavsiya etiladi</Badge>}
          {!product.is_available && (
            <div className="absolute inset-0 flex items-center justify-center bg-foreground/50">
              <Badge variant="secondary" className="text-lg">
                Mavjud emas
              </Badge>
            </div>
          )}
          <Button
            onClick={handleAddToCart}
            disabled={!product.is_available}
            size="icon"
            className="absolute bottom-3 right-3 h-10 w-10 rounded-full opacity-0 shadow-lg transition-all duration-300 group-hover:opacity-100"
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>
        <CardContent className="p-4">
          <div className="mb-2 flex items-start justify-between gap-2">
            <h3 className="font-serif text-lg font-semibold text-foreground line-clamp-1">{product.name}</h3>
            <span className="shrink-0 font-bold text-primary" suppressHydrationWarning>{formatPrice(product.price)}</span>
          </div>
          <p className="mb-3 text-sm text-muted-foreground line-clamp-2">{product.description}</p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              <span>{product.preparation_time} daq</span>
            </div>
            {product.calories && (
              <div className="flex items-center gap-1">
                <Flame className="h-3.5 w-3.5" />
                <span>{product.calories} kkal</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
