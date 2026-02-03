-- Analytics jadvali (Saytdan foydalanish statistikasi)
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL, -- 'page_view', 'click', 'search', 'login', 'order'
  user_id UUID,
  user_agent TEXT, -- Qurilma ma'lumoti
  ip_address TEXT,
  page_url TEXT,
  search_query TEXT,
  device_type TEXT, -- 'mobile', 'tablet', 'desktop'
  referrer TEXT,
  duration_seconds INTEGER,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics qulayligi uchun indeks
CREATE INDEX idx_analytics_event_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_device_type ON analytics_events(device_type);
CREATE INDEX idx_analytics_created_at ON analytics_events(created_at);
CREATE INDEX idx_analytics_user_id ON analytics_events(user_id);

-- Analytics Summary jadvali (kunlik statistika)
CREATE TABLE analytics_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  total_page_views INTEGER DEFAULT 0,
  total_clicks INTEGER DEFAULT 0,
  total_searches INTEGER DEFAULT 0,
  total_logins INTEGER DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  mobile_visits INTEGER DEFAULT 0,
  tablet_visits INTEGER DEFAULT 0,
  desktop_visits INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  top_search_queries TEXT[], -- ARRAY of search queries
  top_pages TEXT[], -- ARRAY of page URLs
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_summary ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Admins can view analytics events" ON analytics_events FOR SELECT USING (
  (SELECT (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean) = true
);

CREATE POLICY "Anyone can insert analytics events" ON analytics_events FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view analytics summary" ON analytics_summary FOR SELECT USING (
  (SELECT (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean) = true
);
