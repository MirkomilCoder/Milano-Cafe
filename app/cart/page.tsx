"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/lib/cart-context"
import { formatPrice } from "@/lib/format"

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice, clearCart } = useCart()

  const deliveryFee = 15000
  const minOrderAmount = 50000
  const canCheckout = totalPrice >= minOrderAmount

  return (
    <div className="min-h-screen dark:bg-slate-950">
      <Header />
      <main className="pb-16 pt-24 lg:pt-28">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="font-serif text-3xl font-bold text-foreground">Savat</h1>
              <p className="text-muted-foreground">{items.length} ta mahsulot</p>
            </div>
            {items.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearCart}>
                <Trash2 className="mr-2 h-4 w-4" />
                Tozalash
              </Button>
            )}
          </div>

          {items.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                  <ShoppingBag className="h-10 w-10 text-muted-foreground" />
                </div>
                <h2 className="mb-2 font-serif text-xl font-semibold">Savatingiz bo'sh</h2>
                <p className="mb-6 text-center text-muted-foreground">
                  Menu dan o'zingizga yoqqan mahsulotlarni qo'shing
                </p>
                <Link href="/menu">
                  <Button className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Menu ga o'tish
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-8 lg:grid-cols-3">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <Card>
                  <CardContent className="divide-y divide-border p-0">
                    {items.map((item) => (
                      <div key={item.product.id} className="flex gap-4 p-4">
                        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-muted">
                          <Image
                            src={item.product.image_url || "/placeholder.svg?height=96&width=96&query=coffee"}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex flex-1 flex-col">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="font-medium text-foreground">{item.product.name}</h3>
                              <p className="text-sm text-muted-foreground" suppressHydrationWarning>{formatPrice(item.product.price)}</p>
                              {item.notes && <p className="mt-1 text-xs text-muted-foreground">Izoh: {item.notes}</p>}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeItem(item.product.id)}
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="mt-auto flex items-center justify-between">
                            <div className="flex items-center rounded-lg border border-border">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-8 text-center text-sm">{item.quantity}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                            <span className="font-semibold text-foreground" suppressHydrationWarning>
                              {formatPrice(item.product.price * item.quantity)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Order Summary */}
              <div>
                <Card className="sticky top-24">
                  <CardContent className="p-6">
                    <h2 className="mb-4 font-serif text-lg font-semibold">Buyurtma xulosasi</h2>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Jami</span>
                        <span suppressHydrationWarning>{formatPrice(totalPrice)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Yetkazib berish</span>
                        <span suppressHydrationWarning>{formatPrice(deliveryFee)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-base font-semibold">
                        <span>Umumiy</span>
                        <span className="text-primary" suppressHydrationWarning>{formatPrice(totalPrice + deliveryFee)}</span>
                      </div>
                    </div>

                    {!canCheckout && (
                      <p className="mt-4 text-center text-sm text-amber-600">
                        Minimal buyurtma: {formatPrice(minOrderAmount)}
                      </p>
                    )}

                    <Link href={canCheckout ? "/checkout" : "#"}>
                      <Button className="mt-6 w-full" size="lg" disabled={!canCheckout}>
                        Buyurtma berish
                      </Button>
                    </Link>

                    <Link href="/menu">
                      <Button variant="outline" className="mt-2 w-full bg-transparent">
                        Xarid qilishni davom ettirish
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
