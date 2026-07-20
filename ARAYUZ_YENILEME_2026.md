# Tooldur Arayüz Yenileme — Temmuz 2026

## Tasarım yaklaşımı

Tooldur arayüzü tek bir "mühendislik çalışma alanı" teması altında yeniden düzenlendi. Ana renk koyu lacivert/siyah zemin ve camgöbeği teknik vurgu rengidir. Amber yalnızca ikincil durum, uyarı ve seçili kategori vurgularında kullanılır.

## Baştan oluşturulan alanlar

- Masaüstü üst menü, global arama alanı, dil seçimi ve mobil çekmece
- Mobil alt menü ve hızlı işlem paneli
- Footer ve tüm site bağlantı hiyerarşisi
- Ana sayfa hero, araç rafları, kategori alanları, doğrudan çözüm kartları ve TooldurCAD akışı
- Tüm Araçlar sayfası; arama, kategori, favori, son kullanılan ve sıralama kontrolleri
- Türkçe ve çok dilli araç detay sayfaları
- Türkçe ve çok dilli kategori sayfaları
- Ortak kart, form, buton, sonuç, hesap geçmişi, PWA ve komut paleti görsel sistemi

## Aynı temaya bağlanan alanlar

Blog, blog detayları, destek, giriş, hesap panelleri, proje yönetimi, forum, yasal metinler, TooldurCAD indirme alanı ve eski Tailwind tabanlı hesaplayıcılar ortak tasarım değişkenleri ve birleşik arayüz katmanına bağlandı.

## Korunan teknik yapılar

- 44 mevcut sayfa rotası aynen korunmuştur.
- 72 araç slug sırası ve adresi aynen korunmuştur.
- Google Analytics kimliği: `G-J5SC4H2SQE`
- Canonical adresler, yapılandırılmış veriler ve mevcut SEO metinleri korunmuştur.
- `package.json` Node.js sürümü `24.x` olarak kalmıştır.

## Kontroller

- 183 TypeScript/TSX dosyası sözdizimi kontrolünden geçti.
- 9 CSS dosyasında blok dengesi kontrol edildi.
- Kaynak paket ile rota ve araç slug karşılaştırması yapıldı; eklenen/silinen adres bulunmadı.
- İnternetsiz çalışma ortamında paket yöneticisi bağımlılıkları indirilemediği için tam `next build` çalıştırılamadı.
