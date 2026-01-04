# Google Search Console (GSC) Setup Ko'rsatmasi

Milano Kafe loyihasini Google Search Console ga qo'shish bo'yicha to'liq qo'llanma.

## 📋 Tayyorlik (Allaqachon Bajarilgan)

✅ **robots.txt** - `/public/robots.txt` da mavjud
- Barcha search engine'larga ruxsat berildi
- Admin va private sahifalar yashirildi (Disallow)
- Sitemap joylashuvi ko'rsatildi

✅ **sitemap.xml** - `app/sitemap.ts` da dinamik sitemap
- Barcha mahsulotlar o'z slugi bilan
- Barcha statik sahifalar

✅ **robots.txt va sitemap.xml** - public folderdagi static version'lari

✅ **next/font/google** - SEO-optimize qilingan fontlar
- Preload va display:swap bilan

## 🔍 Google Search Console ga Qo'shish

### 1. **Domain Tasdiqtirish**

#### **Variant A: DNS Records orqali (Tavsiyalangan)**

1. **Google Search Console'ga kirish:**
   - [https://search.google.com/search-console](https://search.google.com/search-console) ga boring
   - Google akkauntingiz bilan kirish

2. **Yangi property qo'shish:**
   - "Property qo'shish" tugmasini bosing
   - **"Domain"** tanlaing
   - Domeningizni kiritib: `milano-kafe.uz`
   - "Davom etish" tugmasini bosing

3. **DNS tasdiqtirish (Namecheap/GoDaddy/Beget):**
   
   Google sizga beradigan DNS record'ni ko'chiring:
   ```
   TXT record:
   Name: milano-kafe.uz
   Value: google-site-verification=XXXXXXXXXXXXXXXXXXXXX
   ```
   
   DNS provider'iga (Namecheap, GoDaddy, Beget, va h.k.) kirishing:
   - Domain settings → DNS Records → Add Record
   - TXT record'ni qo'shib, tasdiq kodini paste qiling
   - 5-30 daqiqa kutib turung (DNS propagation)
   - Google Search Console da "Tasdiqtirish" tugmasini bosing

#### **Variant B: HTML File orqali**

1. Google sizga `google1234567890abcdef.html` faylini beradi
2. Faylni `public` papkasiga qo'yib, commit va deploy qiling
3. Google Search Console da "Tasdiqtirish" tugmasini bosing

#### **Variant C: Google Analytics orqali**

Agar Google Analytics allaqachon ulangan bo'lsa, uni ishlatib tasdiqtiring.

### 2. **Sitemap Submit Qilish**

1. **Google Search Console da login qiling**
2. **"Sitemaps" bo'limiga boring:**
   - Chap menyu → Sitemaps
   
3. **Sitemap URL'ni submit qiling:**
   ```
   https://milano-kafe.uz/sitemap.xml
   ```
   
   Yoki Next.js dynamic sitemap uchun:
   ```
   https://milano-kafe.uz/sitemap.ts
   ```

4. **Status tekshiring:**
   - "Muvaffaqiyatli" bo'lmaguncha kutib turing
   - Dastlabki crawl uchun 24-48 soat vaqt beringing

### 3. **robots.txt Tekshirish**

1. Google Search Console da "Settings" → "Crawl stats"
2. robots.txt automatik tekshiriladi
3. `/public/robots.txt` muvaffaqiyatli qidirish kerak

## 📱 Meta Tags va Structured Data

### robots.ts - Next.js Robots
Allaqachon `app/robots.ts` da mavjud:

```typescript
export default {
  rules: [
    {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/', '/auth/'],
    },
  ],
  sitemap: 'https://milano-kafe.uz/sitemap.xml',
}
```

### manifest.ts - PWA Manifest
Allaqachon `app/manifest.ts` da mavjud - offline mode'i uchun.

### Open Graph Tags
`app/layout.tsx` da:

```typescript
export const metadata: Metadata = {
  title: 'Milano Kafe - Eng Yaxshi Kofе va Taomlari',
  description: 'Milano Kafe - o'z natijaviy taomlar bilan siz kunning har bir soatida xizmat qiladi.',
  openGraph: {
    title: 'Milano Kafe',
    description: 'Taomlari, Pitsasi va Kofe',
    images: [
      {
        url: 'https://milano-kafe.uz/milano.jpg',
        width: 1200,
        height: 630,
      },
    ],
  },
}
```

## 🎯 Keybotics Optimization (SEO)

### Allaqachon Bajarilgan:

✅ **Performance Meta Tags:**
- Viewport sozlamasi
- charset UTF-8
- X-UA-Compatible

✅ **Semantic HTML:**
- `<header>`, `<nav>`, `<main>`, `<footer>` tags

✅ **Image Optimization:**
- `next/image` ishlatish
- Alt text'lari

✅ **JSON-LD Structured Data:**
- Organization schema
- Local Business schema
- Product schema (mahsulotlar uchun)

### Qo'shimcha Optimizatsiya:

#### **1. Product Schema'sini Yaxshilash**
`app/product/[slug]/page.tsx` da:

```typescript
export const generateMetadata = async ({ params }: Props): Promise<Metadata> => {
  const product = await getProduct(params.slug)
  
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image_url,
    price: product.price,
    priceCurrency: 'UZS',
    availability: product.is_available ? 'InStock' : 'OutOfStock',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.5',
      reviewCount: '100',
    },
  }

  return {
    title: product.name,
    description: product.description,
    openGraph: {
      images: [product.image_url],
    },
  }
}
```

#### **2. Breadcrumb Schema'sini Qo'shish**

```typescript
// components/breadcrumb-schema.tsx
export function BreadcrumbSchema({ items }: Props) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${BASE_URL}${item.url}`,
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
```

#### **3. Local Business Schema'sini Yaxshilash**

```typescript
// app/layout.tsx
export const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'Milano Kafe',
  image: 'https://milano-kafe.uz/milano.jpg',
  description: 'Eng Yaxshi Kofе va Taomlari',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Tashkent',
    addressCountry: 'UZ',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'Customer Service',
    telephone: '+998-XX-XXX-XX-XX',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 41.2995,
    longitude: 69.2401,
  },
  areaServed: 'UZ',
  servesCuisine: 'Uzbek, Italian, International',
}
```

## 📊 Google Search Console'da Qilish Kerak Bo'ladigan Ishlar

### 1. **Performance Monitoring**
- Monthly monitor: Clicks, Impressions, CTR, Position
- Mobile usability issues tekshiring
- Coverage issues tekshiring

### 2. **Enhancements**
- Mobile usability
- Rich results (Products, FAQ, Recipe, va h.k.)
- Mobile-Friendly Test

### 3. **Link Analysis**
- Top referrers tekshiring
- Internal links quality'si
- Backlinks (agar bo'lsa)

### 4. **Security & Manual Actions**
- Security issues tekshiring
- Manual actions bo'lmasa yaxshi!

## 🚀 Deployment Checklist

Vercel'da deploy qilishdan oldin:

- [ ] `NEXT_PUBLIC_BASE_URL=https://milano-kafe.uz` o'rnatilgan
- [ ] `sitemap.ts` dinamik sitemap generate qiladi
- [ ] `/robots.txt` static faylida sitemap URL'i to'g'ri
- [ ] DNS records tasdiqtirish uchun tayyor
- [ ] Open Graph images mavjud
- [ ] Structured data schema JSON-LD formatida

