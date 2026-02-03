'use client'

import { useState } from 'react'
import { CCTVSystem } from '@/components/cctv-system'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function CamerasPage() {
  const [showAddCamera, setShowAddCamera] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Restaurant Cameras</h1>
          <p className="text-muted-foreground mt-1">Monitor your restaurant with real-time CCTV feeds</p>
        </div>
        <Button onClick={() => setShowAddCamera(!showAddCamera)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Camera
        </Button>
      </div>

      <Alert className="bg-blue-50 border-blue-200">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          All cameras are monitored and recorded for security purposes. Make sure to comply with local privacy regulations.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Cameras</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground mt-1">All online</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Uptime</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">99.8%</div>
            <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Storage Used</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">847 GB</div>
            <p className="text-xs text-muted-foreground mt-1">of 1 TB</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <Badge variant="outline" className="mt-1 text-xs">1 critical</Badge>
          </CardContent>
        </Card>
      </div>

      {/* CCTV System Component */}
      <CCTVSystem />
    </div>
  )
}
