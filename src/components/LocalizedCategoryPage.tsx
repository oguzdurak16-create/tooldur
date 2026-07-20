import type { CSSProperties } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Calculator, CheckCircle2 } from 'lucide-react';
import { categories } from '@/data/tools';
import ToolCard from '@/components/ToolCard';
import CategoryCard from '@/components/CategoryCard';
import { getIcon, Folder } from '@/lib/icons';
import type { Locale } from '@/lib/siteLanguage';
import {
  getCategoryHref,
  getLocalizedCategories,
  getLocalizedCategory,
  getLocalizedTools,
  getToolsHref,
  getToolsPageCopy,
  getToolHref,
} from '@/lib/toolLocalization';
import { getCategoryVisual } from '@/lib/visualAssets';
import { isIndexableCategory, isIndexableTool } from '@/lib/seoFocus';
import styles from './CategoryPage.module.css';

interface Props { slug: string; locale: Locale; }

const colorMap: Record<string, { accent: string }> = {
  yellow: { accent: '#fbbf24' },
  orange: { accent: '#fb923c' },
  blue: { accent: '#38bdf8' },
  green: { accent: '#6ee7b7' },
  purple: { accent: '#c4b5fd' },
};

type PageText = {
  home: string;
  allTools: string;
  group: string;
  free: string;
  noSignup: string;
  mobile: string;
  inCategory: string;
  chooseTool: string;
  empty: string;
  otherCategories: string;
  otherText: string;
  toolsIndex: string;
  discoverIndex: string;
};

const categoryPageText: Record<Locale, PageText> = {
  tr: { home: 'Ana Sayfa', allTools: 'Tüm Araçlar', group: 'Mühendislik araç grubu', free: 'ücretsiz araç', noSignup: 'Kayıt gerektirmez', mobile: 'Mobil uyumlu', inCategory: 'Bu kategorideki araçlar', chooseTool: 'alanındaki hesabı seçin, değerleri girin ve sonucu doğrudan alın.', empty: 'Bu kategoride henüz araç yok.', otherCategories: 'Diğer kategoriler', otherText: 'Farklı mühendislik disiplinleri için hazırlanmış hesaplama alanlarına geçin.', toolsIndex: '01 / Araçlar', discoverIndex: '02 / Keşfet' },
  en: { home: 'Home', allTools: 'All Tools', group: 'Engineering tool group', free: 'free tools', noSignup: 'No sign-up required', mobile: 'Mobile ready', inCategory: 'Tools in this category', chooseTool: 'Choose a calculation, enter the values and get the result directly.', empty: 'There are no tools in this category yet.', otherCategories: 'Other categories', otherText: 'Move to calculation workspaces prepared for other engineering disciplines.', toolsIndex: '01 / Tools', discoverIndex: '02 / Explore' },
  es: { home: 'Inicio', allTools: 'Todas las herramientas', group: 'Grupo de herramientas de ingeniería', free: 'herramientas gratuitas', noSignup: 'Sin registro', mobile: 'Compatible con móvil', inCategory: 'Herramientas de esta categoría', chooseTool: 'Elige un cálculo, introduce los valores y obtén el resultado directamente.', empty: 'Todavía no hay herramientas en esta categoría.', otherCategories: 'Otras categorías', otherText: 'Explora espacios de cálculo para otras disciplinas de ingeniería.', toolsIndex: '01 / Herramientas', discoverIndex: '02 / Explorar' },
  zh: { home: '首页', allTools: '全部工具', group: '工程工具组', free: '个免费工具', noSignup: '无需注册', mobile: '适配移动端', inCategory: '此分类中的工具', chooseTool: '选择计算工具，输入数值并直接获得结果。', empty: '此分类还没有工具。', otherCategories: '其他分类', otherText: '查看为其他工程领域准备的计算工作区。', toolsIndex: '01 / 工具', discoverIndex: '02 / 探索' },
  hi: { home: 'होम', allTools: 'सभी टूल्स', group: 'इंजीनियरिंग टूल समूह', free: 'मुफ़्त टूल', noSignup: 'साइन-अप आवश्यक नहीं', mobile: 'मोबाइल अनुकूल', inCategory: 'इस श्रेणी के टूल्स', chooseTool: 'गणना चुनें, मान दर्ज करें और परिणाम तुरंत प्राप्त करें।', empty: 'इस श्रेणी में अभी कोई टूल नहीं है।', otherCategories: 'अन्य श्रेणियाँ', otherText: 'अन्य इंजीनियरिंग क्षेत्रों के लिए तैयार गणना कार्यक्षेत्र देखें।', toolsIndex: '01 / टूल्स', discoverIndex: '02 / एक्सप्लोर' },
  ar: { home: 'الرئيسية', allTools: 'كل الأدوات', group: 'مجموعة أدوات هندسية', free: 'أداة مجانية', noSignup: 'لا يتطلب تسجيلاً', mobile: 'متوافق مع الهاتف', inCategory: 'أدوات هذه الفئة', chooseTool: 'اختر العملية الحسابية وأدخل القيم واحصل على النتيجة مباشرة.', empty: 'لا توجد أدوات في هذه الفئة بعد.', otherCategories: 'فئات أخرى', otherText: 'انتقل إلى مساحات حسابية مخصصة لتخصصات هندسية أخرى.', toolsIndex: '01 / الأدوات', discoverIndex: '02 / استكشف' },
};

