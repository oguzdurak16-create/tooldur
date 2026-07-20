'use client';

import Link from 'next/link';
import { BookmarkPlus, Clipboard, FileDown, FolderPlus, History, Share2 } from 'lucide-react';

type RelatedAction = {
  label: string;
  href: string;
};

interface Props {
  toolName: string;
  toolSlug: string;
  relatedActions?: RelatedAction[];
}

export default function ToolActionPanel({ toolName, toolSlug, relatedActions = [] }: Props) {
  const copyLink = async () => {
    if (typeof window === 'undefined') return;
    try {
      await navigator.clipboard.writeText(window.location.href);
      window.dispatchEvent(new CustomEvent('tooldur-toast', { detail: 'Link kopyalandı.' }));
    } catch {
      window.prompt('Linki kopyala:', window.location.href);
    }
  };

  const share = async () => {
    if (typeof window === 'undefined') return;
    if (navigator.share) {
      try {
        await navigator.share({ title: toolName, text: `${toolName} - Tooldur`, url: window.location.href });
        return;
      } catch {
        return;
      }
    }
    copyLink();
  };

  const printPage = () => {
    if (typeof window !== 'undefined') window.print();
  };

  return (
    <aside className="td-action-panel" aria-label="Hesap sonrası işlemler">
      <div className="td-action-panel-head">
        <span className="td-action-eyebrow">Sonucu kaybetme</span>
        <h2>{toolName} için sonraki adım</h2>
        <p>Hesabı yaptıktan sonra sayfadan çıkmadan sonucu kaydet, PDF al veya ilişkili araca geç.</p>
      </div>

      <div className="td-action-grid">
        <Link href={`/giris?next=/arac/${toolSlug}`} className="td-action-btn primary">
          <BookmarkPlus size={17} />
          Ücretsiz kaydet
        </Link>
        <button type="button" onClick={printPage} className="td-action-btn">
          <FileDown size={17} />
          PDF / Yazdır
        </button>
        <Link href="/dashboard/gecmis" className="td-action-btn">
          <History size={17} />
          Geçmişim
        </Link>
        <Link href="/proje-yonetimi" className="td-action-btn">
          <FolderPlus size={17} />
          Projeye ekle
        </Link>
        <button type="button" onClick={copyLink} className="td-action-btn">
          <Clipboard size={17} />
          Link kopyala
        </button>
        <button type="button" onClick={share} className="td-action-btn">
          <Share2 size={17} />
          Paylaş
        </button>
      </div>

      {relatedActions.length > 0 && (
        <div className="td-next-tools">
          <strong>Bu işin devamı</strong>
          <div>
            {relatedActions.slice(0, 3).map((item) => (
              <Link key={item.href} href={item.href}>{item.label}</Link>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
