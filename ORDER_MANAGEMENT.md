# Buyurtma Boshqaruv Tizimi (Order Management System)

Bu loyihada buyurtmalarni avtomatik boshqarish tizimi bitirilgan. Barcha buyurtmalar o'z vaqtida o'chiriladi va status o'zgarishlari avtomatik bo'ladi.

## 🎯 Asosiy Xususiyatlar

### 1. **Avtomatik Status O'tkazish**
- **Muddati:** Pending statusida 5 kun qolsa, avtomatik "Yakunlangan" statusiga o'tadi
- **Ishlashi:** Har kuni soat 3-da (UTC) ishga tushadi
- **API Endpoint:** `POST /api/admin/orders/auto-transition`

### 2. **Avtomatik Buyurtma O'chirish**
Buyurtmalar ularning statusi va vaqtiga asosan avtomatik o'chiriladi:

| Status | O'chirish Vaqti | Eslatma |
|--------|-----------------|---------|
| **Cancelled** | 10 kun | Bekor qilingan buyurtmalar |
| **Completed** | 30 kun | Yakunlangan buyurtmalar |
| **All** | 90 kun | Barcha buyurtmalar (maksimal vaqt) |

- **Ishlashi:** Har kuni soat 2-da (UTC) ishga tushadi
- **API Endpoint:** `POST /api/admin/orders/cleanup`

### 3. **Buyurtma Timeline (Rivojlanish Qadamlari)**
Admin dashboard da har bir buyurtmaning rivojlanishi ko'rsatiladi:

```
Kutilmoqda → Tasdiqlangan → Tayyorlanmoqda → Tayyor → Yakunlangan
```

Timeline da quyidagi ma'lumotlar ko'rsatiladi:
- ✅ Yakunlangan qadamlar
- ⏳ Hozirgi qadami
- ⭕ Bajarilmaydigan qadamlar

### 4. **Vaqt Hisoblash**
Har bir buyurtma uchun quyidagi vaqtlar ko'rsatiladi:
- 📅 **Yaratilgan sana** - buyurtma qachon qabul qilingan
- ⏱️ **Status o'tkazish muddati** - pending statusida qolgan kunlar
- 🗑️ **O'chirish muddati** - database dan qolgan kunlar

### 5. **Buyurtma Qidirish**
Admin dashboard da quyidagi parametrlar bo'yicha buyurtma qidirish mumkin:
- Buyurtma ID si
- Mijoz nomi
- Telefon raqami

Bu xususiyat buyurtmalarni yo'qolib ketmasligi uchun ishlab chiqilgan.

## 🔧 Texnik Tafsilotlar

### Database Schema Yangilanishlari

Quyidagi maydonlar `orders` jadvaliga qo'shildi:

```sql
-- Status o'zgarishi soati
status_changed_at TIMESTAMPTZ DEFAULT now()

-- Avtomatik o'chirish vaqti
scheduled_deletion TIMESTAMPTZ

-- Soft delete belgisi
deleted_at TIMESTAMPTZ

-- Avtomatik status o'tkazish vaqti
auto_transition_at TIMESTAMPTZ
```

### Yangi Jadvalli va Funkciyalar

1. **`order_audit_log`** - Barcha buyurtma o'zgarishlari saqlanadi
   - Qachon kim qanday o'zgartirdi
   - Eski va yangi statuslar
   - O'zgarish sababi

2. **RLS Policies** - Xavfsizlik uchun row-level security

3. **SQL Functions:**
   - `set_order_lifecycle_timestamps()` - Avtomatik vaqt hisoblash
   - `log_order_changes()` - O'zgarishlni audit log ga yozish
   - `cleanup_expired_orders()` - Eski buyurtmalarni o'chirish
   - `auto_transition_pending_orders()` - Statusi o'tkazish

### API Endpoints

#### 1. Cleanup Endpoint
```
POST /api/admin/orders/cleanup
Header: Authorization: Bearer <CRON_SECRET>

Response:
{
  "success": true,
  "cleaned": 5,
  "statistics": {
    "total_orders": 100,
    "deleted_orders": 15,
    "active_orders": 85
  }
}
```

#### 2. Auto-Transition Endpoint
```
POST /api/admin/orders/auto-transition
Header: Authorization: Bearer <CRON_SECRET>

Response:
{
  "success": true,
  "transitioned": 3,
  "statistics": {
    "pending_count": 10,
    "completed_count": 45,
    "cancelled_count": 5
  }
}
```

