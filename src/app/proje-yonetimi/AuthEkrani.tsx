'use client';

import Link from 'next/link';
import { ArrowRight, FolderKanban } from 'lucide-react';

export default function AuthEkrani() {
  return (
    <div className="pm-root pm-auth-screen">
      <section className="pm-auth-card">
        <div className="pm-auth-mark">T</div>
        <div className="pm-breadcrumb"><FolderKanban size={12} /> Tooldur Proje Yönetimi</div>
        <h1>Hesabınla giriş yap</h1>
        <p>Projelerini, görevlerini, terminlerini ve ekip üyelerini kaydetmek için Tooldur hesabına giriş yapman gerekiyor.</p>
        <div className="pm-auth-actions">
          <Link href="/giris" className="pm-button is-primary" style={{ textDecoration: 'none', flex: 1 }}>
            Giriş yap veya üye ol <ArrowRight size={15} />
          </Link>
        </div>
        <p className="pm-auth-foot">Giriş tamamlandığında bu sayfaya geri dönebilirsin.</p>
      </section>
    </div>
  );
}
