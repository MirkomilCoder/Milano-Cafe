import Image from "next/image"
import Link from "next/link"
import { Clock, Flame } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "@/lib/format"
import { AddToCartButton } from "./add-to-cart-button"
import type { Product } from "@/lib/types"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {

  return (
    <Link href={`/product/${product.slug}`}>
      <Card className="group h-full overflow-hidden border-border/50 transition-all duration-300 hover:border-primary/30 hover:shadow-lg flex flex-col">
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
        </div>
        <CardContent className="p-3 sm:p-4 flex flex-col flex-grow">
          <div className="mb-2 flex items-start justify-between gap-1 sm:gap-2">
            <h3 className="font-serif text-sm sm:text-lg font-semibold text-foreground line-clamp-2 flex-grow">{product.name}</h3>
            <span className="shrink-0 font-bold text-primary whitespace-nowrap text-xs sm:text-base">{formatPrice(product.price)}</span>
          </div>
          <p className="mb-2 sm:mb-3 text-xs sm:text-sm text-muted-foreground line-clamp-2 flex-grow">{product.description}</p>
          <div className="flex items-center gap-2 sm:gap-4 text-xs text-muted-foreground mb-3 sm:mb-4">
            <div className="flex items-center gap-0.5 sm:gap-1">
              <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              <span>{product.preparation_time}daq</span>
            </div>
            {product.calories && (
              <div className="flex items-center gap-0.5 sm:gap-1">
                <Flame className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                <span>{product.calories}kkal</span>
              </div>
            )}
          </div>
          <AddToCartButton product={product} />
        </CardContent>
      </Card>
    </Link>
  )
}
