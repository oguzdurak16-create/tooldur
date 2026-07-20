import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Gizlilik Politikası ve KVKK Aydınlatma Metni',
  description: 'Tooldur gizlilik politikası, KVKK aydınlatma metni, kişisel veri işleme amaçları, hukuki sebepler, yurt dışı aktarım ve başvuru hakları.',
  alternates: { canonical: 'https://www.tooldur.com/gizlilik' },
};

const S = {
  page: { minHeight: '100vh', background: 'var(--bg)' } as React.CSSProperties,
  card: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '28px 32px', marginBottom: 14 } as React.CSSProperties,
  h2: { fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', color: 'var(--amber)', marginBottom: 16, textTransform: 'uppercase' as const },
  p: { fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.9, margin: '0 0 12px' },
  li: { fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.9, marginBottom: 6 },
  ul: { paddingLeft: 20, margin: '8px 0 12px', listStyleType: 'disc' as const },
  strong: { color: 'var(--ink)' },
};

export default function GizlilikPage() {
  return (
    <div style={S.page}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 16px 80px' }}>
        <div style={{ marginBottom: 44, paddingBottom: 24, borderBottom: '1px solid var(--border)' }}>
          <div className="section-label" style={{ marginBottom: 14 }}>KVKK ve Gizlilik</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px, 4vw, 38px)', color: 'var(--ink)', marginBottom: 10 }}>Gizlilik Politikası ve KVKK Aydınlatma Metni</h1>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-4)', letterSpacing: '0.1em' }}>SON GÜNCELLEME: NİSAN 2026</p>
        </div>

        <div style={S.card}>
          <h2 style={S.h2}>// 1. Veri Sorumlusu</h2>
          <p style={S.p}>6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında, Tooldur.com üzerinden işlenen kişisel veriler bakımından veri sorumlusu aşağıda belirtilmiştir.</p>
          <p style={S.p}><strong style={S.strong}>Veri Sorumlusu:</strong> Oğuzhan Durak / Tooldur.com</p>
          <p style={S.p}><strong style={S.strong}>İletişim:</strong> tooldur@gmail.com</p>
          <p style={S.p}><strong style={S.strong}>Merkez:</strong> Bursa, Türkiye</p>
        </div>

        <div style={S.card}>
          <h2 style={S.h2}>// 2. İşlenen Kişisel Veri Kategorileri</h2>
          <ul style={S.ul}>
            <li style={S.li}><strong style={S.strong}>Kimlik ve iletişim verileri:</strong> Ad-soyad, e-posta adresi, isteğe bağlı profil bilgileri.</li>
            <li style={S.li}><strong style={S.strong}>Hesap ve güvenlik verileri:</strong> Kullanıcı kimliği, oturum kayıtları, şifre bilgisi yalnızca hash'lenmiş biçimde.</li>
            <li style={S.li}><strong style={S.strong}>Kullanım verileri:</strong> Hesaplama geçmişi, kaydedilen sonuçlar, notlar, proje/görev/yorum/ek dosya kayıtları.</li>
            <li style={S.li}><strong style={S.strong}>Takım ve davet verileri:</strong> Proje yönetiminde davet edilen kişilerin e-posta adresleri ve üyelik durumları.</li>
            <li style={S.li}><strong style={S.strong}>Teknik veriler:</strong> IP adresi, cihaz/tarayıcı bilgisi, hata kayıtları, güvenlik logları.</li>
            <li style={S.li}><strong style={S.strong}>Çerez verileri:</strong> Zorunlu çerezler ile kullanıcının açık rızasına bağlı analitik ve reklam çerezleri.</li>
          </ul>
          <p style={S.p}>Kayıt olmadan kullanılan hesaplama araçlarında hesap verisi oluşturulmaz; işlemler ağırlıklı olarak tarayıcı üzerinde çalışır.</p>
        </div>

        <div style={S.card}>
          <h2 style={S.h2}>// 3. İşleme Amaçları</h2>
          <ul style={S.ul}>
            <li style={S.li}>Hesap oluşturma, kimlik doğrulama ve oturum yönetimi.</li>
            <li style={S.li}>Hesaplama geçmişi, notlar ve proje yönetimi hizmetlerini sunma.</li>
            <li style={S.li}>Takım davetleri, görev atamaları, yorumlar ve dosya ekleri gibi işbirliği özelliklerini çalıştırma.</li>
            <li style={S.li}>Güvenliği sağlama, kötüye kullanımı önleme, hata ve performans sorunlarını giderme.</li>
            <li style={S.li}>Yasal talepleri ve mevzuattan kaynaklanan yükümlülükleri yerine getirme.</li>
            <li style={S.li}>Açık izin verilmesi halinde analitik ölçüm, reklam gösterimi ve ürün güncellemeleri hakkında bilgilendirme.</li>
          </ul>
        </div>

        <div style={S.card}>
          <h2 style={S.h2}>// 4. Hukuki Sebepler</h2>
          <p style={S.p}>Kişisel verileriniz KVKK madde 5 kapsamında aşağıdaki hukuki sebeplerle işlenir:</p>
          <ul style={S.ul}>
            <li style={S.li}><strong style={S.strong}>Sözleşmenin kurulması veya ifası:</strong> Üyelik, giriş, hesaplama geçmişi, notlar ve proje yönetimi hizmetleri.</li>
            <li style={S.li}><strong style={S.strong}>Meşru menfaat:</strong> Site güvenliği, kötüye kullanımın önlenmesi, hata kayıtları ve hizmet kalitesinin korunması.</li>
            <li style={S.li}><strong style={S.strong}>Yasal yükümlülük:</strong> Yetkili makam talepleri ve mevzuattan doğan saklama/cevaplama yükümlülükleri.</li>
            <li style={S.li}><strong style={S.strong}>Açık rıza:</strong> Zorunlu olmayan analitik çerezler, reklam çerezleri ve ticari/ürün bilgilendirme e-postaları.</li>
          </ul>
          <p style={S.p}>KVKK aydınlatma metnini okumanız, tek başına açık rıza verdiğiniz anlamına gelmez. Açık rıza gerektiren işlemler için ayrı tercih alınır.</p>
        </div>

        <div style={S.card}>
          <h2 style={S.h2}>// 5. Aktarımlar ve Hizmet Sağlayıcılar</h2>
          <p style={S.p}>Kişisel verileriniz satılmaz. Veriler yalnızca hizmetin sağlanması, güvenlik, barındırma, e-posta, analitik ve reklam altyapısı için sınırlı şekilde aşağıdaki alıcı gruplarıyla paylaşılabilir:</p>
          <ul style={S.ul}>
            <li style={S.li}><strong style={S.strong}>Supabase:</strong> Veritabanı, kimlik doğrulama ve dosya altyapısı.</li>
            <li style={S.li}><strong style={S.strong}>Vercel:</strong> Web barındırma, dağıtım ve teknik log altyapısı.</li>
            <li style={S.li}><strong style={S.strong}>Resend veya benzeri e-posta servisleri:</strong> Kayıt, şifre sıfırlama, bildirim ve işlemsel e-postalar.</li>
            <li style={S.li}><strong style={S.strong}>Google Analytics:</strong> Yalnızca izin verilirse anonimleştirilmiş ziyaret istatistikleri.</li>
            <li style={S.li}><strong style={S.strong}>Google AdSense / Google Ads:</strong> Yalnızca izin verilirse reklam gösterimi ve reklam ölçümü.</li>
          </ul>
          <p style={S.p}>Bu servislerin sunucuları Türkiye dışında bulunabileceğinden, hizmetin niteliğine göre yurt dışına veri aktarımı söz konusu olabilir. Zorunlu olmayan analitik ve reklam aktarımları çerez tercihlerinize bağlıdır. Hesap, güvenlik, barındırma ve e-posta altyapısı için aktarım, hizmetin kurulması/ifası ve güvenliği kapsamında sınırlı tutulur.</p>
        </div>

        <div style={S.card}>
          <h2 style={S.h2}>// 6. Çerezler</h2>
          <p style={S.p}>Zorunlu çerezler site güvenliği, oturum ve tercihlerin saklanması için kullanılır. Analitik ve reklam çerezleri açık rızanız olmadan yüklenmez. Tercihlerinizi çerez panelinden değiştirebilirsiniz.</p>
          <p style={S.p}><Link href="/cerez-politikasi" style={{ color: 'var(--amber)', fontWeight: 700 }}>Çerez Politikası'nı inceleyin</Link></p>
        </div>

        <div style={S.card}>
          <h2 style={S.h2}>// 7. Saklama Süreleri</h2>
          <ul style={S.ul}>
            <li style={S.li}>Hesap verileri: Hesap aktif olduğu sürece; silme talebinden sonra teknik/yasal gereklilikler hariç en geç 30 gün içinde silme/anonymize süreci başlatılır.</li>
            <li style={S.li}>Hesaplama geçmişi ve notlar: Hesap aktif olduğu sürece veya kullanıcı tarafından silinene kadar.</li>
            <li style={S.li}>Proje yönetimi verileri: Proje/üyelik aktif olduğu sürece veya yetkili kullanıcı tarafından silinene kadar.</li>
            <li style={S.li}>Davet kayıtları: Davet süreci ve güvenlik/uyuşmazlık takibi için makul süre boyunca.</li>
            <li style={S.li}>Sunucu ve güvenlik logları: Teknik güvenlik için makul süre, olağan durumda 90 güne kadar.</li>
            <li style={S.li}>Analitik verileri: Google Analytics ayarlarında belirlenen süre boyunca.</li>
          </ul>
        </div>

        <div style={S.card}>
          <h2 style={S.h2}>// 8. Haklarınız ve Başvuru</h2>
          <p style={S.p}>KVKK madde 11 kapsamında; verilerinizin işlenip işlenmediğini öğrenme, bilgi talep etme, amacına uygun kullanılıp kullanılmadığını öğrenme, aktarıldığı kişileri bilme, düzeltme, silme/yok etme, itiraz ve zararın giderilmesini talep etme haklarına sahipsiniz.</p>
          <p style={S.p}>Başvurularınızı <strong style={{ color: 'var(--amber)' }}>tooldur@gmail.com</strong> adresine iletebilir veya <Link href="/kvkk-basvuru-formu" style={{ color: 'var(--amber)', fontWeight: 700 }}>KVKK Başvuru Formu</Link> sayfasındaki bilgileri kullanabilirsiniz. Talebiniz, niteliğine göre en geç 30 gün içinde sonuçlandırılır.</p>
        </div>

        <div style={S.card}>
          <h2 style={S.h2}>// 9. Çocukların Gizliliği</h2>
          <p style={S.p}>Tooldur, 18 yaş altındaki kişilere yönelik değildir. 18 yaş altı bir kişiye ait veri işlendiğini düşünüyorsanız silme ve inceleme talebi için bizimle iletişime geçebilirsiniz.</p>
        </div>

        <div style={S.card}>
          <h2 style={S.h2}>// 10. Güncellemeler ve İletişim</h2>
          <p style={S.p}>Bu metin gerektiğinde güncellenebilir. Güncel sürüm her zaman bu sayfada yayımlanır.</p>
          <p style={{ ...S.p, fontFamily: 'var(--font-mono)', color: 'var(--amber)', fontWeight: 700 }}>tooldur@gmail.com</p>
        </div>
      </div>
    </div>
  );
}
