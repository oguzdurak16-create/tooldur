import type { Category, Tool } from '@/data/tools';
import { categories, tools } from '@/data/tools';
import { getCopy } from '@/lib/localizedContent';
import { getLocalizedPath, type Locale } from '@/lib/siteLanguage';

export type LocalizedTool = Tool;
export type LocalizedCategory = Category;

type ToolNameCopy = { name: string; shortName?: string; description?: string };

type ToolPageCopy = {
  badge: string;
  title: string;
  description: string;
  searchPlaceholder: string;
  allCategories: string;
  result: string;
  tool: string;
  category: string;
  categoriesTitle: string;
  categoriesDescription: string;
  noResultsTitle: string;
  noResultsText: string;
  resetFilters: string;
  searchLabel: string;
  categoryLabel: string;
  toolCountSuffix: string;
  openAction: string;
  freeTool: string;
  newBadge: string;
  popularBadge: string;
  toleranceBadge: string;
};

export const TOOLS_PAGE_COPY: Record<Locale, ToolPageCopy> = {
  tr: {
    badge: 'TÜM ARAÇLAR',
    title: 'Tüm Mühendislik Araçları',
    description: 'Elektrik, inşaat, makine ve genel hesaplama araçlarını tek ekranda bulun.',
    searchPlaceholder: 'Araç ara...',
    allCategories: 'Tüm kategoriler',
    result: 'Sonuç',
    tool: 'Araç',
    category: 'Kategori',
    categoriesTitle: 'Hesaplama kategorileri',
    categoriesDescription: 'Kategori seçerek ilgili araçlara hızlıca ulaşın.',
    noResultsTitle: 'Araç bulunamadı',
    noResultsText: 'Arama kelimesini değiştir ya da kategori filtresini kaldır.',
    resetFilters: 'Filtreleri sıfırla',
    searchLabel: 'Arama',
    categoryLabel: 'Kategori',
    toolCountSuffix: 'araç',
    openAction: 'Hesapla →',
    freeTool: 'Ücretsiz araç',
    newBadge: 'Yeni',
    popularBadge: 'Popüler',
    toleranceBadge: 'Tolerans',
  },
  en: {
    badge: 'ALL TOOLS',
    title: 'All Engineering Tools',
    description: 'Find electrical, construction, mechanical and general engineering calculators in one place.',
    searchPlaceholder: 'Search tools...',
    allCategories: 'All categories',
    result: 'Result',
    tool: 'Tool',
    category: 'Category',
    categoriesTitle: 'Calculation categories',
    categoriesDescription: 'Choose a category to quickly reach the related tools.',
    noResultsTitle: 'No tool found',
    noResultsText: 'Change the search term or remove the category filter.',
    resetFilters: 'Reset filters',
    searchLabel: 'Search',
    categoryLabel: 'Category',
    toolCountSuffix: 'tools',
    openAction: 'Calculate →',
    freeTool: 'Free tool',
    newBadge: 'New',
    popularBadge: 'Popular',
    toleranceBadge: 'Tolerance',
  },
  es: {
    badge: 'TODAS LAS HERRAMIENTAS',
    title: 'Todas las herramientas de ingeniería',
    description: 'Encuentra calculadoras eléctricas, de construcción, mecánicas y generales en una sola pantalla.',
    searchPlaceholder: 'Buscar herramienta...',
    allCategories: 'Todas las categorías',
    result: 'Resultado',
    tool: 'Herramienta',
    category: 'Categoría',
    categoriesTitle: 'Categorías de cálculo',
    categoriesDescription: 'Elige una categoría para acceder rápido a las herramientas relacionadas.',
    noResultsTitle: 'No se encontró herramienta',
    noResultsText: 'Cambia la búsqueda o elimina el filtro de categoría.',
    resetFilters: 'Restablecer filtros',
    searchLabel: 'Búsqueda',
    categoryLabel: 'Categoría',
    toolCountSuffix: 'herramientas',
    openAction: 'Calcular →',
    freeTool: 'Herramienta gratuita',
    newBadge: 'Nuevo',
    popularBadge: 'Popular',
    toleranceBadge: 'Tolerancia',
  },
  zh: {
    badge: '全部工具',
    title: '全部工程工具',
    description: '在一个页面中查找电气、建筑、机械和通用工程计算器。',
    searchPlaceholder: '搜索工具...',
    allCategories: '全部分类',
    result: '结果',
    tool: '工具',
    category: '分类',
    categoriesTitle: '计算分类',
    categoriesDescription: '选择分类即可快速打开相关工具。',
    noResultsTitle: '未找到工具',
    noResultsText: '请更改搜索词或取消分类筛选。',
    resetFilters: '重置筛选',
    searchLabel: '搜索',
    categoryLabel: '分类',
    toolCountSuffix: '个工具',
    openAction: '计算 →',
    freeTool: '免费工具',
    newBadge: '新',
    popularBadge: '热门',
    toleranceBadge: '公差',
  },
  hi: {
    badge: 'सभी टूल्स',
    title: 'सभी इंजीनियरिंग टूल्स',
    description: 'इलेक्ट्रिकल, निर्माण, मैकेनिकल और सामान्य इंजीनियरिंग कैलकुलेटर एक जगह खोजें।',
    searchPlaceholder: 'टूल खोजें...',
    allCategories: 'सभी श्रेणियाँ',
    result: 'परिणाम',
    tool: 'टूल',
    category: 'श्रेणी',
    categoriesTitle: 'कैलकुलेशन श्रेणियाँ',
    categoriesDescription: 'संबंधित टूल्स तक जल्दी पहुँचने के लिए श्रेणी चुनें।',
    noResultsTitle: 'कोई टूल नहीं मिला',
    noResultsText: 'खोज शब्द बदलें या श्रेणी फ़िल्टर हटाएँ।',
    resetFilters: 'फ़िल्टर रीसेट करें',
    searchLabel: 'खोज',
    categoryLabel: 'श्रेणी',
    toolCountSuffix: 'टूल',
    openAction: 'कैलकुलेट →',
    freeTool: 'मुफ्त टूल',
    newBadge: 'नया',
    popularBadge: 'लोकप्रिय',
    toleranceBadge: 'टॉलरेंस',
  },
  ar: {
    badge: 'كل الأدوات',
    title: 'كل الأدوات الهندسية',
    description: 'اعثر على حاسبات الكهرباء والإنشاءات والميكانيك والحسابات العامة في مكان واحد.',
    searchPlaceholder: 'ابحث عن أداة...',
    allCategories: 'كل الفئات',
    result: 'نتيجة',
    tool: 'أداة',
    category: 'فئة',
    categoriesTitle: 'فئات الحساب',
    categoriesDescription: 'اختر فئة للوصول سريعاً إلى الأدوات المرتبطة.',
    noResultsTitle: 'لم يتم العثور على أداة',
    noResultsText: 'غيّر كلمة البحث أو أزل فلتر الفئة.',
    resetFilters: 'إعادة ضبط الفلاتر',
    searchLabel: 'بحث',
    categoryLabel: 'فئة',
    toolCountSuffix: 'أدوات',
    openAction: 'احسب →',
    freeTool: 'أداة مجانية',
    newBadge: 'جديد',
    popularBadge: 'شائع',
    toleranceBadge: 'تفاوت',
  },
};

