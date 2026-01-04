import { useEffect, useCallback } from "react"
import { usePathname, useSearchParams } from "next/navigation"

export function useAnalytics() {
    const pathname = usePathname()
    const searchParams = useSearchParams()

    // Track page view
    useEffect(() => {
        const trackPageView = async () => {
            try {
                await fetch("/api/admin/analytics/stats", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        event_type: "page_view",
                        page_url: pathname,
                    }),
                })
            } catch (error) {
                console.error("Failed to track page view:", error)
            }
        }

        trackPageView()
    }, [pathname])

    // Track clicks
    const trackClick = useCallback((elementId?: string, metadata?: any) => {
        fetch("/api/admin/analytics/stats", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                event_type: "click",
                page_url: pathname,
                metadata: {
                    element_id: elementId,
                    ...metadata,
                },
            }),
        }).catch((error) => console.error("Failed to track click:", error))
    }, [pathname])

    // Track search
    const trackSearch = useCallback((query: string, metadata?: any) => {
        fetch("/api/admin/analytics/stats", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                event_type: "search",
                search_query: query,
                page_url: pathname,
                metadata,
            }),
        }).catch((error) => console.error("Failed to track search:", error))
    }, [pathname])

    // Track login
    const trackLogin = useCallback((userId?: string) => {
        fetch("/api/admin/analytics/stats", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                event_type: "login",
                user_id: userId || null,
                page_url: pathname,
            }),
        }).catch((error) => console.error("Failed to track login:", error))
    }, [pathname])

    // Track order
    const trackOrder = useCallback((orderId: string, amount: number) => {
        fetch("/api/admin/analytics/stats", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                event_type: "order",
                page_url: pathname,
                metadata: {
                    order_id: orderId,
                    amount,
                },
            }),
        }).catch((error) => console.error("Failed to track order:", error))
    }, [pathname])

    return {
        trackClick,
        trackSearch,
        trackLogin,
        trackOrder,
    }
}
