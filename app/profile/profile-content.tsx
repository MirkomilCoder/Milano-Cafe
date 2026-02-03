"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { LogOut, Package, UserIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { formatDate, formatPrice, getStatusColor, getStatusLabel } from "@/lib/format"
import { useUserPresence } from "@/hooks/use-user-presence"
import { useToast } from "@/hooks/use-toast"
import { deleteUserSession } from "@/app/auth/session-actions"
import type { Order } from "@/lib/types"
import type { User } from "@supabase/supabase-js"

interface ProfileContentProps {
  user: User
  orders: Order[]
}

export function ProfileContent({ user, orders }: ProfileContentProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [editingProfile, setEditingProfile] = useState(false)
  const [profileData, setProfileData] = useState({
    full_name: user.user_metadata?.full_name || "",
    phone: user.user_metadata?.phone || "",
    address: user.user_metadata?.address || "",
    location: user.user_metadata?.location || "",
  })
  
  // Track user presence
  useUserPresence()

  const handleLogout = async () => {
    setLoading(true)
    try {
      // Delete user session from database
      await deleteUserSession()
      
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push("/")
      router.refresh()
    } catch (error) {
      console.error("Logout error:", error)
      setLoading(false)
    }
  }

  const handleUpdateProfile = async () => {
    try {
      setLoading(true)
      const supabase = createClient()
      
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: profileData.full_name,
          phone: profileData.phone,
          address: profileData.address,
          location: profileData.location,
        }
      })

      if (error) {
        toast({
          title: "Xatolik",
          description: error.message,
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Muvaffaqiyatli",
        description: "Profil ma'lumotlari yangilandi",
      })
      setEditingProfile(false)
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Xatolik",
        description: "Profil yangilashda xatolik yuz berdi",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">Profilim</h1>
          <p className="text-muted-foreground">{user.email}</p>
        </div>
        <Button variant="outline" onClick={handleLogout} disabled={loading} className="gap-2 bg-transparent">
          <LogOut className="h-4 w-4" />
          Chiqish
        </Button>
      </div>

      <Tabs defaultValue="orders" className="space-y-6">
        <TabsList>
          <TabsTrigger value="orders" className="gap-2">
            <Package className="h-4 w-4" />
            Buyurtmalar
          </TabsTrigger>
          <TabsTrigger value="profile" className="gap-2">
            <UserIcon className="h-4 w-4" />
            Ma'lumotlar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-4">
          {orders.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Package className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <h2 className="mb-2 font-semibold">Buyurtmalar yo'q</h2>
                <p className="text-sm text-muted-foreground">Siz hali buyurtma bermagansiz</p>
              </CardContent>
            </Card>
          ) : (
            orders.map((order) => (
              <Card key={order.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle className="text-base">#{order.id.slice(0, 8).toUpperCase()}</CardTitle>
                    <p className="text-sm text-muted-foreground">{formatDate(order.created_at)}</p>
                  </div>
                  <Badge className={getStatusColor(order.status)}>{getStatusLabel(order.status)}</Badge>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {order.order_items?.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {item.product?.name} x {item.quantity}
                        </span>
                        <span suppressHydrationWarning>{formatPrice(item.total_price)}</span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between border-t pt-2 font-semibold">
                      <span>Jami</span>
                      <span className="text-primary" suppressHydrationWarning>{formatPrice(order.total_amount)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="profile">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Profil ma'lumotlari</CardTitle>
              <Button
                variant="outline"
                onClick={() => setEditingProfile(!editingProfile)}
                disabled={loading}
              >
                {editingProfile ? "Bekor qilish" : "Tahrirlash"}
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {editingProfile ? (
                <>
                  <div>
                    <Label htmlFor="full_name" className="text-sm font-medium">Ism</Label>
                    <Input
                      id="full_name"
                      value={profileData.full_name}
                      onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                      placeholder="To'liq ismingiz"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-sm font-medium">Telefon</Label>
                    <Input
                      id="phone"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      placeholder="+998 90 123 45 67"
                    />
                  </div>
                  <div>
                    <Label htmlFor="address" className="text-sm font-medium">Manzil</Label>
                    <Input
                      id="address"
                      value={profileData.address}
                      onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                      placeholder="Manzil"
                    />
                  </div>
                  <div>
                    <Label htmlFor="location" className="text-sm font-medium">Joylashuvi</Label>
                    <Input
                      id="location"
                      value={profileData.location}
                      onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                      placeholder="Shaxar, tuman"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <p className="text-foreground">{user.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Ro'yxatdan o'tgan sana</label>
                    <p className="text-foreground">{formatDate(user.created_at)}</p>
                  </div>
                  <Button onClick={handleUpdateProfile} disabled={loading} className="w-full">
                    {loading ? "Saqlanmoqda..." : "Saqlash"}
                  </Button>
                </>
              ) : (
                <>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Ism</label>
                    <p className="text-foreground">{profileData.full_name || "Ko'rsatilmagan"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Telefon</label>
                    <p className="text-foreground">{profileData.phone || "Ko'rsatilmagan"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Manzil</label>
                    <p className="text-foreground">{profileData.address || "Ko'rsatilmagan"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Joylashuvi</label>
                    <p className="text-foreground">{profileData.location || "Ko'rsatilmagan"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <p className="text-foreground">{user.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Ro'yxatdan o'tgan sana</label>
                    <p className="text-foreground">{formatDate(user.created_at)}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
