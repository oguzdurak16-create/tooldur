import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Çerez Politikası',
  description: 'Tooldur çerez politikası. Zorunlu, analitik ve reklam çerezleri; açık rıza, reddetme ve tercih yönetimi bilgileri.',
  alternates: { canonical: 'https://www.tooldur.com/cerez-politikasi' },
};

const S = {
  page: { minHeight: '100vh', background: 'var(--bg)' } as React.CSSProperties,
  card: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '28px 32px', marginBottom: 14 } as React.CSSProperties,
  h2: { fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', color: 'var(--amber)', marginBottom: 16, textTransform: 'uppercase' as const },
  p: { fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.9, margin: '0 0 12px' },
  li: { fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.9, marginBottom: 6 },
  ul: { paddingLeft: 20, margin: '8px 0 12px', listStyleType: 'disc' as const },
};

const cerezler = [
  { ad: 'tooldur_cookie_consent', kategori: 'Zorunlu', saglayici: 'Tooldur', amac: 'Çerez tercihlerinin saklanması', sure: 'Kalıcı / tercih değiştirilene kadar', riza: 'Gerekmez' },
  { ad: 'supabase-auth-token / oturum çerezleri', kategori: 'Zorunlu', saglayici: 'Supabase / Tooldur', amac: 'Kullanıcı oturumu ve güvenlik', sure: 'Oturum veya hesap açık kaldığı süre', riza: 'Gerekmez' },
  { ad: '_ga, _ga_*', kategori: 'Analitik', saglayici: 'Google Analytics', amac: 'Anonimleştirilmiş ziyaret ve performans ölçümü', sure: 'Google ayarlarına göre, genellikle 2 yıla kadar', riza: 'Açık rıza gerekir' },
  { ad: '_gid, _gat', kategori: 'Analitik', saglayici: 'Google Analytics', amac: 'Ziyaret istatistikleri ve hız sınırlama', sure: 'Kısa süreli', riza: 'Açık rıza gerekir' },
  { ad: '__gads, __gpi, IDE, DSID ve benzeri', kategori: 'Reklam', saglayici: 'Google AdSense / Google Ads', amac: 'Reklam gösterimi, reklam ölçümü ve kişiselleştirme', sure: 'Google ayarlarına göre değişir', riza: 'Açık rıza gerekir' },
];