export const TOOL_PAGE_LABELS: Record<Locale, {
  home: string;
  allTools: string;
  faq: string;
  relatedGuides: string;
  similarTools: string;
  similarToolsText: string;
  open: string;
  useCaseFallback: string;
}> = {
  tr: { home: 'Ana Sayfa', allTools: 'Tüm Araçlar', faq: 'Sık sorulan sorular', relatedGuides: 'İlgili rehberler', similarTools: 'Benzer araçlar', similarToolsText: 'Aynı kategori altında işine yarayabilecek diğer araçlar.', open: 'Aç →', useCaseFallback: 'Kullanım alanları' },
  en: { home: 'Home', allTools: 'All Tools', faq: 'Frequently asked questions', relatedGuides: 'Related guides', similarTools: 'Similar tools', similarToolsText: 'Other tools in the same category that may be useful.', open: 'Open →', useCaseFallback: 'Use cases' },
  es: { home: 'Inicio', allTools: 'Todas las herramientas', faq: 'Preguntas frecuentes', relatedGuides: 'Guías relacionadas', similarTools: 'Herramientas similares', similarToolsText: 'Otras herramientas de la misma categoría que pueden ser útiles.', open: 'Abrir →', useCaseFallback: 'Casos de uso' },
  zh: { home: '首页', allTools: '全部工具', faq: '常见问题', relatedGuides: '相关指南', similarTools: '类似工具', similarToolsText: '同一分类下可能有用的其他工具。', open: '打开 →', useCaseFallback: '使用场景' },
  hi: { home: 'होम', allTools: 'सभी टूल्स', faq: 'अक्सर पूछे जाने वाले प्रश्न', relatedGuides: 'संबंधित गाइड', similarTools: 'मिलते-जुलते टूल्स', similarToolsText: 'इसी श्रेणी के अन्य उपयोगी टूल्स।', open: 'खोलें →', useCaseFallback: 'उपयोग क्षेत्र' },
  ar: { home: 'الرئيسية', allTools: 'كل الأدوات', faq: 'الأسئلة الشائعة', relatedGuides: 'أدلة ذات صلة', similarTools: 'أدوات مشابهة', similarToolsText: 'أدوات أخرى من نفس الفئة قد تكون مفيدة.', open: 'فتح →', useCaseFallback: 'مجالات الاستخدام' },
};

