import Image from 'next/image';
import type { CSSProperties } from 'react';
import Link from 'next/link';
import { ArrowRight, Calculator, ChevronRight, CircleHelp } from 'lucide-react';
import { notFound } from 'next/navigation';
import ToleranceGuide from '@/components/ToleranceGuide';
import CalculatorClientLoader from '@/components/CalculatorClientLoader';
import ToolEngagementBar from '@/components/ToolEngagementBar';
import { tools } from '@/data/tools';
import { getToleranceGuide } from '@/data/toleranceGuides';
import type { Locale } from '@/lib/siteLanguage';
import { getLocalizedCategoryById, getLocalizedToolBySlug, getOriginalToolBySlug, getToolHref, getToolsHref, getToolPageLabels } from '@/lib/toolLocalization';
import { getToolVisual } from '@/lib/visualAssets';
import { isIndexableTool } from '@/lib/seoFocus';
import styles from './LocalizedToolPage.module.css';

interface Props {
  slug: string;
  locale: Locale;
}

const colorMap: Record<string, { accent: string; bg: string; soft: string }> = {
  yellow: { accent: '#ffb11b', bg: 'rgba(255,177,27,0.10)', soft: 'rgba(255,177,27,0.06)' },
  orange: { accent: '#fbbf24', bg: 'rgba(251,191,36,0.10)', soft: 'rgba(251,191,36,0.06)' },
  blue: { accent: '#60a5fa', bg: 'rgba(96,165,250,0.10)', soft: 'rgba(96,165,250,0.06)' },
  green: { accent: '#6ee7b7', bg: 'rgba(110,231,183,0.10)', soft: 'rgba(110,231,183,0.06)' },
  purple: { accent: '#c4b5fd', bg: 'rgba(196,181,253,0.10)', soft: 'rgba(196,181,253,0.06)' },
};

