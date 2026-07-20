import type { Locale } from '@/lib/siteLanguage';

export type LocalizedPageKey =
  | 'home'
  | 'tools'
  | 'blog'
  | 'tooldurcad'
  | 'support'
  | 'technical-call-library'
  | 'roadmap'
  | 'release-notes'
  | 'project-management'
  | 'about'
  | 'contact'
  | 'privacy'
  | 'terms'
  | 'cookies';

export type PageCopy = {
  badge: string;
  title: string;
  description: string;
  primary: string;
  secondary: string;
  sectionTitle: string;
  sectionText: string;
  cards: { title: string; text: string }[];
};

export type LocaleCopy = {
  localeName: string;
  seoSuffix: string;
  pages: Record<LocalizedPageKey, PageCopy>;
  labels: {
    free: string;
    popularTools: string;
    categories: string;
    openTool: string;
    relatedTools: string;
    readArticle: string;
    download: string;
    version: string;
    updated: string;
    originalToolNote: string;
    blogNote: string;
    categoryTools: string;
  };
  categoryNames: Record<string, string>;
  categoryDescriptions: Record<string, string>;
  toolIntro: string;
  blogIntro: string;
};

const commonCards = {
  en: [
    { title: 'Engineering calculators', text: 'Practical calculators for tolerances, keyways, tap drills, bolt torque, sheet metal and unit conversion.' },
    { title: 'TooldurCAD', text: 'A lightweight desktop assistant for machine designers and SOLIDWORKS users.' },
    { title: 'Technical notes', text: 'Copy-ready technical drawing notes for manufacturing, surfaces, coatings and assembly.' },
    { title: 'Project tracking', text: 'A simple project and task tracking area for technical work.' },
  ],
  es: [
    { title: 'Calculadoras de ingeniería', text: 'Cálculos prácticos de tolerancias, chaveteros, roscas, par de apriete, chapa y conversión de unidades.' },
    { title: 'TooldurCAD', text: 'Asistente de escritorio ligero para diseñadores de máquinas y usuarios de SOLIDWORKS.' },
    { title: 'Notas técnicas', text: 'Notas listas para copiar en planos técnicos de fabricación, superficies, recubrimientos y montaje.' },
    { title: 'Gestión de proyectos', text: 'Un área simple para seguir proyectos y tareas técnicas.' },
  ],
  zh: [
    { title: '工程计算器', text: '用于公差、键槽、攻丝钻孔、螺栓扭矩、钣金和单位换算的实用计算。' },
    { title: 'TooldurCAD', text: '面向机械设计人员和 SOLIDWORKS 用户的轻量桌面助手。' },
    { title: '技术说明', text: '可直接复制到工程图中的制造、表面、涂层和装配说明。' },
    { title: '项目跟踪', text: '用于技术工作的简单项目和任务跟踪区域。' },
  ],
  hi: [
    { title: 'इंजीनियरिंग कैलकुलेटर', text: 'टॉलरेंस, कीवे, टैप ड्रिल, बोल्ट टॉर्क, शीट मेटल और यूनिट कन्वर्जन के लिए व्यावहारिक कैलकुलेटर।' },
    { title: 'TooldurCAD', text: 'मशीन डिजाइनरों और SOLIDWORKS उपयोगकर्ताओं के लिए हल्का डेस्कटॉप असिस्टेंट।' },
    { title: 'तकनीकी नोट्स', text: 'मैन्युफैक्चरिंग, सरफेस, कोटिंग और असेंबली के लिए कॉपी करने योग्य ड्रॉइंग नोट्स।' },
    { title: 'प्रोजेक्ट ट्रैकिंग', text: 'तकनीकी कार्यों के लिए सरल प्रोजेक्ट और टास्क ट्रैकिंग क्षेत्र।' },
  ],
  ar: [
    { title: 'حاسبات هندسية', text: 'حاسبات عملية للتفاوتات، مجاري المفاتيح، ثقوب القلاوظ، عزم البراغي، الصفائح وتحويل الوحدات.' },
    { title: 'TooldurCAD', text: 'مساعد سطح مكتب خفيف لمصممي الآلات ومستخدمي SOLIDWORKS.' },
    { title: 'ملاحظات فنية', text: 'ملاحظات جاهزة للنسخ في الرسومات الفنية للتصنيع والأسطح والطلاءات والتجميع.' },
    { title: 'متابعة المشاريع', text: 'منطقة بسيطة لمتابعة المشاريع والمهام الفنية.' },
  ],
} as const;

function page(badge: string, title: string, description: string, primary: string, secondary: string, sectionTitle: string, sectionText: string, cards: { title: string; text: string }[]): PageCopy {
  return { badge, title, description, primary, secondary, sectionTitle, sectionText, cards };
}

