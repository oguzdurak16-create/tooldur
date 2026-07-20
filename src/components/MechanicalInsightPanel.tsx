import { AlertTriangle, CheckCircle2, Ruler } from "lucide-react";
import type { ToleranceGuide as ToleranceGuideType } from "@/data/toleranceGuides";

interface Props {
  guide: ToleranceGuideType;
  toolName: string;
}

export default function MechanicalInsightPanel({ guide, toolName }: Props) {
  const fitCards = guide.fitCards.slice(0, 4);
  const rows = guide.rows.slice(0, 6);

  return (
    <section className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 sm:p-5">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-300">
            <Ruler className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-base font-bold text-[var(--foreground)] sm:text-lg">
              {toolName} tolerans önerileri
            </h2>
            <p className="text-xs text-[var(--muted-foreground)]">
              H7, H8, h6 gibi sınıf adları seçim fikri verir; sayısal standart tablosu değildir.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {fitCards.map((card) => (
          <article
            key={`${card.label}-${card.value}`}
            className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-3"
          >
            <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-blue-700 dark:text-blue-300">
              {card.label}
            </div>
            <div className="mt-1 text-base font-extrabold text-[var(--foreground)]">
              {card.value}
            </div>
            <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
              {card.use}
            </p>
          </article>
        ))}
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]">
        <div className="grid grid-cols-[1fr_1fr] gap-0 border-b border-[var(--border)] bg-[var(--muted)]/35 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--muted-foreground)] sm:grid-cols-[1fr_1fr_1.6fr]">
          <div>Bölge</div>
          <div>Tolerans sınıfı</div>
          <div className="hidden sm:block">Kullanım notu</div>
        </div>

        {rows.map((row) => (
          <div
            key={`${row.item}-${row.tolerance}`}
            className="grid grid-cols-[1fr_1fr] gap-0 border-b border-[var(--border)] px-3 py-3 last:border-b-0 sm:grid-cols-[1fr_1fr_1.6fr]"
          >
            <div className="text-sm font-semibold text-[var(--foreground)]">
              {row.item}
            </div>
            <div className="font-mono text-sm font-bold text-blue-700 dark:text-blue-300">
              {row.tolerance}
            </div>
            <div className="col-span-2 mt-1 text-xs leading-5 text-[var(--muted-foreground)] sm:col-span-1 sm:mt-0">
              {row.note}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        {guide.notes.slice(0, 3).map((note, index) => (
          <div
            key={`${index}-${note}`}
            className="flex items-start gap-2 rounded-xl bg-[var(--muted)]/25 px-3 py-2 text-xs leading-5 text-[var(--muted-foreground)]"
          >
            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-emerald-600" />
            <span>{note}</span>
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-400/25 bg-amber-400/10 px-3 py-2 text-xs leading-5 text-[var(--muted-foreground)]">
        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-amber-600" />
        <span>
          Kesin teknik resim için güncel standart, üretici kataloğu ve müşteri şartnamesi esas alınmalıdır.
        </span>
      </div>
    </section>
  );
}
