import type React from "react"
import type { Metadata, Viewport } from "next"
import { Playfair_Display, Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { CartProvider } from "@/lib/cart-context"
import { Toaster } from "@/components/ui/sonner"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "Milano Kafe | Zominning eng yaxshi restoran va kafesi",
  description:
    "Milano Kafe - Jizzakh viloyati, Zomin tumanidagi premium kofe restoran. Eng sifatli  taomlalar. Online buyurtma bering, yetkazib beramiz! Chinor ostida joylashgan yangi ammo juda mashur kafe.",
  keywords: ["milano kafe", "zomin kafe", "kafe milano", "milano restoran", "zomin restoran", "premium kafe", "coffee zomin", "jizzakh kafe", "zomin jizzakh", "milano zomin kafe", "best cafe zomin", "restoran zomin", "kafe jizzakh"],
  verification: {
    google: "1-VQMdQdjoaUdP3rZSZo9p2n0WdfDql7PttQwEi4bQs",
  },
  icons: {
    icon: [
      {
        url: "/favicon.svg",
        type: "image/svg+xml",
      },
      {
        url: "/milano-kafe-icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export const viewport: Viewport = {
  themeColor: "#6F4E37",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="uz" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Restaurant",
              name: "Milano Kafe",
              image: "/logo.png",
              description: "Milano Kafe - Zaamin, Jizzakh viloyatidagi premium kofe va restoran",
              address: {
                "@type": "PostalAddress",
                streetAddress: "Chinor ostida",
                addressLocality: "Zomin",
                addressRegion: "Jizzakh",
                postalCode: "130200",
                addressCountry: "UZ"
              },
              telephone: "+998901234567",
              url: "https://milano-cafe.uz",
              openingHoursSpecification: {
                "@type": "OpeningHoursSpecification",
                dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
                opens: "08:00",
                closes: "23:00"
              },
              sameAs: [
                "https://www.facebook.com/milanokafe",
                "https://www.instagram.com/milanokafe"
              ]
            })
          }}
        />
      </head>
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <CartProvider>
            {children}
            <Toaster position="top-center" richColors />
          </CartProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
