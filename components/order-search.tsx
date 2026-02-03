"use client"

import { useState, useCallback } from "react"
import { Search, AlertCircle, CheckCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { formatPrice, formatDate } from "@/lib/format"
import { useToast } from "@/hooks/use-toast"
import type { Order } from "@/lib/types"

interface OrderSearchProps {
  onOrderSelect?: (order: Order) => void
}

export function OrderSearch({ onOrderSelect }: OrderSearchProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Order[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const { toast } = useToast()

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      const supabase = createClient()

      // Search by order ID, customer name, or phone
      const { data: orders, error } = await supabase
        .from("orders")
        .select(`
          *,
          order_items (
            *,
            product:products (name, image_url)
          )
        `)
        .or(
          `id.ilike.%${searchQuery}%,customer_name.ilike.%${searchQuery}%,phone.ilike.%${searchQuery}%`
        )
        .eq("deleted_at", null)
        .order("created_at", { ascending: false })
        .limit(10)

      if (error) {
        toast({
          title: "Xatolik",
          description: "Buyurtmalarni qidira olmadik",
          variant: "destructive",
        })
        return
      }

      setSearchResults(orders || [])

      if (orders && orders.length === 0) {
        toast({
          title: "Natija topilmadi",
          description: "Bunday buyurtma topilmadi",
        })
      }
    } finally {
      setIsSearching(false)
    }
  }, [searchQuery, toast])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Buyurtma ID, mijoz nomi yoki telefon..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isSearching}
        />
        <Button onClick={handleSearch} disabled={isSearching} className="whitespace-nowrap">
          <Search className="h-4 w-4 mr-2" />
          {isSearching ? "Izlanmoqda..." : "Izlash"}
        </Button>
      </div>

      {searchResults.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            {searchResults.length} buyurtma topildi
          </p>
          {searchResults.map((order) => (
            <Card
              key={order.id}
              className="p-4 cursor-pointer hover:bg-muted transition-colors"
              onClick={() => {
                onOrderSelect?.(order)
                setSearchQuery("")
                setSearchResults([])
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-mono font-semibold">#{order.id.slice(0, 8).toUpperCase()}</p>
                      <p className="text-sm text-muted-foreground">{order.customer_name}</p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatPrice(order.total_amount)}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(order.created_at)}</p>
                </div>
                <div className="ml-4">
                  {order.status === "completed" ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <Badge>{order.status}</Badge>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {searchQuery && !isSearching && searchResults.length === 0 && (
        <div className="p-4 border rounded-lg bg-muted/30 flex gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Buyurtma topilmadi</p>
            <p className="text-sm text-muted-foreground">
              "{searchQuery}" bo'yicha buyurtma topilmadi. Izohni tekshiring va qayta urinib ko'ring.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
