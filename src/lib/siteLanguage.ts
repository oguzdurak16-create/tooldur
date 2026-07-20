export type Locale = 'tr' | 'en' | 'es' | 'zh' | 'hi' | 'ar';
export type PublicLocale = Exclude<Locale, 'tr'>;

export const BASE_URL = 'https://www.tooldur.com';
export const DEFAULT_LOCALE: Locale = 'tr';
export const PUBLIC_LOCALES: PublicLocale[] = ['en', 'es', 'zh', 'hi', 'ar'];
export const STATIC_I18N_LOCALES: Exclude<PublicLocale, 'en'>[] = ['es', 'zh', 'hi', 'ar'];
export const ALL_LOCALES: Locale[] = ['tr', ...PUBLIC_LOCALES];
export const INDEXABLE_LOCALES: Locale[] = ['tr', 'en'];

export const LANGUAGE_META: Record<Locale, { code: Locale; label: string; short: string; description: string; htmlLang: string; dir: 'ltr' | 'rtl' }> = {
  tr: { code: 'tr', label: 'Türkçe', short: 'TR', description: 'Türkçe sürüm', htmlLang: 'tr-TR', dir: 'ltr' },
  en: { code: 'en', label: 'English', short: 'EN', description: 'English pages', htmlLang: 'en', dir: 'ltr' },
  es: { code: 'es', label: 'Español', short: 'ES', description: 'Páginas en español', htmlLang: 'es', dir: 'ltr' },
  zh: { code: 'zh', label: '中文', short: 'ZH', description: '中文页面', htmlLang: 'zh-Hans', dir: 'ltr' },
  hi: { code: 'hi', label: 'हिन्दी', short: 'HI', description: 'हिन्दी पृष्ठ', htmlLang: 'hi', dir: 'ltr' },
  ar: { code: 'ar', label: 'العربية', short: 'AR', description: 'صفحات عربية', htmlLang: 'ar', dir: 'rtl' },
};

export type RouteKey =
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
  | 'cookies'
  | 'tool'
  | 'category'
  | 'blog-post';

export const ROUTES: Record<RouteKey, { tr: string; international: string }> = {
  home: { tr: '/', international: '' },
  tools: { tr: '/araclar', international: 'tools' },
  blog: { tr: '/blog', international: 'blog' },
  tooldurcad: { tr: '/kurulum-indir', international: 'tooldurcad' },
  support: { tr: '/bizi-destekle', international: 'support' },
  'technical-call-library': { tr: '/teknik-cagri-kutuphanesi', international: 'technical-call-library' },
  roadmap: { tr: '/yol-haritasi', international: 'roadmap' },
  'release-notes': { tr: '/surum-notlari', international: 'release-notes' },
  'project-management': { tr: '/proje-yonetimi', international: 'project-management' },
  about: { tr: '/hakkimizda', international: 'about' },
  contact: { tr: '/iletisim', international: 'contact' },
  privacy: { tr: '/gizlilik', international: 'privacy' },
  terms: { tr: '/kullanim-sartlari', international: 'terms' },
  cookies: { tr: '/cerez-politikasi', international: 'cookies' },
  tool: { tr: '/arac', international: 'tool' },
  category: { tr: '/kategori', international: 'category' },
  'blog-post': { tr: '/blog', international: 'blog' },
};

export const TR_PATH_TO_ROUTE: Record<string, RouteKey> = Object.fromEntries(
  (Object.entries(ROUTES) as Array<[RouteKey, { tr: string; international: string }]>).map(([key, value]) => [value.tr, key])
) as Record<string, RouteKey>;

export const INT_PATH_TO_ROUTE: Record<string, RouteKey> = Object.fromEntries(
  (Object.entries(ROUTES) as Array<[RouteKey, { tr: string; international: string }]>).map(([key, value]) => [`/${value.international}`, key])
) as Record<string, RouteKey>;

export function isSupportedLocale(value: string | undefined | null): value is Locale {
  return !!value && (ALL_LOCALES as readonly string[]).includes(value);
}

