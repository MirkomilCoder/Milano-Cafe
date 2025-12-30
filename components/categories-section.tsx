import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import type { Category } from "@/lib/types"

export async function CategoriesSection() {
  const supabase = await createClient()

  const { data: categories } = await supabase.from("categories").select("*").limit(6)

  if (!categories || categories.length === 0) {
    return null
  }

  return (
    <section className="py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <h2 className="mb-4 font-serif text-3xl font-bold text-foreground sm:text-4xl">Kategoriyalar</h2>
            <p className="max-w-2xl text-muted-foreground">Turli xil mazali taomlar va ichimliklar kategoriyasi</p>
          </div>
          <Link
            href="/categories"
            className="hidden items-center gap-1 text-sm font-medium text-primary hover:underline sm:flex"
          >
            Barchasini ko'rish
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(categories as Category[]).map((category, index) => (
            <Link
              key={category.id}
              href={`/menu?category=${category.slug}`}
              className={`group relative overflow-hidden rounded-2xl ${
                index === 0 ? "sm:col-span-2 sm:row-span-2" : ""
              }`}
            >
              <div className={`relative ${index === 0 ? "aspect-square sm:aspect-[2/1]" : "aspect-[4/3]"}`}>
                <Image
                  src={category.image_url || "/placeholder.svg?height=300&width=400&query=food"}
                  alt={category.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="mb-1 font-serif text-xl font-bold text-primary-foreground sm:text-2xl">
                    {category.name}
                  </h3>
                  <p className="text-sm text-primary-foreground/80 line-clamp-2">{category.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <Link
          href="/categories"
          className="mt-6 flex items-center justify-center gap-1 text-sm font-medium text-primary hover:underline sm:hidden"
        >
          Barchasini ko'rish
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  )
}