function seoCopy(locale: Locale, toolName: string, categoryName?: string) {
  const cat = categoryName || toolName;
  const copies: Record<Locale, {
    useTitle: string;
    intro: string[];
    sections: { heading: string; body: string[]; list?: string[] }[];
    faq: { question: string; answer: string }[];
  }> = {
    tr: {
      useTitle: `${toolName} ne için kullanılır?`,
      intro: [`${toolName}, ${cat} alanında hızlı ön hesap ve teknik kontrol yapmak için hazırlanmış ücretsiz bir Tooldur aracıdır.`],
      sections: [
        { heading: 'Nasıl kullanılır?', body: ['Gerekli değerleri forma girin, birimleri kontrol edin ve sonucu teknik ön değerlendirme amacıyla kullanın.'], list: ['Giriş değerlerini kontrol edin.', 'Sonucu standart, katalog veya mühendislik hesabıyla doğrulayın.', 'Kritik işlerde yalnızca bu sonucu nihai karar olarak kullanmayın.'] },
      ],
      faq: [
        { question: `${toolName} ücretsiz mi?`, answer: 'Evet. Tooldur üzerindeki hesaplama araçları ücretsiz kullanım için hazırlanmıştır.' },
        { question: 'Sonuçlar kesin proje hesabı yerine geçer mi?', answer: 'Hayır. Sonuçlar ön hesap ve hızlı kontrol içindir; kritik tasarım kararları ayrıca doğrulanmalıdır.' },
      ],
    },
    en: {
      useTitle: `What is ${toolName} used for?`,
      intro: [`${toolName} is a free Tooldur calculator prepared for quick preliminary checks in ${cat}.`],
      sections: [
        { heading: 'How to use it', body: ['Enter the required values, check the units and use the result for preliminary engineering evaluation.'], list: ['Check the input values.', 'Verify the result with standards, catalogs or engineering review.', 'Do not use it as the only final decision source for critical work.'] },
      ],
      faq: [
        { question: `Is ${toolName} free?`, answer: 'Yes. Tooldur calculators are prepared for free use.' },
        { question: 'Can the result replace a final design calculation?', answer: 'No. Results are for preliminary checks and should be verified for critical engineering work.' },
      ],
    },
    es: {
      useTitle: `¿Para qué se usa ${toolName}?`,
      intro: [`${toolName} es una calculadora gratuita de Tooldur para comprobaciones preliminares rápidas en ${cat}.`],
      sections: [
        { heading: 'Cómo usarla', body: ['Introduce los valores necesarios, revisa las unidades y usa el resultado como evaluación técnica preliminar.'], list: ['Verifica los datos de entrada.', 'Confirma el resultado con normas, catálogos o revisión de ingeniería.', 'No lo uses como única fuente para decisiones críticas.'] },
      ],
      faq: [
        { question: `¿${toolName} es gratis?`, answer: 'Sí. Las calculadoras de Tooldur están preparadas para uso gratuito.' },
        { question: '¿El resultado sustituye un cálculo final de diseño?', answer: 'No. Los resultados son controles preliminares y deben verificarse en trabajos críticos.' },
      ],
    },
    zh: {
      useTitle: `${toolName}用于什么？`,
      intro: [`${toolName}是 Tooldur 提供的免费计算器，用于${cat}相关的快速工程预检查。`],
      sections: [
        { heading: '使用方法', body: ['输入所需数值，检查单位，并将结果用于初步工程评估。'], list: ['检查输入值。', '用标准、样本或工程复核验证结果。', '关键工作不要只依赖此结果作为最终决策。'] },
      ],
      faq: [
        { question: `${toolName}免费吗？`, answer: '是的。Tooldur 计算器可免费使用。' },
        { question: '结果能替代最终设计计算吗？', answer: '不能。结果用于初步检查，关键工程工作需要进一步验证。' },
      ],
    },
    hi: {
      useTitle: `${toolName} किस काम आता है?`,
      intro: [`${toolName}, ${cat} में तेज़ प्रारंभिक जांच के लिए बनाया गया मुफ्त Tooldur कैलकुलेटर है।`],
      sections: [
        { heading: 'कैसे उपयोग करें', body: ['आवश्यक मान दर्ज करें, यूनिट जांचें और परिणाम को प्रारंभिक इंजीनियरिंग मूल्यांकन के लिए उपयोग करें।'], list: ['इनपुट मानों की जांच करें।', 'मानक, कैटलॉग या इंजीनियरिंग समीक्षा से परिणाम सत्यापित करें।', 'महत्वपूर्ण कार्यों में इसे अकेला अंतिम निर्णय स्रोत न मानें।'] },
      ],
      faq: [
        { question: `क्या ${toolName} मुफ्त है?`, answer: 'हाँ। Tooldur कैलकुलेटर मुफ्त उपयोग के लिए तैयार किए गए हैं।' },
        { question: 'क्या परिणाम अंतिम डिजाइन कैलकुलेशन की जगह ले सकता है?', answer: 'नहीं। परिणाम प्रारंभिक जांच के लिए हैं और महत्वपूर्ण कार्यों में सत्यापन जरूरी है।' },
      ],
    },
    ar: {
      useTitle: `ما استخدام ${toolName}؟`,
      intro: [`${toolName} هي حاسبة مجانية من Tooldur للفحوص الهندسية الأولية السريعة في ${cat}.`],
      sections: [
        { heading: 'طريقة الاستخدام', body: ['أدخل القيم المطلوبة، راجع الوحدات واستخدم النتيجة كتقييم هندسي أولي.'], list: ['راجع قيم الإدخال.', 'تحقق من النتيجة عبر المعايير أو الكتالوجات أو مراجعة هندسية.', 'لا تعتمد عليها وحدها كقرار نهائي في الأعمال الحرجة.'] },
      ],
      faq: [
        { question: `هل ${toolName} مجاني؟`, answer: 'نعم. حاسبات Tooldur معدّة للاستخدام المجاني.' },
        { question: 'هل تغني النتيجة عن حساب التصميم النهائي؟', answer: 'لا. النتائج للفحص الأولي ويجب التحقق منها في الأعمال الهندسية الحرجة.' },
      ],
    },
  };
  return copies[locale] || copies.tr;
}

