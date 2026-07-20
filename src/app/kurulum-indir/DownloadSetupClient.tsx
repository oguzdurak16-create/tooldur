'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Download, Lock, ShieldCheck, HeartHandshake, MonitorCog, PanelRight, Ruler, Copy, ListChecks, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type SetupFile = {
  key: string;
  title: string;
  desc: string;
  fileName: string;
  version: string;
  size: string;
  updatedAt: string;
};

type CadShot = {
  src: string;
  title: string;
  desc: string;
  width: number;
  height: number;
};

const BUCKET = 'tooldur-cad';
const FILES: SetupFile[] = [
  {
    key: 'solidworks',
    title: 'TooldurCAD SolidWorks Setup',
    desc: 'Lisanslı SOLIDWORKS kullanıcıları için görev bölmesi paneli ve CAD destek araçları kurulum paketi.',
    fileName: 'TooldurCAD-SolidWorks-Setup-v1.0.3.exe',
    version: 'v1.0.3',
    size: '2.46 MB',
    updatedAt: '01.06.2026',
  },
  {
    key: 'universal',
    title: 'TooldurCAD Universal Lite Setup',
    desc: 'Bağımsız masaüstü kullanım için hafif TooldurCAD kurulum paketi.',
    fileName: 'TooldurCAD-Universal-Lite-Setup-v1.0.3.exe',
    version: 'v1.0.3',
    size: '2.05 MB',
    updatedAt: '01.06.2026',
  },
];

const SCREENSHOTS: CadShot[] = [
  {
    src: '/tooldurcad/solidworks-kama-panel.png',
    title: 'SolidWorks içinde hızlı kama hesabı',
    desc: 'Mil çapı girilir, kama genişliği/yüksekliği, önerilen geçmeler ve teknik çağrı aynı panelde alınır.',
    width: 359,
    height: 969,
  },
  {
    src: '/tooldurcad/solidworks-arac-listesi.png',
    title: 'Görev panelinden araç seçimi',
    desc: 'Kama, segman, kılavuz/matkap, tolerans, rulman geçme, O-ring kanalı, yüzey pürüzlülüğü ve daha fazlası tek listede toplanır.',
    width: 357,
    height: 971,
  },
  {
    src: '/tooldurcad/solidworks-ic-segman.png',
    title: 'İç segman kanalı önerisi',
    desc: 'Delik çapına göre kanal çapı, kanal genişliği, H7/H8 önerileri ve katalog doğrulama notu gösterilir.',
    width: 363,
    height: 978,
  },
  {
    src: '/tooldurcad/desktop-kama-genis-ekran.png',
    title: 'Masaüstü geniş ekran görünümü',
    desc: 'Hesap formu, ana sonuçlar, işleme önerileri, tolerans kartları ve kopyalanabilir teknik çağrı geniş panelde görüntülenir.',
    width: 1919,
    height: 1026,
  },
  {
    src: '/tooldurcad/desktop-kilavuz-matkap.png',
    title: 'Kılavuz / matkap hesabı',
    desc: 'Vida ölçüsüne göre hatve, kılavuz matkap çapı, boşluk deliği, iç/dış diş önerileri ve pah bilgisi üretilir.',
    width: 1919,
    height: 1026,
  },
];

const FEATURE_LIST = [
  'SolidWorks içinde yan panel olarak kullanılabilir.',
  'Aynı araçlar bağımsız masaüstü penceresinde de çalışır.',
  'Hesap sonucunu teknik çağrı formatında kopyalamaya uygundur.',
  'Tolerans, yüzey ve işleme notlarını tasarımcıya hızlı verir.',
  'Mekanik tasarımda sık kullanılan ölçü tablolarını tek ekranda toplar.',
];

