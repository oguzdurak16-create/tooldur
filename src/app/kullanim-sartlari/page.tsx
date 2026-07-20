import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kullanım Şartları',
  description: 'Tooldur kullanım şartları ve koşulları. Platformumuzu kullanmadan önce lütfen okuyun.',
  alternates: { canonical: 'https://www.tooldur.com/kullanim-sartlari' },
};

const S = {
  page: { minHeight: '100vh', background: 'var(--bg)' } as React.CSSProperties,
  card: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '28px 32px', marginBottom: 14 } as React.CSSProperties,
  h2: { fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', color: 'var(--amber)', marginBottom: 16, textTransform: 'uppercase' as const },
  p: { fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.9, margin: '0 0 12px' },
  li: { fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.9, marginBottom: 6 },
  ul: { paddingLeft: 20, margin: '8px 0 12px', listStyleType: 'disc' as const },
};

export default function KullanimSartlariPage() {
  return (
    <div style={S.page}>
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '48px 16px 80px' }}>

        <div style={{ marginBottom: 44, paddingBottom: 24, borderBottom: '1px solid var(--border)' }}>
          <div className="section-label" style={{ marginBottom: 14 }}>Kullanım Şartları</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px, 4vw, 38px)', color: 'var(--ink)', marginBottom: 10 }}>Kullanım Şartları</h1>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-4)', letterSpacing: '0.1em' }}>SON GÜNCELLEME: MART 2026</p>
        </div>

        <div style={S.card}>
          <h2 style={S.h2}>// 1. Kabul ve Bağlayıcılık</h2>
          <p style={S.p}>Tooldur.com web sitesini ("Platform") kullanarak bu Kullanım Şartları'nı okuduğunuzu, anladığınızı ve kabul ettiğinizi beyan edersiniz. Bu şartları kabul etmiyorsanız Platformu kullanmayınız.</p>
          <p style={S.p}>Kayıt oluştururken Kullanım Şartları'nı kabul etmeniz gerekir. KVKK Aydınlatma Metni ayrıca okunur; açık rıza gerektiren işlemler için ayrı tercih alınır.</p>
        </div>

        <div style={S.card}>
          <h2 style={S.h2}>// 2. Hizmet Tanımı</h2>
          <p style={S.p}>Tooldur, mühendislik hesaplama araçları, birim çeviriciler, teknik çizim modülleri, malzeme kütüphanesi, proje yönetimi panosu ve mühendis defteri sunan ücretsiz bir online platformdur.</p>
          <p style={S.p}>Platform üzerindeki tüm hesaplama araçları <strong style={{ color: 'var(--amber)' }}>bilgi ve referans amaçlıdır.</strong> Kritik mühendislik kararlarında, yapısal tasarımlarda veya güvenlik gerektiren uygulamalarda sonuçların bağımsız bir profesyonel tarafından doğrulanması zorunludur.</p>
        </div>

        <div style={S.card}>
          <h2 style={S.h2}>// 3. Hesap Oluşturma</h2>
          <ul style={S.ul}>
            <li style={S.li}>Hesap oluşturmak için geçerli bir e-posta adresi ve en az 6 karakterlik bir şifre gereklidir</li>
            <li style={S.li}>Hesabınızın güvenliğinden siz sorumlusunuz; şifrenizi üçüncü kişilerle paylaşmayınız</li>
            <li style={S.li}>Hesabınız üzerinden gerçekleştirilen tüm işlemlerden siz sorumlusunuz</li>
            <li style={S.li}>Yanlış, yanıltıcı veya başkasına ait bilgilerle hesap oluşturmak yasaktır</li>
            <li style={S.li}>Tooldur, şüpheli hesapları önceden bildirimde bulunmaksızın askıya alabilir veya kapatabilir</li>
          </ul>
        </div>

        <div style={S.card}>
          <h2 style={S.h2}>// 4. Kullanım Kuralları</h2>
          <p style={S.p}>Platform yalnızca yasal amaçlar için kullanılabilir. Aşağıdaki eylemler kesinlikle yasaktır:</p>
          <ul style={S.ul}>
            <li style={S.li}>Platforma zarar verecek, performansını düşürecek veya işleyişini engelleyecek her türlü eylem</li>
            <li style={S.li}>Otomatik veri toplama (scraping), bot kullanımı veya API'ye yetkisiz erişim</li>
            <li style={S.li}>Platformun kaynak kodunun izinsiz kopyalanması, derlenmesi veya tersine mühendisliği</li>
            <li style={S.li}>Başka kullanıcıların verilerine yetkisiz erişim girişimi</li>
            <li style={S.li}>Platformun herhangi bir bileşeninin ticari amaçla yeniden dağıtılması</li>
            <li style={S.li}>Zararlı yazılım (malware, virus vb.) yükleme veya dağıtma girişimi</li>
          </ul>
          <p style={S.p}>İhlaller erişim engeliyle ve gerekli durumlarda yasal işlemle sonuçlanabilir.</p>
        </div>

        <div style={S.card}>
          <h2 style={S.h2}>// 5. Fikri Mülkiyet</h2>
          <ul style={S.ul}>
            <li style={S.li}>Platform içeriği, tasarım, logo, kaynak kodu, hesaplama formülleri ve algoritmalar Tooldur'un fikri mülkiyetindedir</li>
            <li style={S.li}>Hesaplama sonuçlarınız ve yüklediğiniz/oluşturduğunuz içerikler (notlar, projeler) size aittir</li>
            <li style={S.li}>Platformun herhangi bir bölümünün Tooldur'un yazılı izni olmaksızın kopyalanması, çoğaltılması veya ticari amaçla kullanılması yasaktır</li>
            <li style={S.li}>Platformda kullanılan üçüncü taraf açık kaynak kütüphaneleri kendi lisanslarına tabidir</li>
          </ul>
        </div>

        <div style={S.card}>
          <h2 style={S.h2}>// 6. Sorumluluk Reddi ve Garanti Sınırlaması</h2>
          <p style={{ ...S.p, background: 'var(--red-light)', padding: '14px 18px', borderRadius: 10, border: '1px solid rgba(239,68,68,0.15)' }}>
            <strong style={{ color: 'var(--red)' }}>ÖNEMLİ UYARI:</strong> Hesaplama sonuçları referans niteliğindedir ve "olduğu gibi" sunulmaktadır. Tooldur, hesaplama hatalarından, formül güncelliklerinden veya bu sonuçlara dayanılarak alınan mühendislik kararlarından doğan doğrudan ya da dolaylı zararlardan sorumlu tutulamaz.
          </p>
          <ul style={S.ul}>
            <li style={S.li}>Platform kesintisiz veya hatasız çalışacağına dair garanti vermez</li>
            <li style={S.li}>Bakım, güncelleme veya teknik sorunlar nedeniyle geçici erişim kesintileri yaşanabilir</li>
            <li style={S.li}>Ücretsiz hizmet olması sebebiyle herhangi bir hizmet seviyesi taahhüdü (SLA) yoktur</li>
            <li style={S.li}>Tooldur, platformda bağlantısı verilen üçüncü taraf web sitelerinin içeriğinden sorumlu değildir</li>
          </ul>
        </div>

        <div style={S.card}>
          <h2 style={S.h2}>// 7. Proje Yönetimi Hizmeti</h2>
          <ul style={S.ul}>
            <li style={S.li}>Proje yönetimi modülündeki veriler (projeler, görevler, yorumlar, ekler) Supabase altyapısında saklanır</li>
            <li style={S.li}>Yüklenen dosyaların içeriğinden kullanıcı sorumludur; yasadışı, telif hakkı ihlali içeren veya zararlı dosya yüklenmesi yasaktır</li>
            <li style={S.li}>Takım üyelerine davet gönderilmesi halinde, davet edilen kişinin e-posta adresi proje kapsamında saklanır</li>
            <li style={S.li}>Tooldur, proje verilerinin yedeklenmesini garanti etmez; önemli verilerinizi ayrıca yedeklemenizi öneriyoruz</li>
          </ul>
        </div>

        <div style={S.card}>
          <h2 style={S.h2}>// 8. Hesap Silme</h2>
          <p style={S.p}>Hesabınızı profil ayarlarınızda sunulan hesap silme özelliği varsa buradan, aksi durumda tooldur@gmail.com adresine e-posta göndererek sildirme talebinde bulunabilirsiniz. Hesap silindiğinde:</p>
          <ul style={S.ul}>
            <li style={S.li}>Kişisel verileriniz 30 gün içinde kalıcı olarak silinir</li>
            <li style={S.li}>Hesaplama geçmişiniz ve notlarınız geri dönüşü olmaksızın kaldırılır</li>
            <li style={S.li}>Yasal yükümlülükler gereği belirli loglar saklama süresi sonuna kadar tutulabilir</li>
          </ul>
        </div>

        <div style={S.card}>
          <h2 style={S.h2}>// 9. Değişiklikler</h2>
          <p style={S.p}>Bu Kullanım Şartları gerektiğinde önceden bildirimde bulunularak güncellenebilir. Önemli değişiklikler kayıtlı kullanıcılara e-posta yoluyla bildirilir. Güncellenmiş şartlarla platformu kullanmaya devam etmeniz, değişiklikleri kabul ettiğiniz anlamına gelir.</p>
        </div>

        <div style={S.card}>
          <h2 style={S.h2}>// 10. Uygulanacak Hukuk ve Yetkili Mahkeme</h2>
          <p style={S.p}>Bu Kullanım Şartları Türkiye Cumhuriyeti hukukuna tabidir. Taraflar arasında çıkabilecek uyuşmazlıklarda Türkiye Cumhuriyeti mahkemeleri ve icra daireleri yetkilidir.</p>
        </div>

        <div style={S.card}>
          <h2 style={S.h2}>// 11. İletişim</h2>
          <p style={S.p}>Kullanım şartlarımız hakkında soru ve talepleriniz için:</p>
          <p style={{ ...S.p, fontFamily: 'var(--font-mono)', color: 'var(--amber)', fontWeight: 600 }}>tooldur@gmail.com</p>
        </div>

      </div>
    </div>
  );
}
