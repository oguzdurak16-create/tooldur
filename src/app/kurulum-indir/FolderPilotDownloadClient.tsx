'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArchiveRestore,
  ArrowRight,
  DatabaseZap,
  Download,
  FolderCog,
  FolderSearch2,
  HardDrive,
  Layers3,
  Lock,
  MonitorUp,
  Network,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

const BUCKET = 'tooldur-cad';
const FILE_NAME = 'Tooldur-FolderPilot-v0.8.1.exe';
const VERSION = 'v0.8.1';

const FEATURES = [
  { icon: FolderSearch2, title: 'Explorer yerine kullan', text: 'Klasör gezme, sekmeler, favoriler, hızlı erişim, arama ve önizleme tek Windows penceresinde.' },
  { icon: FolderCog, title: 'Akıllı Düzenle', text: 'Eklediğin klasörleri tüm alt klasörleriyle tarar ve dosyaları türlerine göre Library içinde toplar.' },
  { icon: DatabaseZap, title: 'Hızlı indeks', text: 'Yerel disk, mapped sürücü ve erişilebilir ortak klasörleri indeksleyip tek aramadan bulur.' },
  { icon: Network, title: 'Ağ klasörleri', text: 'UNC / mapped ortak klasörleri destekler; geçici ağ hatalarında eski kayıtları yanlışlıkla silmez.' },
  { icon: ShieldCheck, title: 'Korunan alanlar', text: 'PDM gibi kritik klasörlerde yalnız arama ve açmaya izin verip taşıma/silme işlemlerini engeller.' },
  { icon: RefreshCw, title: 'Gerçek yenileme', text: 'Windows üzerinden silinen dosyaları hayalet kayıt olarak bırakmaz; indeks ve görünümü uzlaştırır.' },
];

