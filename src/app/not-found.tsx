import Link from 'next/link';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-primary-200">404</h1>
        <h2 className="text-2xl font-semibold text-secondary-900 mt-4 mb-2">
          Sayfa Bulunamadı
        </h2>
        <p className="text-secondary-600 mb-8 max-w-md mx-auto">
          Aradığınız sayfa mevcut değil veya taşınmış olabilir.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/" className="btn-primary">
            <Home className="w-5 h-5 mr-2" />
            Ana Sayfaya Dön
          </Link>
          <Link href="/araclar" className="btn-secondary">
            <Search className="w-5 h-5 mr-2" />
            Araçları İncele
          </Link>
        </div>
      </div>
    </div>
  );
}
