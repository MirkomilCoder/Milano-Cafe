"use client"

import type React from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart-context"
import { useToast } from "@/hooks/use-toast"
import type { Product } from "@/lib/types"

interface AddToCartButtonProps {
  product: Product
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
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
    <Button
      onClick={handleAddToCart}
      disabled={!product.is_available}
      className="w-full gap-2 transition-all duration-300 text-xs sm:text-sm py-1.5 sm:py-2"
      suppressHydrationWarning
    >
      <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
      <span className="hidden sm:inline">Savatga qo'shish</span>
      <span className="sm:hidden">Qo'sh</span>
    </Button>
  )
}