export function isPublicLocale(value: string | undefined | null): value is PublicLocale {
  return !!value && (PUBLIC_LOCALES as readonly string[]).includes(value);
}

export function isIndexableLocale(value: string | undefined | null): value is Locale {
  return !!value && (INDEXABLE_LOCALES as readonly string[]).includes(value);
}

export function getLocaleFromPathname(pathname: string): Locale {
  const first = pathname.split('/').filter(Boolean)[0];
  return isPublicLocale(first) ? first : 'tr';
}

export function removeLocalePrefix(pathname: string): { locale: Locale; pathnameWithoutLocale: string } {
  const normalized = pathname || '/';
  const parts = normalized.split('/').filter(Boolean);
  const first = parts[0];
  if (isPublicLocale(first)) {
    const rest = `/${parts.slice(1).join('/')}`;
    return { locale: first, pathnameWithoutLocale: rest === '/' ? '/' : rest.replace(/\/$/, '') || '/' };
  }
  return { locale: 'tr', pathnameWithoutLocale: normalized.replace(/\/$/, '') || '/' };
}

export function resolveRouteFromPathname(pathname: string): { route: RouteKey; slug?: string } {
  const { locale, pathnameWithoutLocale } = removeLocalePrefix(pathname);
  const normalized = pathnameWithoutLocale.replace(/\/$/, '') || '/';

  if (locale === 'tr') {
    if (normalized.startsWith('/arac/')) return { route: 'tool', slug: normalized.replace('/arac/', '') };
    if (normalized.startsWith('/kategori/')) return { route: 'category', slug: normalized.replace('/kategori/', '') };
    if (normalized.startsWith('/blog/')) return { route: 'blog-post', slug: normalized.replace('/blog/', '') };
    return { route: TR_PATH_TO_ROUTE[normalized] || 'home' };
  }

  if (normalized.startsWith('/tool/')) return { route: 'tool', slug: normalized.replace('/tool/', '') };
  if (normalized.startsWith('/category/')) return { route: 'category', slug: normalized.replace('/category/', '') };
  if (normalized.startsWith('/blog/')) {
    const slug = normalized.replace('/blog/', '');
    return slug ? { route: 'blog-post', slug } : { route: 'blog' };
  }
  return { route: INT_PATH_TO_ROUTE[normalized] || (normalized === '/' ? 'home' : 'home') };
}

export function getLocalizedPath(locale: Locale, route: RouteKey, slug?: string): string {
  if (locale === 'tr') {
    if (route === 'tool') return slug ? `/arac/${slug}` : '/araclar';
    if (route === 'category') return slug ? `/kategori/${slug}` : '/araclar';
    if (route === 'blog-post') return slug ? `/blog/${slug}` : '/blog';
    return ROUTES[route]?.tr || '/';
  }

  if (route === 'tool') return slug ? `/${locale}/tool/${slug}` : `/${locale}/tools`;
  if (route === 'category') return slug ? `/${locale}/category/${slug}` : `/${locale}/tools`;
  if (route === 'blog-post') return slug ? `/${locale}/blog/${slug}` : `/${locale}/blog`;

  const segment = ROUTES[route]?.international || '';
  return segment ? `/${locale}/${segment}` : `/${locale}`;
}

export function localizeCurrentPath(pathname: string, targetLocale: Locale): string {
  const { route, slug } = resolveRouteFromPathname(pathname);
  return getLocalizedPath(targetLocale, route, slug);
}

export function absoluteLocalizedUrl(locale: Locale, route: RouteKey, slug?: string): string {
  return `${BASE_URL}${getLocalizedPath(locale, route, slug)}`;
}

export function languageAlternates(route: RouteKey, slug?: string): Record<string, string> {
  const entries: Record<string, string> = {
    'x-default': absoluteLocalizedUrl('tr', route, slug),
  };
  INDEXABLE_LOCALES.forEach((locale) => {
    entries[locale] = absoluteLocalizedUrl(locale, route, slug);
  });
  return entries;
}

export function localeDir(locale: Locale): 'ltr' | 'rtl' {
  return LANGUAGE_META[locale]?.dir || 'ltr';
}

