import { Suspense } from 'react';
import AuthCallbackClient from './AuthCallbackClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div style={{ padding: 32, color: '#e5e7eb' }}>Giriş tamamlanıyor...</div>}>
      <AuthCallbackClient />
    </Suspense>
  );
}