export default function CerezPolitikasiPage() {
  return (
    <div style={S.page}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 16px 80px' }}>
        <div style={{ marginBottom: 44, paddingBottom: 24, borderBottom: '1px solid var(--border)' }}>
          <div className="section-label" style={{ marginBottom: 14 }}>Çerez Politikası</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px, 4vw, 38px)', color: 'var(--ink)', marginBottom: 10 }}>Çerez Politikası</h1>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-4)', letterSpacing: '0.1em' }}>SON GÜNCELLEME: MAYIS 2026</p>
        </div>

        <div style={S.card}>
          <h2 style={S.h2}>// Çerez Nedir?</h2>
          <p style={S.p}>Çerezler, web siteleri tarafından tarayıcınıza kaydedilen küçük veri dosyalarıdır. Tooldur'da çerezler; oturum yönetimi, güvenlik, tercihlerin saklanması ve izin vermeniz halinde analitik/reklam ölçümü için kullanılır.</p>
        </div>

        <div style={S.card}>
          <h2 style={S.h2}>// Rıza Yaklaşımı</h2>
          <ul style={S.ul}>
            <li style={S.li}>Zorunlu çerezler sitenin çalışması için gereklidir ve kapatılamaz.</li>
            <li style={S.li}>Google Analytics çerezleri açık rıza vermeden yüklenmez.</li>
            <li style={S.li}>Google AdSense / reklam çerezleri açık rıza vermeden yüklenmez.</li>
            <li style={S.li}>Çerez panelinde “Tümünü Kabul Et”, “Tümünü Reddet” ve “Tercihleri Yönet” seçenekleri aynı seviyede sunulur.</li>
            <li style={S.li}>Zorunlu olmayan çerezlere rıza vermek siteyi kullanmanın ön şartı değildir; tercihlerinizi footer alanındaki “Çerez Tercihlerimi Yönet” düğmesinden sonradan değiştirebilirsiniz.</li>
          </ul>
        </div>

        <div style={S.card}>
          <h2 style={S.h2}>// Kullanılan Çerezler</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ textAlign: 'left', padding: '10px 8px', color: 'var(--ink)' }}>Çerez</th>
                  <th style={{ textAlign: 'left', padding: '10px 8px', color: 'var(--ink)' }}>Kategori</th>
                  <th style={{ textAlign: 'left', padding: '10px 8px', color: 'var(--ink)' }}>Sağlayıcı</th>
                  <th style={{ textAlign: 'left', padding: '10px 8px', color: 'var(--ink)' }}>Amaç</th>
                  <th style={{ textAlign: 'left', padding: '10px 8px', color: 'var(--ink)' }}>Süre</th>
                  <th style={{ textAlign: 'left', padding: '10px 8px', color: 'var(--ink)' }}>Rıza</th>
                </tr>
              </thead>
              <tbody>
                {cerezler.map((c) => (
                  <tr key={c.ad} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '10px 8px', color: 'var(--ink-2)', fontFamily: 'var(--font-mono)' }}>{c.ad}</td>
                    <td style={{ padding: '10px 8px', color: 'var(--ink-2)' }}>{c.kategori}</td>
                    <td style={{ padding: '10px 8px', color: 'var(--ink-2)' }}>{c.saglayici}</td>
                    <td style={{ padding: '10px 8px', color: 'var(--ink-2)' }}>{c.amac}</td>
                    <td style={{ padding: '10px 8px', color: 'var(--ink-2)' }}>{c.sure}</td>
                    <td style={{ padding: '10px 8px', color: 'var(--ink-2)' }}>{c.riza}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div style={S.card}>
          <h2 style={S.h2}>// Tercihleri Değiştirme</h2>
          <p style={S.p}>Çerez tercihlerinizi her zaman sitenin footer alanındaki “Çerez Tercihlerimi Yönet” düğmesiyle değiştirebilirsiniz. Zorunlu olmayan çerezleri reddetmeniz, hesaplama araçlarının ve temel site işlevlerinin çalışmasını engellemez.</p>
          <p style={S.p}>Ayrıca tarayıcı ayarlarınızdan çerezleri silebilir veya engelleyebilirsiniz:</p>
          <ul style={S.ul}>
            <li style={S.li}>Chrome: Ayarlar → Gizlilik ve güvenlik → Çerezler ve diğer site verileri</li>
            <li style={S.li}>Firefox: Ayarlar → Gizlilik ve Güvenlik → Çerezler ve Site Verileri</li>
            <li style={S.li}>Safari: Tercihler → Gizlilik → Web sitesi verilerini yönet</li>
            <li style={S.li}>Edge: Ayarlar → Çerezler ve site izinleri</li>
          </ul>
        </div>

        <div style={S.card}>
          <h2 style={S.h2}>// Üçüncü Taraf Servisler</h2>
          <p style={S.p}>Google Analytics ve Google AdSense kullanımı, yalnızca ilgili kategoriye açık rıza vermeniz halinde etkinleşir. Bu servisler Google'ın kendi gizlilik ve çerez politikalarına da tabidir. Google ayarlarınız üzerinden reklam kişiselleştirmeyi ayrıca yönetebilirsiniz.</p>
          <ul style={S.ul}>
            <li style={S.li}>Google Gizlilik Politikası: policies.google.com/privacy</li>
            <li style={S.li}>Google Analytics devre dışı bırakma eklentisi: tools.google.com/dlpage/gaoptout</li>
            <li style={S.li}>Google Reklam Ayarları: adssettings.google.com</li>
          </ul>
        </div>

        <div style={S.card}>
          <h2 style={S.h2}>// İletişim</h2>
          <p style={S.p}>Çerez politikasıyla ilgili sorularınız için:</p>
          <p style={{ ...S.p, fontFamily: 'var(--font-mono)', color: 'var(--amber)', fontWeight: 700 }}>tooldur@gmail.com</p>
        </div>
      </div>
    </div>
  );
}