export default function LocalizedCategoryPage({ slug, locale }: Props) {
  const originalCategory = categories.find((item) => item.slug === slug);
  if (!originalCategory) notFound();

  const category = getLocalizedCategory(originalCategory, locale);
  const localizedTools = getLocalizedTools(locale);
  const localizedCategories = getLocalizedCategories(locale);
  const categoryTools = isIndexableCategory(originalCategory)
    ? localizedTools.filter((tool) => tool.category === category.id && isIndexableTool(tool))
    : localizedTools.filter((tool) => tool.category === category.id);
  const otherCategories = localizedCategories.filter((item) => item.id !== category.id && isIndexableCategory(item));
  const IconComponent = getIcon(category.icon, Folder);
  const colors = colorMap[category.color] || colorMap.blue;
  const pageCopy = categoryPageText[locale];
  const toolsCopy = getToolsPageCopy(locale);
  const visual = getCategoryVisual(originalCategory.id);
  const pageStyle = { '--category-accent': colors.accent } as CSSProperties;
  const homeHref = locale === 'tr' ? '/' : `/${locale}`;

  return (
    <main className={styles.page} style={pageStyle}>
      <div className={styles.breadcrumbBar}>
        <div className="td-container">
          <nav className={styles.breadcrumb} aria-label="Breadcrumb">
            <Link href={homeHref}>{pageCopy.home}</Link><span>/</span>
            <Link href={getToolsHref(locale)}>{pageCopy.allTools}</Link><span>/</span>
            <strong>{category.name}</strong>
          </nav>
        </div>
      </div>

      <section className={styles.hero}>
        <div className={`td-container ${styles.heroGrid}`}>
          <div className={styles.heroCopy}>
            <div className={styles.eyebrow}><Calculator size={13} /> {pageCopy.group}</div>
            <div className={styles.titleRow}>
              <div className={styles.icon}><IconComponent size={29} /></div>
              <h1 className={styles.title}>{category.name}</h1>
            </div>
            <p className={styles.description}>{category.description}</p>
            <div className={styles.heroMeta}>
              <div className={styles.metaItem}><CheckCircle2 size={14} /> {categoryTools.length} {pageCopy.free}</div>
              <div className={styles.metaItem}><CheckCircle2 size={14} /> {pageCopy.noSignup}</div>
              <div className={styles.metaItem}><CheckCircle2 size={14} /> {pageCopy.mobile}</div>
            </div>
          </div>

          <div className={styles.visual}>
            <Image src={visual.src} alt={`${category.name} – ${visual.alt}`} fill priority sizes="(max-width: 1050px) 100vw, 440px" />
            <div className={styles.visualBadge}>
              <div><strong>{categoryTools.length}</strong><span>{toolsCopy.toolCountSuffix}</span></div>
              <div className={styles.visualCode}>TOOLDUR / {category.slug.toUpperCase()}</div>
            </div>
          </div>
        </div>
      </section>

      <section className={`td-container ${styles.section}`}>
        <div className={styles.sectionHead}>
          <div>
            <div className={styles.sectionIndex}>{pageCopy.toolsIndex}</div>
            <h2>{pageCopy.inCategory}</h2>
            <p>{category.name}: {pageCopy.chooseTool}</p>
          </div>
        </div>

        {categoryTools.length > 0 ? (
          <div className={styles.toolGrid}>
            {categoryTools.map((tool) => <ToolCard key={tool.id} tool={tool} locale={locale} />)}
          </div>
        ) : (
          <div className={styles.empty}>{pageCopy.empty}</div>
        )}
      </section>

      <section className={`td-container ${styles.otherSection}`}>
        <div className={styles.sectionHead}>
          <div>
            <div className={styles.sectionIndex}>{pageCopy.discoverIndex}</div>
            <h2>{pageCopy.otherCategories}</h2>
            <p>{pageCopy.otherText}</p>
          </div>
        </div>
        <div className={styles.categoryGrid}>
          {otherCategories.map((item) => <CategoryCard key={item.id} category={item} locale={locale} />)}
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: `${category.name} | Tooldur`,
          description: category.description,
          url: `https://www.tooldur.com${getCategoryHref(category.slug, locale)}`,
          primaryImageOfPage: `https://www.tooldur.com${visual.og}`,
          hasPart: categoryTools.map((tool) => ({
            '@type': 'SoftwareApplication',
            name: tool.name,
            url: `https://www.tooldur.com${getToolHref(tool.slug, locale)}`,
            applicationCategory: 'UtilitiesApplication',
            operatingSystem: 'Any',
          })),
        }) }}
      />
    </main>
  );
}
