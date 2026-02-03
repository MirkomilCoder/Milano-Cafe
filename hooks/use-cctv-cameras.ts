'use client';

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/types'

type Camera = Database['public']['Tables']['cctv_cameras']['Row']

export function useCctvCameras() {
  const [cameras, setCameras] = useState<Camera[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    // Initial fetch
    const fetchCameras = async () => {
      try {
        const { data, error } = await supabase
          .from('cctv_cameras')
          .select('*')
          .order('created_at', { ascending: false })
        
        if (error) throw error
        setCameras(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch cameras')
      } finally {
        setLoading(false)
      }
    }

    fetchCameras()

    // Subscribe to real-time changes
    const channel = supabase
      .channel('cctv_cameras_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cctv_cameras'
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setCameras((prev) => [payload.new as Camera, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setCameras((prev) =>
              prev.map((c) => (c.id === payload.new.id ? (payload.new as Camera) : c))
            )
          } else if (payload.eventType === 'DELETE') {
            setCameras((prev) => prev.filter((c) => c.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  return { cameras, loading, error }
}