export default function FolderPilotDownloadClient() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
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

  const download = async () => {
    setError('');
    if (!user) {
      window.location.href = `/giris?redirect=${encodeURIComponent('/kurulum-indir#folderpilot')}`;
      return;
    }

    setLoading(true);
    try {
      const { data, error: signError } = await supabase.storage
        .from(BUCKET)
        .createSignedUrl(FILE_NAME, 120, { download: FILE_NAME });

      if (signError || !data?.signedUrl) {
        throw signError || new Error('FolderPilot indirme bağlantısı oluşturulamadı.');
      }

      window.location.href = data.signedUrl;
    } catch (e: any) {
      setError(e?.message || 'İndirme başlatılamadı. Kurulum dosyası Storage üzerinde bulunamıyor olabilir.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="folderpilot" style={{ padding: '56px 16px 18px', background: 'var(--bg)' }}>
      <div className="td-container" style={{ maxWidth: 1180 }}>
        <div style={{
          position: 'relative',
          overflow: 'hidden',
          border: '1px solid var(--border-mid)',
          borderRadius: 28,
          padding: 'clamp(22px, 4vw, 42px)',
          background: 'linear-gradient(145deg, rgba(255,177,27,.075), rgba(13,21,33,.96) 35%, rgba(7,11,18,.98))',
          boxShadow: 'var(--shadow)',
        }}>
          <div aria-hidden="true" style={{ position: 'absolute', width: 360, height: 360, right: -120, top: -170, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,177,27,.13), transparent 68%)' }} />

          <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'minmax(0, 1.05fr) minmax(320px, .95fr)', gap: 28, alignItems: 'center' }} className="folderpilot-hero-grid">
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 12px', borderRadius: 999, background: 'var(--accent-soft)', border: '1px solid rgba(255,177,27,.22)', color: 'var(--amber)', fontSize: 11, fontWeight: 900, letterSpacing: '.08em', textTransform: 'uppercase' }}>
                <Sparkles size={15} /> Tooldur masaüstü uygulaması · {VERSION}
              </div>

              <h1 style={{ margin: '15px 0 12px', color: 'var(--ink)', fontSize: 'clamp(35px, 5vw, 60px)', lineHeight: 1, letterSpacing: '-.055em' }}>
                Tooldur FolderPilot
              </h1>
              <p style={{ maxWidth: 720, margin: 0, color: 'var(--ink-3)', fontSize: 17, lineHeight: 1.75 }}>
                Windows Gezgini yerine günlük kullanıma odaklanan akıllı dosya çalışma alanı. Dosyalarını bulur, önizler, indeksler; seçtiğin klasörlerdeki dağınıklığı Tooldur Library düzenine toplar.
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9, marginTop: 20 }}>
                {['Windows 10/11', '64-bit', 'Portable tek EXE', 'Ücretsiz'].map((tag) => (
                  <span key={tag} style={{ padding: '7px 10px', borderRadius: 10, border: '1px solid var(--border)', background: 'rgba(255,255,255,.025)', color: 'var(--ink-2)', fontSize: 12, fontWeight: 700 }}>{tag}</span>
                ))}
              </div>

              {error && (
                <div style={{ marginTop: 16, padding: 12, borderRadius: 12, border: '1px solid rgba(251,113,133,.28)', background: 'rgba(251,113,133,.08)', color: '#fecdd3', fontSize: 13, lineHeight: 1.5 }}>
                  {error}
                </div>
              )}

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 22 }}>
                <button onClick={download} disabled={loading} style={{ minHeight: 48, padding: '0 20px', border: 0, borderRadius: 14, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 9, background: user ? 'linear-gradient(180deg, #ffd47a, #ffb11b)' : 'rgba(255,255,255,.06)', color: user ? '#05070d' : 'var(--ink-3)', fontWeight: 900, cursor: loading ? 'wait' : 'pointer', boxShadow: user ? '0 4px 24px rgba(255,177,27,.22)' : 'none' }}>
                  {user ? <Download size={18} /> : <Lock size={18} />}
                  {loading ? 'Link hazırlanıyor...' : user ? 'FolderPilot’u indir' : 'Üye girişi ile indir'}
                </button>
                {!user && (
                  <Link href={`/giris?redirect=${encodeURIComponent('/kurulum-indir#folderpilot')}`} style={{ minHeight: 48, padding: '0 18px', borderRadius: 14, display: 'inline-flex', alignItems: 'center', gap: 8, border: '1px solid var(--border-mid)', color: 'var(--ink-2)', textDecoration: 'none', fontWeight: 800 }}>
                    Giriş Yap / Üye Ol <ArrowRight size={17} />
                  </Link>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, color: 'var(--ink-4)', fontSize: 11.5 }}>
                <ShieldCheck size={15} color="var(--amber)" /> İndirme bağlantısı üyelik doğrulamasından sonra 120 saniyelik özel link olarak oluşturulur.
              </div>
            </div>

            <div style={{ border: '1px solid var(--border-mid)', borderRadius: 22, padding: 12, background: '#080e17', boxShadow: '0 24px 58px rgba(0,0,0,.3)' }}>
              <div style={{ height: 34, display: 'flex', alignItems: 'center', gap: 7, padding: '0 4px 8px', color: 'var(--ink-4)', fontSize: 10 }}>
                <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#fb7185' }} />
                <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#fbbf24' }} />
                <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#6ee7b7' }} />
                <strong style={{ marginLeft: 6, color: 'var(--ink-3)' }}>Tooldur FolderPilot</strong>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '92px 1fr 128px', minHeight: 300, overflow: 'hidden', borderRadius: 15, border: '1px solid var(--border)' }}>
                <div style={{ background: '#080e17', borderRight: '1px solid var(--border)', padding: 10 }}>
                  {['Ana Sayfa', 'Hızlı Erişim', 'Library', 'Dosyalar', 'Favoriler'].map((x, i) => (
                    <div key={x} style={{ padding: '8px 7px', marginBottom: 4, borderRadius: 8, background: i === 3 ? 'rgba(255,177,27,.10)' : 'transparent', color: i === 3 ? 'var(--amber)' : 'var(--ink-4)', fontSize: 9.5, fontWeight: i === 3 ? 800 : 600 }}>{x}</div>
                  ))}
                </div>
                <div style={{ background: '#0a121e', padding: 12 }}>
                  <div style={{ height: 31, border: '1px solid var(--border)', borderRadius: 9, background: '#0d1521', marginBottom: 10 }} />
                  {[
                    ['CAD', '26M0150-analiz.step', 'Mühendislik'],
                    ['PDF', 'Teknik rapor.pdf', 'Belgeler'],
                    ['XLS', 'Sipariş özeti.xlsx', 'Tablolar'],
                    ['ZIP', 'Arşiv-2026.zip', 'Arşivler'],
                    ['IMG', 'proje-gorsel.png', 'Görseller'],
                  ].map(([badge, name, type]) => (
                    <div key={name} style={{ display: 'grid', gridTemplateColumns: '34px 1fr', gap: 8, alignItems: 'center', padding: '8px 4px', borderBottom: '1px solid var(--border)' }}>
                      <span style={{ width: 31, height: 31, borderRadius: 8, display: 'grid', placeItems: 'center', background: 'rgba(255,177,27,.08)', color: 'var(--amber)', fontSize: 8, fontWeight: 900 }}>{badge}</span>
                      <span style={{ minWidth: 0 }}><b style={{ display: 'block', color: 'var(--ink-2)', fontSize: 9.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</b><small style={{ color: 'var(--ink-4)', fontSize: 8 }}>{type}</small></span>
                    </div>
                  ))}
                </div>
                <div style={{ background: '#0d1521', borderLeft: '1px solid var(--border)', padding: 12 }}>
                  <div style={{ height: 112, borderRadius: 10, background: 'linear-gradient(145deg, rgba(255,177,27,.12), rgba(56,189,248,.06))', display: 'grid', placeItems: 'center', color: 'var(--amber)' }}><HardDrive size={34} /></div>
                  <strong style={{ display: 'block', marginTop: 12, color: 'var(--ink)', fontSize: 10 }}>Dosya önizleme</strong>
                  <span style={{ display: 'block', marginTop: 5, color: 'var(--ink-4)', fontSize: 8.5, lineHeight: 1.5 }}>Dosya bilgisi, konum, boyut ve hızlı işlemler tek panelde.</span>
                  <div style={{ height: 7, borderRadius: 99, background: '#111c2b', marginTop: 16, overflow: 'hidden' }}><div style={{ width: '68%', height: '100%', background: 'var(--amber)' }} /></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(245px, 1fr))', gap: 12, marginTop: 18 }}>
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <article key={title} style={{ border: '1px solid var(--border)', borderRadius: 18, padding: 17, background: 'var(--bg-card)' }}>
              <div style={{ width: 38, height: 38, borderRadius: 12, display: 'grid', placeItems: 'center', background: 'var(--accent-soft)', color: 'var(--amber)' }}><Icon size={19} /></div>
              <strong style={{ display: 'block', marginTop: 11, color: 'var(--ink)', fontSize: 14 }}>{title}</strong>
              <span style={{ display: 'block', marginTop: 5, color: 'var(--ink-3)', fontSize: 12.5, lineHeight: 1.55 }}>{text}</span>
            </article>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 12, marginTop: 18 }}>
          {[
            { icon: Layers3, title: 'Recursive tarama', text: 'Eklediğin klasörün içindeki tüm erişilebilir alt dosyaları tarar.' },
            { icon: ArchiveRestore, title: 'Boş klasör temizliği', text: 'Düzenleme sonrası gerçekten boş kalan alt klasörleri güvenli şekilde kaldırır.' },
            { icon: MonitorUp, title: 'İşlem ilerleme ekranı', text: 'Tarama, taşıma, temizleme ve indeks aşamalarını yüzde ve dosya sayısıyla gösterir.' },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} style={{ display: 'flex', gap: 11, alignItems: 'flex-start', padding: 14, borderRadius: 16, border: '1px solid var(--border)', background: 'rgba(255,255,255,.02)' }}>
              <Icon size={18} color="var(--amber)" style={{ flex: '0 0 auto', marginTop: 2 }} />
              <span><b style={{ display: 'block', color: 'var(--ink-2)', fontSize: 12.5 }}>{title}</b><small style={{ display: 'block', marginTop: 3, color: 'var(--ink-4)', fontSize: 11.5, lineHeight: 1.5 }}>{text}</small></span>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 880px) {
          .folderpilot-hero-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
