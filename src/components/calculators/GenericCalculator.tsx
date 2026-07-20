'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import {
  Construction,
  ArrowRight,
  Sparkles,
  Wrench,
  FolderKanban,
  Info,
  ChevronRight,
} from 'lucide-react';
import type { Tool } from '@/data/tools';
import { tools, getCategoryById } from '@/data/tools';

interface Props {
  tool: Tool;
}

function getFallbackCopy(tool: Tool, categoryName?: string) {
  const lowerName = tool.name.toLowerCase();
  const cat = categoryName || 'ilgili kategori';

  if (lowerName.includes('hesaplama')) {
    return {
      title: `${tool.name} için altyapı hazır`,
      intro: `${tool.name} sayfası aktif durumda. Bu araç için özel giriş alanları ve sonuç motoru eklendiğinde doğrudan bu sayfa üzerinden hesaplama yapılabilecek.`,
      usage: `Bu araç büyük olasılıkla ${cat.toLowerCase()} içinde pratik hesaplama, ön kontrol ve hızlı karar desteği için kullanılacak.`,
      note: `Şu anda bu sayfa boş görünmek yerine açıklama, yönlendirme ve ilgili araç bağlantıları sunar.`,
    };
  }

  if (lowerName.includes('çevirici') || lowerName.includes('dönüş')) {
    return {
      title: `${tool.name} için dönüşüm ekranı hazırlanıyor`,
      intro: `${tool.name} aktif sayfa yapısına sahip. Özel dönüşüm formu henüz eklenmemiş olsa da bu sayfa kullanıcıyı ilgili araçlara yönlendirir.`,
      usage: `Bu araç, birimler veya teknik değerler arasında hızlı dönüşüm yapmak isteyen kullanıcılar için planlanmıştır.`,
      note: `Özel bileşen eklendiğinde giriş alanları, sonuç kartları ve hızlı dönüşüm blokları burada yer alacak.`,
    };
  }

  return {
    title: `${tool.name} sayfası hazır`,
    intro: `${tool.name} için detay sayfası aktif durumda. Bu araç henüz özel calculator bileşeni almamış olsa da sayfa kullanıcıyı boş bırakmaz.`,
    usage: `Bu aracın amacı, ${cat.toLowerCase()} içindeki ihtiyaçlara göre hızlı bilgi, hesap veya yönlendirme sağlamaktır.`,
    note: `Özel tool bileşeni eklendiğinde bu alan otomatik olarak gerçek hesaplama ekranına dönüşür.`,
  };
}

export default function GenericCalculator({ tool }: Props) {
  const category = getCategoryById(tool.category);

  const relatedTools = useMemo(() => {
    return tools
      .filter((t) => t.category === tool.category && t.slug !== tool.slug)
      .slice(0, 6);
  }, [tool]);

  const copy = getFallbackCopy(tool, category?.name);

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      {/* Hero */}
      <div className="calc-box">
        <div className="flex flex-col md:flex-row md:items-start gap-5">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-amber-500/10 shrink-0">
            <Construction className="w-8 h-8 text-amber-500" />
          </div>

          <div className="flex-1">
            <div className="flex flex-wrap gap-2 mb-3">
              {category && <span className="calc-chip">{category.name}</span>}
              <span className="calc-chip">Aktif fallback ekranı</span>
              <span className="calc-chip">Özel tool bekleniyor</span>
            </div>

            <h2 className="text-2xl md:text-3xl font-bold text-[var(--foreground)] mb-3">
              {copy.title}
            </h2>

            <p className="calc-prose">
              {tool.description || copy.intro}
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              {category && (
                <Link
                  href={`/kategori/${category.slug}`}
                  className="inline-flex items-center gap-2 rounded-xl px-4 py-3 font-semibold calc-panel hover:brightness-[1.03] transition-all"
                >
                  <FolderKanban className="w-4 h-4" />
                  Kategoriye Git
                </Link>
              )}

              <Link
                href="/araclar"
                className="inline-flex items-center gap-2 rounded-xl px-4 py-3 font-semibold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg active:scale-[0.98]"
              >
                Tüm Araçlar
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Açıklama kartları */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="calc-box">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h3 className="calc-section-title">Ne işe yarayacak?</h3>
          </div>
          <p className="calc-prose">{copy.usage}</p>
        </div>

        <div className="calc-box">
          <div className="flex items-center gap-2 mb-3">
            <Wrench className="w-4 h-4 text-sky-500" />
            <h3 className="calc-section-title">Buraya ne gelecek?</h3>
          </div>
          <p className="calc-prose">
            Bu araç için özel bileşen yazıldığında; giriş alanları, hesaplama motoru, sonuç kartları,
            gerekiyorsa teknik çizim ve açıklayıcı yardım blokları burada gösterilecek.
          </p>
        </div>

        <div className="calc-box">
          <div className="flex items-center gap-2 mb-3">
            <Info className="w-4 h-4 text-emerald-500" />
            <h3 className="calc-section-title">Şu an ne oluyor?</h3>
          </div>
          <p className="calc-prose">{copy.note}</p>
        </div>
      </div>

      {/* Tool özeti */}
      <div className="calc-box-accent">
        <p className="font-semibold text-[var(--foreground)] mb-2">
          Araç özeti
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="calc-soft rounded-xl p-4">
            <p className="text-sm calc-muted mb-1">Araç adı</p>
            <p className="font-semibold text-[var(--foreground)]">{tool.name}</p>
          </div>

          <div className="calc-soft rounded-xl p-4">
            <p className="text-sm calc-muted mb-1">Slug</p>
            <p className="font-mono text-sm text-[var(--foreground)]">{tool.slug}</p>
          </div>

          <div className="calc-soft rounded-xl p-4 md:col-span-2">
            <p className="text-sm calc-muted mb-1">Açıklama</p>
            <p className="text-[var(--foreground)]">
              {tool.description || 'Bu araç için açıklama bilgisi mevcut değil.'}
            </p>
          </div>
        </div>
      </div>

      {/* Benzer araçlar */}
      {relatedTools.length > 0 && (
        <section className="calc-box space-y-4">
          <h3 className="calc-section-title">Benzer araçlar</h3>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {relatedTools.map((relatedTool) => (
              <Link
                key={relatedTool.slug}
                href={`/arac/${relatedTool.slug}`}
                className="calc-soft rounded-xl p-4 hover:shadow-md transition-all border border-[var(--border)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-[var(--foreground)] mb-1">
                      {relatedTool.name}
                    </p>
                    <p className="text-sm calc-muted line-clamp-3">
                      {relatedTool.description}
                    </p>
                  </div>

                  <ChevronRight className="w-4 h-4 text-[var(--muted-foreground)] shrink-0 mt-1" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Bilgilendirici son bölüm */}
      <section className="calc-box space-y-4">
        <h3 className="calc-section-title">{tool.name} hakkında</h3>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="calc-soft rounded-xl p-4">
            <p className="calc-prose">
              Bu sayfa, özel calculator bileşeni olmayan araçlar için geçici ama güçlü bir kullanıcı deneyimi sağlar.
              Böylece kullanıcı ölü bir ekran yerine yönlendirme ve bağlam görür.
            </p>
          </div>

          <div className="calc-soft rounded-xl p-4">
            <p className="calc-prose">
              Özel tool geliştirildiğinde bu bileşen otomatik devreden çıkar ve slug eşleşmesiyle gerçek hesaplayıcı açılır.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}