'use client';

import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export interface AuthUser {
  uid:         string;
  email:       string;
  displayName: string;
  photoURL:    string;
}

export function useAuth() {
  const [user,    setUser]    = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: any } }) => {
      setUser(session ? mapUser(session.user) : null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e: any, session: any) => {
      setUser(session ? mapUser(session.user) : null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const cikisYap = () => supabase.auth.signOut();

  return { user, loading, cikisYap };
}

function mapUser(u: User): AuthUser {
  return {
    uid:         u.id,
    email:       u.email ?? '',
    displayName: u.user_metadata?.full_name ?? u.user_metadata?.name ?? u.email?.split('@')[0] ?? '',
    photoURL:    u.user_metadata?.avatar_url ?? '',
  };
}