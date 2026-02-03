import { createClient } from "@/lib/supabase/server"
import { ProductCard } from "./product-card"
import type { Product } from "@/lib/types"

export async function FeaturedProducts() {
  const supabase = await createClient()

  const { data: products } = await supabase
    .from("products")
    .select("*, category:categories(*)")
    .eq("is_featured", true)
    .eq("is_available", true)
    .limit(8)

  if (!products || products.length === 0) {
    return null
  }

  // Serialize products to remove nested objects that might cause hydration mismatches
  const serializedProducts = products.map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: product.price,
    image_url: product.image_url,
    category_id: product.category_id,
    is_available: product.is_available,
    is_featured: product.is_featured,
    preparation_time: product.preparation_time,
    calories: product.calories,
    created_at: product.created_at,
    updated_at: product.updated_at,
  }))

  return (
    <section className="bg-muted/30 py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="mb-4 font-serif text-3xl font-bold text-foreground sm:text-4xl">
            Tavsiya etilgan mahsulotlar
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Bizning eng mashhur va sevimli taomlarimiz. Har biri maxsus tayyorlanadi.
          </p>
        </div>

        <div className="grid gap-[3px] sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {serializedProducts.map((product) => (
            <ProductCard key={product.id} product={product as Product} />
          ))}
        </div>
      </div>
    </section>
  )
}
