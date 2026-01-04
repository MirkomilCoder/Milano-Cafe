# Analytics & Status Setup Guide

Bu dokument sayt statistikasi (Analytics) va Status bo'limi sozlanishini tasvirlaydi.

## Features

Admin dashboard-da quyidagi statistika ko'rsatiladi:
- 👥 **Jami Tashrif** - Saytga kirgan foydalanuvchilar
- 👁️ **Sahifa Ko'rishlar** - Jami sahifa ko'rishlar
- 🖱️ **Click-lar** - Foydalanuvchilarga kliklashlar
- 🔍 **Qidiruvlar** - Foydalanuvchilarga qidiruvlar
- 📱 **Mobil/Desktop/Tablet** - Qurilma bo'yicha statistika
- 🔐 **Kirish** - Foydalanuvchilarga kirish
- 📦 **Buyurtmalar** - Jami buyurtmalar

## Database Tables

### 1. `analytics_events` - Har bir event-ni yozib qolish

```sql
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY,
  event_type TEXT, -- 'page_view', 'click', 'search', 'login', 'order'
  user_id UUID,
  user_agent TEXT, -- Qurilma ma'lumoti
  device_type TEXT, -- 'mobile', 'tablet', 'desktop'
  page_url TEXT,
  search_query TEXT,
  metadata JSONB,
  created_at TIMESTAMP
);
```

### 2. `analytics_summary` - Kunlik statistika

```sql
CREATE TABLE analytics_summary (
  id UUID PRIMARY KEY,
  date DATE,
  total_page_views INTEGER,
  total_clicks INTEGER,
  total_searches INTEGER,
  total_logins INTEGER,
  total_orders INTEGER,
  mobile_visits INTEGER,
  tablet_visits INTEGER,
  desktop_visits INTEGER,
  unique_visitors INTEGER,
  top_search_queries TEXT[],
  top_pages TEXT[]
);
```

## Setup Steps

### 1. Database Tables Yaratish

Supabase SQL Editor-da quyidagini bajarish kerak:

```bash
# Supabase console-ga kirish
# SQL Editor-ni ochish
# Quyidagi SQL-ni bajarish:
```

File: `scripts/002-create-analytics-table.sql` ni Supabase SQL Editor-da ishga tushiring.

### 2. Environment Variables

`.env.local` faylida quyidagini qo'shish:

```env
# Supabase (mavjud)
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

### 3. Next.js Routes

Quyidagi API endpointlar avtomatik yaratiladi:

- `POST /api/admin/analytics/stats` - Event yozish
- `GET /api/admin/analytics/stats?days=30` - Statistika olish

## Usage

### Frontend-da Events Tracking

```typescript
import { useAnalytics } from "@/hooks/useAnalytics"

export function MyComponent() {
  const { trackClick, trackSearch, trackOrder } = useAnalytics()

  // Click tracking
  const handleClick = () => {
    trackClick("button-id", { metadata: "value" })
  }

  // Search tracking
  const handleSearch = (query: string) => {
    trackSearch(query)
  }

  // Order tracking
  const handleOrder = (orderId: string) => {
    trackOrder(orderId, 100000)
  }

  return (
    <>
      <button onClick={handleClick}>Click me</button>
    </>
  )
}
```

### Admin Dashboard-da Statistics

Admin dashboard-da avtomatik ko'rsatiladi:

1. **Main Dashboard** - Kichik statistics card
2. **Full Status Page** - `/admin/status` - Batafsil statistika

## Components

### `AdminStatusCard`

Dashboard-da qo'llaniladi. Props:

```typescript
interface AdminStatusCardProps {
  stats?: AnalyticsStats
  loading?: boolean
  error?: string
}
```

### Status Page (`/admin/status`)

- Quyidagi filter bilan: 7 kun, 30 kun, 90 kun
- Top searches
- Top pages
- Visitor trends
- Device breakdown

## Types

`lib/types.ts` dagi barcha types:

```typescript
// Analytics Events
export interface AnalyticsEvent {
  event_type: 'page_view' | 'click' | 'search' | 'login' | 'order'
  user_id?: string
  page_url?: string
  device_type?: 'mobile' | 'tablet' | 'desktop'
  // ...
}

// Analytics Statistics
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
```

## Integration Points

1. **Supabase Auth** - User login tracking uchun
2. **Order Creation** - Order tracking uchun
3. **Page Navigation** - Page view tracking uchun
4. **Search Functionality** - Search tracking uchun

## Maintenance

### Regular Cleanup

Ko'p vaqt davomida analytics events-lar juda ko'payadi. Ular uchun cleanup cron job sozlanishi kerak:

```typescript
// vercel.json-da:
{
  "crons": [
    {
      "path": "/api/admin/analytics/cleanup",
      "schedule": "0 2 * * *" // Har kuni 2:00 AM
    }
  ]
}
```

### Query Performance

Katta analytics tables uchun indekslar mavjud:

```sql
CREATE INDEX idx_analytics_event_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_device_type ON analytics_events(device_type);
CREATE INDEX idx_analytics_created_at ON analytics_events(created_at);
```

## Troubleshooting

### Events yuklanmaydi

1. API endpoint-ni tekshirish: `GET /api/admin/analytics/stats`
2. Supabase RLS policies-ni tekshirish
3. Browser console-da errors-ni qaraash

### Statistics ko'rsatilmaydi

1. Database tables-ni tekshirish: `SELECT * FROM analytics_events;`
2. API response-ni tekshirish: Network tab-da
3. Admin authentication-ni tekshirish

## Future Enhancements

- [ ] Real-time charts (Recharts integration)
- [ ] Custom date range selection
- [ ] Export analytics to CSV
- [ ] Custom email reports
- [ ] Geographic analytics
- [ ] Heatmap tracking
- [ ] Performance metrics
