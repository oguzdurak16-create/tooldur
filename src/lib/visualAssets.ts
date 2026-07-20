export type SiteVisual = {
  src: string;
  og: string;
  alt: string;
  caption: string;
};

const topic = (name: string, alt: string, caption: string): SiteVisual => ({
  src: `/visuals/topics/${name}.webp`,
  og: `/visuals/topics/${name}-og.webp`,
  alt,
  caption,
});

export const siteVisuals = {
  home: topic('dashboard-workbench', 'Mühendislik hesaplama paneli, grafikler ve teknik araçlar', 'Mühendislik hesapları ve dijital çalışma alanı'),
  manufacturing: topic('tool-sheet-metal', 'Sac büküm kalıbı, büküm çizgisi ve ölçülendirme şeması', 'Sac metal, büküm ve imalat hesapları'),
  cad: topic('tool-software', 'Kod ve CAD iş akışını temsil eden temiz teknik arayüz', 'TooldurCAD ve dijital mühendislik araçları'),
  guides: topic('tool-general', 'Hesap makinesi, geometri ve teknik ölçülendirme araçları', 'Teknik bilgi, formüller ve uygulama rehberleri'),
  project: topic('project-management', 'Kanban kolonları, görev kartları ve tamamlanma işareti', 'Proje, görev, termin ve ekip yönetimi'),
  dashboard: topic('dashboard-workbench', 'Mühendislik paneli, hesaplama grafiği ve modül kartları', 'Mühendislik paneli ve kişisel çalışma alanı'),
} satisfies Record<string, SiteVisual>;

const categoryVisuals: Record<string, SiteVisual> = {
  makine: topic('category-makine', 'Dişli, rulman ve cıvata teknik illüstrasyonu', 'Makine, mekanik ve imalat hesapları'),
  cevirici: topic('category-cevirici', 'Karşılıklı dönüşüm okları ve ölçüm hesap makinesi', 'Hızlı ve doğru birim dönüşümleri'),
  elektrik: topic('category-elektrik', 'Elektrik devresi, kablo kesiti ve ölçülendirme', 'Elektrik ve elektronik hesapları'),
  insaat: topic('category-insaat', 'Yapı, betonarme kesit ve teknik ölçüler', 'İnşaat, yapı ve metraj hesapları'),
  endustri: topic('category-endustri', 'Fabrika, dişli ve üretim verimliliği göstergesi', 'Endüstri ve üretim verimliliği'),
  kimya: topic('category-kimya', 'Farklı çözeltiler içeren laboratuvar balonları', 'Kimya, çözelti ve proses hesapları'),
  cevre: topic('category-cevre', 'Güneş paneli, güneş ve sürdürülebilirlik yaprağı', 'Çevre, enerji ve sürdürülebilirlik'),
  yazilim: topic('category-yazilim', 'Kod penceresi ve bağlı veri düğümleri', 'Yazılım, veri ve sistem hesapları'),
  genel: topic('category-genel', 'Hesap makinesi ve analog ölçüm göstergesi', 'Genel amaçlı hesaplama araçları'),
};