export default function DownloadSetupClient() {
  const [user, setUser] = useState<any>(null);
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: any } }) => {
      if (mounted) setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setUser(session?.user ?? null);
    });
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const downloadFile = async (file: SetupFile) => {
    setError('');
    if (!user) {
      window.location.href = `/giris?redirect=${encodeURIComponent('/kurulum-indir')}`;
      return;
    }

    setLoadingKey(file.key);
    try {
      const { data, error: signError } = await supabase.storage
        .from(BUCKET)
        .createSignedUrl(file.fileName, 120, { download: file.fileName });

      if (signError || !data?.signedUrl) {
        throw signError || new Error('İndirme linki oluşturulamadı.');
      }

      window.location.href = data.signedUrl;
    } catch (e: any) {
      setError(e?.message || 'İndirme başlatılamadı. Bucket adı, dosya adı ve Storage policy ayarlarını kontrol edin.');
    } finally {
      setLoadingKey(null);
    }
  };

  return (
    <main style={{ minHeight: '80vh', padding: '56px 16px 80px', background: 'var(--bg)' }}>
      <section className="td-container" style={{ maxWidth: 1180 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 13px', borderRadius: 999, background: 'rgba(255,177,27,.1)', border: '1px solid rgba(255,177,27,.22)', color: 'var(--amber)', fontWeight: 900, fontSize: 12, letterSpacing: '.08em', textTransform: 'uppercase' }}>
          TooldurCAD · Güncel sürüm v1.0.3
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.05fr) minmax(300px, .95fr)', gap: 26, alignItems: 'center', marginTop: 18 }} className="tdcad-hero-grid">
          <div>
            <h1 style={{ margin: '0 0 12px', color: 'var(--ink)', fontSize: 'clamp(34px, 5vw, 58px)', lineHeight: 1.02, letterSpacing: '-.05em' }}>
              TooldurCAD v1.0.3 kurulum dosyaları
            </h1>

            <p style={{ maxWidth: 790, color: 'var(--ink-3)', fontSize: 17, lineHeight: 1.75, marginBottom: 22 }}>
              TooldurCAD v1.0.3, mekanik tasarım sırasında sık kullanılan hesapları SolidWorks içinde veya bağımsız masaüstü panelinde hızlıca çalıştırmak için geliştirilen CAD destek aracıdır. Kama, segman, kılavuz/matkap, tolerans, rulman geçme, O-ring kanalı, yüzey pürüzlülüğü ve benzeri araçları tek yerde toplar.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12, marginBottom: 24 }}>
              {[
                { icon: PanelRight, title: 'SolidWorks Paneli', text: 'Yan görev bölmesinden hızlı kullanım' },
                { icon: MonitorCog, title: 'Masaüstü Modu', text: 'Geniş ekranda bağımsız hesap paneli' },
                { icon: Copy, title: 'Teknik Çağrı', text: 'Sonucu kopyalanabilir çağrıya dönüştürür' },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} style={{ border: '1px solid rgba(255,255,255,.08)', background: 'rgba(255,255,255,.035)', borderRadius: 18, padding: 16 }}>
                    <Icon size={21} color="var(--amber)" />
                    <strong style={{ display: 'block', marginTop: 10, color: 'var(--ink)', fontSize: 14 }}>{item.title}</strong>
                    <span style={{ display: 'block', marginTop: 4, color: 'var(--ink-3)', fontSize: 13, lineHeight: 1.45 }}>{item.text}</span>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 8 }}>
              {!user && (
                <Link href={`/giris?redirect=${encodeURIComponent('/kurulum-indir')}`} style={{ minHeight: 46, padding: '0 18px', borderRadius: 14, display: 'inline-flex', alignItems: 'center', gap: 9, background: 'linear-gradient(180deg, #ffd47a, #ffb11b)', color: '#090d15', textDecoration: 'none', fontWeight: 900 }}>
                  <Lock size={17} /> Giriş Yap / Üye Ol
                </Link>
              )}
              <a href="#indir" style={{ minHeight: 46, padding: '0 18px', borderRadius: 14, display: 'inline-flex', alignItems: 'center', gap: 9, border: '1px solid rgba(255,177,27,.24)', color: 'var(--amber)', textDecoration: 'none', fontWeight: 900 }}>
                <Download size={17} /> Kurulum Dosyaları
              </a>
              <a href="#ekranlar" style={{ minHeight: 46, padding: '0 18px', borderRadius: 14, display: 'inline-flex', alignItems: 'center', gap: 9, border: '1px solid rgba(255,255,255,.1)', color: 'var(--ink-2)', textDecoration: 'none', fontWeight: 800 }}>
                <Ruler size={17} /> Ekran Görüntüleri
              </a>
            </div>
          </div>

          <div style={{ border: '1px solid rgba(255,255,255,.08)', borderRadius: 24, padding: 10, background: 'linear-gradient(180deg, rgba(17,24,39,.92), rgba(10,15,25,.96))', boxShadow: '0 24px 70px rgba(0,0,0,.3)' }}>
            <Image
              src="/visuals/topics/tool-software.webp"
              alt="CAD ekranı, kumpas, dişli ve rulman bulunan TooldurCAD mühendislik çalışma alanı"
              width={1600}
              height={900}
              priority
              sizes="(max-width: 900px) 100vw, 48vw"
              style={{ width: '100%', height: 'auto', display: 'block', borderRadius: 18, border: '1px solid rgba(255,255,255,.08)' }}
            />
          </div>
        </div>

        <section style={{ marginTop: 34, border: '1px solid rgba(255,255,255,.08)', borderRadius: 24, padding: 24, background: 'rgba(255,255,255,.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <ListChecks size={22} color="var(--amber)" />
            <h2 style={{ margin: 0, color: 'var(--ink)', fontSize: 26, letterSpacing: '-.04em' }}>Program ne işe yarar?</h2>
          </div>
          <p style={{ color: 'var(--ink-3)', lineHeight: 1.7, margin: '0 0 16px', maxWidth: 900 }}>
            Programın amacı, tasarımcıların sık baktığı mekanik hesap ve tolerans bilgilerini çizim sırasında daha hızlı erişilebilir hale getirmektir. Ölçüyü girersin; sistem ilgili ölçü aralığını, önerilen standartları, tolerans/yüzey notlarını ve teknik resme yazılabilecek kısa çağrıyı üretir.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 10 }}>
            {FEATURE_LIST.map((item) => (
              <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, padding: 12, borderRadius: 16, background: 'rgba(15,23,42,.62)', border: '1px solid rgba(255,255,255,.07)', color: 'var(--ink-2)', lineHeight: 1.55, fontSize: 14 }}>
                <CheckCircle2 size={17} color="#35f0b6" style={{ flex: '0 0 auto', marginTop: 2 }} />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>

        <section id="ekranlar" style={{ marginTop: 34 }}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ color: 'var(--amber)', fontWeight: 900, fontSize: 12, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 8 }}>Ekran görüntüleri</div>
            <h2 style={{ margin: 0, color: 'var(--ink)', fontSize: 'clamp(26px, 4vw, 38px)', letterSpacing: '-.05em' }}>SolidWorks paneli ve masaüstü görünümü</h2>
            <p style={{ margin: '9px 0 0', color: 'var(--ink-3)', lineHeight: 1.65, maxWidth: 760 }}>
              Aşağıdaki görseller programın SolidWorks içi dar panel kullanımını ve bağımsız geniş ekran kullanımını gösterir.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
            {SCREENSHOTS.map((shot) => (
              <article key={shot.src} style={{ border: '1px solid rgba(255,255,255,.08)', borderRadius: 22, padding: 10, background: 'linear-gradient(180deg, rgba(17,24,39,.86), rgba(10,15,25,.94))', boxShadow: '0 20px 46px rgba(0,0,0,.18)' }}>
                <a href={shot.src} target="_blank" rel="noreferrer" style={{ display: 'block', textDecoration: 'none' }}>
                  <Image
                    src={shot.src}
                    alt={shot.title}
                    width={shot.width}
                    height={shot.height}
                    sizes="(max-width: 768px) 100vw, 33vw"
                    style={{ width: '100%', height: 260, objectFit: 'contain', display: 'block', borderRadius: 15, background: '#050b14', border: '1px solid rgba(255,255,255,.08)' }}
                  />
                </a>
                <div style={{ padding: '13px 4px 4px' }}>
                  <h3 style={{ margin: '0 0 6px', color: 'var(--ink)', fontSize: 17, letterSpacing: '-.03em' }}>{shot.title}</h3>
                  <p style={{ margin: 0, color: 'var(--ink-3)', fontSize: 13.5, lineHeight: 1.6 }}>{shot.desc}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="indir" style={{ marginTop: 38 }}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ color: 'var(--amber)', fontWeight: 900, fontSize: 12, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 8 }}>Üyelere özel indirme</div>
            <h2 style={{ margin: 0, color: 'var(--ink)', fontSize: 'clamp(26px, 4vw, 38px)', letterSpacing: '-.05em' }}>Kurulum dosyaları</h2>
            <p style={{ maxWidth: 760, color: 'var(--ink-3)', fontSize: 16, lineHeight: 1.7, margin: '9px 0 0' }}>
              TooldurCAD v1.0.3 Universal Lite ve SolidWorks destek kurulum dosyalarını indirmek için üye girişi gerekir. Linkler her indirmede kısa süreli ve üyeye özel oluşturulur.
            </p>
          </div>

          {error && <div style={{ marginBottom: 18, padding: 14, borderRadius: 14, border: '1px solid rgba(248,113,113,.25)', background: 'rgba(248,113,113,.08)', color: '#fecaca', fontSize: 14 }}>{error}</div>}

          <div className="tdcad-download-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 18, alignItems: 'stretch' }}>
            {FILES.map((file) => (
              <article key={file.key} className="tdcad-download-card" style={{ border: '1px solid rgba(255,255,255,.08)', background: 'linear-gradient(180deg, rgba(17,24,39,.86), rgba(10,15,25,.94))', borderRadius: 24, padding: 22, boxShadow: '0 24px 54px rgba(0,0,0,.24)', minHeight: 285, display: 'flex', flexDirection: 'column' }}>
                <div style={{ width: 46, height: 46, borderRadius: 16, display: 'grid', placeItems: 'center', background: 'rgba(255,177,27,.12)', color: 'var(--amber)', marginBottom: 16 }}>
                  {user ? <ShieldCheck size={22} /> : <Lock size={22} />}
                </div>
                <h2 style={{ color: 'var(--ink)', fontSize: 22, margin: '0 0 10px', letterSpacing: '-.03em' }}>{file.title}</h2>
                <p style={{ color: 'var(--ink-3)', lineHeight: 1.65, marginBottom: 14 }}>{file.desc}</p>
                <div style={{ marginBottom: 18, padding: '10px 12px', borderRadius: 12, background: 'rgba(255,255,255,.035)', border: '1px solid rgba(255,255,255,.07)', color: 'var(--ink-4)', fontSize: 12, lineHeight: 1.55 }}>
                  <div style={{ wordBreak: 'break-all', fontFamily: 'var(--font-mono)' }}>{file.fileName}</div>
                  <div style={{ marginTop: 6, color: 'var(--ink-3)' }}>Sürüm: {file.version} · Boyut: {file.size} · Tarih: {file.updatedAt}</div>
                </div>
                <button onClick={() => downloadFile(file)} disabled={loadingKey === file.key} style={{ width: '100%', minHeight: 48, marginTop: 'auto', borderRadius: 15, border: '1px solid rgba(255,177,27,.22)', background: user ? 'linear-gradient(180deg, #ffd47a, #ffb11b)' : 'rgba(255,255,255,.05)', color: user ? '#090d15' : 'var(--ink-3)', fontWeight: 900, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 9 }}>
                  {user ? <Download size={17} /> : <Lock size={17} />}
                  {loadingKey === file.key ? 'Link hazırlanıyor...' : user ? 'İndir' : 'Üye girişi gerekli'}
                </button>
              </article>
            ))}
          </div>
        </section>

        <div id="destek" style={{ marginTop: 30, border: '1px solid rgba(255,177,27,.16)', borderRadius: 22, padding: 22, background: 'linear-gradient(135deg, rgba(255,177,27,.09), rgba(255,255,255,.03))' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <HeartHandshake size={22} color="var(--amber)" />
            <h2 style={{ margin: 0, color: 'var(--ink)', fontSize: 22 }}>Tooldur’u destekle</h2>
          </div>
          <p style={{ color: 'var(--ink-3)', lineHeight: 1.65, margin: '0 0 16px' }}>TooldurCAD, ücretsiz mühendislik araçları ve proje yönetimi özellikleri bağımsız olarak geliştiriliyor. Gönüllü destekler yeni araçların ve güncellemelerin devamına katkı sağlar.</p>
          <Link href="/bizi-destekle" style={{ minHeight: 44, padding: '0 16px', borderRadius: 14, display: 'inline-flex', alignItems: 'center', gap: 9, background: 'linear-gradient(180deg, #ffd47a, #ffb11b)', color: '#090d15', textDecoration: 'none', fontWeight: 900 }}>
            Bizi Destekle <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      <style jsx>{`
        @media (max-width: 860px) {
          .tdcad-hero-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </main>
  );
}
