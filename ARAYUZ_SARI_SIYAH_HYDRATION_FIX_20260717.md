# Tooldur sarı-siyah arayüz ve çalışma zamanı düzeltmesi

Tarih: 17.07.2026

## Arayüz
- Yeni arayüz düzeni korunmuştur.
- Ana marka rengi yeniden Tooldur sarısı `#ffb11b` yapılmıştır.
- Arka plan, kart, panel, form, mobil menü, dashboard ve proje yönetimi alanları koyu/siyah tabanlı tek tasarım sistemine bağlanmıştır.
- Önceki yenilemede ana vurguya dönüşen camgöbeği renkler sarı marka vurgusuna çevrilmiştir.

## React hydration
- Eski service worker'ın Next.js HTML ve build dosyalarını cache'lemesi kaldırılmıştır.
- Service worker yalnızca PWA kaydını korur; sayfa veya `_next` build dosyalarını yakalamaz.
- Eski `tooldur-shell-v3` cache kayıtları yeni worker etkinleşirken temizlenir.
- Worker güncellemesi `updateViaCache: none` ile zorlanır ve eski controller değiştiğinde bir defalık güvenli yenileme yapılır.
- Root layout içindeki iç içe `<main>` yapısı kaldırılmış, içerik kapsayıcısı `<div>` yapılmıştır.

## Tarayıcı uyarıları
- `mobile-web-app-capable=yes` meta etiketi eklendi.
- `/dashboard` ve `/proje-yonetimi` isteklerini yakalayan service worker fetch kodu kaldırıldığı için `FetchEvent ... Failed to fetch` hatası giderildi.
- Görseller için görülen lazy-load intervention mesajı tarayıcının bilgilendirme mesajıdır; site hatası değildir.

## Korunanlar
- Mevcut URL/slug yapısı
- Google Analytics kimliği
- SEO, canonical, sitemap ve yönlendirmeler
- Node.js 24.x ve pnpm kilit dosyası