const toolVisuals = {
  sheetMetal: topic('tool-sheet-metal', 'V kalıpta bükülen sac ve büküm ölçü çizgileri', 'Sac büküm, açınım ve kesim hesabı'),
  fastener: topic('tool-fastener-torque', 'Cıvata üzerinde tork yönü ve tork göstergesi', 'Cıvata ve sıkma torku hesabı'),
  bearing: topic('tool-bearing', 'Bilyalı rulman ve rulman ömrü ölçülendirmesi', 'Rulman ömrü hesabı'),
  gear: topic('tool-gear', 'Birbiriyle çalışan iki dişli çark ve modül ölçüsü', 'Dişli çark ve aktarım hesabı'),
  beltPulley: topic('tool-belt-pulley', 'Kayışla bağlanan iki kasnak ve oran ölçüsü', 'Kayış ve kasnak hesabı'),
  shaft: topic('tool-shaft', 'Kademeli makine mili ve çap ölçülendirmesi', 'Mil mukavemeti ve çap hesabı'),
  spring: topic('tool-spring', 'Helisel yay ve kuvvet yönü şeması', 'Yay sabiti ve kuvvet hesabı'),
  tolerance: topic('tool-tolerance', 'Mil ve delik geçmesi için tolerans kesiti', 'ISO geçme ve tolerans hesabı'),
  surface: topic('tool-surface', 'Yüzey profili ve pürüzlülük grafiği', 'Yüzey pürüzlülüğü rehberi'),
  fluid: topic('tool-fluid-pressure', 'Boru hattı ve basınç göstergesi', 'Basınç ve akışkan hesabı'),
  pump: topic('tool-pump', 'Santrifüj pompa çarkı ve akış yönleri', 'Pompa gücü ve debi hesabı'),
  pipe: topic('tool-pipe', 'Boru kesiti ve et kalınlığı ölçüsü', 'Boru et kalınlığı hesabı'),
  thermal: topic('tool-thermal', 'Sıcak ve soğuk yüzeyler arasında ısı akışı', 'Isı iletimi ve genleşme hesabı'),
  electricalCable: topic('tool-electrical-cable', 'Üç damarlı kablo kesiti ve iletken alanı', 'Kablo kesiti ve akım hesabı'),
  electricalCircuit: topic('tool-electrical-circuit', 'Direnç ağı ve elektrik devresi şeması', 'Gerilim, direnç ve güç hesabı'),
  concrete: topic('tool-concrete', 'Betonarme kiriş kesiti ve donatı çubukları', 'Beton miktarı ve kesit hesabı'),
  rebar: topic('tool-rebar', 'Donatı ızgarası ve çubuk aralığı ölçüsü', 'Donatı ve demir ağırlığı hesabı'),
  stairs: topic('tool-stairs', 'Basamak dizisi ve merdiven bağıntısı', 'Merdiven ölçü hesabı'),
  profile: topic('tool-profile-weight', 'Çelik I profil kesiti ve ölçülendirme', 'Profil ve levha ağırlığı hesabı'),
  chemistry: topic('tool-chemistry', 'Kimyasal çözelti balonu ve molekül ağı', 'Molarite ve seyreltme hesabı'),
  energy: topic('tool-energy', 'Güneş paneli ve güneş enerjisi ölçümü', 'Güneş enerjisi ve karbon hesabı'),
  software: topic('tool-software', 'Kod penceresi ve bağlı sistem düğümleri', 'Yazılım, API ve sistem hesabı'),
  units: topic('tool-units', 'Ölçü birimleri arasında dönüşüm okları', 'Birim ve ölçü dönüşümü'),
  production: topic('tool-production', 'Fabrika ve verimlilik göstergesi', 'OEE, takt ve kapasite hesabı'),
  welding: topic('tool-welding', 'İki levha arasındaki kaynak dikişi kesiti', 'Kaynak dikişi hesabı'),
  oRing: topic('tool-o-ring', 'O-ring ve kanal kesiti ölçülendirmesi', 'O-ring kanal hesabı'),
  reynolds: topic('tool-reynolds', 'Boru içindeki akış çizgileri ve Reynolds ölçüsü', 'Reynolds sayısı hesabı'),
  pressureVessel: topic('tool-pressure-vessel', 'Silindirik basınçlı kap ve cidar kalınlığı', 'Basınçlı kap cidar hesabı'),
  finance: topic('tool-finance', 'Finans grafiği ve para göstergeleri', 'Finansal hesaplama aracı'),
  health: topic('tool-health', 'Vücut ölçümü ve boy skalası', 'Vücut kitle indeksi hesabı'),
  general: topic('tool-general', 'Hesap makinesi ve temel geometri şekli', 'Genel hesaplama aracı'),
};

export function getCategoryVisual(categoryId?: string): SiteVisual {
  return categoryVisuals[categoryId || ''] || categoryVisuals.genel;
}

export function getToolVisual(categoryId?: string, slug = ''): SiteVisual {
  const n = slug.toLocaleLowerCase('tr-TR');

  if (/(sac-bukum|sac-büküm|sac-bukum-kesim|baklavali|baklavalı)/.test(n)) return toolVisuals.sheetMetal;
  if (/(civata|cıvata|tork-hesaplama|kilavuz|kılavuz|kama-kanali)/.test(n)) return toolVisuals.fastener;
  if (/(rulman)/.test(n)) return toolVisuals.bearing;
  if (/(disli|dişli)/.test(n)) return toolVisuals.gear;
  if (/(kayis|kayış|kasnak)/.test(n)) return toolVisuals.beltPulley;
  if (/(mil-mukavemet|konik)/.test(n)) return toolVisuals.shaft;
  if (/(yay-hesaplama)/.test(n)) return toolVisuals.spring;
  if (/(tolerans|gecme|geçme)/.test(n)) return toolVisuals.tolerance;
  if (/(puruz|pürüz)/.test(n)) return toolVisuals.surface;
  if (/(o-ring|oring)/.test(n)) return toolVisuals.oRing;
  if (/(kaynak-dikisi|kaynak-dikişi)/.test(n)) return toolVisuals.welding;

  if (/(pompa)/.test(n)) return toolVisuals.pump;
  if (/(boru-eti)/.test(n)) return toolVisuals.pipe;
  if (/(reynolds|viskozite)/.test(n)) return toolVisuals.reynolds;
  if (/(basincli-kap|basınçlı-kap|kap-cidar)/.test(n)) return toolVisuals.pressureVessel;
  if (/(termal|isil-genlesme|ısıl-genleşme)/.test(n)) return toolVisuals.thermal;
  if (/(basinc|basınç)/.test(n)) return toolVisuals.fluid;

  if (/(kablo-kesiti|voltaj-dusumu|voltaj-düşümü)/.test(n)) return toolVisuals.electricalCable;
  if (/(ohm|led-direnc|guc-faktoru|güç-faktörü|elektrik-fatura)/.test(n)) return toolVisuals.electricalCircuit;

  if (/(beton-miktari|beton-miktarı)/.test(n)) return toolVisuals.concrete;
  if (/(demir-agirligi|demir-ağırlığı)/.test(n)) return toolVisuals.rebar;
  if (/(merdiven)/.test(n)) return toolVisuals.stairs;
  if (/(profil|levha-agirlik|levha-ağırlık)/.test(n)) return toolVisuals.profile;

  if (/(molarite|seyreltme|kimya|cozelti|çözelti)/.test(n)) return toolVisuals.chemistry;
  if (/(gunes|güneş|karbon-emisyon)/.test(n)) return toolVisuals.energy;
  if (/(api|sla|uptime|teknik-resim-cagri|teknik-resim-çağrı|cad|yazilim|yazılım)/.test(n)) return toolVisuals.software;
  if (/(proje-yonetimi|proje-yönetimi)/.test(n)) return siteVisuals.project;

  if (/(oee|takt|uretim|üretim|verim|kapasite)/.test(n)) return toolVisuals.production;
  if (/(cevirici|çevirici|uzunluk|agirlik-birimi|ağırlık-birimi|sicaklik|sıcaklık|hacim-birimi|alan-birimi)/.test(n)) return toolVisuals.units;
  if (/(pazaryeri|kdv|kira-artis|kira-artış|kredi)/.test(n)) return toolVisuals.finance;
  if (/(bmi)/.test(n)) return toolVisuals.health;

  if (categoryId) return getCategoryVisual(categoryId);
  return toolVisuals.general;
}

