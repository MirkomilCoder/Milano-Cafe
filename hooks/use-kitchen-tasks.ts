'use client';

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/types'

type KitchenTask = Database['public']['Tables']['kitchen_tasks']['Row']

export function useKitchenTasks(status?: string) {
  const [tasks, setTasks] = useState<KitchenTask[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    // Initial fetch
    const fetchTasks = async () => {
      try {
        let query = supabase.from('kitchen_tasks').select('*')
        
        if (status) {
          query = query.eq('status', status)
        }
        
        const { data, error } = await query.order('created_at', { ascending: false })
        
        if (error) throw error
        setTasks(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch tasks')
      } finally {
        setLoading(false)
      }
    }

    fetchTasks()

    // Subscribe to real-time changes
    const channel = supabase
      .channel('kitchen_tasks_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'kitchen_tasks'
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setTasks((prev) => [payload.new as KitchenTask, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setTasks((prev) =>
              prev.map((t) => (t.id === payload.new.id ? (payload.new as KitchenTask) : t))
            )
          } else if (payload.eventType === 'DELETE') {
            setTasks((prev) => prev.filter((t) => t.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, status])

  const updateTask = async (id: string, updates: Partial<KitchenTask>) => {
    try {
      const { error } = await supabase
        .from('kitchen_tasks')
        .update(updates)
        .eq('id', id)
      
      if (error) throw error
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task')
    }
  }

  return { tasks, loading, error, updateTask }
}
