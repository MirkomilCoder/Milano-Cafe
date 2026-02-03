'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertCircle, Camera, Wifi, WifiOff, Volume2, VolumeX, Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Alert, AlertDescription } from '@/components/ui/alert'

const supabase = createClient()

interface CCTVCamera {
  id: string
  name: string
  location: string
  status: 'online' | 'offline'
  resolution: string
  streamUrl?: string
  lastSeen?: string
}

interface CCTVSystemProps {
  adminOnly?: boolean
}

export function CCTVSystem({ adminOnly = true }: CCTVSystemProps) {
  const [cameras, setCameras] = useState<CCTVCamera[]>([])
  const [selectedCamera, setSelectedCamera] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [audioEnabled, setAudioEnabled] = useState(false)
  const [recordingActive, setRecordingActive] = useState<Set<string>>(new Set())
  const supabase = createClient()

  // Initialize cameras and listen for real-time updates
  useEffect(() => {
    const initializeCameras = async () => {
      try {
        const { data, error } = await supabase
          .from('cctv_cameras')
          .select('*')
          .order('created_at', { ascending: true })

        if (error) throw error

        const formattedCameras = (data || []).map((camera: any) => ({
          id: camera.id,
          name: camera.name,
          location: camera.location,
          status: camera.is_online ? 'online' : 'offline',
          resolution: camera.resolution || '1080p',
          streamUrl: camera.stream_url,
          lastSeen: camera.last_seen,
        }))

        setCameras(formattedCameras)
        if (formattedCameras.length > 0) {
          setSelectedCamera(formattedCameras[0].id)
        }
      } catch (error) {
        console.error('[v0] Error loading cameras:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeCameras()

    // Subscribe to real-time updates
    const subscription = supabase
      .channel('cctv_updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'cctv_cameras' },
        (payload: any) => {
          const updatedCamera = {
            id: payload.new.id,
            name: payload.new.name,
            location: payload.new.location,
            status: payload.new.is_online ? 'online' : 'offline',
            resolution: payload.new.resolution || '1080p',
            streamUrl: payload.new.stream_url,
            lastSeen: payload.new.last_seen,
          }

          setCameras((prev) => {
            const index = prev.findIndex((c) => c.id === updatedCamera.id)
            if (index >= 0) {
              const updated = [...prev]
              updated[index] = updatedCamera
              return updated
            }
            return [...prev, updatedCamera]
          })
        },
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const toggleRecording = useCallback(async (cameraId: string) => {
    try {
      const newRecording = new Set(recordingActive)
      if (newRecording.has(cameraId)) {
        newRecording.delete(cameraId)
      } else {
        newRecording.add(cameraId)
      }
      setRecordingActive(newRecording)

      // Save recording status to database
      await supabase.from('cctv_recordings').insert({
        camera_id: cameraId,
        started_at: new Date(),
        is_active: !recordingActive.has(cameraId),
      })
    } catch (error) {
      console.error('[v0] Error toggling recording:', error)
    }
  }, [recordingActive])

  const getSelectedCamera = () => cameras.find((c) => c.id === selectedCamera)

  if (isLoading) {
    return (
      <div className="w-full h-96 flex items-center justify-center bg-muted rounded-lg">
        <div className="text-center">
          <Camera className="w-8 h-8 mx-auto mb-2 text-muted-foreground animate-pulse" />
          <p className="text-muted-foreground">Loading CCTV System...</p>
        </div>
      </div>
    )
  }

  const selectedCameraData = getSelectedCamera()

  return (
    <div className="w-full space-y-4">
      {/* Main Camera Feed */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-primary" />
              <div>
                <CardTitle className="text-lg">{selectedCameraData?.name || 'Select Camera'}</CardTitle>
                <p className="text-sm text-muted-foreground">{selectedCameraData?.location}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={selectedCameraData?.status === 'online' ? 'default' : 'destructive'}>
                {selectedCameraData?.status === 'online' ? (
                  <>
                    <Wifi className="w-3 h-3 mr-1" /> Online
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3 h-3 mr-1" /> Offline
                  </>
                )}
              </Badge>
              <Badge variant="outline">{selectedCameraData?.resolution}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="aspect-video w-full bg-black rounded-lg flex items-center justify-center relative overflow-hidden">
            {selectedCameraData?.status === 'online' ? (
              <div className="w-full h-full bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
                <div className="relative w-full h-full">
                  {/* Camera feed placeholder - in production, use actual video stream */}
                  <div className="w-full h-full bg-black opacity-80" />
                  <div className="absolute top-4 left-4 bg-red-500 px-3 py-1 rounded text-white text-xs font-bold animate-pulse">
                    LIVE
                  </div>
                  <div className="absolute bottom-4 right-4 text-white text-xs bg-black/50 px-2 py-1 rounded">
                    {new Date().toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                <AlertCircle className="w-12 h-12 mx-auto mb-2" />
                <p>Camera Offline</p>
              </div>
            )}
          </div>

          {/* Camera Controls */}
          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleRecording(selectedCameraData?.id || '')}
              disabled={!selectedCameraData || selectedCameraData.status === 'offline'}
              className={recordingActive.has(selectedCameraData?.id || '') ? 'bg-red-100 border-red-300' : ''}
            >
              <div
                className={`w-2 h-2 rounded-full mr-2 ${recordingActive.has(selectedCameraData?.id || '') ? 'bg-red-500' : 'bg-gray-400'}`}
              />
              {recordingActive.has(selectedCameraData?.id || '') ? 'Recording' : 'Record'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAudioEnabled(!audioEnabled)}
              disabled={!selectedCameraData || selectedCameraData.status === 'offline'}
            >
              {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </Button>
          </div>

          {selectedCameraData?.lastSeen && (
            <p className="text-xs text-muted-foreground mt-2">Last seen: {new Date(selectedCameraData.lastSeen).toLocaleString()}</p>
          )}
        </CardContent>
      </Card>

      {/* Camera List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Available Cameras ({cameras.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
            {cameras.map((camera) => (
              <button
                key={camera.id}
                onClick={() => setSelectedCamera(camera.id)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  selectedCamera === camera.id
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-start justify-between mb-1">
                  <span className="text-xs font-semibold truncate">{camera.name}</span>
                  <Badge
                    size="sm"
                    variant={camera.status === 'online' ? 'default' : 'destructive'}
                    className="w-fit"
                  >
                    {camera.status === 'online' ? <Wifi className="w-2 h-2" /> : <WifiOff className="w-2 h-2" />}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground truncate">{camera.location}</p>
              </button>
            ))}
          </div>

          {cameras.length === 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>No cameras configured. Contact administrator to add cameras.</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
