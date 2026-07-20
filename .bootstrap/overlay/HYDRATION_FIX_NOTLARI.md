# Tooldur Hydration Düzeltmesi

Bu paket React #425, #418 ve #423 hatalarının iki ana kaynağını giderir:

- Uygulama kabuğu artık hydration sırasında `useEffect` ile sonradan eklenmiyor; header ve footer ilk sunucu/istemci render'ında aynı DOM ile üretiliyor.
- Ana sayfa arama sonuçları ilk render sonrasında otomatik değişmiyor. Sonuç listesi yalnızca kullanıcı sorgu yazdığında açılıyor.
- Kişisel favori/son kullanılan rafı, yerel depolama verilerini hydration tamamlandıktan sonra uyguluyor.
- Eski Service Worker sürümleri ve eski Cache Storage verileri tek seferlik temizleniyor.
- Service Worker sürümü `runtime=v6` olarak yükseltildi ve sayfa/Next.js chunk cache'leme yapmıyor.

Korunanlar:

- Sarı-siyah Tooldur teması
- Mevcut URL ve slug yapısı
- Google Analytics: `G-J5SC4H2SQE`
- Node.js 24.x
