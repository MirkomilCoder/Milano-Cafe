"use client"

import type React from "react"

import { useState } from "react"
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

const contactInfo = [
  {
    icon: MapPin,
    title: "Manzil",
    content: "Jizzakh viloyati, Zomin tumani, Chinor ostida",
  },
  {
    icon: Phone,
    title: "Telefon",
    content: "+998 77 183 99 99",
  },
  {
    icon: Mail,
    title: "Email",
    content: "info@milanokafe.uz",
  },
  {
    icon: Clock,
    title: "Ish vaqti",
    content: "Har kuni: 08:00 - 23:00",
  },
]

export default function ContactPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()

      const { error } = await supabase.from("contact_messages").insert({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        subject: formData.subject,
        message: formData.message,
      })

      if (error) throw error

      toast({
        title: "Xabar yuborildi!",
        description: "Tez orada siz bilan bog'lanamiz.",
      })

      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      })
    } catch (error) {
      console.error("Contact error:", error)
      toast({
        title: "Xatolik yuz berdi",
        description: "Iltimos, qaytadan urinib ko'ring",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen dark:bg-slate-950">
      <Header />
      <main className="pb-16 pt-24 lg:pt-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-12 text-center">
            <h1 className="mb-4 font-serif text-4xl font-bold text-foreground">Biz bilan bog'laning</h1>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Savollaringiz bormi? Bizga yozing yoki qo'ng'iroq qiling. Biz har doim yordam berishga tayyormiz.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Contact Info */}
            <div className="space-y-4">
              {contactInfo.map((item) => (
                <Card key={item.title}>
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <item.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.content}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Map */}
              <Card className="overflow-hidden">
                <div className="aspect-video bg-muted">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2996.0!2d69.2401!3d41.3111!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDHCsDE4JzQwLjAiTiA2OcKwMTQnMjQuNCJF!5e0!3m2!1sen!2s!4v1234567890"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </Card>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-6">
                  <h2 className="mb-6 font-serif text-xl font-semibold">Xabar yuborish</h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label htmlFor="name">Ismingiz</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label htmlFor="phone">Telefon (ixtiyoriy)</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="subject">Mavzu</Label>
                        <Select
                          value={formData.subject}
                          onValueChange={(v) => setFormData({ ...formData, subject: v })}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Mavzuni tanlang" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">Umumiy savol</SelectItem>
                            <SelectItem value="order">Buyurtma haqida</SelectItem>
                            <SelectItem value="feedback">Fikr-mulohaza</SelectItem>
                            <SelectItem value="partnership">Hamkorlik</SelectItem>
                            <SelectItem value="other">Boshqa</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="message">Xabar</Label>
                      <Textarea
                        id="message"
                        rows={5}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        required
                      />
                    </div>

                    <Button type="submit" className="gap-2" disabled={loading}>
                      {loading ? (
                        "Yuborilmoqda..."
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Yuborish
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
