import { notFound } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProductDetails } from "./product-details"
import { createClient } from "@/lib/supabase/server"
import type { Metadata } from "next"

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()

  const { data: product } = await supabase.from("products").select("*").eq("slug", slug).single()

  if (!product) {
    return {
      title: "Mahsulot topilmadi | Milano Kafe",
    }
  }

  return {
    title: `${product.name} | Milano Kafe`,
    description: product.description,
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: product } = await supabase
    .from("products")
    .select("*, category:categories(*)")
    .eq("slug", slug)
    .single()

  if (!product) {
    notFound()
  }

  // Fetch related products
  const { data: relatedProducts } = await supabase
    .from("products")
    .select("*, category:categories(*)")
    .eq("category_id", product.category_id)
    .neq("id", product.id)
    .eq("is_available", true)
    .limit(4)

  return (
    <div className="min-h-screen dark:bg-slate-950">
      <Header />
      <main className="pb-16 pt-24 lg:pt-28">
        <ProductDetails product={product} relatedProducts={relatedProducts || []} />
      </main>
      <Footer />
    </div>
  )
}
