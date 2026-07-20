import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'KVKK Başvuru Formu',
  description: 'Tooldur KVKK ilgili kişi başvuru formu. Kişisel veri erişim, düzeltme, silme ve itiraz talepleri için başvuru bilgileri.',
  alternates: { canonical: 'https://www.tooldur.com/kvkk-basvuru-formu' },
};

const S = {
  page: { minHeight: '100vh', background: 'var(--bg)' } as React.CSSProperties,
  card: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '28px 32px', marginBottom: 14 } as React.CSSProperties,
  h2: { fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', color: 'var(--amber)', marginBottom: 16, textTransform: 'uppercase' as const },
  p: { fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.9, margin: '0 0 12px' },
  li: { fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.9, marginBottom: 6 },
  ul: { paddingLeft: 20, margin: '8px 0 12px', listStyleType: 'disc' as const },
};

export default function KvkkBasvuruFormuPage() {
  return (
    <div style={S.page}>
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '48px 16px 80px' }}>
        <div style={{ marginBottom: 44, paddingBottom: 24, borderBottom: '1px solid var(--border)' }}>
          <div className="section-label" style={{ marginBottom: 14 }}>KVKK Başvuru</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px, 4vw, 38px)', color: 'var(--ink)', marginBottom: 10 }}>KVKK İlgili Kişi Başvuru Formu</h1>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-4)', letterSpacing: '0.1em' }}>SON GÜNCELLEME: NİSAN 2026</p>
        </div>

        <div style={S.card}>
          <h2 style={S.h2}>// Başvuru Adresi</h2>
          <p style={S.p}>KVKK madde 11 kapsamındaki taleplerinizi aşağıdaki e-posta adresine iletebilirsiniz:</p>
          <p style={{ ...S.p, fontFamily: 'var(--font-mono)', color: 'var(--amber)', fontWeight: 700 }}>tooldur@gmail.com</p>
          <p style={S.p}>Konu satırına <strong style={{ color: 'var(--ink)' }}>“KVKK Başvuru Talebi”</strong> yazmanız sürecin daha hızlı ilerlemesini sağlar.</p>
        </div>

        <div style={S.card}>
          <h2 style={S.h2}>// Başvuruda Bulunması Gereken Bilgiler</h2>
          <ul style={S.ul}>
            <li style={S.li}>Ad ve soyad</li>
            <li style={S.li}>Tooldur hesabınızda kullandığınız e-posta adresi</li>
            <li style={S.li}>Size dönüş yapılmasını istediğiniz e-posta adresi</li>
            <li style={S.li}>Talebinizin açık açıklaması</li>
            <li style={S.li}>Talebin hangi veri veya işlemle ilgili olduğu</li>
            <li style={S.li}>Kimliğinizi doğrulamaya yarayacak makul bilgiler</li>
          </ul>
          <p style={S.p}>Güvenliğiniz için gereğinden fazla kimlik belgesi, özel nitelikli kişisel veri veya hassas bilgi göndermeyiniz. Gerekirse ek doğrulama ayrıca talep edilir.</p>
        </div>

        <div style={S.card}>
          <h2 style={S.h2}>// Talep Türleri</h2>
          <ul style={S.ul}>
            <li style={S.li}>Kişisel verilerimin işlenip işlenmediğini öğrenmek istiyorum.</li>
            <li style={S.li}>İşlenen kişisel verilerim hakkında bilgi istiyorum.</li>
            <li style={S.li}>Eksik veya yanlış kişisel verilerimin düzeltilmesini istiyorum.</li>
            <li style={S.li}>Kişisel verilerimin silinmesini veya yok edilmesini istiyorum.</li>
            <li style={S.li}>Verilerimin aktarıldığı üçüncü kişiler hakkında bilgi istiyorum.</li>
            <li style={S.li}>Otomatik işlemeye dayalı bir sonuca itiraz ediyorum.</li>
            <li style={S.li}>Ticari/ürün bilgilendirme iznimin geri alınmasını istiyorum.</li>
          </ul>
        </div>

        <div style={S.card}>
          <h2 style={S.h2}>// Örnek E-posta Metni</h2>
          <div style={{ background: 'var(--bg-muted)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
            <p style={{ ...S.p, fontFamily: 'var(--font-mono)', whiteSpace: 'pre-line', margin: 0 }}>{`Konu: KVKK Başvuru Talebi

Ad Soyad:
Tooldur hesap e-postası:
Dönüş e-postası:
Talep türü:
Talebin açıklaması:

6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamındaki talebimin değerlendirilmesini rica ederim.`}</p>
          </div>
        </div>

        <div style={S.card}>
          <h2 style={S.h2}>// Yanıt Süresi</h2>
          <p style={S.p}>Başvurular, talebin niteliğine göre en geç 30 gün içinde ücretsiz olarak sonuçlandırılır. Talebin ayrıca bir maliyet gerektirmesi halinde yalnızca mevzuatta öngörülen ücret talep edilebilir.</p>
          <p style={S.p}>Daha fazla bilgi için <Link href="/gizlilik" style={{ color: 'var(--amber)', fontWeight: 700 }}>Gizlilik Politikası ve KVKK Aydınlatma Metni</Link> sayfasını inceleyebilirsiniz.</p>
        </div>
      </div>
    </div>
  );
}
