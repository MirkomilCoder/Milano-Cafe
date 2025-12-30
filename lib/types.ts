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
  order_items?: OrderItem[]
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