export const UI_TEXT: Record<Locale, {
  nav: { home: string; tools: string; blog: string; technical: string; roadmap: string; categories: string; search: string; support: string; cad: string; login: string; panel: string; language: string; quick: string; allTools: string; downloadCad: string; projects: string; menu: string; closeMenu: string; accountCheck: string; logout: string; forum: string };
  footer: { description: string; active: string; support: string; categories: string; links: string; rights: string; cookieSettings: string; about: string; contact: string; privacy: string; kvkk: string; terms: string; cookies: string; releaseNotes: string; roadmap: string; technical: string };
  cookie: { title: string; text: string; policy: string; reject: string; manage: string; accept: string; settingsTitle: string; settingsNote: string; necessaryTitle: string; necessaryText: string; alwaysActive: string; analyticsTitle: string; analyticsText: string; adsTitle: string; adsText: string; save: string; close: string };
}> = {
  tr: {
    nav: { home: 'Ana Sayfa', tools: 'Araçlar', blog: 'Blog', technical: 'Teknik Çağrı', roadmap: 'Roadmap', categories: 'Kategoriler', search: 'Araç Ara', support: 'Bizi Destekle', cad: 'CAD Destek', login: 'Giriş', panel: 'Panelim', language: 'Dil Seçimi', quick: 'Hızlı Erişim', allTools: 'Tüm Araçları Gör', downloadCad: 'CAD Destek İndir', projects: 'Projeler', menu: 'Menü', closeMenu: 'Menüyü kapat', accountCheck: 'Oturum kontrol ediliyor', logout: 'Çıkış Yap', forum: 'Forum' },
    footer: { description: 'Elektrik, inşaat ve makine mühendisliği için ücretsiz online hesaplama araçları.', active: 'Aktif · %100 Ücretsiz', support: 'Bizi Destekle', categories: 'Kategoriler', links: 'Bağlantılar', rights: 'Tüm hakları saklıdır', cookieSettings: 'Çerez Tercihlerimi Yönet', about: 'Hakkımızda', contact: 'İletişim', privacy: 'Gizlilik Politikası ve KVKK', kvkk: 'KVKK Başvuru Formu', terms: 'Kullanım Şartları', cookies: 'Çerez Politikası', releaseNotes: 'Sürüm Notları', roadmap: 'Yol Haritası', technical: 'Teknik Çağrı Kütüphanesi' },
    cookie: { title: 'Çerez Tercihleri', text: 'Zorunlu çerezler site güvenliği, oturum ve tercih yönetimi için kullanılır. Analitik ve reklam/pazarlama çerezleri açık rızanız olmadan çalışmaz. Tercihlerinizi istediğiniz zaman değiştirebilirsiniz.', policy: 'Çerez Politikası', reject: 'Tümünü Reddet', manage: 'Tercihleri Yönet', accept: 'Tümünü Kabul Et', settingsTitle: 'Çerez Ayarları', settingsNote: 'Zorunlu olmayan çerezler varsayılan olarak kapalıdır.', necessaryTitle: 'Zorunlu Çerezler', necessaryText: 'Site güvenliği, oturum yönetimi ve çerez tercihinizin saklanması için gereklidir. Pazarlama amacıyla kullanılmaz ve devre dışı bırakılamaz.', alwaysActive: 'Her zaman aktif', analyticsTitle: 'Analitik Çerezler', analyticsText: 'Google Analytics ile ziyaret ve performans ölçümü yapılır. Açık rıza vermezseniz yüklenmez.', adsTitle: 'Reklam ve Pazarlama Çerezleri', adsText: 'Google AdSense/Ads reklam gösterimi, ölçümü ve kişiselleştirme amaçlarıyla çalışır. Açık rıza vermezseniz yüklenmez.', save: 'Seçimlerimi Kaydet', close: 'Ayarları kapat' },
  },
  en: {
    nav: { home: 'Home', tools: 'Tools', blog: 'Blog', technical: 'Technical Notes', roadmap: 'Roadmap', categories: 'Categories', search: 'Search', support: 'Support', cad: 'TooldurCAD', login: 'Login', panel: 'Panel', language: 'Language', quick: 'Quick Access', allTools: 'View Tools', downloadCad: 'Download TooldurCAD', projects: 'Projects', menu: 'Menu', closeMenu: 'Close menu', accountCheck: 'Checking session', logout: 'Log out', forum: 'Forum' },
    footer: { description: 'Free online engineering calculators for electrical, construction and mechanical design work.', active: 'Active · 100% Free', support: 'Support Tooldur', categories: 'Categories', links: 'Links', rights: 'All rights reserved', cookieSettings: 'Manage Cookie Preferences', about: 'About', contact: 'Contact', privacy: 'Privacy Policy', kvkk: 'Data Request Form', terms: 'Terms of Use', cookies: 'Cookie Policy', releaseNotes: 'Release Notes', roadmap: 'Roadmap', technical: 'Technical Notes Library' },
    cookie: { title: 'Cookie Preferences', text: 'Essential cookies are used for site security, sessions and preference management. Analytics and advertising cookies do not run without your consent. You can change your preferences at any time.', policy: 'Cookie Policy', reject: 'Reject All', manage: 'Manage Preferences', accept: 'Accept All', settingsTitle: 'Cookie Settings', settingsNote: 'Optional cookies are disabled by default.', necessaryTitle: 'Essential Cookies', necessaryText: 'Required for site security, session management and saving your cookie preferences. They are not used for marketing and cannot be disabled.', alwaysActive: 'Always active', analyticsTitle: 'Analytics Cookies', analyticsText: 'Google Analytics is used for visit and performance measurement. It is not loaded unless you consent.', adsTitle: 'Advertising and Marketing Cookies', adsText: 'Google AdSense/Ads works for ad display, measurement and personalization. It is not loaded unless you consent.', save: 'Save Choices', close: 'Close settings' },
  },
  es: {
    nav: { home: 'Inicio', tools: 'Herramientas', blog: 'Blog', technical: 'Notas técnicas', roadmap: 'Hoja de ruta', categories: 'Categorías', search: 'Buscar', support: 'Apoyar', cad: 'TooldurCAD', login: 'Ingresar', panel: 'Panel', language: 'Idioma', quick: 'Acceso rápido', allTools: 'Ver herramientas', downloadCad: 'Descargar TooldurCAD', projects: 'Proyectos', menu: 'Menú', closeMenu: 'Cerrar menú', accountCheck: 'Comprobando sesión', logout: 'Salir', forum: 'Foro' },
    footer: { description: 'Calculadoras de ingeniería gratuitas para electricidad, construcción y diseño mecánico.', active: 'Activo · 100% gratis', support: 'Apoyar Tooldur', categories: 'Categorías', links: 'Enlaces', rights: 'Todos los derechos reservados', cookieSettings: 'Gestionar preferencias de cookies', about: 'Acerca de', contact: 'Contacto', privacy: 'Privacidad', kvkk: 'Formulario de datos', terms: 'Términos de uso', cookies: 'Política de cookies', releaseNotes: 'Notas de versión', roadmap: 'Hoja de ruta', technical: 'Biblioteca de notas técnicas' },
    cookie: { title: 'Preferencias de cookies', text: 'Las cookies esenciales se usan para seguridad, sesiones y preferencias. Las cookies de analítica y publicidad no se ejecutan sin consentimiento.', policy: 'Política de cookies', reject: 'Rechazar todo', manage: 'Gestionar preferencias', accept: 'Aceptar todo', settingsTitle: 'Configuración de cookies', settingsNote: 'Las cookies opcionales están desactivadas por defecto.', necessaryTitle: 'Cookies esenciales', necessaryText: 'Necesarias para seguridad, sesión y guardar preferencias. No se usan para marketing y no se pueden desactivar.', alwaysActive: 'Siempre activas', analyticsTitle: 'Cookies analíticas', analyticsText: 'Google Analytics mide visitas y rendimiento. No se carga sin consentimiento.', adsTitle: 'Cookies publicitarias', adsText: 'Google AdSense/Ads se usa para anuncios, medición y personalización. No se carga sin consentimiento.', save: 'Guardar selección', close: 'Cerrar ajustes' },
  },
  zh: {
    nav: { home: '首页', tools: '工具', blog: '博客', technical: '技术说明', roadmap: '路线图', categories: '分类', search: '搜索', support: '支持', cad: 'TooldurCAD', login: '登录', panel: '面板', language: '语言', quick: '快速入口', allTools: '查看工具', downloadCad: '下载 TooldurCAD', projects: '项目', menu: '菜单', closeMenu: '关闭菜单', accountCheck: '正在检查会话', logout: '退出', forum: '论坛' },
    footer: { description: '面向电气、建筑和机械设计工作的免费在线工程计算器。', active: '在线 · 完全免费', support: '支持 Tooldur', categories: '分类', links: '链接', rights: '保留所有权利', cookieSettings: '管理 Cookie 偏好', about: '关于', contact: '联系', privacy: '隐私政策', kvkk: '数据申请表', terms: '使用条款', cookies: 'Cookie 政策', releaseNotes: '版本说明', roadmap: '路线图', technical: '技术说明库' },
    cookie: { title: 'Cookie 偏好', text: '必要 Cookie 用于网站安全、会话和偏好管理。分析和广告 Cookie 未经同意不会运行。', policy: 'Cookie 政策', reject: '全部拒绝', manage: '管理偏好', accept: '全部接受', settingsTitle: 'Cookie 设置', settingsNote: '可选 Cookie 默认关闭。', necessaryTitle: '必要 Cookie', necessaryText: '用于网站安全、会话管理和保存 Cookie 偏好。不会用于营销，也不能关闭。', alwaysActive: '始终启用', analyticsTitle: '分析 Cookie', analyticsText: 'Google Analytics 用于访问和性能测量。未经同意不会加载。', adsTitle: '广告 Cookie', adsText: 'Google AdSense/Ads 用于广告展示、测量和个性化。未经同意不会加载。', save: '保存选择', close: '关闭设置' },
  },
  hi: {
    nav: { home: 'होम', tools: 'टूल्स', blog: 'ब्लॉग', technical: 'तकनीकी नोट्स', roadmap: 'रोडमैप', categories: 'श्रेणियाँ', search: 'खोजें', support: 'समर्थन', cad: 'TooldurCAD', login: 'लॉगिन', panel: 'पैनल', language: 'भाषा', quick: 'त्वरित पहुँच', allTools: 'टूल्स देखें', downloadCad: 'TooldurCAD डाउनलोड', projects: 'प्रोजेक्ट', menu: 'मेनू', closeMenu: 'मेनू बंद करें', accountCheck: 'सत्र जांचा जा रहा है', logout: 'लॉग आउट', forum: 'फोरम' },
    footer: { description: 'इलेक्ट्रिकल, निर्माण और मैकेनिकल डिजाइन कार्य के लिए मुफ्त ऑनलाइन इंजीनियरिंग कैलकुलेटर।', active: 'सक्रिय · 100% मुफ्त', support: 'Tooldur का समर्थन करें', categories: 'श्रेणियाँ', links: 'लिंक', rights: 'सर्वाधिकार सुरक्षित', cookieSettings: 'Cookie प्राथमिकताएँ प्रबंधित करें', about: 'परिचय', contact: 'संपर्क', privacy: 'गोपनीयता नीति', kvkk: 'डेटा अनुरोध फ़ॉर्म', terms: 'उपयोग की शर्तें', cookies: 'Cookie नीति', releaseNotes: 'रिलीज नोट्स', roadmap: 'रोडमैप', technical: 'तकनीकी नोट्स लाइब्रेरी' },
    cookie: { title: 'Cookie प्राथमिकताएँ', text: 'जरूरी Cookie साइट सुरक्षा, सत्र और प्राथमिकताओं के लिए उपयोग होते हैं। एनालिटिक्स और विज्ञापन Cookie आपकी सहमति के बिना नहीं चलते।', policy: 'Cookie नीति', reject: 'सभी अस्वीकार करें', manage: 'प्राथमिकताएँ प्रबंधित करें', accept: 'सभी स्वीकार करें', settingsTitle: 'Cookie सेटिंग्स', settingsNote: 'वैकल्पिक Cookie डिफ़ॉल्ट रूप से बंद हैं।', necessaryTitle: 'जरूरी Cookie', necessaryText: 'सुरक्षा, सत्र और Cookie प्राथमिकता सेव करने के लिए आवश्यक। मार्केटिंग के लिए उपयोग नहीं होते और बंद नहीं किए जा सकते।', alwaysActive: 'हमेशा सक्रिय', analyticsTitle: 'एनालिटिक्स Cookie', analyticsText: 'Google Analytics विज़िट और प्रदर्शन मापता है। सहमति के बिना लोड नहीं होता।', adsTitle: 'विज्ञापन Cookie', adsText: 'Google AdSense/Ads विज्ञापन, माप और निजीकरण के लिए काम करता है। सहमति के बिना लोड नहीं होता।', save: 'चयन सेव करें', close: 'सेटिंग्स बंद करें' },
  },
  ar: {
    nav: { home: 'الرئيسية', tools: 'الأدوات', blog: 'المدونة', technical: 'ملاحظات فنية', roadmap: 'خارطة الطريق', categories: 'الفئات', search: 'بحث', support: 'ادعمنا', cad: 'TooldurCAD', login: 'تسجيل الدخول', panel: 'لوحة التحكم', language: 'اللغة', quick: 'وصول سريع', allTools: 'عرض الأدوات', downloadCad: 'تنزيل TooldurCAD', projects: 'المشاريع', menu: 'القائمة', closeMenu: 'إغلاق القائمة', accountCheck: 'جارٍ فحص الجلسة', logout: 'تسجيل الخروج', forum: 'المنتدى' },
    footer: { description: 'حاسبات هندسية مجانية على الإنترنت للأعمال الكهربائية والإنشائية والتصميم الميكانيكي.', active: 'نشط · مجاني 100%', support: 'ادعم Tooldur', categories: 'الفئات', links: 'روابط', rights: 'جميع الحقوق محفوظة', cookieSettings: 'إدارة تفضيلات ملفات الارتباط', about: 'من نحن', contact: 'اتصال', privacy: 'سياسة الخصوصية', kvkk: 'نموذج طلب البيانات', terms: 'شروط الاستخدام', cookies: 'سياسة ملفات الارتباط', releaseNotes: 'ملاحظات الإصدار', roadmap: 'خارطة الطريق', technical: 'مكتبة الملاحظات الفنية' },
    cookie: { title: 'تفضيلات ملفات الارتباط', text: 'تُستخدم ملفات الارتباط الأساسية لأمان الموقع والجلسات وإدارة التفضيلات. لا تعمل ملفات التحليلات والإعلانات بدون موافقتك.', policy: 'سياسة ملفات الارتباط', reject: 'رفض الكل', manage: 'إدارة التفضيلات', accept: 'قبول الكل', settingsTitle: 'إعدادات ملفات الارتباط', settingsNote: 'ملفات الارتباط الاختيارية معطلة افتراضياً.', necessaryTitle: 'ملفات الارتباط الأساسية', necessaryText: 'مطلوبة للأمان وإدارة الجلسة وحفظ تفضيلاتك. لا تُستخدم للتسويق ولا يمكن تعطيلها.', alwaysActive: 'نشطة دائماً', analyticsTitle: 'ملفات التحليلات', analyticsText: 'يُستخدم Google Analytics لقياس الزيارات والأداء. لا يتم تحميله بدون موافقة.', adsTitle: 'ملفات الإعلان والتسويق', adsText: 'يعمل Google AdSense/Ads لعرض الإعلانات والقياس والتخصيص. لا يتم تحميله بدون موافقة.', save: 'حفظ الاختيارات', close: 'إغلاق الإعدادات' },
  },
};
