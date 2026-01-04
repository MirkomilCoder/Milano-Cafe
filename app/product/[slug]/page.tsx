import { notFound } from "next/navigation"
import Script from "next/script"
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

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://milano-kafe.uz"

  return {
    title: `${product.name} | Milano Kafe`,
    description: product.description || product.name,
    keywords: [product.name, "Milano Kafe", "kafe", "taom"],
    openGraph: {
      title: product.name,
      description: product.description || product.name,
      images: product.image_url ? [{ url: product.image_url, width: 800, height: 600 }] : [],
      url: `${baseUrl}/product/${product.slug}`,
      type: "website",
    },
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://milano-kafe.uz"

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

  // Product Schema for Google Search
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || product.name,
    image: product.image_url || `${baseUrl}/placeholder.jpg`,
    brand: {
      "@type": "Brand",
      name: "Milano Kafe",
    },
    offers: {
      "@type": "Offer",
      url: `${baseUrl}/product/${product.slug}`,
      priceCurrency: "UZS",
      price: product.price,
      availability: product.is_available
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "Milano Kafe",
      },
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.5",
      reviewCount: "150",
    },
  }

  // BreadcrumbList Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Bosh sahifa",
        item: baseUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Menu",
        item: `${baseUrl}/menu`,
      },
      product.category && {
        "@type": "ListItem",
        position: 3,
        name: product.category.name,
        item: `${baseUrl}/categories?category=${product.category.slug}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: product.name,
        item: `${baseUrl}/product/${product.slug}`,
      },
    ].filter(Boolean),
  }

  return (
    <>
      {/* Structured Data for Search Engines */}
      <Script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
        strategy="afterInteractive"
      />
      <Script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        strategy="afterInteractive"
      />

      <div className="min-h-screen dark:bg-slate-950">
        <Header />
        <main className="pb-16 pt-24 lg:pt-28">
          <ProductDetails product={product} relatedProducts={relatedProducts || []} />
        </main>
        <Footer />
      </div>
    </>
  )
}
