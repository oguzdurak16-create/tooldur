# Tooldur Site Geliştirme Notları

Tarih: 17 Temmuz 2026

## URL koruması

Mevcut sayfa ve araç adresleri korunmuştur. Araç slugları, kategori adresleri ve yönlendirme yapısı değiştirilmemiştir. Yeni sayfa rotası eklenmemiştir.

## Arayüz ve kullanım

- Üst menüye masaüstü ve mobilde çalışan global araç araması eklendi.
- Arama `Ctrl + K` veya `/` kısayoluyla açılabilir.
- Arama motoru; metrik diş, kılavuz tablosu, dalgıç pompa, torna derece, donatı ağırlıkları ve H7/g6 gibi teknik eş anlamları tanır.
- Araç sayfalarına favoriye ekleme, bağlantı kopyalama, paylaşma ve hesap alanına hızlı geçiş eklendi.
- Ana sayfaya favoriler, son kullanılanlar ve başlangıç araçlarını gösteren kişisel çalışma alanı eklendi.
- Tüm Araçlar sayfasına favori filtresi, son kullanılan sıralaması ve A-Z sıralaması eklendi.
- Ana sayfaya Search Console sorgularına doğrudan karşılık veren teknik çözüm kartları eklendi.

## SEO ve analitik

- Site geneli `WebSite/SearchAction` yapılandırılmış verisi eklendi.
- `/araclar?q=...` sorgusuyla arama sonucunun doğrudan açılması sağlandı.
- Google Analytics ölçüm kimliği `G-J5SC4H2SQE` olarak güncellendi; mevcut çerez onayı mantığı korunmuştur.
- Mevcut araç ve kategori bağlantıları güçlendirilmiş, yeni slug oluşturulmamıştır.

## Performans

- Ana sayfa hero görseli yaklaşık 1,65 MB'den 96 KB seviyesine indirildi.
- Dashboard boş durum görseli yaklaşık 1,58 MB'den 57 KB seviyesine indirildi.
- Destek sayfası kapak görseli optimize edildi.
- Boş gelen hero odak görseli geçerli ve optimize edilmiş bir PNG olarak onarıldı.

## Kontroller

- 179 TypeScript/TSX dosyasında sözdizimi kontrolü yapıldı.
- Yeni ve değiştirilen dosyalardaki dahili import yolları doğrulandı.
- Statik görsel referansları kontrol edildi.
- Araç sluglarının ve uygulama rota dosyalarının önceki paketle aynı kaldığı doğrulandı.

Tam `next build`, paket bağımlılıkları çevrimdışı ortamda indirilemediği için çalıştırılamamıştır.

## İkinci geliştirme paketi

- Tüm hesaplama sayfalarına yerel çalışma alanı eklendi.
- Form girdileri araç bazında tarayıcıda otomatik saklanır ve aynı araç yeniden açıldığında geri yüklenir.
- Kullanıcı giriş yapmadan hesap anlık görüntüsü kaydetme, özet kopyalama ve CSV dışa aktarma eklendi.
- Tarayıcıda toplam son 30 yerel kayıt saklanır; kayıtlar araç bazında listelenir, kopyalanabilir veya silinebilir.
- PWA yükleme desteği ve servis çalışanı eklendi. Daha önce açılmış genel sayfalar çevrimdışı görüntülenebilir.
- Dashboard, giriş, yönetim ve proje sayfaları güvenlik amacıyla çevrimdışı önbelleğe alınmaz.
- Bağlantı kesildiğinde çevrimdışı durum bildirimi gösterilir.
- Klavye kullanıcıları için “İçeriğe geç” bağlantısı, belirgin odak görünümü ve hareket azaltma desteği eklendi.
- Hesap kaydetme, özet kopyalama, CSV dışa aktarma ve PWA yükleme işlemleri için analitik olayları eklendi.
- Google Analytics ölçüm kimliği değiştirilmedi: `G-J5SC4H2SQE`.
- Sayfa rotaları ve 72 araç slugı önceki paketle birebir aynı tutuldu.
