# Mühendis Gözüyle içerik entegrasyonu

- Dizin: `/muhendis-gozuyle`; konu sayfaları `/muhendis-gozuyle/[slug]`.
- İçerik kaynağı: `src/data/mgStories.ts`. Sayfadaki 8 yazı, MG'nin konu arşivinden Tooldur için yeniden düzenlenmiş teknik anlatımlardır; birebir Facebook gönderi metinleri değildir.
- Görseller: `public/mg/*.webp` içinde Facebook'ta Mühendis Gözüyle sayfasında yayımlanmış gerçek gönderi görselleri. `scripts/mg-original-post-image-manifest.json` içerik/gönderi eşleştirmesini tutar; geçici fbcdn bağlantıları production kaynaklarına konmaz.
- İçerik ekleme: Yeni konuyu slug, başlık, özet, doğrulanmış açıklamalar, ilgili araç bağlantıları ve tek uygun görselle birlikte `mgStories` dizisine ekle. Araç URL'sinin mevcut olduğunu kontrol et. Benzer konuları tekrar etme.
- Sitemap ve detay sayfası başlıkları veri dizisinden üretilir. `MG_SITE_PUBLISHED_AT` ancak içerik paketi yayınlandığında yenilenmelidir.
- **Deploy kuralı:** Tek tek gönderi eklemek için main dalına art arda push yapma. Editoryal konuları bir dalda veya çevrimdışı hazırla; lint, build, sayfa yolu ve SEO kontrolleri tamamlanınca main dalına **tek toplu commit** ile aktar. Bu depoda main push Vercel dağıtımını tetikleyebilir.
- Yalnızca doğrulanmış orijinal gönderi görselini ve kalıcı gönderi adresini kullan; görselleri tasarım şablonuyla yeniden üretme.
