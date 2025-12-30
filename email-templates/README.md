# Email Template Setup Qo'llanma

## 🎯 MILANO Kafe Email Templates

### Email Tasdiqlash Template-i

**Fayl yo'li:** `email-templates/confirm-email-supabase.html`

Bu template Supabase Authentication-da email tasdiqlash uchun ishlatiladi.

### Supabase-da Setup Qilish:

1. **Supabase Dashboard-ga kiring:**
   - https://app.supabase.com
   - Loyihangizni tanlang

2. **Email Templates bo'limiga o'ting:**
   - Authentication → Email Templates
   - "Confirm signup" template-ni tanlang

3. **Template-ni o'zgartiring:**
   - HTML content-ni `confirm-email-supabase.html` fayldan nusxalang
   - Paste qiling Supabase template editor-iga
   - "Save" tugmasini bosing

### Template o'zgaruvchilari:

```
{{ .ConfirmationURL }}  - Tasdiqlash linkini o'zgartiradi (Supabase avtomatik generatsiya qiladi)
{{ .Email }}            - Foydalanuvchining emaili
{{ .Data }}             - Qo'shimcha ma'lumotlar
```

### Email Template Features:

✅ **MILANO Kafe Branding**
- Premium gold (#d4a574) va dark (#1a1410) ranglar
- Serif typography (Playfair Display)
- Professional layout

✅ **Responsive Design**
- Mobile va desktop uchun optimized
- Email clients-da mos ko'rinishi

✅ **Creative Elements**
- Logo va branding header
- CTA (Call-to-Action) button
- Feature box - rewards va promotions haqida
- Alternative link fallback
- Professional footer

### Supabase Email Settings:

**SMTP Konfiguratsiya (opsional):**

Agar o'z SMTP-ni ishlatmoqchi bo'lsangiz:

1. Settings → Email Configuration
2. SMTP Details-ni kiritng:
   - Host: your-smtp-host.com
   - Port: 587 (TLS) yoki 465 (SSL)
   - Username: your-email@domain.com
   - Password: your-password
   - Sender Email: noreply@milano-kafe.uz
   - Sender Name: MILANO Kafe

3. Test email yuborish:
   - "Send Test Email" tugmasini bosing

### Maslahatlar:

1. **Preview:** Template-ni Supabase editor-ining preview panel-ida tekshiring
2. **Testing:** Test email yuborish uchun "Send Test Email"-ni ishlating
3. **Customization:** Font-larni, rang-larni yangilash uchun HTML-ni o'zgartiring
4. **Links:** {{ .ConfirmationURL }} o'zgaruvchisini to'g'ri qo'ling

### Fayl Strukturasi:

```
email-templates/
├── confirm-email.html              (Eski versiya - backup)
└── confirm-email-supabase.html     (Supabase uchun - aktiv)
```

### Boshqa Email Templates:

Agar boshqa email template-lar kerak bo'lsa (password reset, welcome, notification):

1. Supabase-da yangi template-ni tanlang
2. Xuddi shu jarayonni takrorlang
3. Har bir template uchun alohida HTML yarating

---

**Tahrir:** 20-Dekabr, 2025
**Brand:** MILANO Kafe
**Status:** ✅ Aktiv va foydalanishga tayyorgi
