"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Check, MapPin, Store, Navigation } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/lib/cart-context"
import { formatPrice } from "@/lib/format"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import type { User } from "@supabase/supabase-js"

export default function CheckoutPage() {
  const router = useRouter()
  const { items, totalPrice, clearCart } = useCart()
  const { toast } = useToast()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [deliveryType, setDeliveryType] = useState<"pickup" | "delivery">("pickup")

  const [formData, setFormData] = useState({
    customerName: "",
    phone: "",
    address: "",
    notes: "",
  })
  const [geoLoading, setGeoLoading] = useState(false)

  const deliveryFee = deliveryType === "delivery" ? 15000 : 0
  const grandTotal = totalPrice + deliveryFee

  // GPS orqali manzilni aniqlash
  const handleGetLocation = async () => {
    setGeoLoading(true)
    try {
      if (!navigator.geolocation) {
        throw new Error("Geolocation brauzeringizda qo'llab-quvvatlanmaydi")
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          
          // Reverse geocoding - Google Maps API yoki Open Street Map
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            )
            const data = await response.json()
            
            const address = data.address ? 
              `${data.address.road ? data.address.road + ', ' : ''}${data.address.suburb || data.address.city || ''}, ${data.address.country}` 
              : `Kenglik: ${latitude.toFixed(4)}, Uzunlik: ${longitude.toFixed(4)}`
            
            setFormData((prev) => ({
              ...prev,
              address: address,
            }))

            toast({
              title: "Manzil aniqlandi",
              description: "GPS orqali manzil aniqlab olingan",
            })
          } catch (error) {
            // Agar reverse geocoding ishlamasa, koordinatalarni qo'ying
            setFormData((prev) => ({
              ...prev,
              address: `Kenglik: ${latitude.toFixed(6)}, Uzunlik: ${longitude.toFixed(6)}`,
            }))
            toast({
              title: "Koordinatalar aniqlandi",
              description: "Iltimos, to'liq manzilni kiriting",
            })
          }
        },
        (error) => {
          toast({
            title: "Xatolik",
            description: "Manzilni aniqlashda xatolik yuz berdi",
            variant: "destructive",
          })
        }
      )
    } finally {
      setGeoLoading(false)
    }
  }

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user?.user_metadata?.full_name) {
        setFormData((prev) => ({
          ...prev,
          customerName: user.user_metadata.full_name,
        }))
      }
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "Kirish kerak",
        description: "Buyurtma berish uchun tizimga kiring",
        variant: "destructive",
      })
      router.push("/auth/login")
      return
    }

    if (items.length === 0) {
      toast({
        title: "Savat bo'sh",
        description: "Avval mahsulotlarni savatga qo'shing",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()

      // Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          status: "pending",
          total_amount: grandTotal,
          delivery_type: deliveryType,
          delivery_address: deliveryType === "delivery" ? formData.address : null,
          notes: formData.notes || null,
          phone: formData.phone,
          customer_name: formData.customerName,
        })
        .select()
        .single()

      if (orderError) throw orderError

      // Create order items
      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.product.id,
        quantity: item.quantity,
        unit_price: item.product.price,
        total_price: item.product.price * item.quantity,
        notes: item.notes || null,
      }))

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems)

      if (itemsError) throw itemsError

      clearCart()

      toast({
        title: "Buyurtma qabul qilindi!",
        description: `Buyurtma raqami: #${order.id.slice(0, 8)}`,
      })

      router.push(`/order-success?id=${order.id}`)
    } catch (error) {
      console.error("Order error:", error)
      toast({
        title: "Xatolik yuz berdi",
        description: "Iltimos, qaytadan urinib ko'ring",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen dark:bg-slate-950">
        <Header />
        <main className="flex min-h-[60vh] items-center justify-center pb-16 pt-24">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6 text-center">
              <h2 className="mb-2 font-serif text-xl font-semibold">Savatingiz bo'sh</h2>
              <p className="mb-6 text-muted-foreground">Buyurtma berish uchun avval mahsulotlarni qo'shing</p>
              <Link href="/menu">
                <Button>Menu ga o'tish</Button>
              </Link>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen dark:bg-slate-950">
      <Header />
      <main className="pb-16 pt-24 lg:pt-28">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Link
              href="/cart"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Savatga qaytish
            </Link>
            <h1 className="mt-4 font-serif text-3xl font-bold text-foreground">Buyurtmani rasmiylashtirish</h1>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-8 lg:grid-cols-3">
              {/* Form */}
              <div className="space-y-6 lg:col-span-2">
                {/* Contact Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Aloqa ma'lumotlari</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label htmlFor="name">Ism</Label>
                        <Input
                          id="name"
                          value={formData.customerName}
                          onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Telefon</Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+998 77 183 99 99"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Delivery Type */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Yetkazib berish turi</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup
                      value={deliveryType}
                      onValueChange={(v) => setDeliveryType(v as "pickup" | "delivery")}
                      className="grid gap-4 sm:grid-cols-2"
                    >
                      <Label
                        htmlFor="pickup"
                        className={`flex cursor-pointer items-center gap-4 rounded-lg border-2 p-4 transition-colors ${
                          deliveryType === "pickup" ? "border-primary bg-primary/5" : "border-border"
                        }`}
                      >
                        <RadioGroupItem value="pickup" id="pickup" />
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                            <Store className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">Olib ketish</p>
                            <p className="text-sm text-muted-foreground">Bepul</p>
                          </div>
                        </div>
                      </Label>

                      <Label
                        htmlFor="delivery"
                        className={`flex cursor-pointer items-center gap-4 rounded-lg border-2 p-4 transition-colors ${
                          deliveryType === "delivery" ? "border-primary bg-primary/5" : "border-border"
                        }`}
                      >
                        <RadioGroupItem value="delivery" id="delivery" />
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                            <MapPin className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">Yetkazib berish</p>
                            <p className="text-sm text-muted-foreground" suppressHydrationWarning>{formatPrice(15000)}</p>
                          </div>
                        </div>
                      </Label>
                    </RadioGroup>

                    {deliveryType === "delivery" && (
                      <div className="mt-4 space-y-3">
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <Label htmlFor="address">Manzil</Label>
                            <Textarea
                              id="address"
                              placeholder="To'liq manzilni kiriting"
                              value={formData.address}
                              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                              required
                            />
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleGetLocation}
                          disabled={geoLoading}
                          className="w-full"
                        >
                          <Navigation className="mr-2 h-4 w-4" />
                          {geoLoading ? "Manzil aniqlanmoqda..." : "GPS orqali manzilni aniqlash"}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Notes */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Qo'shimcha izohlar</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder="Buyurtmaga qo'shimcha izohlar..."
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Order Summary */}
              <div>
                <Card className="sticky top-24">
                  <CardHeader>
                    <CardTitle className="text-lg">Buyurtma</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="max-h-64 space-y-3 overflow-y-auto">
                      {items.map((item) => (
                        <div key={item.product.id} className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            {item.product.name} x {item.quantity}
                          </span>
                          <span suppressHydrationWarning>{formatPrice(item.product.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>

                    <Separator />

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Jami</span>
                        <span suppressHydrationWarning>{formatPrice(totalPrice)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Yetkazib berish</span>
                        <span suppressHydrationWarning>{formatPrice(deliveryFee)}</span>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex justify-between font-semibold">
                      <span>Umumiy</span>
                      <span className="text-primary" suppressHydrationWarning>{formatPrice(grandTotal)}</span>
                    </div>

                    <Button type="submit" className="w-full gap-2" size="lg" disabled={loading}>
                      {loading ? (
                        "Yuborilmoqda..."
                      ) : (
                        <>
                          <Check className="h-4 w-4" />
                          Buyurtma berish
                        </>
                      )}
                    </Button>

                    {!user && (
                      <p className="text-center text-sm text-amber-600">
                        Buyurtma berish uchun{" "}
                        <Link href="/auth/login" className="underline">
                          tizimga kiring
                        </Link>
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  )
}
