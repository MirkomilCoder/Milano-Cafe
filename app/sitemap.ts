import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const revalidate = 3600 // Revalidate every hour

interface Product {
  slug: string
  updated_at: string
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://milano-kafe.uz'

async function getProducts(): Promise<Product[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('products')
      .select('slug, updated_at')
      .eq('is_available', true)

    if (error) {
      console.error('Error fetching products:', error)
      return []
    }
    return data || []
  } catch (error) {
    console.error('Error in getProducts:', error)
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts()

  const productUrls: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${BASE_URL}/product/${product.slug}`,
    lastModified: new Date(product.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1,
    },
    {
      url: `${BASE_URL}/menu`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/categories`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/cart`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/profile`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/checkout`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.5,
    },
    ...productUrls,
  ]
}
