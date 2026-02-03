import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import type { Category } from "@/lib/types"

export const metadata = {
  title: "Kategoriyalar | Milano Kafe - Zaamin, Jizzakh",
  description: "Milano Kafening barcha taom va ichimlik kategoriyalari. Premium kafe va restoran tanlama.",
}

export default async function CategoriesPage() {
  const supabase = await createClient()

  const { data: categories } = await supabase.from("categories").select("*").order("name")

  return (
    <div className="min-h-screen dark:bg-slate-950">
      <Header />
      <main className="pb-16 pt-24 lg:pt-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h1 className="mb-4 font-serif text-4xl font-bold text-foreground">Milano Kafe - Kategoriyalar</h1>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Milano Kafe ning turli xil mazali taomlar va ichimliklar kategoriyasi. O'zingizga yoqqanini tanlang. Zaamin tumanidagi premium restoran tanlama.
            </p>
          </div>

          {categories && categories.length > 0 ? (
            <div className="grid gap-[3px] grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {(categories as Category[]).map((category) => (
                <Link key={category.id} href={`/menu?category=${category.slug}`}>
                  <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg">
                    <div className="relative aspect-[4/3]">
                      <Image
                        src={category.image_url || "/placeholder.svg?height=300&width=400&query=food"}
                        alt={category.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <h2 className="mb-1 font-serif text-2xl font-bold text-primary-foreground">{category.name}</h2>
                        <p className="text-sm text-primary-foreground/80 line-clamp-2">{category.description}</p>
                      </div>
                    </div>
                    <CardContent className="flex items-center justify-between p-4">
                      <span className="text-sm text-muted-foreground">Ko'rish</span>
                      <ArrowRight className="h-4 w-4 text-primary transition-transform group-hover:translate-x-1" />
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center">
              <p className="text-muted-foreground">Hozircha kategoriyalar mavjud emas</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