export default function LocalizedToolPage({ slug, locale }: Props) {
  const originalTool = getOriginalToolBySlug(slug);
  const tool = getLocalizedToolBySlug(slug, locale);

  if (!originalTool || !tool) notFound();

  const category = getLocalizedCategoryById(tool.category, locale);
  const relatedTools = tools
    .filter((t) => t.category === originalTool.category && t.id !== originalTool.id && isIndexableTool(t))
    .slice(0, 4)
    .map((t) => getLocalizedToolBySlug(t.slug, locale) || t);
  const colors = colorMap[(category as any)?.color || 'yellow'] || colorMap.yellow;
  const toleranceGuide = locale === 'tr' ? getToleranceGuide(slug) : null;
  const labels = getToolPageLabels(locale);
  const seoContent = seoCopy(locale, tool.name, category?.name);
  const visual = getToolVisual(originalTool.category, originalTool.slug);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: tool.name,
    description: tool.description,
    url: `https://www.tooldur.com${getToolHref(tool.slug, locale)}`,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Any',
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    publisher: { '@type': 'Organization', name: 'Tooldur', url: 'https://www.tooldur.com' },
    image: `https://www.tooldur.com${visual.og}`,
  };

  const pageStyle = { '--tool-color': colors.accent } as CSSProperties;
  const homeHref = locale === 'tr' ? '/' : `/${locale}`;
  const categoryHref = category ? (locale === 'tr' ? `/kategori/${category.slug}` : `/${locale}/category/${category.slug}`) : '';

  return (
    <main className={styles.page} style={pageStyle}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className={styles.breadcrumbBar}>
        <div className="td-container">
          <nav className={styles.breadcrumb} aria-label="Breadcrumb">
            <Link href={homeHref}>{labels.home}</Link><ChevronRight size={13} />
            <Link href={getToolsHref(locale)}>{labels.allTools}</Link>
            {category && <><ChevronRight size={13} /><Link href={categoryHref}>{category.name}</Link></>}
            <ChevronRight size={13} /><strong>{tool.name}</strong>
          </nav>
        </div>
      </div>

      <section className={styles.hero}>
        <div className={`td-container ${styles.heroGrid}`}>
          <div>
            {category && <span className={styles.category}>{category.name}</span>}
            <h1>{tool.name}</h1>
            {tool.description && <p className={styles.description}>{tool.description}</p>}
            <ToolEngagementBar slug={tool.slug} name={tool.name} locale={locale} />
          </div>
          <div className={styles.visual}>
            <Image src={visual.src} alt={`${tool.name} – ${visual.alt}`} fill priority sizes="(max-width: 920px) 100vw, 430px" />
            <div className={styles.visualTop}><span>Tooldur workspace</span><span>Free tool</span></div>
            <div className={styles.caption}>{visual.caption}</div>
          </div>
        </div>
      </section>

      <section id="hesaplama" className={styles.calculatorSection}>
        <div className="td-container">
          <div className={styles.calculatorHeader}><div><Calculator size={14} /> Calculation workspace</div><span>{tool.name}</span></div>
          <div className={styles.calculatorFrame}>
            <div className={`${styles.calculatorInner} tool-compact-calculator`}>
              <CalculatorClientLoader slug={slug} tool={tool} locale={locale} />
            </div>
          </div>
        </div>
      </section>

      {toleranceGuide && <ToleranceGuide guide={toleranceGuide} />}

      <section className={styles.contentSection}>
        <div className={`td-container ${styles.contentGrid}`}>
          <article className={styles.article}>
            <h2>{seoContent.useTitle}</h2>
            {seoContent.intro.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
            {seoContent.sections.map((section) => (
              <section key={section.heading}>
                <h3>{section.heading}</h3>
                {section.body.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
                {section.list && <ul>{section.list.map((item) => <li key={item}>{item}</li>)}</ul>}
              </section>
            ))}
          </article>
          <aside className={styles.side}>
            <div className={styles.sideCard}>
              <h2><CircleHelp size={17} color="var(--tool-color)" /> {labels.faq}</h2>
              {seoContent.faq.map((item) => <div className={styles.faq} key={item.question}><h3>{item.question}</h3><p>{item.answer}</p></div>)}
            </div>
          </aside>
        </div>
      </section>

      {relatedTools.length > 0 && (
        <section className={styles.related}>
          <div className="td-container">
            <div className={styles.relatedHead}><h2>{labels.similarTools}</h2><p>{labels.similarToolsText}</p></div>
            <div className={styles.relatedGrid}>
              {relatedTools.map((relatedTool) => (
                <Link key={relatedTool.id} href={getToolHref(relatedTool.slug, locale)} className={styles.relatedCard}>
                  <strong>{relatedTool.name}</strong><span>{relatedTool.description}</span><b>{labels.open} <ArrowRight size={13} /></b>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