#### 3. Status Monitoring
```
GET /api/admin/orders/cleanup
GET /api/admin/orders/auto-transition
```

## ⚙️ Sozlash (Setup)

### 1. Environment Variables

`.env.local` fayliga qo'shing:

```env
# Cron job uchun maxfiy kalit (generate: openssl rand -base64 32)
CRON_SECRET=your-secure-random-string-here
```

### 2. Database Migratsiyasi

SQL migratsiyasini bajarib chiqing:

```bash
# scripts/003-orders-management.sql faylini o'qib, 
# Supabase SQL editor ga paste qiling va ishga tushiring
```

### 3. Cron Jobs Setup

Vercel'da host qilyotgan bo'lsa, `vercel.json` allaqachon sozlangan:

```json
{
  "crons": [
    {
      "path": "/api/admin/orders/cleanup",
      "schedule": "0 2 * * *"  // 2:00 AM UTC
    },
    {
      "path": "/api/admin/orders/auto-transition",
      "schedule": "0 3 * * *"  // 3:00 AM UTC
    }
  ]
}
```

**Localhost'da test qilish uchun:**

```bash
# Terminal 1: Next.js server ishga tushiring
npm run dev

# Terminal 2: Cron endpoint larini test qiling
curl -X POST http://localhost:3000/api/admin/orders/cleanup \
  -H "Authorization: Bearer your-cron-secret"

curl -X POST http://localhost:3000/api/admin/orders/auto-transition \
  -H "Authorization: Bearer your-cron-secret"

# Status tekshiring
curl http://localhost:3000/api/admin/orders/cleanup
curl http://localhost:3000/api/admin/orders/auto-transition
```

## 📊 Admin Dashboard

### Buyurtmalar ro'yxati

- **Satrlar:** Har bir buyurtma
- **Ustunlar:** ID, Mijoz, Turi, Summa, Status, Sana, Amallar
- **Filtrash:** Status bo'yicha filtrash
- **Qidirish:** ID, mijoz nomi yoki telefon bo'yicha izlash

### Buyurtma Tafsilotlari

Dialog na quyidagi ma'lumotlar ko'rsatiladi:

1. **Timeline** - Rivojlanish qadamlari
2. **Timing Info** - Yaratilgan sana, o'zgartirish vaqti, o'chirish vaqti
3. **Buyurtma Tarkibi** - Mahsulotlar ro'yxati
4. **Jami** - To'lov summasi
5. **Status O'zgartirish** - Tugmalar orqali status o'zgarish

## 🔐 Xavfsizlik

1. **CRON_SECRET** - Cron job'lar uchun maxfiy kalitni saqlang
2. **RLS Policies** - Faqat admin'lar buyurtmalarni ko'ra oladi
3. **Audit Log** - Barcha o'zgarishllar saqlanadi
4. **Soft Delete** - Buyurtmalar o'chirilmay, `deleted_at` belgisi qo'yiladi

## 🐛 Muammolarni Hal Qilish

### Cron jobs ishlamayotgan bo'lsa:

1. **Environment variable'ni tekshiring:**
   ```
   CRON_SECRET=... o'rnatilganmi?
   ```

2. **Vercel logs'ni tekshiring:**
   ```
   vercel logs --tail
   ```

3. **Endpoint'ni manual test qiling:**
   ```
   curl -X POST https://your-domain.com/api/admin/orders/cleanup \
     -H "Authorization: Bearer YOUR_CRON_SECRET"
   ```

### Buyurtma o'chirilmayotgan bo'lsa:

1. **Database'da status va scheduled_deletion'ni tekshiring**
2. **SQL function ishladimi tekshiring** - `cleanup_expired_orders()` ni test qiling
3. **Logs'ni ko'ring** - `/api/admin/orders/cleanup` response'ini tekshiring

## 📚 Fayllar

- **`scripts/003-orders-management.sql`** - Database migratsiya
- **`app/api/admin/orders/cleanup.ts`** - Cleanup API
- **`app/api/admin/orders/auto-transition.ts`** - Auto-transition API
- **`components/order-timeline.tsx`** - Timeline component
- **`components/order-search.tsx`** - Search component
- **`app/admin/orders/orders-management.tsx`** - Admin dashboard
- **`lib/types.ts`** - TypeScript types
- **`vercel.json`** - Vercel cron configuration