const TOOL_NAMES: Record<Exclude<Locale, 'tr'>, Record<string, ToolNameCopy>> = {
  en: {
    'kablo-kesiti': { name: 'Cable Size Calculator', shortName: 'Cable Size' },
    'voltaj-dusumu': { name: 'Voltage Drop Calculator', shortName: 'Voltage Drop' },
    'elektrik-fatura': { name: 'Electricity Bill Calculator', shortName: 'Electricity Bill' },
    'guc-faktoru': { name: 'Power Factor Correction', shortName: 'Power Factor' },
    'led-direnc': { name: 'LED Resistor Calculator', shortName: 'LED Resistor' },
    'ohm-kanunu': { name: "Ohm's Law Calculator", shortName: "Ohm's Law" },
    'beton-hesaplama': { name: 'Concrete Quantity Calculator', shortName: 'Concrete Quantity' },
    'demir-hesaplama': { name: 'Rebar Weight Calculator', shortName: 'Rebar Weight' },
    'celik-profil': { name: 'Steel Profile Weight Calculator', shortName: 'Steel Profile' },
    'tugla-hesaplama': { name: 'Brick Quantity Calculator', shortName: 'Brick Quantity' },
    'merdiven-hesaplama': { name: 'Stair Calculator', shortName: 'Stair' },
    'levha-agirlik': { name: 'Sheet/Plate Weight Calculator', shortName: 'Plate Weight' },
    'baklavali-sac-agirlik': { name: 'Checker Plate Weight Calculator', shortName: 'Checker Plate' },
    'iso-tolerans': { name: 'ISO Fit and Tolerance Calculator', shortName: 'ISO Tolerance' },
    'kilavuz-matkap': { name: 'Tap Drill and Thread Callout', shortName: 'Tap Drill' },
    'yuzey-puruzlulugu': { name: 'Surface Roughness Guide', shortName: 'Surface Roughness' },
    'teknik-cagri': { name: 'Technical Drawing Callout Generator', shortName: 'Drawing Callout' },
    'civata-tork': { name: 'Bolt Tightening Torque Calculator', shortName: 'Bolt Torque' },
    'sac-bukum-acinim': { name: 'Sheet Metal Bend Allowance Calculator', shortName: 'Sheet Metal Bend' },
    'tork-hesaplama': { name: 'Torque Calculator', shortName: 'Torque' },
    'basinc-hesaplama': { name: 'Pressure Calculator', shortName: 'Pressure' },
    'hiz-hesaplama': { name: 'Speed Calculator', shortName: 'Speed' },
    'mil-mukavemet': { name: 'Shaft Strength Calculator', shortName: 'Shaft Strength' },
    'kama-kanali': { name: 'Keyway Calculator (DIN 6885)', shortName: 'Keyway' },
    'uzunluk-cevirici': { name: 'Length Unit Converter', shortName: 'Length' },
    'agirlik-cevirici': { name: 'Weight Unit Converter', shortName: 'Weight' },
    'alan-cevirici': { name: 'Area Unit Converter', shortName: 'Area' },
    'hacim-cevirici': { name: 'Volume Unit Converter', shortName: 'Volume' },
    'sicaklik-cevirici': { name: 'Temperature Unit Converter', shortName: 'Temperature' },
    'basinc-cevirici': { name: 'Pressure Unit Converter', shortName: 'Pressure' },
    'yuzde-hesaplama': { name: 'Percentage Calculator', shortName: 'Percentage' },
    'alan-hesaplama': { name: 'Area Calculator', shortName: 'Area' },
    'hacim-hesaplama': { name: 'Volume Calculator', shortName: 'Volume' },
    pisagor: { name: 'Pythagorean Theorem Calculator', shortName: 'Pythagoras' },
    'disli-carki': { name: 'Gear Calculator', shortName: 'Gear' },
    'yay-hesaplama': { name: 'Spring Calculator', shortName: 'Spring' },
    'rulman-omru': { name: 'Bearing Life Calculator', shortName: 'Bearing Life' },
    viskozite: { name: 'Viscosity Conversion', shortName: 'Viscosity' },
    'guc-verim': { name: 'Power and Efficiency Calculator', shortName: 'Efficiency' },
    'termal-iletim': { name: 'Thermal Conduction Calculator', shortName: 'Thermal Conduction' },
    'devir-frekans': { name: 'RPM-Frequency Conversion', shortName: 'RPM-Frequency' },
    'boru-eti-hesaplama': { name: 'Pipe Wall Thickness Calculator', shortName: 'Pipe Wall' },
    'o-ring-kanali': { name: 'O-Ring Groove Calculator', shortName: 'O-Ring Groove' },
    'isil-genlesme': { name: 'Thermal Expansion Calculator', shortName: 'Thermal Expansion' },
    'reynolds-sayisi': { name: 'Reynolds Number Calculator', shortName: 'Reynolds Number' },
    'basincli-kap-cidar': { name: 'Pressure Vessel Wall Thickness', shortName: 'Vessel Wall' },
    'oee-uretim': { name: 'OEE Production Efficiency Calculator', shortName: 'OEE' },
    'takt-suresi': { name: 'Takt Time and Capacity Calculator', shortName: 'Takt Time' },
    'molarite-seyreltme': { name: 'Molarity Dilution Calculator', shortName: 'Molarity' },
    'karbon-emisyonu': { name: 'Carbon Emission Calculator', shortName: 'Carbon Emission' },
    'gunes-paneli-enerji': { name: 'Solar Panel Energy Calculator', shortName: 'Solar Energy' },
    'api-sla-uptime': { name: 'API SLA and Uptime Calculator', shortName: 'SLA Uptime' },
    'proje-yonetimi': { name: 'Project Management Board', shortName: 'Project Board' },
    'pazaryeri-fiyat-hesaplama': { name: 'Marketplace Price Calculator', shortName: 'Marketplace Price' },
    'kdv-hesaplama': { name: 'VAT Calculator', shortName: 'VAT' },
    'bmi-hesaplama': { name: 'Body Mass Index (BMI)', shortName: 'BMI' },
    'kira-artis-hesaplama': { name: 'Rent Increase Calculator', shortName: 'Rent Increase' },
    'kredi-hesaplama': { name: 'Loan Calculator', shortName: 'Loan' },
    'kayis-kasnak-hesaplama': { name: 'Belt and Pulley Calculator', shortName: 'Belt-Pulley' },
    'pompa-guc-hesaplama': { name: 'Pump Power Calculator', shortName: 'Pump Power' },
    'kaynak-dikisi-hesaplama': { name: 'Weld Strength Calculator', shortName: 'Weld Strength' },
  },
  es: {
    'kablo-kesiti': { name: 'Calculadora de sección de cable', shortName: 'Sección de cable' },
    'voltaj-dusumu': { name: 'Calculadora de caída de tensión', shortName: 'Caída de tensión' },
    'elektrik-fatura': { name: 'Calculadora de factura eléctrica', shortName: 'Factura eléctrica' },
    'guc-faktoru': { name: 'Corrección del factor de potencia', shortName: 'Factor de potencia' },
    'led-direnc': { name: 'Calculadora de resistencia LED', shortName: 'Resistencia LED' },
    'ohm-kanunu': { name: 'Calculadora de la ley de Ohm', shortName: 'Ley de Ohm' },
    'beton-hesaplama': { name: 'Calculadora de cantidad de hormigón', shortName: 'Hormigón' },
    'demir-hesaplama': { name: 'Calculadora de peso de armadura', shortName: 'Peso de armadura' },
    'celik-profil': { name: 'Calculadora de peso de perfil de acero', shortName: 'Perfil de acero' },
    'tugla-hesaplama': { name: 'Calculadora de ladrillos', shortName: 'Ladrillos' },
    'merdiven-hesaplama': { name: 'Calculadora de escaleras', shortName: 'Escalera' },
    'levha-agirlik': { name: 'Calculadora de peso de chapa/placa', shortName: 'Peso de placa' },
    'baklavali-sac-agirlik': { name: 'Calculadora de peso de chapa estriada', shortName: 'Chapa estriada' },
    'iso-tolerans': { name: 'Calculadora de ajuste y tolerancia ISO', shortName: 'Tolerancia ISO' },
    'kilavuz-matkap': { name: 'Broca para roscar y llamada de rosca', shortName: 'Broca de roscar' },
    'yuzey-puruzlulugu': { name: 'Guía de rugosidad superficial', shortName: 'Rugosidad' },
    'teknik-cagri': { name: 'Generador de llamadas de plano técnico', shortName: 'Llamada técnica' },
    'civata-tork': { name: 'Calculadora de par de apriete de tornillos', shortName: 'Par de tornillo' },
    'sac-bukum-acinim': { name: 'Calculadora de desarrollo de chapa plegada', shortName: 'Plegado de chapa' },
    'tork-hesaplama': { name: 'Calculadora de par', shortName: 'Par' },
    'basinc-hesaplama': { name: 'Calculadora de presión', shortName: 'Presión' },
    'hiz-hesaplama': { name: 'Calculadora de velocidad', shortName: 'Velocidad' },
    'mil-mukavemet': { name: 'Calculadora de resistencia de eje', shortName: 'Resistencia de eje' },
    'kama-kanali': { name: 'Calculadora de chavetero (DIN 6885)', shortName: 'Chavetero' },
    'uzunluk-cevirici': { name: 'Conversor de unidades de longitud', shortName: 'Longitud' },
    'agirlik-cevirici': { name: 'Conversor de unidades de peso', shortName: 'Peso' },
    'alan-cevirici': { name: 'Conversor de unidades de área', shortName: 'Área' },
    'hacim-cevirici': { name: 'Conversor de unidades de volumen', shortName: 'Volumen' },
    'sicaklik-cevirici': { name: 'Conversor de temperatura', shortName: 'Temperatura' },
    'basinc-cevirici': { name: 'Conversor de presión', shortName: 'Presión' },
    'yuzde-hesaplama': { name: 'Calculadora de porcentajes', shortName: 'Porcentaje' },
    'alan-hesaplama': { name: 'Calculadora de área', shortName: 'Área' },
    'hacim-hesaplama': { name: 'Calculadora de volumen', shortName: 'Volumen' },
    pisagor: { name: 'Calculadora del teorema de Pitágoras', shortName: 'Pitágoras' },
    'disli-carki': { name: 'Calculadora de engranajes', shortName: 'Engranaje' },
    'yay-hesaplama': { name: 'Calculadora de resortes', shortName: 'Resorte' },
    'rulman-omru': { name: 'Calculadora de vida de rodamiento', shortName: 'Vida de rodamiento' },
    viskozite: { name: 'Conversión de viscosidad', shortName: 'Viscosidad' },
    'guc-verim': { name: 'Calculadora de potencia y eficiencia', shortName: 'Eficiencia' },
    'termal-iletim': { name: 'Calculadora de conducción térmica', shortName: 'Conducción térmica' },
    'devir-frekans': { name: 'Conversión RPM-frecuencia', shortName: 'RPM-frecuencia' },
    'boru-eti-hesaplama': { name: 'Calculadora de espesor de pared de tubería', shortName: 'Pared de tubería' },
    'proje-yonetimi': { name: 'Panel de gestión de proyectos', shortName: 'Panel de proyectos' },
    'pazaryeri-fiyat-hesaplama': { name: 'Calculadora de precio para marketplaces', shortName: 'Precio marketplace' },
    'kdv-hesaplama': { name: 'Calculadora de IVA', shortName: 'IVA' },
    'bmi-hesaplama': { name: 'Índice de masa corporal (BMI)', shortName: 'BMI' },
    'kira-artis-hesaplama': { name: 'Calculadora de aumento de alquiler', shortName: 'Aumento de alquiler' },
    'kredi-hesaplama': { name: 'Calculadora de préstamos', shortName: 'Préstamo' },
    'kayis-kasnak-hesaplama': { name: 'Calculadora de correa y polea', shortName: 'Correa-polea' },
    'pompa-guc-hesaplama': { name: 'Calculadora de potencia de bomba', shortName: 'Potencia de bomba' },
    'kaynak-dikisi-hesaplama': { name: 'Calculadora de resistencia de soldadura', shortName: 'Soldadura' },
  },
  zh: {
    'kablo-kesiti': { name: '电缆截面积计算器', shortName: '电缆截面' },
    'voltaj-dusumu': { name: '电压降计算器', shortName: '电压降' },
    'elektrik-fatura': { name: '电费计算器', shortName: '电费' },
    'guc-faktoru': { name: '功率因数校正', shortName: '功率因数' },
    'led-direnc': { name: 'LED 电阻计算器', shortName: 'LED 电阻' },
    'ohm-kanunu': { name: '欧姆定律计算器', shortName: '欧姆定律' },
    'beton-hesaplama': { name: '混凝土用量计算器', shortName: '混凝土' },
    'demir-hesaplama': { name: '钢筋重量计算器', shortName: '钢筋重量' },
    'celik-profil': { name: '钢型材重量计算器', shortName: '钢型材' },
    'tugla-hesaplama': { name: '砖块数量计算器', shortName: '砖块' },
    'merdiven-hesaplama': { name: '楼梯计算器', shortName: '楼梯' },
    'levha-agirlik': { name: '板材重量计算器', shortName: '板材重量' },
    'baklavali-sac-agirlik': { name: '花纹板重量计算器', shortName: '花纹板' },
    'iso-tolerans': { name: 'ISO 配合与公差计算器', shortName: 'ISO 公差' },
    'kilavuz-matkap': { name: '攻丝钻孔与螺纹标注', shortName: '攻丝钻' },
    'yuzey-puruzlulugu': { name: '表面粗糙度指南', shortName: '表面粗糙度' },
    'teknik-cagri': { name: '工程图标注生成器', shortName: '图纸标注' },
    'civata-tork': { name: '螺栓拧紧扭矩计算器', shortName: '螺栓扭矩' },
    'sac-bukum-acinim': { name: '钣金折弯展开计算器', shortName: '钣金折弯' },
    'tork-hesaplama': { name: '扭矩计算器', shortName: '扭矩' },
    'basinc-hesaplama': { name: '压力计算器', shortName: '压力' },
    'hiz-hesaplama': { name: '速度计算器', shortName: '速度' },
    'mil-mukavemet': { name: '轴强度计算器', shortName: '轴强度' },
    'kama-kanali': { name: '键槽计算器（DIN 6885）', shortName: '键槽' },
    'uzunluk-cevirici': { name: '长度单位换算器', shortName: '长度' },
    'agirlik-cevirici': { name: '重量单位换算器', shortName: '重量' },
    'alan-cevirici': { name: '面积单位换算器', shortName: '面积' },
    'hacim-cevirici': { name: '体积单位换算器', shortName: '体积' },
    'sicaklik-cevirici': { name: '温度单位换算器', shortName: '温度' },
    'basinc-cevirici': { name: '压力单位换算器', shortName: '压力' },
    'yuzde-hesaplama': { name: '百分比计算器', shortName: '百分比' },
    'alan-hesaplama': { name: '面积计算器', shortName: '面积' },
    'hacim-hesaplama': { name: '体积计算器', shortName: '体积' },
    pisagor: { name: '勾股定理计算器', shortName: '勾股定理' },
    'disli-carki': { name: '齿轮计算器', shortName: '齿轮' },
    'yay-hesaplama': { name: '弹簧计算器', shortName: '弹簧' },
    'rulman-omru': { name: '轴承寿命计算器', shortName: '轴承寿命' },
    viskozite: { name: '黏度换算', shortName: '黏度' },
    'guc-verim': { name: '功率与效率计算器', shortName: '效率' },
    'termal-iletim': { name: '热传导计算器', shortName: '热传导' },
    'devir-frekans': { name: '转速-频率换算', shortName: '转速频率' },
    'boru-eti-hesaplama': { name: '管壁厚度计算器', shortName: '管壁厚度' },
    'proje-yonetimi': { name: '项目管理看板', shortName: '项目看板' },
    'pazaryeri-fiyat-hesaplama': { name: '平台售价计算器', shortName: '平台售价' },
    'kdv-hesaplama': { name: '增值税计算器', shortName: '增值税' },
    'bmi-hesaplama': { name: '身体质量指数（BMI）', shortName: 'BMI' },
    'kira-artis-hesaplama': { name: '租金涨幅计算器', shortName: '租金涨幅' },
    'kredi-hesaplama': { name: '贷款计算器', shortName: '贷款' },
    'kayis-kasnak-hesaplama': { name: '皮带与皮带轮计算器', shortName: '皮带轮' },
    'pompa-guc-hesaplama': { name: '泵功率计算器', shortName: '泵功率' },
    'kaynak-dikisi-hesaplama': { name: '焊缝强度计算器', shortName: '焊缝强度' },
  },
  hi: {
    'kablo-kesiti': { name: 'केबल साइज कैलकुलेटर', shortName: 'केबल साइज' },
    'voltaj-dusumu': { name: 'वोल्टेज ड्रॉप कैलकुलेटर', shortName: 'वोल्टेज ड्रॉप' },
    'elektrik-fatura': { name: 'बिजली बिल कैलकुलेटर', shortName: 'बिजली बिल' },
    'guc-faktoru': { name: 'पावर फैक्टर करेक्शन', shortName: 'पावर फैक्टर' },
    'led-direnc': { name: 'LED रेसिस्टर कैलकुलेटर', shortName: 'LED रेसिस्टर' },
    'ohm-kanunu': { name: 'ओम नियम कैलकुलेटर', shortName: 'ओम नियम' },
    'beton-hesaplama': { name: 'कंक्रीट मात्रा कैलकुलेटर', shortName: 'कंक्रीट मात्रा' },
    'demir-hesaplama': { name: 'रीबार वजन कैलकुलेटर', shortName: 'रीबार वजन' },
    'celik-profil': { name: 'स्टील प्रोफाइल वजन कैलकुलेटर', shortName: 'स्टील प्रोफाइल' },
    'tugla-hesaplama': { name: 'ईंट मात्रा कैलकुलेटर', shortName: 'ईंट' },
    'merdiven-hesaplama': { name: 'सीढ़ी कैलकुलेटर', shortName: 'सीढ़ी' },
    'levha-agirlik': { name: 'शीट/प्लेट वजन कैलकुलेटर', shortName: 'प्लेट वजन' },
    'baklavali-sac-agirlik': { name: 'चेकर प्लेट वजन कैलकुलेटर', shortName: 'चेकर प्लेट' },
    'iso-tolerans': { name: 'ISO फिट और टॉलरेंस कैलकुलेटर', shortName: 'ISO टॉलरेंस' },
    'kilavuz-matkap': { name: 'टैप ड्रिल और थ्रेड कॉलआउट', shortName: 'टैप ड्रिल' },
    'yuzey-puruzlulugu': { name: 'सरफेस रफनेस गाइड', shortName: 'सरफेस रफनेस' },
    'teknik-cagri': { name: 'टेक्निकल ड्रॉइंग कॉलआउट जनरेटर', shortName: 'ड्रॉइंग कॉलआउट' },
    'civata-tork': { name: 'बोल्ट टाइटनिंग टॉर्क कैलकुलेटर', shortName: 'बोल्ट टॉर्क' },
    'sac-bukum-acinim': { name: 'शीट मेटल बेंड कैलकुलेटर', shortName: 'शीट बेंड' },
    'tork-hesaplama': { name: 'टॉर्क कैलकुलेटर', shortName: 'टॉर्क' },
    'basinc-hesaplama': { name: 'प्रेशर कैलकुलेटर', shortName: 'प्रेशर' },
    'hiz-hesaplama': { name: 'स्पीड कैलकुलेटर', shortName: 'स्पीड' },
    'mil-mukavemet': { name: 'शाफ्ट स्ट्रेंथ कैलकुलेटर', shortName: 'शाफ्ट स्ट्रेंथ' },
    'kama-kanali': { name: 'कीवे कैलकुलेटर (DIN 6885)', shortName: 'कीवे' },
    'uzunluk-cevirici': { name: 'लंबाई यूनिट कन्वर्टर', shortName: 'लंबाई' },
    'agirlik-cevirici': { name: 'वजन यूनिट कन्वर्टर', shortName: 'वजन' },
    'alan-cevirici': { name: 'क्षेत्रफल यूनिट कन्वर्टर', shortName: 'क्षेत्रफल' },
    'hacim-cevirici': { name: 'आयतन यूनिट कन्वर्टर', shortName: 'आयतन' },
    'sicaklik-cevirici': { name: 'तापमान यूनिट कन्वर्टर', shortName: 'तापमान' },
    'basinc-cevirici': { name: 'प्रेशर यूनिट कन्वर्टर', shortName: 'प्रेशर' },
    'yuzde-hesaplama': { name: 'प्रतिशत कैलकुलेटर', shortName: 'प्रतिशत' },
    'alan-hesaplama': { name: 'क्षेत्रफल कैलकुलेटर', shortName: 'क्षेत्रफल' },
    'hacim-hesaplama': { name: 'आयतन कैलकुलेटर', shortName: 'आयतन' },
    pisagor: { name: 'पाइथागोरस प्रमेय कैलकुलेटर', shortName: 'पाइथागोरस' },
    'disli-carki': { name: 'गियर कैलकुलेटर', shortName: 'गियर' },
    'yay-hesaplama': { name: 'स्प्रिंग कैलकुलेटर', shortName: 'स्प्रिंग' },
    'rulman-omru': { name: 'बेयरिंग लाइफ कैलकुलेटर', shortName: 'बेयरिंग लाइफ' },
    viskozite: { name: 'विस्कोसिटी कन्वर्जन', shortName: 'विस्कोसिटी' },
    'guc-verim': { name: 'पावर और एफिशिएंसी कैलकुलेटर', shortName: 'एफिशिएंसी' },
    'termal-iletim': { name: 'थर्मल कंडक्शन कैलकुलेटर', shortName: 'थर्मल कंडक्शन' },
    'devir-frekans': { name: 'RPM-फ्रीक्वेंसी कन्वर्जन', shortName: 'RPM-फ्रीक्वेंसी' },
    'boru-eti-hesaplama': { name: 'पाइप वॉल थिकनेस कैलकुलेटर', shortName: 'पाइप वॉल' },
    'proje-yonetimi': { name: 'प्रोजेक्ट मैनेजमेंट बोर्ड', shortName: 'प्रोजेक्ट बोर्ड' },
    'pazaryeri-fiyat-hesaplama': { name: 'मार्केटप्लेस प्राइस कैलकुलेटर', shortName: 'मार्केटप्लेस प्राइस' },
    'kdv-hesaplama': { name: 'VAT कैलकुलेटर', shortName: 'VAT' },
    'bmi-hesaplama': { name: 'बॉडी मास इंडेक्स (BMI)', shortName: 'BMI' },
    'kira-artis-hesaplama': { name: 'किराया वृद्धि कैलकुलेटर', shortName: 'किराया वृद्धि' },
    'kredi-hesaplama': { name: 'लोन कैलकुलेटर', shortName: 'लोन' },
    'kayis-kasnak-hesaplama': { name: 'बेल्ट और पुली कैलकुलेटर', shortName: 'बेल्ट-पुली' },
    'pompa-guc-hesaplama': { name: 'पंप पावर कैलकुलेटर', shortName: 'पंप पावर' },
    'kaynak-dikisi-hesaplama': { name: 'वेल्ड स्ट्रेंथ कैलकुलेटर', shortName: 'वेल्ड स्ट्रेंथ' },
  },
  ar: {
    'kablo-kesiti': { name: 'حاسبة مقطع الكابل', shortName: 'مقطع الكابل' },
    'voltaj-dusumu': { name: 'حاسبة هبوط الجهد', shortName: 'هبوط الجهد' },
    'elektrik-fatura': { name: 'حاسبة فاتورة الكهرباء', shortName: 'فاتورة الكهرباء' },
    'guc-faktoru': { name: 'تصحيح معامل القدرة', shortName: 'معامل القدرة' },
    'led-direnc': { name: 'حاسبة مقاومة LED', shortName: 'مقاومة LED' },
    'ohm-kanunu': { name: 'حاسبة قانون أوم', shortName: 'قانون أوم' },
    'beton-hesaplama': { name: 'حاسبة كمية الخرسانة', shortName: 'كمية الخرسانة' },
    'demir-hesaplama': { name: 'حاسبة وزن حديد التسليح', shortName: 'وزن التسليح' },
    'celik-profil': { name: 'حاسبة وزن مقاطع الفولاذ', shortName: 'مقطع فولاذي' },
    'tugla-hesaplama': { name: 'حاسبة كمية الطوب', shortName: 'الطوب' },
    'merdiven-hesaplama': { name: 'حاسبة السلالم', shortName: 'السلم' },
    'levha-agirlik': { name: 'حاسبة وزن الصفائح/الألواح', shortName: 'وزن اللوح' },
    'baklavali-sac-agirlik': { name: 'حاسبة وزن الصاج المعرج', shortName: 'صاج معرج' },
    'iso-tolerans': { name: 'حاسبة التوافق والتفاوت ISO', shortName: 'تفاوت ISO' },
    'kilavuz-matkap': { name: 'ثقب القلاوظ ونداء السن', shortName: 'ثقب القلاوظ' },
    'yuzey-puruzlulugu': { name: 'دليل خشونة السطح', shortName: 'خشونة السطح' },
    'teknik-cagri': { name: 'مولد نداءات الرسم الفني', shortName: 'نداء الرسم' },
    'civata-tork': { name: 'حاسبة عزم شد البراغي', shortName: 'عزم البرغي' },
    'sac-bukum-acinim': { name: 'حاسبة فرد ثني الصفائح', shortName: 'ثني الصفائح' },
    'tork-hesaplama': { name: 'حاسبة العزم', shortName: 'العزم' },
    'basinc-hesaplama': { name: 'حاسبة الضغط', shortName: 'الضغط' },
    'hiz-hesaplama': { name: 'حاسبة السرعة', shortName: 'السرعة' },
    'mil-mukavemet': { name: 'حاسبة مقاومة العمود', shortName: 'مقاومة العمود' },
    'kama-kanali': { name: 'حاسبة مجرى المفتاح (DIN 6885)', shortName: 'مجرى المفتاح' },
    'uzunluk-cevirici': { name: 'محول وحدات الطول', shortName: 'الطول' },
    'agirlik-cevirici': { name: 'محول وحدات الوزن', shortName: 'الوزن' },
    'alan-cevirici': { name: 'محول وحدات المساحة', shortName: 'المساحة' },
    'hacim-cevirici': { name: 'محول وحدات الحجم', shortName: 'الحجم' },
    'sicaklik-cevirici': { name: 'محول وحدات الحرارة', shortName: 'الحرارة' },
    'basinc-cevirici': { name: 'محول وحدات الضغط', shortName: 'الضغط' },
    'yuzde-hesaplama': { name: 'حاسبة النسبة المئوية', shortName: 'النسبة' },
    'alan-hesaplama': { name: 'حاسبة المساحة', shortName: 'المساحة' },
    'hacim-hesaplama': { name: 'حاسبة الحجم', shortName: 'الحجم' },
    pisagor: { name: 'حاسبة نظرية فيثاغورس', shortName: 'فيثاغورس' },
    'disli-carki': { name: 'حاسبة التروس', shortName: 'الترس' },
    'yay-hesaplama': { name: 'حاسبة النوابض', shortName: 'النابض' },
    'rulman-omru': { name: 'حاسبة عمر المحمل', shortName: 'عمر المحمل' },
    viskozite: { name: 'تحويل اللزوجة', shortName: 'اللزوجة' },
    'guc-verim': { name: 'حاسبة القدرة والكفاءة', shortName: 'الكفاءة' },
    'termal-iletim': { name: 'حاسبة التوصيل الحراري', shortName: 'التوصيل الحراري' },
    'devir-frekans': { name: 'تحويل الدوران-التردد', shortName: 'الدوران والتردد' },
    'boru-eti-hesaplama': { name: 'حاسبة سماكة جدار الأنبوب', shortName: 'جدار الأنبوب' },
    'proje-yonetimi': { name: 'لوحة إدارة المشاريع', shortName: 'لوحة المشاريع' },
    'pazaryeri-fiyat-hesaplama': { name: 'حاسبة سعر السوق الإلكتروني', shortName: 'سعر السوق' },
    'kdv-hesaplama': { name: 'حاسبة ضريبة القيمة المضافة', shortName: 'VAT' },
    'bmi-hesaplama': { name: 'مؤشر كتلة الجسم (BMI)', shortName: 'BMI' },
    'kira-artis-hesaplama': { name: 'حاسبة زيادة الإيجار', shortName: 'زيادة الإيجار' },
    'kredi-hesaplama': { name: 'حاسبة القروض', shortName: 'القرض' },
    'kayis-kasnak-hesaplama': { name: 'حاسبة الحزام والبكرة', shortName: 'حزام-بكرة' },
    'pompa-guc-hesaplama': { name: 'حاسبة قدرة المضخة', shortName: 'قدرة المضخة' },
    'kaynak-dikisi-hesaplama': { name: 'حاسبة مقاومة اللحام', shortName: 'مقاومة اللحام' },
  },
};