export function getBlogVisual(post: { title: string; category: string; keywords?: string[] }): SiteVisual {
  const text = [post.title, post.category, ...(post.keywords || [])].join(' ').toLocaleLowerCase('tr-TR');
  if (/(sac|büküm|bukum|açınım|acinim|kesim|levha)/.test(text)) return toolVisuals.sheetMetal;
  if (/(cıvata|civata|tork|vida|kama|kılavuz|kilavuz)/.test(text)) return toolVisuals.fastener;
  if (/(kaynak dikişi|kaynak dikisi)/.test(text)) return toolVisuals.welding;
  if (/(o-ring|oring)/.test(text)) return toolVisuals.oRing;
  if (/(rulman)/.test(text)) return toolVisuals.bearing;
  if (/(dişli|disli)/.test(text)) return toolVisuals.gear;
  if (/(kayış|kayis|kasnak)/.test(text)) return toolVisuals.beltPulley;
  if (/(mil mukavemet|şaft|saft|konik)/.test(text)) return toolVisuals.shaft;
  if (/(yay hesabı|yay hesabi)/.test(text)) return toolVisuals.spring;
  if (/(tolerans|geçme|gecme)/.test(text)) return toolVisuals.tolerance;
  if (/(pürüz|puruz)/.test(text)) return toolVisuals.surface;

  if (/(pompa)/.test(text)) return toolVisuals.pump;
  if (/(basınçlı kap|basincli kap)/.test(text)) return toolVisuals.pressureVessel;
  if (/(boru et|boru cidar)/.test(text)) return toolVisuals.pipe;
  if (/(reynolds|viskozite|akış|akis)/.test(text)) return toolVisuals.reynolds;
  if (/(basınç|basinc)/.test(text)) return toolVisuals.fluid;
  if (/(termal|ısıl|isil|genleşme|genlesme)/.test(text)) return toolVisuals.thermal;

  if (/(kablo|kesit|voltaj düşümü|voltaj dusumu)/.test(text)) return toolVisuals.electricalCable;
  if (/(elektrik|ohm|led|gerilim|güç faktörü|guc faktoru)/.test(text)) return toolVisuals.electricalCircuit;
  if (/(beton)/.test(text)) return toolVisuals.concrete;
  if (/(donatı|donati|demir ağırlık|demir agirlik)/.test(text)) return toolVisuals.rebar;
  if (/(merdiven)/.test(text)) return toolVisuals.stairs;
  if (/(profil|çelik|celik|levha ağırlık|levha agirlik)/.test(text)) return toolVisuals.profile;
  if (/(kimya|molarite|seyreltme|çözelti|cozelti)/.test(text)) return toolVisuals.chemistry;
  if (/(enerji|güneş|gunes|karbon|çevre|cevre)/.test(text)) return toolVisuals.energy;
  if (/(tooldurcad|solidworks|cad|yazılım|yazilim|api|sla)/.test(text)) return toolVisuals.software;
  if (/(proje yönetimi|proje yonetimi|kanban)/.test(text)) return siteVisuals.project;
  if (/(oee|takt|üretim|uretim|verimlilik|kapasite)/.test(text)) return toolVisuals.production;
  if (/(birim|çevir|cevir|uzunluk|ağırlık|agirlik|sıcaklık|sicaklik)/.test(text)) return toolVisuals.units;
  if (/(kredi|kdv|fiyat|pazaryeri|kira|finans)/.test(text)) return toolVisuals.finance;
  if (/(bmi|vücut kitle|vucut kitle)/.test(text)) return toolVisuals.health;
  return categoryVisuals[post.category] || toolVisuals.general;
}
