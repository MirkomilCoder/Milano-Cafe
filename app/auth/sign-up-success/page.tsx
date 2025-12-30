"use client"

import Link from "next/link"
import { CheckCircle, Coffee, Mail, ExternalLink, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

export default function SignUpSuccessPage() {
  const [email, setEmail] = useState<string>("")
  const [isVerified, setIsVerified] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    const getEmail = async () => {
      try {
        const { data } = await supabase.auth.getUser()
        if (data.user?.email) {
          setEmail(data.user.email)
          setIsVerified(data.user.email_confirmed_at !== null)
        }
      } catch (error) {
        console.error("Error fetching user:", error)
      } finally {
        setIsLoading(false)
      }
    }

    getEmail()
  }, [])

  const handleResendEmail = async () => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOtp({ email })
      if (error) {
        toast({
          title: "Xatolik",
          description: "Email yuborishda xatolik yuz berdi",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Yuborildi!",
          description: `Tasdiqlash xabari ${email} ga yuborildi`,
        })
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenEmail = () => {
    const emailProvider = email.split("@")[1]
    let mailURL = ""
    
    switch (emailProvider) {
      case "gmail.com":
        mailURL = "https://gmail.com"
        break
      case "outlook.com":
      case "hotmail.com":
        mailURL = "https://outlook.live.com"
        break
      case "yahoo.com":
        mailURL = "https://mail.yahoo.com"
        break
      default:
        mailURL = `https://mail.google.com`
    }
    window.open(mailURL, "_blank")
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-slate-900 to-slate-950 p-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-amber-600 to-amber-700">
              <Coffee className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="block font-serif text-2xl font-bold text-amber-400">MILANO</span>
              <span className="block text-xs tracking-widest text-amber-600">KAFE</span>
            </div>
          </Link>
        </div>

        <Card className="border-amber-900/20 bg-white shadow-lg">
          <CardContent className="pt-8 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-100 to-green-50">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>

            <h1 className="mb-3 font-serif text-2xl font-bold text-slate-900">
              Xush Kelibsiz MILANO-ga! 🎉
            </h1>

            <p className="mb-6 text-sm text-slate-600">
              Siz muvaffaqiyatli ro'yxatdan o'tdingiz. Emailingizni tasdiqlash uchun quyidagi link-ni bosing.
            </p>

            {!isLoading && email && (
              <div className={`mb-6 rounded-lg p-4 ${
                isVerified 
                  ? "border-l-4 border-green-500 bg-green-50" 
                  : "border-l-4 border-amber-500 bg-amber-50"
              }`}>
                <div className="flex items-center gap-2">
                  {isVerified ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-amber-600" />
                  )}
                  <div className="text-left">
                    <p className={`text-sm font-semibold ${
                      isVerified ? "text-green-900" : "text-amber-900"
                    }`}>
                      {isVerified ? "✓ Tasdiqlangan" : "Tasdiqlash kutilmoqda"}
                    </p>
                    <p className="text-xs text-slate-600">{email}</p>
                  </div>
                </div>
              </div>
            )}

            {!isVerified && (
              <div className="space-y-3">
                <Button
                  onClick={handleOpenEmail}
                  className="w-full gap-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800"
                  size="lg"
                >
                  <Mail className="h-5 w-5" />
                  Email-ni Ochish
                </Button>

                <Button
                  onClick={handleResendEmail}
                  disabled={isLoading}
                  variant="outline"
                  className="w-full border-amber-200 text-amber-700 hover:bg-amber-50"
                  size="sm"
                >
                  {isLoading ? "Yuborilmoqda..." : "Tasdiqlash Xabarini Qayta Yuborish"}
                </Button>
              </div>
            )}

            {isVerified && (
              <Link href="/auth/login" className="block">
                <Button className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800" size="lg">
                  Kirish Sahifasiga
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-xs text-slate-400">
          <p>© 2025 MILANO Kafe. Barcha huquqlar himoyalangan.</p>
        </div>
      </div>
    </div>
  )
}
