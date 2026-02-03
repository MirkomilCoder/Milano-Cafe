-- Seed kategoriyalar
INSERT INTO categories (name, slug, description, image_url) VALUES
('Qahva', 'qahva', 'Turli xil kofe ichimliklar', '/placeholder.svg?height=200&width=200'),
('Choy', 'choy', 'Issiq va sovuq choylar', '/placeholder.svg?height=200&width=200'),
('Shirinliklar', 'shirinliklar', 'Mazali tortlar va pechenyalar', '/placeholder.svg?height=200&width=200'),
('Nonushta', 'nonushta', 'Ertalabki ovqatlanish', '/placeholder.svg?height=200&width=200'),
('Salatlar', 'salatlar', 'Yangi salatlar', '/placeholder.svg?height=200&width=200'),
('Sendvichlar', 'sendvichlar', 'Mazali sendvichlar', '/placeholder.svg?height=200&width=200');

-- Seed mahsulotlar
INSERT INTO products (name, slug, description, price, image_url, category_id, is_featured, preparation_time, calories) VALUES
-- Qahva
('Espresso', 'espresso', 'Klassik italyan espressosi', 15000, '/placeholder.svg?height=300&width=300', (SELECT id FROM categories WHERE slug = 'qahva'), true, 3, 5),
('Americano', 'americano', 'Espresso va issiq suv', 18000, '/placeholder.svg?height=300&width=300', (SELECT id FROM categories WHERE slug = 'qahva'), true, 4, 10),
('Cappuccino', 'cappuccino', 'Espresso, ko''pirtirilgan sut va sut ko''pigi', 25000, '/placeholder.svg?height=300&width=300', (SELECT id FROM categories WHERE slug = 'qahva'), true, 5, 120),
('Milano Qahvasi', 'milano-qahvasi', 'Espresso va ko''p miqdorda sut', 28000, '/placeholder.svg?height=300&width=300', (SELECT id FROM categories WHERE slug = 'qahva'), true, 5, 150),
('Mocha', 'mocha', 'Espresso, shokolad va sut', 32000, '/placeholder.svg?height=300&width=300', (SELECT id FROM categories WHERE slug = 'qahva'), false, 6, 280),
('Flat White', 'flat-white', 'Yuqori sifatli espresso va sut', 30000, '/placeholder.svg?height=300&width=300', (SELECT id FROM categories WHERE slug = 'qahva'), false, 5, 110),
('Iced Coffee', 'iced-coffee', 'Sovutilgan kofe ichimlik', 22000, '/placeholder.svg?height=300&width=300', (SELECT id FROM categories WHERE slug = 'qahva'), true, 4, 80),
('Cold Brew', 'cold-brew', '24 soat davomida tayyorlangan sovuq kofe', 28000, '/placeholder.svg?height=300&width=300', (SELECT id FROM categories WHERE slug = 'qahva'), false, 2, 5),

-- Choy
('Yashil choy', 'yashil-choy', 'An''anaviy yashil choy', 12000, '/placeholder.svg?height=300&width=300', (SELECT id FROM categories WHERE slug = 'choy'), false, 5, 2),
('Qora choy', 'qora-choy', 'Klassik qora choy', 10000, '/placeholder.svg?height=300&width=300', (SELECT id FROM categories WHERE slug = 'choy'), false, 5, 2),
('Earl Grey', 'earl-grey', 'Bergamot xushbo''y choy', 15000, '/placeholder.svg?height=300&width=300', (SELECT id FROM categories WHERE slug = 'choy'), false, 5, 2),
('Matcha Qahva', 'matcha-qahva', 'Yapon matcha va sut', 35000, '/placeholder.svg?height=300&width=300', (SELECT id FROM categories WHERE slug = 'choy'), true, 6, 120),

