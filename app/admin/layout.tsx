"use client"

import { useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { sendOrderNotification, sendMessageNotification, requestNotificationPermission } from "@/lib/web-notifications"

interface AdminLayoutProps {
  children: React.ReactNode
}

// Global notification sound player
let globalAudioRef: HTMLAudioElement | null = null
let globalTimeoutRef: NodeJS.Timeout | null = null
let isSoundMuted = false

export function setGlobalSoundMuted(muted: boolean) {
  isSoundMuted = muted
  if (muted && globalAudioRef) {
    globalAudioRef.pause()
    globalAudioRef = null
  }
}

export function isGlobalSoundMuted(): boolean {
  return isSoundMuted
}

const playGlobalSound = () => {
  if (isSoundMuted) {
    console.log("🔇 Sound is muted")
    return
  }
  
  try {
    // Stop previous sound
    if (globalAudioRef) {
      globalAudioRef.pause()
      globalAudioRef.currentTime = 0
    }

    const audio = new Audio("/ring.mp3")
    audio.volume = 0.8
    globalAudioRef = audio

    audio.play().catch(() => {
      console.log("MP3 playback failed, using fallback...")
      playFallbackSound()
    })
  } catch (error) {
    console.error("Audio error:", error)
    playFallbackSound()
  }
}

const playFallbackSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const now = audioContext.currentTime

    // Create a 15-second notification sound
    // Repeating pattern of tones
    const pattern = [
      { freq: 800, delay: 0, duration: 0.3 },
      { freq: 1000, delay: 0.4, duration: 0.3 },
      { freq: 1200, delay: 0.8, duration: 0.3 },
      { freq: 1000, delay: 1.2, duration: 0.3 },
    ]

    // Repeat pattern 3 times (4 seconds per cycle = 12 seconds total)
    // Plus single tones for remaining time
    for (let cycle = 0; cycle < 3; cycle++) {
      pattern.forEach(({ freq, delay, duration }) => {
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)

        const startTime = now + cycle * 4 + delay
        oscillator.frequency.setValueAtTime(freq, startTime)
        gainNode.gain.setValueAtTime(0.5, startTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration)

        oscillator.start(startTime)
        oscillator.stop(startTime + duration)
      })
    }

    // Add final 3 seconds of continuous tones
    for (let i = 0; i < 3; i++) {
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      const startTime = now + 12 + i * 1
      oscillator.frequency.setValueAtTime(800 + i * 200, startTime)
      gainNode.gain.setValueAtTime(0.5, startTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.8)

      oscillator.start(startTime)
      oscillator.stop(startTime + 0.8)
    }
  } catch (error) {
    console.error("Fallback audio error:", error)
  }
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const hasSetupRef = useRef(false)

  useEffect(() => {
    if (hasSetupRef.current) return
    hasSetupRef.current = true

    console.log("🔧 AdminLayout: Setting up global notification system...")

    // Request browser notification permission
    requestNotificationPermission()

    const supabase = createClient()
    let ordersChannel: any = null
    let messagesChannel: any = null

    const setupGlobalNotifications = async () => {
      // Monitor orders for real-time notifications
      ordersChannel = supabase
        .channel(`admin-orders-global-${Date.now()}`, {
          config: { broadcast: { self: true } },
        })
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "orders",
          },
          (payload: any) => {
            console.log("🔔 NEW ORDER DETECTED - Playing sound globally!")
            const newOrder = payload.new
            
            // Send browser push notification
            sendOrderNotification({
              id: newOrder.id,
              customer_name: newOrder.customer_name,
              total_amount: newOrder.total_amount,
            })
            
            playGlobalSound()
          }
        )
        .subscribe((status) => {
          console.log("📡 Global orders channel status:", status)
        })

      // Monitor messages for real-time notifications
      messagesChannel = supabase
        .channel(`admin-messages-global-${Date.now()}`, {
          config: { broadcast: { self: true } },
        })
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "contact_messages",
          },
          (payload: any) => {
            console.log("🔔 NEW MESSAGE DETECTED - Playing sound globally!")
            const newMessage = payload.new
            
            // Send browser push notification
            sendMessageNotification({
              id: newMessage.id,
              name: newMessage.name,
              subject: newMessage.subject,
            })
            
            playGlobalSound()
          }
        )
        .subscribe((status) => {
          console.log("📡 Global messages channel status:", status)
        })
    }

    setupGlobalNotifications()

    return () => {
      console.log("🔌 AdminLayout cleanup: Removing global notification channels")
      if (ordersChannel) {
        supabase.removeChannel(ordersChannel)
      }
      if (messagesChannel) {
        supabase.removeChannel(messagesChannel)
      }
      if (globalAudioRef) {
        globalAudioRef.pause()
        globalAudioRef = null
      }
      if (globalTimeoutRef) {
        clearTimeout(globalTimeoutRef)
      }
    }
  }, [])

  return <>{children}</>
}
