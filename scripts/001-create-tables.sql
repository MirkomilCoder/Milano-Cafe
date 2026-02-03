-- Kafe Marketplace Database Schema

-- Categories jadvali (Qahva, Shirinliklar, Nonushta va h.k.)
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products jadvali (Menu elementlari)
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  is_available BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  preparation_time INTEGER DEFAULT 10, -- daqiqada
  calories INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders jadvali
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, confirmed, preparing, ready, completed, cancelled
  total_amount DECIMAL(10, 2) NOT NULL,
  delivery_type TEXT NOT NULL DEFAULT 'pickup', -- pickup, delivery
  delivery_address TEXT,
  notes TEXT,
  phone TEXT,
  customer_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order Items jadvali
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contact Messages jadvali
CREATE TABLE contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews jadvali
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Settings jadvali (Kafe sozlamalari)
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Categories - hamma ko'rishi mumkin
CREATE POLICY "Categories are viewable by everyone" ON categories FOR SELECT USING (true);
CREATE POLICY "Categories are insertable by admins" ON categories FOR INSERT WITH CHECK (
  (SELECT (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean) = true
);
CREATE POLICY "Categories are updatable by admins" ON categories FOR UPDATE USING (
  (SELECT (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean) = true
);
CREATE POLICY "Categories are deletable by admins" ON categories FOR DELETE USING (
  (SELECT (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean) = true
);

-- Products - hamma ko'rishi mumkin
CREATE POLICY "Products are viewable by everyone" ON products FOR SELECT USING (true);
CREATE POLICY "Products are insertable by admins" ON products FOR INSERT WITH CHECK (
  (SELECT (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean) = true
);
CREATE POLICY "Products are updatable by admins" ON products FOR UPDATE USING (
  (SELECT (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean) = true
);
CREATE POLICY "Products are deletable by admins" ON products FOR DELETE USING (
  (SELECT (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean) = true
);

-- Orders - foydalanuvchi faqat o'z buyurtmalarini ko'radi, admin hammasini
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (
  auth.uid() = user_id OR 
  (SELECT (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean) = true
);
CREATE POLICY "Users can create orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can update orders" ON orders FOR UPDATE USING (
  (SELECT (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean) = true
);

-- Order Items
CREATE POLICY "Users can view own order items" ON order_items FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND (orders.user_id = auth.uid() OR 
    (SELECT (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean) = true)
  )
);
CREATE POLICY "Users can insert order items" ON order_items FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
  )
);

-- Contact Messages
CREATE POLICY "Anyone can insert contact messages" ON contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view contact messages" ON contact_messages FOR SELECT USING (
  (SELECT (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean) = true
);
CREATE POLICY "Admins can update contact messages" ON contact_messages FOR UPDATE USING (
  (SELECT (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean) = true
);

-- Reviews
CREATE POLICY "Reviews are viewable by everyone" ON reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reviews" ON reviews FOR DELETE USING (auth.uid() = user_id);

-- Settings
CREATE POLICY "Settings are viewable by everyone" ON settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage settings" ON settings FOR ALL USING (
  (SELECT (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean) = true
);
