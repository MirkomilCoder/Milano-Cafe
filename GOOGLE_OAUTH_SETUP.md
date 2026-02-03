# Google OAuth Setup Guide

## Overview
Bu loyihaga Google va Apple OAuth buttons qo'shildi. Google login/register ishlamoqda, Apple button esa hozircha disabled.

## Login/Register Pages
- **Login Page**: `/app/auth/login/page.tsx` - Google va Apple buttonlarni o'z ichiga oladi
- **Sign-up Page**: `/app/auth/sign-up/page.tsx` - Google va Apple buttonlarni o'z ichiga oladi
- **OAuth Component**: `/components/oauth-buttons.tsx` - Qayta ishlatiluvchi OAuth buttons komponenti
- **Callback Handler**: `/app/auth/callback/route.ts` - OAuth callback handler

## Google OAuth Setup in Supabase

### Step 1: Google Cloud Console'dan OAuth Credentials oling
1. [Google Cloud Console](https://console.cloud.google.com/) ga kiring
2. Yangi project yarating yoki existing projectni tanlang
3. **APIs & Services** > **Credentials** ga kiring
4. **Create Credentials** > **OAuth 2.0 Client ID** tanlang
5. **Web application** tanlang
6. **Authorized JavaScript origins** qo'shing:
   - `http://localhost:3000` (local development)
   - `https://dszqgqrxzlhqlinbokwt.supabase.co` (production)
7. **Authorized redirect URIs** qo'shing:
   - `http://localhost:3000/auth/callback` (local)
   - `https://dszqgqrxzlhqlinbokwt.supabase.co/auth/v1/callback` (production)
8. Client ID va Client Secret ni copy qiling

### Step 2: Supabase'da Google OAuth'ni configure qiling
1. [Supabase Dashboard](https://app.supabase.com/) ga kiring
2. Proyektingizni tanlang
3. **Authentication** > **Providers** ga kiring
4. **Google** provider'ni tanlang
5. Google Cloud Console'dan Client ID va Client Secret'ni paste qiling
6. **Save** ni bosing

### Step 3: Environment Variables
`.env.local` faylida quyidagi variable'lar allaqachon set qilingan:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/auth/callback
```

## OAuth Flow
1. Foydalanuvchi Google button'ni bosadi
2. Google login page'ga yo'naltiriladi
3. Google'da kirish/login qiladi
4. `/auth/callback` route'ga yo'naltiriladi code bilan
5. Supabase session'ni set qiladi
6. Foydalanuvchi home page'ga yo'naltiriladi

## Apple Button
Apple button disabled qilingan va "Hozircha mavjud emas" yozuvi bilan ko'rsatilgan. Kelajakda ishlatish uchun:

1. Apple Developer Account va certificates oling
2. Supabase'da Apple provider'ni configure qiling
3. `oauth-buttons.tsx` faylida Apple handler'ni implement qiling

## Features
✅ Google OAuth login/register
✅ User auto-creation in users table
✅ Error handling va user-friendly messages
✅ Apple button disabled state
✅ Responsive design

## Testing
Local'da test qilish uchun:
1. `npm run dev` ni ishga tushing
2. http://localhost:3000/auth/login ga o'ting
3. Google button'ni bosing
4. Google bilan login qiling
5. Siz automatically home page'ga yo'naltirilasiz

## Troubleshooting
- **"Redirect URI mismatch" xatoligi**: Supabase va Google Cloud Console'da redirect URI'lar match qilanotganini tekshiring
- **OAuth window ochilmasligi**: Browser konsoli xatolarini tekshiring (F12)
- **User creation xatoligi**: Supabase users table'i mavjud bo'lanotganini tekshiring
