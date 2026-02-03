'use client'

import { useState } from 'react'
import { Restaurant3DViewer } from '@/components/restaurant-3d-viewer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Info } from 'lucide-react'
import Link from 'next/link'

export default function RestaurantViewer3DPage() {
  const [showInfo, setShowInfo] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back Home
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Badge>3D Tour</Badge>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowInfo(!showInfo)}
            >
              <Info className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main 3D Viewer */}
          <div className="lg:col-span-2 rounded-lg overflow-hidden border border-border bg-black">
            <Restaurant3DViewer />
          </div>

          {/* Info Panel */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Milano Café Interior</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Welcome to Milano</h3>
                  <p className="text-sm text-foreground/70">
                    Explore our beautifully designed Italian café with this 3D virtual tour. Walk through our dining area, see the kitchen, and get a feel for our warm, welcoming atmosphere.
                  </p>
                </div>

                <div className="border-t border-border pt-4">
                  <h3 className="font-semibold mb-2">Controls</h3>
                  <ul className="text-xs text-foreground/70 space-y-1">
                    <li>• <strong>Rotate:</strong> Click & drag</li>
                    <li>• <strong>Zoom:</strong> Scroll wheel</li>
                    <li>• <strong>Pan:</strong> Right-click & drag</li>
                  </ul>
                </div>

                <div className="border-t border-border pt-4">
                  <h3 className="font-semibold mb-2">Restaurant Hours</h3>
                  <div className="text-xs text-foreground/70 space-y-1">
                    <p>Monday - Friday: 7:00 AM - 10:00 PM</p>
                    <p>Saturday: 8:00 AM - 11:00 PM</p>
                    <p>Sunday: 8:00 AM - 9:00 PM</p>
                  </div>
                </div>

                <Button className="w-full" size="lg">
                  Reserve a Table
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">About Milano</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground/70">
                  Milano Oilaviy Restoran is your destination for authentic Italian cuisine, prepared with love and served with warmth. Our family-run restaurant celebrates the rich culinary traditions of Italy in a welcoming environment.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
