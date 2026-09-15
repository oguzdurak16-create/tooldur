# Tooldur

Mühendislik, imalat ve teknik ön hesap araçları için Next.js uygulaması.

## Çalıştırma

```bash
npm install
npm run dev
```

## Yayına alma

`GITLABA_GONDER.bat` ile güncel kodu GitLab'a gönderin. Vercel, bağlı depoyu otomatik olarak derleyip dağıtır.

## Paket düzeni

- `public/` altındaki tüm görseller korunmuştur.
- `public/home/` ana sayfa hero görsellerini içerir.
- `public/visuals/` araç, kategori ve sosyal paylaşım görsellerini içerir.
- `public/tooldurcad/` TooldurCAD ekran görüntülerini içerir.
- Eski güncelleme notları ve TypeScript build çıktısı paket dışına alınmıştır.

## 17 Temmuz 2026 site geliştirmesi

Global teknik arama, favoriler, son kullanılan araçlar, gelişmiş araç sıralaması, GSC sorgu odaklı ana sayfa bölümleri, araç bazlı otomatik girdi kaydı, yerel hesap geçmişi, CSV dışa aktarma ve PWA desteği eklendi. Mevcut URL yapısı ve Google Analytics kimliği korunmuştur. Ayrıntılar `SITE_GELISTIRME_NOTLARI.md` dosyasındadır.

## Temmuz 2026 tek tema arayüz yenilemesi

Site arayüzü koyu mühendislik çalışma alanı temasıyla baştan düzenlendi. Üst menü, mobil menü, ana sayfa, araç listesi, araç detayları, kategori sayfaları ve footer yeniden oluşturuldu; blog, panel, proje yönetimi, forum, destek ve yasal sayfalar aynı tasarım sistemine bağlandı. URL yapısı ve Analytics kimliği değiştirilmedi. Ayrıntılar `ARAYUZ_YENILEME_2026.md` dosyasındadır.
