// Web Push Notification Service
export async function requestNotificationPermission() {
  if (!("Notification" in window)) {
    console.log("Bu browser push notifications qo'llamaydi")
    return false
  }

  if (Notification.permission === "granted") {
    return true
  }

  if (Notification.permission !== "denied") {
    try {
      const permission = await Notification.requestPermission()
      return permission === "granted"
    } catch (error) {
      console.error("Notification permission error:", error)
      return false
    }
  }

  return false
}

export function sendBrowserNotification(title: string, options?: NotificationOptions) {
  if (Notification.permission !== "granted") {
    return
  }

  try {
    // Service Worker orqali notification yuborish
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification(title, {
          icon: "/icon.svg",
          badge: "/icon-dark-32x32.png",
          tag: "order-notification",
          requireInteraction: true,
          ...options,
        })
      })
    } else {
      // Fallback
      new Notification(title, options)
    }
  } catch (error) {
    console.error("Notification error:", error)
  }
}

export function sendOrderNotification(order: {
  id: string
  customer_name: string
  total_amount: number
}) {
  sendBrowserNotification("🔔 Yangi Buyurtma!", {
    body: `${order.customer_name} - ${order.total_amount.toLocaleString("uz-UZ")} so'm`,
    tag: `order-${order.id}`,
    badge: "/icon-dark-32x32.png",
  } as NotificationOptions)
}

export function sendMessageNotification(message: {
  id: string
  name: string
  subject: string
}) {
  sendBrowserNotification("📧 Yangi Xabar!", {
    body: `${message.name} - ${message.subject}`,
    tag: `message-${message.id}`,
    badge: "/icon-dark-32x32.png",
  } as NotificationOptions)
}
