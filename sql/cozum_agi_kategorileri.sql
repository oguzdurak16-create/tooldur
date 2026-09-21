-- Tooldur Çözüm Ağı kategori bootstrap'ı
-- Idempotent: tekrar çalıştırıldığında aynı slug için yeni kayıt üretmez.
-- Mevcut forum kategorilerini silmez veya değiştirmez.

insert into public.forum_kategoriler (slug, ad, aciklama, ikon, renk, sira)
values
  ('cad-teknik-cizim', 'CAD & Teknik Çizim', 'SolidWorks, AutoCAD, Inventor, teknik resim, PDM ve CAD iş akışı sorunları.', '📐', '#f59e0b', 10),
  ('makine-uretim', 'Makine & Üretim', 'İmalat, sac işleme, büküm, rulman, tolerans, mekanizma ve üretim sahası problemleri.', '⚙️', '#22c55e', 20),
  ('elektrik-otomasyon', 'Elektrik & Otomasyon', 'PLC, servo, sensör, inverter, motor, pano, ölçüm ve otomasyon sorunları.', '⚡', '#38bdf8', 30),
  ('arac-mekanik', 'Araç & Mekanik', 'Otomobil arızaları, mekanik parçalar, elektrik sorunları, bakım ve teşhis deneyimleri.', '🚗', '#a78bfa', 40),
  ('yazilim-bilgisayar', 'Yazılım & Bilgisayar', 'Windows, yazılım kurulumu, hata mesajları, performans ve teknik bilgisayar sorunları.', '💻', '#fb7185', 50),
  ('ev-teknik-cihazlar', 'Ev & Teknik Cihazlar', 'Klima, beyaz eşya, su arıtma, elektrikli cihaz ve ev içi teknik problemler.', '🔧', '#f97316', 60)
on conflict (slug) do update set
  ad = excluded.ad,
  aciklama = excluded.aciklama,
  ikon = excluded.ikon,
  renk = excluded.renk,
  sira = excluded.sira;