function makeDescription(locale: Locale, name: string, originalDescription: string) {
  if (locale === 'tr') return originalDescription;
  const templates: Record<Exclude<Locale, 'tr'>, string> = {
    en: `Use ${name} for fast preliminary engineering calculations and practical technical checks.`,
    es: `Usa ${name} para cálculos técnicos preliminares y controles prácticos de ingeniería.`,
    zh: `使用${name}进行快速工程预计算和实用技术检查。`,
    hi: `${name} का उपयोग तेज़ प्रारंभिक इंजीनियरिंग गणना और व्यावहारिक तकनीकी जांच के लिए करें।`,
    ar: `استخدم ${name} للحسابات الهندسية الأولية السريعة والفحوص الفنية العملية.`,
  };
  return templates[locale];
}

export function getToolsPageCopy(locale: Locale): ToolPageCopy {
  return TOOLS_PAGE_COPY[locale] || TOOLS_PAGE_COPY.tr;
}

export function getToolPageLabels(locale: Locale) {
  return TOOL_PAGE_LABELS[locale] || TOOL_PAGE_LABELS.tr;
}

export function getLocalizedCategory(category: Category, locale: Locale = 'tr'): LocalizedCategory {
  if (locale === 'tr') return category;
  const copy = getCopy(locale);
  return {
    ...category,
    name: copy.categoryNames[category.id] || category.name,
    description: copy.categoryDescriptions[category.id] || category.description,
  };
}

