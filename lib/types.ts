export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  created_at: string
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  image_url: string | null
  category_id: string | null
  is_available: boolean
  is_featured: boolean
  preparation_time: number
  calories: number | null
  created_at: string
  updated_at: string
  category?: Category
}

export interface CartItem {
  product: Product
  quantity: number
  notes?: string
}

export interface Order {
  id: string
  user_id: string
  status: "pending" | "confirmed" | "preparing" | "ready" | "completed" | "cancelled"
  total_amount: number
  delivery_type: "pickup" | "delivery"
  delivery_address: string | null
  notes: string | null
  phone: string | null
  customer_name: string | null
  created_at: string
  updated_at: string
  status_changed_at?: string
  scheduled_deletion?: string | null
  deleted_at?: string | null
  auto_transition_at?: string | null
  order_items?: OrderItem[]
}

export interface OrderAuditLog {
  id: string
  order_id: string
  user_id: string | null
  action: "created" | "status_changed" | "deleted" | "auto_transitioned"
  old_status?: string | null
  new_status?: string | null
  reason?: string | null
  metadata?: Record<string, any> | null
  created_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  unit_price: number
  total_price: number
  notes: string | null
  created_at: string
  product?: Product
}

export interface ContactMessage {
  id: string
  name: string
  email: string
  phone: string | null
  subject: string
  message: string
  is_read: boolean
  created_at: string
}

export interface Review {
  id: string
  user_id: string
  product_id: string
  rating: number
  comment: string | null
  created_at: string
}

export interface Setting {
  id: string
  key: string
  value: string
  updated_at: string
}

export interface AnalyticsEvent {
  id: string
  event_type: 'page_view' | 'click' | 'search' | 'login' | 'order'
  user_id: string | null
  user_agent: string | null
  ip_address: string | null
  page_url: string | null
  search_query: string | null
  device_type: 'mobile' | 'tablet' | 'desktop' | null
  referrer: string | null
  duration_seconds: number | null
  metadata: Record<string, any> | null
  created_at: string
}

export interface AnalyticsSummary {
  id: string
  date: string
  total_page_views: number
  total_clicks: number
  total_searches: number
  total_logins: number
  total_orders: number
  mobile_visits: number
  tablet_visits: number
  desktop_visits: number
  unique_visitors: number
  top_search_queries: string[] | null
  top_pages: string[] | null
  created_at: string
  updated_at: string
}

export interface AnalyticsStats {
  totalVisitors: number
  totalPageViews: number
  totalClicks: number
  totalSearches: number
  totalLogins: number
  totalOrders: number
  deviceBreakdown: {
    mobile: number
    tablet: number
    desktop: number
  }
  topSearches: Array<{ query: string; count: number }>
  topPages: Array<{ url: string; views: number }>
  visitorsTrend: Array<{ date: string; count: number }>
}