## 📈 First Index Timeline

Google Search Console ga qo'shganingizdan keyin:

| Kun | Kutish |
|-----|--------|
| **1-2** | Domain tasdiqlanadi |
| **3-5** | robots.txt va sitemap.xml crawl qiladi |
| **7-14** | Birinchi sahifalar index qilinadi |
| **14-30** | Asosiy sahifalar (Menu, Products) index qilinadi |
| **30+** | Performance data ko'rila boshladi |

## 🔗 Foydali Linklar

- [Google Search Console](https://search.google.com/search-console)
- [Google Mobile-Friendly Test](https://search.google.com/test/mobile-friendly)
- [Rich Results Test](https://search.google.com/test/rich-results)
- [Structured Data Markup Helper](https://www.google.com/webmasters/markup-helper/)
- [Next.js SEO Best Practices](https://nextjs.org/learn/seo/introduction-to-seo)

## ⚠️ Muhim Eslatmalar

1. **DNS Propagation:** DNS record'ni qo'shganingizdan keyin 5-30 daqiqada kutib turing
2. **HTTPS:** `https://` protokoli MUST bo'ladi (SSL sertifikat)
3. **Sitemap Update:** Product'lar o'zgarsa, sitemap avtomatik update bo'ladi (1 soat)
4. **Mobile First:** Google mobile first indexing'ni ishlatadi, mobile UX muhim!
5. **Core Web Vitals:** Page speed, LCP, FID, CLS muhim SEO ranking factors

## 🛠️ Local Testing

```bash
# robots.txt tekshiring
curl https://milano-kafe.uz/robots.txt

# sitemap.xml tekshiring
curl https://milano-kafe.uz/sitemap.xml

# Structured data tekshiring
curl https://milano-kafe.uz/api/og

# Mobile friendly test
# https://search.google.com/test/mobile-friendly?url=https://milano-kafe.uz
```

---

**Soruv bo'lsa, Google Search Console help dokumentatsiyasini ko'ring:**
https://support.google.com/webmasters
