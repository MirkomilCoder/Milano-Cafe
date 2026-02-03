'use client'

import { useState, useEffect } from 'react'
import { Product3DViewer } from '@/components/product-3d-viewer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  image_url?: string
}

export default function Product3DPage({ params }: { params: { slug: string } }) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        // This would typically fetch from Supabase
        // For now, we'll use mock data
        const mockProducts: Record<string, Product> = {
          espresso: {
            id: '1',
            name: 'Espresso',
            description: 'Rich and bold double shot of premium espresso',
            price: 2.50,
            category: 'coffee',
            image_url: '/milano-logo.jpg'
          },
          cappuccino: {
            id: '2',
            name: 'Cappuccino',
            description: 'Creamy cappuccino with steamed milk and foam',
            price: 4.50,
            category: 'coffee',
            image_url: '/milano-logo.jpg'
          },
          tiramisu: {
            id: '3',
            name: 'Tiramisu',
            description: 'Traditional Italian tiramisu with layers of mascarpone and espresso',
            price: 6.00,
            category: 'dessert',
            image_url: '/milano-logo.jpg'
          }
        }

        const selectedProduct = mockProducts[params.slug]
        if (!selectedProduct) {
          throw new Error('Product not found')
        }

        setProduct(selectedProduct)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load product')
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [params.slug])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse">Loading product...</div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <h1 className="text-2xl font-bold text-foreground">{error || 'Product not found'}</h1>
        <Link href="/menu">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Menu
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Link href="/menu" className="mb-4 inline-flex items-center">
          <Button variant="ghost">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Menu
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 3D Viewer */}
          <div className="rounded-lg overflow-hidden border border-border">
            <Product3DViewer />
          </div>

          {/* Product Details */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-3xl">{product.name}</CardTitle>
                  <CardDescription className="mt-2">{product.category}</CardDescription>
                </div>
                <Badge variant="secondary" className="text-lg px-3 py-1">
                  ${product.price.toFixed(2)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-foreground/80">{product.description}</p>

              <div className="space-y-4">
                <h3 className="font-semibold">Interact with the 3D Model</h3>
                <ul className="text-sm text-foreground/70 space-y-2">
                  <li>• <strong>Rotate:</strong> Click and drag to rotate the product</li>
                  <li>• <strong>Zoom:</strong> Scroll mouse wheel to zoom in/out</li>
                  <li>• <strong>Pan:</strong> Right-click and drag to pan the view</li>
                  <li>• <strong>Reset:</strong> Double-click to reset the view</li>
                </ul>
              </div>

              <Button size="lg" className="w-full bg-primary hover:bg-primary/90">
                Add to Cart
              </Button>

              <Button variant="outline" size="lg" className="w-full bg-transparent">
                Share 3D Model
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
