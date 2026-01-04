export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      analytics_events: {
        Row: {
          id: string
          event_type: string
          user_id: string | null
          user_agent: string | null
          ip_address: string | null
          page_url: string | null
          search_query: string | null
          device_type: string | null
          referrer: string | null
          duration_seconds: number | null
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          event_type: string
          user_id?: string | null
          user_agent?: string | null
          ip_address?: string | null
          page_url?: string | null
          search_query?: string | null
          device_type?: string | null
          referrer?: string | null
          duration_seconds?: number | null
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          event_type?: string
          user_id?: string | null
          user_agent?: string | null
          ip_address?: string | null
          page_url?: string | null
          search_query?: string | null
          device_type?: string | null
          referrer?: string | null
          duration_seconds?: number | null
          metadata?: Json | null
          created_at?: string
        }
      }
      analytics_summary: {
        Row: {
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
        Insert: {
          id?: string
          date: string
          total_page_views?: number
          total_clicks?: number
          total_searches?: number
          total_logins?: number
          total_orders?: number
          mobile_visits?: number
          tablet_visits?: number
          desktop_visits?: number
          unique_visitors?: number
          top_search_queries?: string[] | null
          top_pages?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          date?: string
          total_page_views?: number
          total_clicks?: number
          total_searches?: number
          total_logins?: number
          total_orders?: number
          mobile_visits?: number
          tablet_visits?: number
          desktop_visits?: number
          unique_visitors?: number
          top_search_queries?: string[] | null
          top_pages?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
    CompositeTypes: {}
  }
}