export function getLocalizedCategories(locale: Locale = 'tr'): LocalizedCategory[] {
  return categories.map((category) => getLocalizedCategory(category, locale));
}

export function getLocalizedCategoryById(id: string, locale: Locale = 'tr'): LocalizedCategory | undefined {
  const category = categories.find((item) => item.id === id);
  return category ? getLocalizedCategory(category, locale) : undefined;
}

export function getLocalizedTool(tool: Tool, locale: Locale = 'tr'): LocalizedTool {
  if (locale === 'tr') return tool;
  const translation = TOOL_NAMES[locale]?.[tool.id];
  const name = translation?.name || tool.name;
  return {
    ...tool,
    name,
    shortName: translation?.shortName || name,
    description: translation?.description || makeDescription(locale, name, tool.description),
  };
}

export function getLocalizedTools(locale: Locale = 'tr'): LocalizedTool[] {
  return tools.map((tool) => getLocalizedTool(tool, locale));
}

export function getLocalizedToolBySlug(slug: string, locale: Locale = 'tr'): LocalizedTool | undefined {
  const tool = tools.find((item) => item.slug === slug);
  return tool ? getLocalizedTool(tool, locale) : undefined;
}

export function getOriginalToolBySlug(slug: string): Tool | undefined {
  return tools.find((item) => item.slug === slug);
}

export function getToolsHref(locale: Locale = 'tr') {
  return getLocalizedPath(locale, 'tools');
}

export function getToolHref(slug: string, locale: Locale = 'tr') {
  return getLocalizedPath(locale, 'tool', slug);
}

export function getCategoryHref(slug: string, locale: Locale = 'tr') {
  return getLocalizedPath(locale, 'category', slug);
}