-- Shirinliklar
('Tiramisu', 'tiramisu', 'Italyan tiramisu torti', 38000, '/placeholder.svg?height=300&width=300', (SELECT id FROM categories WHERE slug = 'shirinliklar'), true, 2, 450),
('Cheesecake', 'cheesecake', 'New York style cheesecake', 42000, '/placeholder.svg?height=300&width=300', (SELECT id FROM categories WHERE slug = 'shirinliklar'), true, 2, 400),
('Croissant', 'croissant', 'Fransuz kruassani', 18000, '/placeholder.svg?height=300&width=300', (SELECT id FROM categories WHERE slug = 'shirinliklar'), true, 3, 230),
('Shokoladli tort', 'shokoladli-tort', 'Yumshoq shokoladli tort', 45000, '/placeholder.svg?height=300&width=300', (SELECT id FROM categories WHERE slug = 'shirinliklar'), false, 2, 500),
('Macarons', 'macarons', 'Fransuz makaronlari (6 dona)', 35000, '/placeholder.svg?height=300&width=300', (SELECT id FROM categories WHERE slug = 'shirinliklar'), false, 2, 280),

-- Nonushta
('Ingliz nonushtasi', 'ingliz-nonushtasi', 'Tuxum, bekon, sosiska, fasol, pomidor', 55000, '/placeholder.svg?height=300&width=300', (SELECT id FROM categories WHERE slug = 'nonushta'), true, 15, 650),
('Pancake', 'pancake', 'Mevali pancake (3 dona)', 35000, '/placeholder.svg?height=300&width=300', (SELECT id FROM categories WHERE slug = 'nonushta'), true, 12, 450),
('Avocado Toast', 'avocado-toast', 'Avokado, tuxum va mikrogreens', 38000, '/placeholder.svg?height=300&width=300', (SELECT id FROM categories WHERE slug = 'nonushta'), true, 10, 320),
('Granola Bowl', 'granola-bowl', 'Granola, yogurt va yangi mevalar', 32000, '/placeholder.svg?height=300&width=300', (SELECT id FROM categories WHERE slug = 'nonushta'), false, 5, 380),

-- Salatlar
('Caesar Salat', 'caesar-salat', 'Klassik sezar salati tovuq bilan', 42000, '/placeholder.svg?height=300&width=300', (SELECT id FROM categories WHERE slug = 'salatlar'), true, 10, 350),
('Greek Salat', 'greek-salat', 'Grek salati feta pishloqi bilan', 38000, '/placeholder.svg?height=300&width=300', (SELECT id FROM categories WHERE slug = 'salatlar'), false, 8, 280),
('Quinoa Salat', 'quinoa-salat', 'Quinoa, sabzavotlar va limon sousi', 40000, '/placeholder.svg?height=300&width=300', (SELECT id FROM categories WHERE slug = 'salatlar'), false, 10, 320),

-- Sendvichlar
('Club Sendvich', 'club-sendvich', 'Tovuq, bekon, pomidor, salat', 45000, '/placeholder.svg?height=300&width=300', (SELECT id FROM categories WHERE slug = 'sendvichlar'), true, 12, 520),
('Tuna Sendvich', 'tuna-sendvich', 'Tuna, mayonez, salat', 40000, '/placeholder.svg?height=300&width=300', (SELECT id FROM categories WHERE slug = 'sendvichlar'), false, 10, 420),
('Grilled Cheese', 'grilled-cheese', 'Eritilgan pishloqli sendvich', 28000, '/placeholder.svg?height=300&width=300', (SELECT id FROM categories WHERE slug = 'sendvichlar'), false, 8, 450);

-- Default sozlamalar
INSERT INTO settings (key, value) VALUES
('cafe_name', 'Milano Kafe'),
('cafe_address', 'Jizzakh viloyati, Zomin tumani, Chinor ostida'),
('cafe_phone', '+998 77 183 99 99'),
('cafe_email', 'info@milanokafe.uz'),
('working_hours', '08:00 - 23:00'),
('delivery_fee', '15000'),
('min_order_amount', '50000');