export const LOCALE_COPY: Record<Locale, LocaleCopy> = {
  tr: {
    localeName: 'Türkçe',
    seoSuffix: 'Tooldur',
    labels: { free: 'Ücretsiz', popularTools: 'Popüler araçlar', categories: 'Kategoriler', openTool: 'Aracı aç', relatedTools: 'İlgili araçlar', readArticle: 'Yazıyı oku', download: 'İndir', version: 'Sürüm', updated: 'Güncel', originalToolNote: 'Hesaplama aracı Türkçe ana sayfada çalışır.', blogNote: 'Bu yazının Türkçe ana içeriği korunur.', categoryTools: 'Kategori araçları' },
    categoryNames: { makine: 'Makine & Mekanik', cevirici: 'Birim Çeviriciler', elektrik: 'Elektrik & Elektronik', insaat: 'İnşaat & Yapı', endustri: 'Endüstri & Üretim', kimya: 'Kimya & Proses', cevre: 'Çevre & Enerji', yazilim: 'Yazılım & Veri', genel: 'Genel Araçlar' },
    categoryDescriptions: { makine: 'Tolerans, geçme, kama, mil, rulman, tork ve imalat hesapları', cevirici: 'Uzunluk, ağırlık, basınç, sıcaklık ve hacim dönüşümleri', elektrik: 'Kablo kesiti, gerilim düşümü ve temel elektrik hesapları', insaat: 'Metraj, ağırlık, beton ve yapı ön hesapları', endustri: 'OEE, takt süresi, kapasite ve üretim verimliliği hesapları', kimya: 'Çözelti, seyreltme, proses ve akışkan ön hesapları', cevre: 'Karbon emisyonu, enerji üretimi ve sürdürülebilirlik hesapları', yazilim: 'SLA, uptime, kapasite ve teknik operasyon hesapları', genel: 'Ana mühendislik araçlarının dışında kalan yardımcı hesaplar' },
    toolIntro: 'Bu sayfa Tooldur içindeki ilgili hesaplama aracı için hazırlanmıştır.',
    blogIntro: 'Tooldur blog içeriği mühendislik hesaplarını ve teknik kararları sadeleştirir.',
    pages: {
      home: page('Mühendislik araçları', 'Ücretsiz mühendislik hesaplama araçları, TooldurCAD ve teknik notlar', 'Tooldur; makine tasarımı, elektrik, inşaat, teknik resim ve proje takibi için ücretsiz araçlar sunar.', 'Araçları keşfet', 'TooldurCAD indir', 'Tooldur’da neler var?', 'Hesaplayıcılar, CAD destek uygulaması, teknik çağrı kütüphanesi ve proje takibi tek yapıda toplanır.', commonCards.en as unknown as { title: string; text: string }[]),
      tools: page('Tooldur araçları', 'Ücretsiz mühendislik hesaplayıcıları', 'Tolerans, kama kanalı, kılavuz matkap, cıvata torku, sac büküm, ağırlık ve birim dönüşümü araçlarını kullan.', 'Popüler araçlar', 'Kategorileri gör', 'Hızlı hesap, net sonuç', 'Araçlar ön hesap ve kontrol amacıyla sade bir akışla hazırlanmıştır.', commonCards.en as unknown as { title: string; text: string }[]),
      blog: page('Tooldur blog', 'Makine tasarımı ve teknik resim için pratik rehberler', 'Tolerans, kama kanalı, kılavuz matkap ve üretim notları için SEO odaklı mühendislik yazıları.', 'Yazıları oku', 'Araçlara git', 'Blog yapısı', 'Rehberler arama trafiği için teknik konuları sade ve uygulanabilir anlatır.', commonCards.en as unknown as { title: string; text: string }[]),
      tooldurcad: page('TooldurCAD', 'TooldurCAD masaüstü mühendislik yardımcısı', 'Makine tasarımcıları için tolerans, kama, segman, sac büküm ve teknik not desteği sağlayan masaüstü uygulaması.', 'Kurulumu indir', 'Sürüm notları', 'v1.0.3 indirme sayfası', 'Universal Lite ve SOLIDWORKS kurulum dosyaları üyelikli indirme akışına hazırdır.', commonCards.en as unknown as { title: string; text: string }[]),
      support: page('Destek', 'Tooldur’u destekle', 'Ücretsiz mühendislik araçlarının geliştirilmesine destek olabilirsin.', 'Destek sayfası', 'Araçlara dön', 'Neden destek?', 'Tooldur’un ücretsiz kalması ve yeni araçların geliştirilmesi için destek alanı ayrılmıştır.', commonCards.en as unknown as { title: string; text: string }[]),
      'technical-call-library': page('Teknik çağrı', 'Teknik resim notları ve çağrı kütüphanesi', 'Tolerans, yüzey, kaplama, kaynak, montaj ve üretim çağrıları için kopyalanabilir notlar.', 'Notları incele', 'Araçlara git', 'Kopyalanabilir yapı', 'Teknik resimde tekrar yazılan notları standartlaştırmak için hazırlanmıştır.', commonCards.en as unknown as { title: string; text: string }[]),
      roadmap: page('Roadmap', 'Tooldur geliştirme yol haritası', 'Yeni hesaplayıcılar, TooldurCAD güncellemeleri ve platform geliştirmeleri için plan alanı.', 'Planı incele', 'Sürüm notları', 'Geliştirme yönü', 'Öncelik; ücretsiz mühendislik araçları, SEO sayfaları ve TooldurCAD kararlılığıdır.', commonCards.en as unknown as { title: string; text: string }[]),
      'release-notes': page('Sürüm notları', 'Tooldur ve TooldurCAD sürüm notları', 'Yeni özellikler, dosya güncellemeleri ve TooldurCAD v1.0.3 değişiklikleri.', 'Güncellemeleri gör', 'TooldurCAD indir', 'Son güncelleme', 'v1.0.3 indirme dosyaları ve duyuru sistemi güncellenmiştir.', commonCards.en as unknown as { title: string; text: string }[]),
      'project-management': page('Proje yönetimi', 'Teknik işler için sade proje takibi', 'Görevleri, notları ve proje durumlarını üyelik panelinde takip etmek için oluşturulan alan.', 'Projeleri aç', 'Giriş yap', 'Teknik iş akışı', 'Mühendislik görevleri için sade, hızlı ve karmaşık olmayan takip yapısı.', commonCards.en as unknown as { title: string; text: string }[]),
      about: page('Hakkımızda', 'Tooldur nedir?', 'Tooldur, mühendislik hesaplarını ve teknik üretim notlarını daha erişilebilir hale getirmek için geliştirilmiştir.', 'Araçlara git', 'İletişim', 'Amaç', 'Ücretsiz, hızlı ve pratik teknik araçlar sunmak.', commonCards.en as unknown as { title: string; text: string }[]),
      contact: page('İletişim', 'Tooldur iletişim', 'Geri bildirim, hata bildirimi ve işbirliği dışı genel platform iletişimi için bu sayfa kullanılır.', 'E-posta gönder', 'Ana sayfa', 'İletişim notu', 'Lütfen teknik araç önerilerini açık ölçü ve kullanım senaryosu ile ilet.', commonCards.en as unknown as { title: string; text: string }[]),
      privacy: page('Gizlilik', 'Gizlilik politikası', 'Tooldur’da kullanıcı hesabı, çerez ve analiz verileri için temel gizlilik bilgilendirmesi.', 'Çerez politikası', 'Kullanım şartları', 'Veri yaklaşımı', 'Gereksiz kişisel veri toplamamaya odaklı sade bir platform yapısı korunur.', commonCards.en as unknown as { title: string; text: string }[]),
      terms: page('Şartlar', 'Kullanım şartları', 'Tooldur hesaplayıcıları ön hesap ve pratik kontrol amacıyla sunulur.', 'Araçlara dön', 'Gizlilik', 'Sorumluluk', 'Kritik mühendislik kararlarında sonuçlar standart, üretici katalogu ve yetkili mühendis kontrolüyle doğrulanmalıdır.', commonCards.en as unknown as { title: string; text: string }[]),
      cookies: page('Çerezler', 'Çerez politikası', 'Zorunlu, analitik ve reklam çerezlerinin nasıl kullanıldığını açıklar.', 'Tercihleri yönet', 'Gizlilik', 'Kontrol', 'Kullanıcı çerez tercihlerini istediği zaman değiştirebilir.', commonCards.en as unknown as { title: string; text: string }[]),
    },
  },
  en: {
    localeName: 'English', seoSuffix: 'Tooldur English', labels: { free: 'Free', popularTools: 'Popular tools', categories: 'Categories', openTool: 'Open tool', relatedTools: 'Related tools', readArticle: 'Read article', download: 'Download', version: 'Version', updated: 'Updated', originalToolNote: 'The calculator opens in the main Tooldur tool area.', blogNote: 'This localized article page summarizes the original engineering guide.', categoryTools: 'Category tools' },
    categoryNames: { makine: 'Mechanical Design', cevirici: 'Unit Converters', elektrik: 'Electrical & Electronics', insaat: 'Construction', endustri: 'Industrial & Manufacturing', kimya: 'Chemical & Process', cevre: 'Environment & Energy', yazilim: 'Software & Data', genel: 'General Tools' },
    categoryDescriptions: { makine: 'Tolerances, fits, keyways, shafts, bearings, torque and manufacturing checks', cevirici: 'Length, weight, pressure, temperature and volume conversions', elektrik: 'Cable sizing, voltage drop and basic electrical calculations', insaat: 'Quantity takeoff, weight, concrete and structural pre-calculations', endustri: 'OEE, takt time, capacity and production efficiency calculations', kimya: 'Solution, dilution, process and fluid pre-calculations', cevre: 'Carbon emissions, energy generation and sustainability calculations', yazilim: 'SLA, uptime, capacity and technical operations calculations', genel: 'Helper calculators outside core engineering categories' },
    toolIntro: 'This localized page introduces the related Tooldur calculator and gives search engines a language-specific entry point.',
    blogIntro: 'Tooldur blog content explains engineering calculations and drawing decisions in practical language.',
    pages: {
      home: page('Engineering tools', 'Free engineering calculators, TooldurCAD and technical notes', 'Tooldur provides free tools for mechanical design, electrical work, construction, technical drawings and project tracking.', 'Explore tools', 'Download TooldurCAD', 'What is inside Tooldur?', 'Calculators, a CAD helper, technical note libraries and project tracking are organized in one platform.', commonCards.en as unknown as { title: string; text: string }[]),
      tools: page('Tooldur tools', 'Free engineering calculators', 'Use calculators for tolerances, keyways, tap drills, bolt torque, sheet metal, weight and unit conversion.', 'Popular tools', 'View categories', 'Fast calculation, clear result', 'Each tool is designed for quick preliminary engineering checks.', commonCards.en as unknown as { title: string; text: string }[]),
      blog: page('Tooldur blog', 'Practical guides for machine design and technical drawings', 'SEO-focused engineering guides for tolerances, keyways, tap drill sizes and manufacturing notes.', 'Read articles', 'Go to tools', 'Blog structure', 'Guides explain search-driven technical topics in a practical way.', commonCards.en as unknown as { title: string; text: string }[]),
      tooldurcad: page('TooldurCAD', 'TooldurCAD desktop engineering assistant', 'A desktop application for machine designers with tolerance, keyway, retaining ring, sheet metal and technical note helpers.', 'Download setup', 'Release notes', 'v1.0.3 download page', 'Universal Lite and SOLIDWORKS setup files are ready for the member download flow.', commonCards.en as unknown as { title: string; text: string }[]),
      support: page('Support', 'Support Tooldur', 'Support the development of free engineering calculators and TooldurCAD improvements.', 'Support page', 'Back to tools', 'Why support?', 'Support helps keep Tooldur free and funds new engineering tools.', commonCards.en as unknown as { title: string; text: string }[]),
      'technical-call-library': page('Technical notes', 'Technical drawing callout library', 'Copy-ready notes for tolerances, surfaces, coatings, welding, assembly and manufacturing.', 'View notes', 'Go to tools', 'Copy-ready format', 'The library standardizes technical notes that are repeatedly written in drawings.', commonCards.en as unknown as { title: string; text: string }[]),
      roadmap: page('Roadmap', 'Tooldur development roadmap', 'Planned calculators, TooldurCAD improvements and platform updates.', 'View roadmap', 'Release notes', 'Development direction', 'Priority is free engineering tools, SEO pages and stable TooldurCAD releases.', commonCards.en as unknown as { title: string; text: string }[]),
      'release-notes': page('Release notes', 'Tooldur and TooldurCAD release notes', 'Feature updates, setup file changes and TooldurCAD v1.0.3 notes.', 'View updates', 'Download TooldurCAD', 'Latest update', 'v1.0.3 download files and the announcement system were updated.', commonCards.en as unknown as { title: string; text: string }[]),
      'project-management': page('Project management', 'Simple project tracking for technical work', 'Track tasks, notes and project status in a member panel.', 'Open projects', 'Login', 'Technical workflow', 'A lightweight workflow for engineering tasks without unnecessary complexity.', commonCards.en as unknown as { title: string; text: string }[]),
      about: page('About', 'What is Tooldur?', 'Tooldur makes engineering calculations and technical manufacturing notes easier to access.', 'Go to tools', 'Contact', 'Purpose', 'Provide free, fast and practical technical tools.', commonCards.en as unknown as { title: string; text: string }[]),
      contact: page('Contact', 'Contact Tooldur', 'Use this page for feedback, bug reports and general platform messages.', 'Send email', 'Home', 'Contact note', 'Please include clear dimensions and the use case when suggesting a new technical tool.', commonCards.en as unknown as { title: string; text: string }[]),
      privacy: page('Privacy', 'Privacy policy', 'Basic privacy information for user accounts, cookies and analytics data on Tooldur.', 'Cookie policy', 'Terms', 'Data approach', 'Tooldur keeps a simple platform structure and avoids unnecessary personal data collection.', commonCards.en as unknown as { title: string; text: string }[]),
      terms: page('Terms', 'Terms of use', 'Tooldur calculators are provided for preliminary engineering checks and practical calculations.', 'Back to tools', 'Privacy', 'Responsibility', 'Critical engineering decisions must be verified with standards, supplier catalogs and qualified engineering review.', commonCards.en as unknown as { title: string; text: string }[]),
      cookies: page('Cookies', 'Cookie policy', 'Explains how essential, analytics and advertising cookies are used.', 'Manage preferences', 'Privacy', 'Control', 'Users can change cookie preferences at any time.', commonCards.en as unknown as { title: string; text: string }[]),
    },
  },
  es: {
    localeName: 'Español', seoSuffix: 'Tooldur Español', labels: { free: 'Gratis', popularTools: 'Herramientas populares', categories: 'Categorías', openTool: 'Abrir herramienta', relatedTools: 'Herramientas relacionadas', readArticle: 'Leer artículo', download: 'Descargar', version: 'Versión', updated: 'Actualizado', originalToolNote: 'La calculadora se abre en el área principal de herramientas de Tooldur.', blogNote: 'Esta página localizada resume la guía técnica original.', categoryTools: 'Herramientas de la categoría' },
    categoryNames: { makine: 'Diseño mecánico', cevirici: 'Conversores de unidades', elektrik: 'Electricidad y electrónica', insaat: 'Construcción', endustri: 'Industria y producción', kimya: 'Química y proceso', cevre: 'Medio ambiente y energía', yazilim: 'Software y datos', genel: 'Herramientas generales' },
    categoryDescriptions: { makine: 'Tolerancias, ajustes, chaveteros, ejes, rodamientos, par y controles de fabricación', cevirici: 'Conversiones de longitud, peso, presión, temperatura y volumen', elektrik: 'Sección de cable, caída de tensión y cálculos eléctricos básicos', insaat: 'Metrados, pesos, hormigón y cálculos previos de obra', endustri: 'Cálculos de OEE, takt, capacidad y eficiencia de producción', kimya: 'Cálculos previos de soluciones, dilución, proceso y fluidos', cevre: 'Cálculos de carbono, energía y sostenibilidad', yazilim: 'Cálculos de SLA, uptime, capacidad y operaciones técnicas', genel: 'Calculadoras auxiliares fuera de las categorías principales' },
    toolIntro: 'Esta página localizada presenta la calculadora relacionada de Tooldur y crea una entrada específica para buscadores en español.',
    blogIntro: 'El blog de Tooldur explica cálculos de ingeniería y decisiones de plano técnico de forma práctica.',
    pages: {
      home: page('Herramientas de ingeniería', 'Calculadoras de ingeniería gratuitas, TooldurCAD y notas técnicas', 'Tooldur ofrece herramientas gratuitas para diseño mecánico, electricidad, construcción, planos técnicos y seguimiento de proyectos.', 'Explorar herramientas', 'Descargar TooldurCAD', '¿Qué incluye Tooldur?', 'Calculadoras, asistente CAD, bibliotecas de notas técnicas y seguimiento de proyectos en una sola plataforma.', commonCards.es as unknown as { title: string; text: string }[]),
      tools: page('Herramientas Tooldur', 'Calculadoras de ingeniería gratuitas', 'Usa calculadoras de tolerancias, chaveteros, roscas, par de apriete, chapa, peso y conversión de unidades.', 'Herramientas populares', 'Ver categorías', 'Cálculo rápido, resultado claro', 'Cada herramienta está diseñada para controles técnicos preliminares.', commonCards.es as unknown as { title: string; text: string }[]),
      blog: page('Blog Tooldur', 'Guías prácticas de diseño mecánico y planos técnicos', 'Guías técnicas orientadas a SEO sobre tolerancias, chaveteros, taladros para rosca y notas de fabricación.', 'Leer artículos', 'Ir a herramientas', 'Estructura del blog', 'Las guías explican temas técnicos buscados con un enfoque práctico.', commonCards.es as unknown as { title: string; text: string }[]),
      tooldurcad: page('TooldurCAD', 'Asistente de ingeniería de escritorio TooldurCAD', 'Aplicación para diseñadores de máquinas con ayuda para tolerancias, chaveteros, anillos elásticos, chapa y notas técnicas.', 'Descargar instalador', 'Notas de versión', 'Página de descarga v1.0.3', 'Los instaladores Universal Lite y SOLIDWORKS están listos para el flujo de descarga con cuenta.', commonCards.es as unknown as { title: string; text: string }[]),
      support: page('Apoyo', 'Apoyar Tooldur', 'Apoya el desarrollo de calculadoras de ingeniería gratuitas y mejoras de TooldurCAD.', 'Página de apoyo', 'Volver a herramientas', '¿Por qué apoyar?', 'El apoyo ayuda a mantener Tooldur gratuito y a crear nuevas herramientas.', commonCards.es as unknown as { title: string; text: string }[]),
      'technical-call-library': page('Notas técnicas', 'Biblioteca de notas para planos técnicos', 'Notas listas para copiar sobre tolerancias, superficies, recubrimientos, soldadura, montaje y fabricación.', 'Ver notas', 'Ir a herramientas', 'Formato listo para copiar', 'La biblioteca estandariza notas técnicas repetidas en planos.', commonCards.es as unknown as { title: string; text: string }[]),
      roadmap: page('Hoja de ruta', 'Hoja de ruta de desarrollo de Tooldur', 'Calculadoras previstas, mejoras de TooldurCAD y actualizaciones de plataforma.', 'Ver hoja de ruta', 'Notas de versión', 'Dirección de desarrollo', 'La prioridad son herramientas gratuitas, páginas SEO y versiones estables de TooldurCAD.', commonCards.es as unknown as { title: string; text: string }[]),
      'release-notes': page('Notas de versión', 'Notas de Tooldur y TooldurCAD', 'Actualizaciones de funciones, cambios de instaladores y notas de TooldurCAD v1.0.3.', 'Ver actualizaciones', 'Descargar TooldurCAD', 'Última actualización', 'Se actualizaron los archivos v1.0.3 y el sistema de anuncios.', commonCards.es as unknown as { title: string; text: string }[]),
      'project-management': page('Gestión de proyectos', 'Seguimiento simple de proyectos técnicos', 'Sigue tareas, notas y estados de proyecto desde el panel de usuario.', 'Abrir proyectos', 'Ingresar', 'Flujo técnico', 'Un flujo ligero para tareas de ingeniería sin complejidad innecesaria.', commonCards.es as unknown as { title: string; text: string }[]),
      about: page('Acerca de', '¿Qué es Tooldur?', 'Tooldur facilita el acceso a cálculos de ingeniería y notas técnicas de fabricación.', 'Ir a herramientas', 'Contacto', 'Propósito', 'Ofrecer herramientas técnicas gratuitas, rápidas y prácticas.', commonCards.es as unknown as { title: string; text: string }[]),
      contact: page('Contacto', 'Contacto Tooldur', 'Página para comentarios, errores y mensajes generales de la plataforma.', 'Enviar email', 'Inicio', 'Nota de contacto', 'Incluye medidas claras y caso de uso al proponer una herramienta.', commonCards.es as unknown as { title: string; text: string }[]),
      privacy: page('Privacidad', 'Política de privacidad', 'Información básica sobre cuentas, cookies y datos analíticos en Tooldur.', 'Política de cookies', 'Términos', 'Enfoque de datos', 'Tooldur evita recolectar datos personales innecesarios.', commonCards.es as unknown as { title: string; text: string }[]),
      terms: page('Términos', 'Términos de uso', 'Las calculadoras de Tooldur se ofrecen para cálculos y controles técnicos preliminares.', 'Volver a herramientas', 'Privacidad', 'Responsabilidad', 'Las decisiones críticas deben verificarse con normas, catálogos y revisión técnica cualificada.', commonCards.es as unknown as { title: string; text: string }[]),
      cookies: page('Cookies', 'Política de cookies', 'Explica el uso de cookies esenciales, analíticas y publicitarias.', 'Gestionar preferencias', 'Privacidad', 'Control', 'El usuario puede cambiar sus preferencias en cualquier momento.', commonCards.es as unknown as { title: string; text: string }[]),
    },
  },
  zh: {
    localeName: '中文', seoSuffix: 'Tooldur 中文', labels: { free: '免费', popularTools: '热门工具', categories: '分类', openTool: '打开工具', relatedTools: '相关工具', readArticle: '阅读文章', download: '下载', version: '版本', updated: '已更新', originalToolNote: '计算器将在 Tooldur 主工具区域打开。', blogNote: '此本地化页面概述原始工程指南。', categoryTools: '分类工具' },
    categoryNames: { makine: '机械设计', cevirici: '单位换算', elektrik: '电气与电子', insaat: '建筑施工', endustri: '工业与生产', kimya: '化学与工艺', cevre: '环境与能源', yazilim: '软件与数据', genel: '通用工具' },
    categoryDescriptions: { makine: '公差、配合、键槽、轴、轴承、扭矩和制造检查', cevirici: '长度、重量、压力、温度和体积换算', elektrik: '电缆截面、电压降和基础电气计算', insaat: '工程量、重量、混凝土和结构预计算', endustri: 'OEE、节拍时间、产能和生产效率计算', kimya: '溶液、稀释、工艺和流体预计算', cevre: '碳排放、能源发电和可持续性计算', yazilim: 'SLA、正常运行时间、容量和技术运营计算', genel: '核心工程类别之外的辅助计算器' },
    toolIntro: '此本地化页面介绍相关 Tooldur 计算器，并为搜索引擎提供中文入口。',
    blogIntro: 'Tooldur 博客用实用语言解释工程计算和技术图纸决策。',
    pages: {
      home: page('工程工具', '免费工程计算器、TooldurCAD 和技术说明', 'Tooldur 为机械设计、电气、建筑、技术图纸和项目跟踪提供免费工具。', '探索工具', '下载 TooldurCAD', 'Tooldur 包含什么？', '计算器、CAD 助手、技术说明库和项目跟踪集中在一个平台。', commonCards.zh as unknown as { title: string; text: string }[]),
      tools: page('Tooldur 工具', '免费工程计算器', '使用公差、键槽、攻丝钻孔、螺栓扭矩、钣金、重量和单位换算计算器。', '热门工具', '查看分类', '快速计算，结果清晰', '每个工具都用于快速的工程预检查。', commonCards.zh as unknown as { title: string; text: string }[]),
      blog: page('Tooldur 博客', '机械设计和技术图纸实用指南', '关于公差、键槽、攻丝钻孔尺寸和制造说明的 SEO 工程指南。', '阅读文章', '前往工具', '博客结构', '指南以实用方式解释搜索需求高的技术主题。', commonCards.zh as unknown as { title: string; text: string }[]),
      tooldurcad: page('TooldurCAD', 'TooldurCAD 桌面工程助手', '面向机械设计人员的桌面应用，提供公差、键槽、挡圈、钣金和技术说明辅助。', '下载安装程序', '版本说明', 'v1.0.3 下载页面', 'Universal Lite 和 SOLIDWORKS 安装文件已准备好用于会员下载流程。', commonCards.zh as unknown as { title: string; text: string }[]),
      support: page('支持', '支持 Tooldur', '支持免费工程计算器和 TooldurCAD 改进的开发。', '支持页面', '返回工具', '为什么支持？', '支持有助于保持 Tooldur 免费并开发新工具。', commonCards.zh as unknown as { title: string; text: string }[]),
      'technical-call-library': page('技术说明', '技术图纸标注库', '用于公差、表面、涂层、焊接、装配和制造的可复制说明。', '查看说明', '前往工具', '可复制格式', '该库标准化工程图中反复使用的技术说明。', commonCards.zh as unknown as { title: string; text: string }[]),
      roadmap: page('路线图', 'Tooldur 开发路线图', '计划中的计算器、TooldurCAD 改进和平台更新。', '查看路线图', '版本说明', '开发方向', '重点是免费工程工具、SEO 页面和稳定的 TooldurCAD 版本。', commonCards.zh as unknown as { title: string; text: string }[]),
      'release-notes': page('版本说明', 'Tooldur 和 TooldurCAD 版本说明', '功能更新、安装文件变化和 TooldurCAD v1.0.3 说明。', '查看更新', '下载 TooldurCAD', '最新更新', 'v1.0.3 下载文件和公告系统已更新。', commonCards.zh as unknown as { title: string; text: string }[]),
      'project-management': page('项目管理', '面向技术工作的简单项目跟踪', '在会员面板中跟踪任务、笔记和项目状态。', '打开项目', '登录', '技术工作流', '用于工程任务的轻量流程，避免不必要的复杂性。', commonCards.zh as unknown as { title: string; text: string }[]),
      about: page('关于', '什么是 Tooldur？', 'Tooldur 让工程计算和技术制造说明更容易访问。', '前往工具', '联系', '目的', '提供免费、快速、实用的技术工具。', commonCards.zh as unknown as { title: string; text: string }[]),
      contact: page('联系', '联系 Tooldur', '用于反馈、错误报告和一般平台消息。', '发送邮件', '首页', '联系说明', '建议新工具时请包含清晰尺寸和使用场景。', commonCards.zh as unknown as { title: string; text: string }[]),
      privacy: page('隐私', '隐私政策', '关于 Tooldur 用户账户、Cookie 和分析数据的基本隐私信息。', 'Cookie 政策', '条款', '数据方式', 'Tooldur 保持简单的平台结构，避免不必要的个人数据收集。', commonCards.zh as unknown as { title: string; text: string }[]),
      terms: page('条款', '使用条款', 'Tooldur 计算器用于初步工程检查和实用计算。', '返回工具', '隐私', '责任', '关键工程决策必须通过标准、供应商目录和合格工程审核验证。', commonCards.zh as unknown as { title: string; text: string }[]),
      cookies: page('Cookie', 'Cookie 政策', '解释必要、分析和广告 Cookie 的使用方式。', '管理偏好', '隐私', '控制', '用户可以随时更改 Cookie 偏好。', commonCards.zh as unknown as { title: string; text: string }[]),
    },
  },
  hi: {
    localeName: 'हिन्दी', seoSuffix: 'Tooldur हिन्दी', labels: { free: 'मुफ्त', popularTools: 'लोकप्रिय टूल्स', categories: 'श्रेणियाँ', openTool: 'टूल खोलें', relatedTools: 'संबंधित टूल्स', readArticle: 'लेख पढ़ें', download: 'डाउनलोड', version: 'वर्ज़न', updated: 'अपडेटेड', originalToolNote: 'कैलकुलेटर Tooldur के मुख्य टूल क्षेत्र में खुलता है।', blogNote: 'यह स्थानीयकृत पेज मूल इंजीनियरिंग गाइड का सार देता है।', categoryTools: 'श्रेणी टूल्स' },
    categoryNames: { makine: 'मैकेनिकल डिजाइन', cevirici: 'यूनिट कन्वर्टर', elektrik: 'इलेक्ट्रिकल और इलेक्ट्रॉनिक्स', insaat: 'कंस्ट्रक्शन', endustri: 'इंडस्ट्रियल और प्रोडक्शन', kimya: 'केमिकल और प्रोसेस', cevre: 'एनवायरनमेंट और एनर्जी', yazilim: 'सॉफ्टवेयर और डेटा', genel: 'जनरल टूल्स' },
    categoryDescriptions: { makine: 'टॉलरेंस, फिट, कीवे, शाफ्ट, बेयरिंग, टॉर्क और मैन्युफैक्चरिंग जांच', cevirici: 'लंबाई, वजन, दबाव, तापमान और आयतन कन्वर्जन', elektrik: 'केबल साइजिंग, वोल्टेज ड्रॉप और बेसिक इलेक्ट्रिकल कैलकुलेशन', insaat: 'क्वांटिटी, वजन, कंक्रीट और स्ट्रक्चरल प्री-कैलकुलेशन', endustri: 'OEE, takt time, capacity और production efficiency calculations', kimya: 'solution, dilution, process और fluid pre-calculations', cevre: 'carbon emission, energy generation और sustainability calculations', yazilim: 'SLA, uptime, capacity और technical operations calculations', genel: 'मुख्य इंजीनियरिंग श्रेणियों के बाहर सहायक कैलकुलेटर' },
    toolIntro: 'यह स्थानीयकृत पेज संबंधित Tooldur कैलकुलेटर का परिचय देता है और सर्च इंजन के लिए हिन्दी एंट्री बनाता है।',
    blogIntro: 'Tooldur ब्लॉग इंजीनियरिंग कैलकुलेशन और ड्रॉइंग निर्णयों को व्यावहारिक भाषा में समझाता है।',
    pages: {
      home: page('इंजीनियरिंग टूल्स', 'मुफ्त इंजीनियरिंग कैलकुलेटर, TooldurCAD और तकनीकी नोट्स', 'Tooldur मैकेनिकल डिजाइन, इलेक्ट्रिकल, कंस्ट्रक्शन, टेक्निकल ड्रॉइंग और प्रोजेक्ट ट्रैकिंग के लिए मुफ्त टूल्स देता है।', 'टूल्स देखें', 'TooldurCAD डाउनलोड', 'Tooldur में क्या है?', 'कैलकुलेटर, CAD असिस्टेंट, तकनीकी नोट्स और प्रोजेक्ट ट्रैकिंग एक प्लेटफॉर्म पर हैं।', commonCards.hi as unknown as { title: string; text: string }[]),
      tools: page('Tooldur टूल्स', 'मुफ्त इंजीनियरिंग कैलकुलेटर', 'टॉलरेंस, कीवे, टैप ड्रिल, बोल्ट टॉर्क, शीट मेटल, वजन और यूनिट कन्वर्जन कैलकुलेटर उपयोग करें।', 'लोकप्रिय टूल्स', 'श्रेणियाँ देखें', 'तेज़ कैलकुलेशन, साफ परिणाम', 'हर टूल तेज़ प्रारंभिक इंजीनियरिंग जांच के लिए बनाया गया है।', commonCards.hi as unknown as { title: string; text: string }[]),
      blog: page('Tooldur ब्लॉग', 'मशीन डिजाइन और टेक्निकल ड्रॉइंग गाइड', 'टॉलरेंस, कीवे, टैप ड्रिल साइज और मैन्युफैक्चरिंग नोट्स के लिए SEO केंद्रित इंजीनियरिंग गाइड।', 'लेख पढ़ें', 'टूल्स पर जाएँ', 'ब्लॉग संरचना', 'गाइड व्यावहारिक तरीके से खोजे जाने वाले तकनीकी विषय समझाते हैं।', commonCards.hi as unknown as { title: string; text: string }[]),
      tooldurcad: page('TooldurCAD', 'TooldurCAD डेस्कटॉप इंजीनियरिंग असिस्टेंट', 'मशीन डिजाइनरों के लिए टॉलरेंस, कीवे, रिटेनिंग रिंग, शीट मेटल और तकनीकी नोट हेल्पर वाला डेस्कटॉप ऐप।', 'सेटअप डाउनलोड', 'रिलीज नोट्स', 'v1.0.3 डाउनलोड पेज', 'Universal Lite और SOLIDWORKS सेटअप फाइलें सदस्य डाउनलोड फ्लो के लिए तैयार हैं।', commonCards.hi as unknown as { title: string; text: string }[]),
      support: page('समर्थन', 'Tooldur का समर्थन करें', 'मुफ्त इंजीनियरिंग कैलकुलेटर और TooldurCAD सुधारों के विकास में समर्थन दें।', 'समर्थन पेज', 'टूल्स पर लौटें', 'समर्थन क्यों?', 'समर्थन Tooldur को मुफ्त रखने और नए टूल बनाने में मदद करता है।', commonCards.hi as unknown as { title: string; text: string }[]),
      'technical-call-library': page('तकनीकी नोट्स', 'टेक्निकल ड्रॉइंग कॉलआउट लाइब्रेरी', 'टॉलरेंस, सरफेस, कोटिंग, वेल्डिंग, असेंबली और मैन्युफैक्चरिंग के लिए कॉपी करने योग्य नोट्स।', 'नोट्स देखें', 'टूल्स पर जाएँ', 'कॉपी-रेडी फॉर्मेट', 'लाइब्रेरी ड्रॉइंग में बार-बार लिखे जाने वाले तकनीकी नोट्स को मानकीकृत करती है।', commonCards.hi as unknown as { title: string; text: string }[]),
      roadmap: page('रोडमैप', 'Tooldur विकास रोडमैप', 'योजनाबद्ध कैलकुलेटर, TooldurCAD सुधार और प्लेटफॉर्म अपडेट।', 'रोडमैप देखें', 'रिलीज नोट्स', 'विकास दिशा', 'प्राथमिकता मुफ्त इंजीनियरिंग टूल्स, SEO पेज और स्थिर TooldurCAD रिलीज हैं।', commonCards.hi as unknown as { title: string; text: string }[]),
      'release-notes': page('रिलीज नोट्स', 'Tooldur और TooldurCAD रिलीज नोट्स', 'फीचर अपडेट, सेटअप फाइल परिवर्तन और TooldurCAD v1.0.3 नोट्स।', 'अपडेट देखें', 'TooldurCAD डाउनलोड', 'नवीनतम अपडेट', 'v1.0.3 डाउनलोड फाइलें और घोषणा प्रणाली अपडेट की गई।', commonCards.hi as unknown as { title: string; text: string }[]),
      'project-management': page('प्रोजेक्ट मैनेजमेंट', 'तकनीकी काम के लिए सरल प्रोजेक्ट ट्रैकिंग', 'सदस्य पैनल में टास्क, नोट्स और प्रोजेक्ट स्थिति ट्रैक करें।', 'प्रोजेक्ट खोलें', 'लॉगिन', 'तकनीकी वर्कफ्लो', 'बिना अनावश्यक जटिलता के इंजीनियरिंग कार्यों के लिए हल्का वर्कफ्लो।', commonCards.hi as unknown as { title: string; text: string }[]),
      about: page('परिचय', 'Tooldur क्या है?', 'Tooldur इंजीनियरिंग कैलकुलेशन और तकनीकी मैन्युफैक्चरिंग नोट्स को आसान बनाता है।', 'टूल्स पर जाएँ', 'संपर्क', 'उद्देश्य', 'मुफ्त, तेज़ और व्यावहारिक तकनीकी टूल्स देना।', commonCards.hi as unknown as { title: string; text: string }[]),
      contact: page('संपर्क', 'Tooldur संपर्क', 'फीडबैक, बग रिपोर्ट और सामान्य प्लेटफॉर्म संदेशों के लिए यह पेज उपयोग करें।', 'ईमेल भेजें', 'होम', 'संपर्क नोट', 'नया तकनीकी टूल सुझाते समय स्पष्ट माप और उपयोग केस लिखें।', commonCards.hi as unknown as { title: string; text: string }[]),
      privacy: page('गोपनीयता', 'गोपनीयता नीति', 'Tooldur पर यूज़र खाते, Cookie और एनालिटिक्स डेटा की मूल जानकारी।', 'Cookie नीति', 'शर्तें', 'डेटा दृष्टिकोण', 'Tooldur अनावश्यक निजी डेटा संग्रह से बचते हुए सरल प्लेटफॉर्म रखता है।', commonCards.hi as unknown as { title: string; text: string }[]),
      terms: page('शर्तें', 'उपयोग की शर्तें', 'Tooldur कैलकुलेटर प्रारंभिक इंजीनियरिंग जांच और व्यावहारिक गणना के लिए दिए जाते हैं।', 'टूल्स पर लौटें', 'गोपनीयता', 'जिम्मेदारी', 'महत्वपूर्ण इंजीनियरिंग निर्णयों को स्टैंडर्ड, सप्लायर कैटलॉग और योग्य इंजीनियरिंग समीक्षा से सत्यापित करें।', commonCards.hi as unknown as { title: string; text: string }[]),
      cookies: page('Cookie', 'Cookie नीति', 'जरूरी, एनालिटिक्स और विज्ञापन Cookie कैसे उपयोग होते हैं, यह समझाता है।', 'प्राथमिकताएँ प्रबंधित करें', 'गोपनीयता', 'नियंत्रण', 'यूज़र किसी भी समय Cookie प्राथमिकताएँ बदल सकते हैं।', commonCards.hi as unknown as { title: string; text: string }[]),
    },
  },
  ar: {
    localeName: 'العربية', seoSuffix: 'Tooldur العربية', labels: { free: 'مجاني', popularTools: 'الأدوات الشائعة', categories: 'الفئات', openTool: 'فتح الأداة', relatedTools: 'أدوات ذات صلة', readArticle: 'قراءة المقال', download: 'تنزيل', version: 'الإصدار', updated: 'محدث', originalToolNote: 'تفتح الحاسبة في منطقة أدوات Tooldur الرئيسية.', blogNote: 'تلخص هذه الصفحة المحلية الدليل الهندسي الأصلي.', categoryTools: 'أدوات الفئة' },
    categoryNames: { makine: 'التصميم الميكانيكي', cevirici: 'محولات الوحدات', elektrik: 'الكهرباء والإلكترونيات', insaat: 'الإنشاءات', endustri: 'الصناعة والإنتاج', kimya: 'الكيمياء والعمليات', cevre: 'البيئة والطاقة', yazilim: 'البرمجيات والبيانات', genel: 'أدوات عامة' },
    categoryDescriptions: { makine: 'التفاوتات، التراكيب، مجاري المفاتيح، الأعمدة، المحامل، العزم وفحوص التصنيع', cevirici: 'تحويلات الطول والوزن والضغط والحرارة والحجم', elektrik: 'مقاس الكابل، هبوط الجهد والحسابات الكهربائية الأساسية', insaat: 'كميات وأوزان وخرسانة وحسابات إنشائية أولية', endustri: 'حسابات OEE ووقت takt والسعة وكفاءة الإنتاج', kimya: 'حسابات أولية للمحاليل والتخفيف والعمليات والموائع', cevre: 'حسابات الكربون وتوليد الطاقة والاستدامة', yazilim: 'حسابات SLA ووقت التشغيل والسعة والعمليات التقنية', genel: 'حاسبات مساعدة خارج الفئات الهندسية الرئيسية' },
    toolIntro: 'تقدم هذه الصفحة المحلية حاسبة Tooldur ذات الصلة وتوفر مدخلاً عربياً لمحركات البحث.',
    blogIntro: 'يشرح Blog Tooldur الحسابات الهندسية وقرارات الرسومات الفنية بلغة عملية.',
    pages: {
      home: page('أدوات هندسية', 'حاسبات هندسية مجانية وTooldurCAD وملاحظات فنية', 'يوفر Tooldur أدوات مجانية للتصميم الميكانيكي والكهرباء والإنشاءات والرسومات الفنية ومتابعة المشاريع.', 'استكشف الأدوات', 'تنزيل TooldurCAD', 'ماذا يوجد في Tooldur؟', 'حاسبات ومساعد CAD ومكتبات ملاحظات فنية ومتابعة مشاريع في منصة واحدة.', commonCards.ar as unknown as { title: string; text: string }[]),
      tools: page('أدوات Tooldur', 'حاسبات هندسية مجانية', 'استخدم حاسبات التفاوتات ومجاري المفاتيح وثقوب القلاوظ وعزم البراغي والصفائح والوزن وتحويل الوحدات.', 'الأدوات الشائعة', 'عرض الفئات', 'حساب سريع ونتيجة واضحة', 'كل أداة مصممة للفحوص الهندسية الأولية السريعة.', commonCards.ar as unknown as { title: string; text: string }[]),
      blog: page('مدونة Tooldur', 'أدلة عملية للتصميم الميكانيكي والرسومات الفنية', 'أدلة هندسية موجهة لمحركات البحث حول التفاوتات ومجاري المفاتيح وثقوب القلاوظ وملاحظات التصنيع.', 'قراءة المقالات', 'الذهاب إلى الأدوات', 'بنية المدونة', 'تشرح الأدلة الموضوعات الفنية المطلوبة بطريقة عملية.', commonCards.ar as unknown as { title: string; text: string }[]),
      tooldurcad: page('TooldurCAD', 'مساعد هندسي مكتبي TooldurCAD', 'تطبيق سطح مكتب لمصممي الآلات يدعم التفاوتات ومجاري المفاتيح وحلقات التثبيت والصفائح والملاحظات الفنية.', 'تنزيل ملف التثبيت', 'ملاحظات الإصدار', 'صفحة تنزيل v1.0.3', 'ملفات Universal Lite وSOLIDWORKS جاهزة لتدفق التنزيل عبر العضوية.', commonCards.ar as unknown as { title: string; text: string }[]),
      support: page('الدعم', 'ادعم Tooldur', 'ادعم تطوير الحاسبات الهندسية المجانية وتحسينات TooldurCAD.', 'صفحة الدعم', 'العودة إلى الأدوات', 'لماذا الدعم؟', 'يساعد الدعم على إبقاء Tooldur مجانياً وتطوير أدوات جديدة.', commonCards.ar as unknown as { title: string; text: string }[]),
      'technical-call-library': page('ملاحظات فنية', 'مكتبة نداءات الرسومات الفنية', 'ملاحظات جاهزة للنسخ للتفاوتات والأسطح والطلاءات واللحام والتجميع والتصنيع.', 'عرض الملاحظات', 'الذهاب إلى الأدوات', 'تنسيق جاهز للنسخ', 'توحّد المكتبة الملاحظات الفنية المتكررة في الرسومات.', commonCards.ar as unknown as { title: string; text: string }[]),
      roadmap: page('خارطة الطريق', 'خارطة تطوير Tooldur', 'حاسبات مخططة وتحسينات TooldurCAD وتحديثات المنصة.', 'عرض الخارطة', 'ملاحظات الإصدار', 'اتجاه التطوير', 'الأولوية للأدوات المجانية وصفحات SEO وإصدارات TooldurCAD المستقرة.', commonCards.ar as unknown as { title: string; text: string }[]),
      'release-notes': page('ملاحظات الإصدار', 'ملاحظات Tooldur وTooldurCAD', 'تحديثات الميزات وتغييرات ملفات التثبيت وملاحظات TooldurCAD v1.0.3.', 'عرض التحديثات', 'تنزيل TooldurCAD', 'آخر تحديث', 'تم تحديث ملفات v1.0.3 ونظام الإعلانات.', commonCards.ar as unknown as { title: string; text: string }[]),
      'project-management': page('إدارة المشاريع', 'متابعة بسيطة للعمل التقني', 'تابع المهام والملاحظات وحالة المشروع من لوحة العضو.', 'فتح المشاريع', 'تسجيل الدخول', 'سير عمل تقني', 'تدفق خفيف لمهام الهندسة بدون تعقيد غير ضروري.', commonCards.ar as unknown as { title: string; text: string }[]),
      about: page('من نحن', 'ما هو Tooldur؟', 'يجعل Tooldur الحسابات الهندسية وملاحظات التصنيع الفنية أسهل وصولاً.', 'الذهاب إلى الأدوات', 'اتصال', 'الغرض', 'تقديم أدوات تقنية مجانية وسريعة وعملية.', commonCards.ar as unknown as { title: string; text: string }[]),
      contact: page('اتصال', 'الاتصال بـ Tooldur', 'استخدم هذه الصفحة للتعليقات وتقارير الأخطاء والرسائل العامة للمنصة.', 'إرسال بريد', 'الرئيسية', 'ملاحظة اتصال', 'عند اقتراح أداة جديدة، أرسل الأبعاد وحالة الاستخدام بوضوح.', commonCards.ar as unknown as { title: string; text: string }[]),
      privacy: page('الخصوصية', 'سياسة الخصوصية', 'معلومات أساسية حول الحسابات وملفات الارتباط وبيانات التحليلات في Tooldur.', 'سياسة الملفات', 'الشروط', 'نهج البيانات', 'يحافظ Tooldur على بنية بسيطة ويتجنب جمع بيانات شخصية غير ضرورية.', commonCards.ar as unknown as { title: string; text: string }[]),
      terms: page('الشروط', 'شروط الاستخدام', 'تُقدم حاسبات Tooldur للفحوص الهندسية الأولية والحسابات العملية.', 'العودة إلى الأدوات', 'الخصوصية', 'المسؤولية', 'يجب التحقق من القرارات الهندسية الحرجة عبر المعايير والكتالوجات ومراجعة هندسية مؤهلة.', commonCards.ar as unknown as { title: string; text: string }[]),
      cookies: page('ملفات الارتباط', 'سياسة ملفات الارتباط', 'تشرح كيفية استخدام الملفات الأساسية والتحليلية والإعلانية.', 'إدارة التفضيلات', 'الخصوصية', 'التحكم', 'يمكن للمستخدم تغيير تفضيلات ملفات الارتباط في أي وقت.', commonCards.ar as unknown as { title: string; text: string }[]),
    },
  },
};

export function getCopy(locale: Locale): LocaleCopy {
  return LOCALE_COPY[locale] || LOCALE_COPY.en;
}
