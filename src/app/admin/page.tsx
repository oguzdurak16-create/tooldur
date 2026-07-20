'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/usePmAuth';
import {
  Users, MessageSquare, Eye, BarChart2, Shield, Key, Trash2,
  Pin, Lock, Unlock, Search, AlertTriangle, RefreshCw, X, Check,
  UserCheck, UserX, Crown, Wrench, Activity, Database, LogOut, Flame
} from 'lucide-react';

/* ── Tipler ─────────────────────────────────────────── */
interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
  created_at: string;
  is_moderator: boolean;
  is_banned: boolean;
  konu_sayisi: number;
  yorum_sayisi: number;
}

interface ForumKonu {
  id: string;
  baslik: string;
  yazar_ad: string;
  yazar_uid: string;
  kategori_id: string;
  begeni_sayisi: number;
  goruntuleme: number;
  yorum_sayisi: number;
  pinli: boolean;
  kapali: boolean;
  created_at: string;
}

interface ForumYorum {
  id: string;
  konu_id: string;
  yazar_ad: string;
  yazar_uid: string;
  icerik: string;
  created_at: string;
}

interface Stats {
  toplamKullanici: number;
  toplamKonu: number;
  bugunKonu: number;
  toplamYorum: number;
  bugunYorum: number;
  toplamGoruntulenme: number;
}

type AuthUserLike = {
  uid?: string;
  id?: string;
  email?: string;
} | null;

function getAuthUserId(user: AuthUserLike): string | undefined {
  return user?.uid ?? user?.id;
}

function profileAdminMi(profile: any): boolean {
  return Boolean(
    profile?.is_admin ||
    profile?.is_moderator ||
    profile?.admin ||
    profile?.role === 'admin' ||
    (Array.isArray(profile?.roles) && profile.roles.includes('admin'))
  );
}

function zaman(iso: string) {
  if (!iso) return '-';
  const d = new Date(iso);
  const now = new Date();
  const fark = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (fark < 60) return 'az önce';
  if (fark < 3600) return Math.floor(fark / 60) + 'dk önce';
  if (fark < 86400) return Math.floor(fark / 3600) + 'sa önce';
  if (fark < 604800) return Math.floor(fark / 86400) + 'g önce';
  return d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function Toast({ msg, type, onClose }: { msg: string; type: 'ok' | 'err'; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 9999,
        background: type === 'ok' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
        border: `1px solid ${type === 'ok' ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)'}`,
        color: type === 'ok' ? 'var(--green)' : 'var(--red)',
        padding: '12px 20px',
        borderRadius: 'var(--radius)',
        fontSize: 14,
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        boxShadow: 'var(--shadow)',
        animation: 'fadeUp .3s ease both',
      }}
    >
      {type === 'ok' ? <Check size={16} /> : <AlertTriangle size={16} />}
      {msg}
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'inherit',
          marginLeft: 8,
          display: 'flex',
        }}
      >
        <X size={14} />
      </button>
    </div>
  );
}

function StatKart({
  ikon,
  baslik,
  deger,
  alt,
  renk,
}: {
  ikon: React.ReactNode;
  baslik: string;
  deger: number;
  alt?: string;
  renk?: string;
}) {
  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px 24px',
        borderLeft: `3px solid ${renk ?? 'var(--amber)'}`,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '.08em',
              textTransform: 'uppercase',
              color: 'var(--ink-3)',
              marginBottom: 6,
            }}
          >
            {baslik}
          </p>
          <p style={{ fontSize: 28, fontWeight: 800, color: 'var(--ink)', lineHeight: 1 }}>
            {deger.toLocaleString('tr-TR')}
          </p>
          {alt && <p style={{ fontSize: 11, color: 'var(--ink-4)', marginTop: 6 }}>{alt}</p>}
        </div>
        <div style={{ color: renk ?? 'var(--amber)', opacity: 0.7 }}>{ikon}</div>
      </div>
    </div>
  );
}

function SifreModal({
  user,
  onClose,
  onToast,
}: {
  user: AdminUser;
  onClose: () => void;
  onToast: (m: string, t: 'ok' | 'err') => void;
}) {
  const [yukleniyor, setYukleniyor] = useState(false);

  const sifreSifirla = async () => {
    setYukleniyor(true);
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: window.location.origin + '/profil',
    });
    setYukleniyor(false);

    if (error) {
      onToast('E-posta gönderilemedi: ' + error.message, 'err');
      return;
    }

    onToast(user.full_name + ' için şifre sıfırlama e-postası gönderildi', 'ok');
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-mid)',
          borderRadius: 'var(--radius-lg)',
          padding: 32,
          maxWidth: 420,
          width: '90%',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <Key size={20} color="var(--amber)" />
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--ink)' }}>
            Şifre Sıfırla
          </h3>
        </div>

        <p style={{ fontSize: 14, color: 'var(--ink-3)', marginBottom: 24, lineHeight: 1.6 }}>
          <strong style={{ color: 'var(--ink)' }}>{user.full_name}</strong> ({user.email}) adresine
          şifre sıfırlama bağlantısı gönderilecek. Emin misin?
        </p>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onClose} className="btn-ghost" style={{ padding: '9px 20px', fontSize: 13 }}>
            İptal
          </button>
          <button
            onClick={sifreSifirla}
            disabled={yukleniyor}
            className="btn-primary"
            style={{ padding: '9px 20px', fontSize: 13 }}
          >
            {yukleniyor ? 'Gönderiliyor...' : 'Gönder'}
          </button>
        </div>
      </div>
    </div>
  );
}

function SilModal({
  baslik,
  mesaj,
  onSil,
  onClose,
}: {
  baslik: string;
  mesaj: string;
  onSil: () => void;
  onClose: () => void;
}) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: 'var(--radius-lg)',
          padding: 32,
          maxWidth: 420,
          width: '90%',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <AlertTriangle size={20} color="var(--red)" />
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--ink)' }}>
            {baslik}
          </h3>
        </div>

        <p style={{ fontSize: 14, color: 'var(--ink-3)', marginBottom: 24, lineHeight: 1.6 }}>
          {mesaj}
        </p>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onClose} className="btn-ghost" style={{ padding: '9px 20px', fontSize: 13 }}>
            İptal
          </button>
          <button
            onClick={onSil}
            style={{
              padding: '9px 20px',
              fontSize: 13,
              background: 'var(--red)',
              color: '#fff',
              border: 'none',
              borderRadius: 'var(--radius)',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Sil
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Ana Bileşen ──────────────────────────────────────── */
export default function AdminPanel() {
  const { user, loading: authLoading } = useAuth();

  const [sekme, setSekme] = useState<'genel' | 'kullanicilar' | 'konular' | 'yorumlar'>('genel');
  const [stats, setStats] = useState<Stats | null>(null);
  const [kullanicilar, setKullanicilar] = useState<AdminUser[]>([]);
  const [konular, setKonular] = useState<ForumKonu[]>([]);
  const [yorumlar, setYorumlar] = useState<ForumYorum[]>([]);
  const [aramaK, setAramaK] = useState('');
  const [aramaKonu, setAramaKonu] = useState('');
  const [yukleniyor, setYukleniyor] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);
  const [sifreModal, setSifreModal] = useState<AdminUser | null>(null);
  const [silModal, setSilModal] = useState<{ baslik: string; mesaj: string; onSil: () => void } | null>(null);
  const [konuSiralama, setKonuSiralama] = useState<'yeni' | 'aktif' | 'en_cok'>('yeni');
  const [kulSiralama, setKulSiralama] = useState<'yeni' | 'konu' | 'yorum'>('yeni');
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminKontrolEdiliyor, setAdminKontrolEdiliyor] = useState(true);

  const toast_ = (msg: string, type: 'ok' | 'err') => setToast({ msg, type });

  useEffect(() => {
    let aktif = true;

    const adminYetkisiniKontrolEt = async () => {
      if (authLoading) return;

      if (!user) {
        if (aktif) {
          setIsAdmin(false);
          setAdminKontrolEdiliyor(false);
        }
        return;
      }

      setAdminKontrolEdiliyor(true);

      const authUserId = getAuthUserId(user);
      if (!authUserId) {
        if (aktif) {
          setIsAdmin(false);
          setAdminKontrolEdiliyor(false);
        }
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('id, is_admin, is_moderator, is_banned')
        .eq('id', authUserId)
        .maybeSingle();

      if (!aktif) return;

      if (error) {
        console.error('Admin kontrolü başarısız:', error.message);
        setIsAdmin(false);
        setAdminKontrolEdiliyor(false);
        return;
      }

      setIsAdmin(profileAdminMi(data));
      setAdminKontrolEdiliyor(false);
    };

    adminYetkisiniKontrolEt();

    return () => {
      aktif = false;
    };
  }, [authLoading, user]);

  const statsYukle = useCallback(async () => {
    const bugun = new Date();
    bugun.setHours(0, 0, 0, 0);

    const [
      { count: tk, error: tkErr },
      { count: tkonu, error: tkonuErr },
      { count: bkonu, error: bkonuErr },
      { count: tyorum, error: tyorumErr },
      { count: byorum, error: byorumErr },
      { data: gors, error: gorsErr },
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('forum_konular').select('*', { count: 'exact', head: true }),
      supabase.from('forum_konular').select('*', { count: 'exact', head: true }).gte('created_at', bugun.toISOString()),
      supabase.from('forum_yorumlar').select('*', { count: 'exact', head: true }),
      supabase.from('forum_yorumlar').select('*', { count: 'exact', head: true }).gte('created_at', bugun.toISOString()),
      supabase.from('forum_konular').select('goruntuleme'),
    ]);

    const ilkHata = tkErr || tkonuErr || bkonuErr || tyorumErr || byorumErr || gorsErr;
    if (ilkHata) {
      toast_('İstatistikler yüklenemedi: ' + ilkHata.message, 'err');
      return;
    }

    const toplamGoruntulenme = (gors ?? []).reduce((s: number, k: any) => s + (k.goruntuleme ?? 0), 0);

    setStats({
      toplamKullanici: tk ?? 0,
      toplamKonu: tkonu ?? 0,
      bugunKonu: bkonu ?? 0,
      toplamYorum: tyorum ?? 0,
      bugunYorum: byorum ?? 0,
      toplamGoruntulenme,
    });
  }, []);

  const kullanicilariYukle = useCallback(async () => {
    setYukleniyor(true);

    const [{ data: profilesData, error: profilesError }, { data: konuYazarlar, error: konuError }, { data: yorumYazarlar, error: yorumError }] =
      await Promise.all([
        supabase.from('profiles').select('id, email, full_name, avatar_url, created_at, is_moderator, is_banned').order('created_at', { ascending: false }).limit(200),
        supabase.from('forum_konular').select('yazar_uid'),
        supabase.from('forum_yorumlar').select('yazar_uid'),
      ]);

    if (profilesError || konuError || yorumError) {
      toast_('Kullanıcılar yüklenemedi', 'err');
      setYukleniyor(false);
      return;
    }

    const konuSayac = new Map<string, number>();
    const yorumSayac = new Map<string, number>();

    for (const kayit of konuYazarlar ?? []) {
      const uid = kayit?.yazar_uid;
      if (!uid) continue;
      konuSayac.set(uid, (konuSayac.get(uid) ?? 0) + 1);
    }

    for (const kayit of yorumYazarlar ?? []) {
      const uid = kayit?.yazar_uid;
      if (!uid) continue;
      yorumSayac.set(uid, (yorumSayac.get(uid) ?? 0) + 1);
    }

    const enriched: AdminUser[] = (profilesData ?? []).map((p: any) => ({
      id: p.id,
      email: p.email ?? '',
      full_name: p.full_name ?? p.email?.split('@')[0] ?? 'İsimsiz',
      avatar_url: p.avatar_url ?? '',
      created_at: p.created_at,
      is_moderator: p.is_moderator ?? false,
      is_banned: p.is_banned ?? false,
      konu_sayisi: konuSayac.get(p.id) ?? 0,
      yorum_sayisi: yorumSayac.get(p.id) ?? 0,
    }));

    setKullanicilar(enriched);
    setYukleniyor(false);
  }, []);

  const konulariYukle = useCallback(async () => {
    setYukleniyor(true);

    let q = supabase.from('forum_konular').select('*').limit(100);

    if (konuSiralama === 'yeni') q = q.order('created_at', { ascending: false });
    else if (konuSiralama === 'aktif') q = q.order('yorum_sayisi', { ascending: false });
    else q = q.order('goruntuleme', { ascending: false });

    const { data, error } = await q;

    if (error) {
      toast_('Konular yüklenemedi: ' + error.message, 'err');
      setYukleniyor(false);
      return;
    }

    setKonular(data ?? []);
    setYukleniyor(false);
  }, [konuSiralama]);

  const yorumlariYukle = useCallback(async () => {
    setYukleniyor(true);

    const { data, error } = await supabase
      .from('forum_yorumlar')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      toast_('Yorumlar yüklenemedi: ' + error.message, 'err');
      setYukleniyor(false);
      return;
    }

    setYorumlar(data ?? []);
    setYukleniyor(false);
  }, []);

  useEffect(() => {
    if (isAdmin) statsYukle();
  }, [isAdmin, statsYukle]);

  useEffect(() => {
    if (isAdmin && sekme === 'kullanicilar') kullanicilariYukle();
  }, [isAdmin, sekme, kullanicilariYukle]);

  useEffect(() => {
    if (isAdmin && sekme === 'konular') konulariYukle();
  }, [isAdmin, sekme, konulariYukle, konuSiralama]);

  useEffect(() => {
    if (isAdmin && sekme === 'yorumlar') yorumlariYukle();
  }, [isAdmin, sekme, yorumlariYukle]);

  const moderatorToggle = async (u: AdminUser) => {
    const { error } = await supabase.from('profiles').update({ is_moderator: !u.is_moderator }).eq('id', u.id);

    if (error) {
      toast_('Hata: ' + error.message, 'err');
      return;
    }

    toast_(u.full_name + (u.is_moderator ? ' moderatörlükten çıkarıldı' : ' moderatör yapıldı'), 'ok');
    kullanicilariYukle();
  };

  const banToggle = async (u: AdminUser) => {
    if (!u.is_banned) {
      setSilModal({
        baslik: 'Kullanıcıyı Banla',
        mesaj: u.full_name + ' forumu kullanamayacak. Emin misin?',
        onSil: async () => {
          setSilModal(null);

          const { error } = await supabase.from('profiles').update({ is_banned: true }).eq('id', u.id);

          if (error) {
            toast_('Hata: ' + error.message, 'err');
            return;
          }

          toast_(u.full_name + ' banlandı', 'ok');
          kullanicilariYukle();
        },
      });
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .update({ is_banned: false })
      .eq('id', u.id);

    if (error) {
      toast_('Hata: ' + error.message, 'err');
      return;
    }

    toast_(u.full_name + ' banı kaldırıldı', 'ok');
    kullanicilariYukle();
  };

  const konuPinToggle = async (k: ForumKonu) => {
    const { error } = await supabase.from('forum_konular').update({ pinli: !k.pinli }).eq('id', k.id);

    if (error) {
      toast_('Hata: ' + error.message, 'err');
      return;
    }

    toast_(k.pinli ? 'Sabitleme kaldırıldı' : 'Konu sabitlendi', 'ok');
    konulariYukle();
  };

  const konuKapalToggle = async (k: ForumKonu) => {
    const { error } = await supabase.from('forum_konular').update({ kapali: !k.kapali }).eq('id', k.id);

    if (error) {
      toast_('Hata: ' + error.message, 'err');
      return;
    }

    toast_(k.kapali ? 'Konu açıldı' : 'Konu kilitlendi', 'ok');
    konulariYukle();
  };

  const konuSil = (k: ForumKonu) =>
    setSilModal({
      baslik: 'Konuyu Sil',
      mesaj: '"' + k.baslik.slice(0, 60) + '" konusu kalıcı olarak silinecek. Emin misin?',
      onSil: async () => {
        setSilModal(null);

        const { error } = await supabase.from('forum_konular').delete().eq('id', k.id);

        if (error) {
          toast_('Hata: ' + error.message, 'err');
          return;
        }

        toast_('Konu silindi', 'ok');
        konulariYukle();
      },
    });

  const yorumSil = (y: ForumYorum) =>
    setSilModal({
      baslik: 'Yorumu Sil',
      mesaj: '"' + y.icerik.slice(0, 80) + '" yorumu kalıcı olarak silinecek. Emin misin?',
      onSil: async () => {
        setSilModal(null);

        const { error } = await supabase.from('forum_yorumlar').delete().eq('id', y.id);

        if (error) {
          toast_('Hata: ' + error.message, 'err');
          return;
        }

        toast_('Yorum silindi', 'ok');
        yorumlariYukle();
      },
    });

  const filtreliKul = kullanicilar
    .filter(
      (u) =>
        !aramaK ||
        u.full_name.toLowerCase().includes(aramaK.toLowerCase()) ||
        u.email.toLowerCase().includes(aramaK.toLowerCase())
    )
    .sort((a, b) =>
      kulSiralama === 'konu'
        ? b.konu_sayisi - a.konu_sayisi
        : kulSiralama === 'yorum'
          ? b.yorum_sayisi - a.yorum_sayisi
          : 0
    );

  const filtreliKonular = konular.filter(
    (k) =>
      !aramaKonu ||
      k.baslik.toLowerCase().includes(aramaKonu.toLowerCase()) ||
      k.yazar_ad.toLowerCase().includes(aramaKonu.toLowerCase())
  );


  const aktifKullanici = kullanicilar.filter((u) => !u.is_banned).length;
  const banliKullanici = kullanicilar.filter((u) => u.is_banned).length;
  const moderatorSayisi = kullanicilar.filter((u) => u.is_moderator).length;
  const pinliKonuSayisi = konular.filter((k) => k.pinli).length;
  const kilitliKonuSayisi = konular.filter((k) => k.kapali).length;
  const toplamEtkilesim = (stats?.toplamKonu ?? 0) + (stats?.toplamYorum ?? 0);

  const btnStyle = (aktif: boolean) => ({
    display: 'flex' as const,
    alignItems: 'center' as const,
    gap: 7,
    padding: '6px 14px',
    borderRadius: 6,
    border: 'none',
    cursor: 'pointer' as const,
    fontSize: 13,
    fontWeight: 600,
    background: aktif ? 'var(--amber-light)' : 'transparent',
    color: aktif ? 'var(--amber)' : 'var(--ink-3)',
    transition: 'all .15s',
  });

  const iconBtn = (active = false, danger = false) => ({
    width: 30,
    height: 30,
    borderRadius: 6,
    border: `1px solid ${
      danger ? 'var(--border-dark)' : active ? 'rgba(245,158,11,0.3)' : 'var(--border-dark)'
    }`,
    background: active
      ? danger
        ? 'rgba(239,68,68,0.08)'
        : 'rgba(245,158,11,0.1)'
      : 'transparent',
    cursor: 'pointer' as const,
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    color: active ? (danger ? 'var(--red)' : 'var(--amber)') : 'var(--ink-3)',
    transition: 'all .15s',
    flexShrink: 0 as const,
  });

  if (authLoading || adminKontrolEdiliyor) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg)',
          color: 'var(--ink-3)',
          fontSize: 15,
        }}
      >
        Yükleniyor...
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg)',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <Shield size={48} color="var(--red)" style={{ opacity: 0.4 }} />
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: 'var(--ink)' }}>
          Yetkisiz Erişim
        </h2>
        <p style={{ color: 'var(--ink-4)', fontSize: 14 }}>Bu sayfaya erişim yetkiniz yok.</p>
      </div>
    );
  }

  return (
    <div className="td-admin-root" style={{ minHeight: '100vh', background: 'var(--bg)', fontFamily: 'var(--font-sans)' }}>
      <div
        style={{
          background: 'var(--bg-card)',
          borderBottom: '1px solid var(--border)',
          padding: '0 24px',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          boxShadow: '0 2px 20px rgba(0,0,0,0.3)',
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            height: 60,
            gap: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginRight: 16 }}>
            <div
              style={{
                width: 32,
                height: 32,
                background: 'var(--amber)',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Wrench size={16} color="#0a0a0f" />
            </div>
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 16,
                fontWeight: 700,
                color: 'var(--ink)',
                whiteSpace: 'nowrap',
              }}
            >
              Admin Panel
            </span>
          </div>

          <div style={{ display: 'flex', gap: 2, flex: 1, overflowX: 'auto' }}>
            {([
              ['genel', 'Genel Bakış', <BarChart2 size={14} key="genel-icon" />],
              ['kullanicilar', 'Kullanıcılar', <Users size={14} key="kullanicilar-icon" />],
              ['konular', 'Konular', <MessageSquare size={14} key="konular-icon" />],
              ['yorumlar', 'Yorumlar', <Activity size={14} key="yorumlar-icon" />],
            ] as const).map(([id, etiket, ikon]) => (
              <button key={id} onClick={() => setSekme(id)} style={btnStyle(sekme === id)}>
                {ikon} {etiket}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <span style={{ fontSize: 12, color: 'var(--ink-4)' }}>{user.email}</span>
            <button
              onClick={() => supabase.auth.signOut()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: 'none',
                border: '1px solid var(--border-dark)',
                borderRadius: 6,
                padding: '6px 12px',
                cursor: 'pointer',
                color: 'var(--ink-4)',
                fontSize: 12,
              }}
            >
              <LogOut size={13} /> Çıkış
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
        {sekme === 'genel' && (
          <div style={{ animation: 'fadeUp .4s ease both' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 24,
              }}
            >
              <div>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, color: 'var(--ink)', marginBottom: 4 }}>
                  Genel Bakış
                </h1>
                <p style={{ fontSize: 13, color: 'var(--ink-4)' }}>Platform istatistikleri</p>
              </div>

              <button
                onClick={statsYukle}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-dark)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '8px 16px',
                  cursor: 'pointer',
                  color: 'var(--ink-3)',
                  fontSize: 13,
                }}
              >
                <RefreshCw size={14} /> Yenile
              </button>
            </div>

            {stats ? (
              <>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: 16,
                    marginBottom: 24,
                  }}
                >
                  <StatKart ikon={<Users size={24} />} baslik="Toplam Kullanıcı" deger={stats.toplamKullanici} alt="Kayıtlı hesap" renk="var(--amber)" />
                  <StatKart ikon={<MessageSquare size={24} />} baslik="Toplam Konu" deger={stats.toplamKonu} alt={'Bugün +' + stats.bugunKonu} renk="#60a5fa" />
                  <StatKart ikon={<Activity size={24} />} baslik="Toplam Yorum" deger={stats.toplamYorum} alt={'Bugün +' + stats.bugunYorum} renk="var(--green)" />
                  <StatKart ikon={<Eye size={24} />} baslik="Toplam Görüntülenme" deger={stats.toplamGoruntulenme} alt="Tüm konular" renk="#a78bfa" />
                </div>

                <div
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-lg)',
                    padding: 24,
                  }}
                >
                  <h3
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: 'var(--ink)',
                      marginBottom: 16,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <Flame size={16} color="var(--amber)" /> Bugünün Aktivitesi
                  </h3>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                      gap: 12,
                    }}
                  >
                    {[
                      ['Yeni Konu', stats.bugunKonu, '#60a5fa'],
                      ['Yeni Yorum', stats.bugunYorum, 'var(--green)'],
                    ].map(([e, d, r]) => (
                      <div
                        key={e as string}
                        style={{
                          background: 'var(--bg-muted)',
                          borderRadius: 'var(--radius)',
                          padding: '16px 20px',
                          borderLeft: `3px solid ${r}`,
                        }}
                      >
                        <p
                          style={{
                            fontSize: 11,
                            color: 'var(--ink-4)',
                            fontWeight: 600,
                            letterSpacing: '.06em',
                            textTransform: 'uppercase',
                            marginBottom: 4,
                          }}
                        >
                          {e}
                        </p>
                        <p style={{ fontSize: 24, fontWeight: 800, color: r as string }}>{d as number}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="td-admin-insight-grid" style={{ display: 'grid', gridTemplateColumns: '1.1fr .9fr', gap: 16, marginTop: 16 }}>
                  <div style={{ background: 'linear-gradient(180deg, rgba(17,24,39,.92), rgba(10,15,25,.96))', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 24 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 800, color: 'var(--ink)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Shield size={16} color="var(--green)" /> Yönetim Özeti
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
                      {[
                        ['Aktif kullanıcı', aktifKullanici, 'Banlı olmayan hesaplar', 'var(--green)'],
                        ['Banlı kullanıcı', banliKullanici, 'Erişimi kısıtlananlar', 'var(--red)'],
                        ['Moderatör', moderatorSayisi, 'Forum yetkilileri', 'var(--amber)'],
                        ['Etkileşim', toplamEtkilesim, 'Konu + yorum toplamı', '#60a5fa'],
                      ].map(([baslik, deger, alt, renk]) => (
                        <div key={baslik as string} style={{ background: 'rgba(255,255,255,.035)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 14, padding: 14 }}>
                          <div style={{ fontSize: 11, color: 'var(--ink-4)', fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase' }}>{baslik as string}</div>
                          <div style={{ marginTop: 6, fontSize: 24, fontWeight: 900, color: renk as string }}>{Number(deger).toLocaleString('tr-TR')}</div>
                          <div style={{ marginTop: 4, fontSize: 12, color: 'var(--ink-4)' }}>{alt as string}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 24 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 800, color: 'var(--ink)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <AlertTriangle size={16} color="var(--amber)" /> Hızlı Kontrol
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {[
                        ['Sabitlenen konu', pinliKonuSayisi, 'Pinli konuları denetle'],
                        ['Kilitli konu', kilitliKonuSayisi, 'Kapalı tartışmaları kontrol et'],
                        ['Son yorum', yorumlar.length, 'Yorumlar sekmesini yenile'],
                      ].map(([baslik, deger, alt]) => (
                        <div key={baslik as string} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: 12, borderRadius: 14, background: 'var(--bg-muted)', border: '1px solid var(--border-dark)' }}>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--ink)' }}>{baslik as string}</div>
                            <div style={{ fontSize: 12, color: 'var(--ink-4)', marginTop: 3 }}>{alt as string}</div>
                          </div>
                          <strong style={{ color: 'var(--amber)', fontSize: 18 }}>{Number(deger).toLocaleString('tr-TR')}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: 60, color: 'var(--ink-4)' }}>
                <Database size={32} style={{ opacity: 0.3, marginBottom: 12 }} />
                <p>İstatistikler yükleniyor...</p>
              </div>
            )}
          </div>
        )}

        {sekme === 'kullanicilar' && (
          <div style={{ animation: 'fadeUp .4s ease both' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 20,
                flexWrap: 'wrap',
                gap: 12,
              }}
            >
              <div>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, color: 'var(--ink)', marginBottom: 4 }}>
                  Kullanıcılar
                </h1>
                <p style={{ fontSize: 13, color: 'var(--ink-4)' }}>{filtreliKul.length} kullanıcı</p>
              </div>

              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: 3 }}>
                  {[['yeni', 'Yeni'], ['konu', 'Konu'], ['yorum', 'Yorum']].map(([k, l]) => (
                    <button
                      key={k}
                      onClick={() => setKulSiralama(k as any)}
                      style={{
                        padding: '6px 12px',
                        fontSize: 12,
                        fontWeight: 600,
                        borderRadius: 6,
                        border: 'none',
                        cursor: 'pointer',
                        background: kulSiralama === k ? 'var(--amber)' : 'var(--bg-card)',
                        color: kulSiralama === k ? '#0a0a0f' : 'var(--ink-3)',
                        transition: 'all .15s',
                      }}
                    >
                      {l}
                    </button>
                  ))}
                </div>

                <div style={{ position: 'relative' }}>
                  <Search
                    size={14}
                    style={{
                      position: 'absolute',
                      left: 10,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--ink-4)',
                    }}
                  />
                  <input
                    value={aramaK}
                    onChange={(e) => setAramaK(e.target.value)}
                    placeholder="Ad veya e-posta..."
                    style={{
                      paddingLeft: 32,
                      paddingRight: 12,
                      height: 34,
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-mid)',
                      borderRadius: 6,
                      color: 'var(--ink)',
                      fontSize: 13,
                      outline: 'none',
                      width: 200,
                    }}
                  />
                </div>

                <button
                  onClick={kullanicilariYukle}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-dark)',
                    borderRadius: 6,
                    padding: '7px 12px',
                    cursor: 'pointer',
                    color: 'var(--ink-3)',
                    fontSize: 13,
                  }}
                >
                  <RefreshCw size={13} />
                </button>
              </div>
            </div>

            {yukleniyor ? (
              <div style={{ textAlign: 'center', padding: 60, color: 'var(--ink-4)' }}>Yükleniyor...</div>
            ) : (
              <div
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 70px 70px 70px 150px',
                    padding: '12px 20px',
                    borderBottom: '1px solid var(--border)',
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '.06em',
                    textTransform: 'uppercase',
                    color: 'var(--ink-4)',
                  }}
                >
                  <span>Kullanıcı</span>
                  <span>Kayıt</span>
                  <span style={{ textAlign: 'center' }}>Konu</span>
                  <span style={{ textAlign: 'center' }}>Yorum</span>
                  <span style={{ textAlign: 'center' }}>Rol</span>
                  <span style={{ textAlign: 'right' }}>İşlem</span>
                </div>

                {filtreliKul.map((u, i) => (
                  <div
                    key={u.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '2fr 1fr 70px 70px 70px 150px',
                      padding: '12px 20px',
                      alignItems: 'center',
                      borderBottom: i < filtreliKul.length - 1 ? '1px solid var(--border)' : 'none',
                      background: u.is_banned ? 'rgba(239,68,68,0.04)' : 'transparent',
                      transition: 'background .12s',
                    }}
                    onMouseEnter={(e) => {
                      if (!u.is_banned) (e.currentTarget as HTMLElement).style.background = 'var(--bg-muted)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = u.is_banned
                        ? 'rgba(239,68,68,0.04)'
                        : 'transparent';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: '50%',
                          overflow: 'hidden',
                          flexShrink: 0,
                          background: 'var(--bg-muted)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 13,
                          fontWeight: 700,
                          color: 'var(--amber)',
                        }}
                      >
                        {u.avatar_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={u.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          u.full_name.slice(0, 2).toUpperCase()
                        )}
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 14, fontWeight: 600, color: u.is_banned ? 'var(--red)' : 'var(--ink)' }}>
                            {u.full_name}
                          </span>
                          {u.is_moderator && <Crown size={12} color="var(--amber)" aria-label="Moderatör" />}
                          {u.is_banned && (
                            <span
                              style={{
                                fontSize: 9,
                                padding: '1px 6px',
                                borderRadius: 10,
                                background: 'rgba(239,68,68,0.15)',
                                color: 'var(--red)',
                                fontWeight: 700,
                              }}
                            >
                              BANLANDI
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--ink-4)' }}>{u.email}</div>
                      </div>
                    </div>

                    <span style={{ fontSize: 12, color: 'var(--ink-4)' }}>{zaman(u.created_at)}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-2)', textAlign: 'center' }}>
                      {u.konu_sayisi}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-2)', textAlign: 'center' }}>
                      {u.yorum_sayisi}
                    </span>

                    <span style={{ textAlign: 'center' }}>
                      {u.is_moderator ? (
                        <span
                          style={{
                            fontSize: 10,
                            padding: '2px 8px',
                            borderRadius: 20,
                            background: 'rgba(245,158,11,0.15)',
                            color: 'var(--amber)',
                            fontWeight: 700,
                          }}
                        >
                          MOD
                        </span>
                      ) : (
                        <span
                          style={{
                            fontSize: 10,
                            padding: '2px 8px',
                            borderRadius: 20,
                            background: 'var(--bg-muted)',
                            color: 'var(--ink-4)',
                            fontWeight: 600,
                          }}
                        >
                          Üye
                        </span>
                      )}
                    </span>

                    <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                      <button onClick={() => setSifreModal(u)} title="Şifre sıfırla" style={iconBtn()}>
                        <Key size={13} />
                      </button>
                      <button
                        onClick={() => moderatorToggle(u)}
                        title={u.is_moderator ? 'Moderatörlüğü kaldır' : 'Moderatör yap'}
                        style={iconBtn(u.is_moderator)}
                      >
                        {u.is_moderator ? <UserX size={13} /> : <UserCheck size={13} />}
                      </button>
                      <button
                        onClick={() => banToggle(u)}
                        title={u.is_banned ? 'Banı kaldır' : 'Banla'}
                        style={iconBtn(u.is_banned, u.is_banned)}
                      >
                        <Shield size={13} />
                      </button>
                    </div>
                  </div>
                ))}

                {filtreliKul.length === 0 && (
                  <div style={{ textAlign: 'center', padding: 48, color: 'var(--ink-4)' }}>
                    Kullanıcı bulunamadı
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {sekme === 'konular' && (
          <div style={{ animation: 'fadeUp .4s ease both' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 20,
                flexWrap: 'wrap',
                gap: 12,
              }}
            >
              <div>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, color: 'var(--ink)', marginBottom: 4 }}>
                  Konular
                </h1>
                <p style={{ fontSize: 13, color: 'var(--ink-4)' }}>{filtreliKonular.length} konu</p>
              </div>

              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: 3 }}>
                  {[['yeni', 'Yeni'], ['aktif', 'Aktif'], ['en_cok', 'En Çok']].map(([k, l]) => (
                    <button
                      key={k}
                      onClick={() => setKonuSiralama(k as any)}
                      style={{
                        padding: '6px 12px',
                        fontSize: 12,
                        fontWeight: 600,
                        borderRadius: 6,
                        border: 'none',
                        cursor: 'pointer',
                        background: konuSiralama === k ? 'var(--amber)' : 'var(--bg-card)',
                        color: konuSiralama === k ? '#0a0a0f' : 'var(--ink-3)',
                        transition: 'all .15s',
                      }}
                    >
                      {l}
                    </button>
                  ))}
                </div>

                <div style={{ position: 'relative' }}>
                  <Search
                    size={14}
                    style={{
                      position: 'absolute',
                      left: 10,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--ink-4)',
                    }}
                  />
                  <input
                    value={aramaKonu}
                    onChange={(e) => setAramaKonu(e.target.value)}
                    placeholder="Başlık veya yazar..."
                    style={{
                      paddingLeft: 32,
                      paddingRight: 12,
                      height: 34,
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-mid)',
                      borderRadius: 6,
                      color: 'var(--ink)',
                      fontSize: 13,
                      outline: 'none',
                      width: 200,
                    }}
                  />
                </div>

                <button
                  onClick={konulariYukle}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-dark)',
                    borderRadius: 6,
                    padding: '7px 12px',
                    cursor: 'pointer',
                    color: 'var(--ink-3)',
                    fontSize: 13,
                  }}
                >
                  <RefreshCw size={13} />
                </button>
              </div>
            </div>

            {yukleniyor ? (
              <div style={{ textAlign: 'center', padding: 60, color: 'var(--ink-4)' }}>Yükleniyor...</div>
            ) : (
              <div
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '3fr 100px 70px 70px 70px 110px',
                    padding: '12px 20px',
                    borderBottom: '1px solid var(--border)',
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '.06em',
                    textTransform: 'uppercase',
                    color: 'var(--ink-4)',
                  }}
                >
                  <span>Başlık</span>
                  <span>Tarih</span>
                  <span style={{ textAlign: 'center' }}>Görüntü.</span>
                  <span style={{ textAlign: 'center' }}>Yorum</span>
                  <span style={{ textAlign: 'center' }}>Beğeni</span>
                  <span style={{ textAlign: 'right' }}>İşlem</span>
                </div>

                {filtreliKonular.map((k, i) => (
                  <div
                    key={k.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '3fr 100px 70px 70px 70px 110px',
                      padding: '12px 20px',
                      alignItems: 'center',
                      borderBottom: i < filtreliKonular.length - 1 ? '1px solid var(--border)' : 'none',
                      transition: 'background .12s',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = 'var(--bg-muted)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = 'transparent';
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                        {k.pinli && <Pin size={11} color="var(--amber)" />}
                        {k.kapali && <Lock size={11} color="var(--ink-4)" />}
                        <span
                          style={{
                            fontSize: 14,
                            fontWeight: 600,
                            color: 'var(--ink)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {k.baslik}
                        </span>
                      </div>
                      <span style={{ fontSize: 11, color: 'var(--ink-4)' }}>@{k.yazar_ad}</span>
                    </div>

                    <span style={{ fontSize: 11, color: 'var(--ink-4)' }}>{zaman(k.created_at)}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-2)', textAlign: 'center' }}>
                      {k.goruntuleme.toLocaleString()}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-2)', textAlign: 'center' }}>
                      {k.yorum_sayisi}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-2)', textAlign: 'center' }}>
                      {k.begeni_sayisi}
                    </span>

                    <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => konuPinToggle(k)}
                        title={k.pinli ? 'Sabitlemeyi kaldır' : 'Sabitle'}
                        style={iconBtn(k.pinli)}
                      >
                        <Pin size={13} />
                      </button>

                      <button
                        onClick={() => konuKapalToggle(k)}
                        title={k.kapali ? 'Konuyu aç' : 'Kilitle'}
                        style={iconBtn(k.kapali, k.kapali)}
                      >
                        {k.kapali ? <Unlock size={13} /> : <Lock size={13} />}
                      </button>

                      <button
                        onClick={() => konuSil(k)}
                        title="Sil"
                        style={iconBtn()}
                        onMouseEnter={(e) => {
                          const el = e.currentTarget as HTMLElement;
                          el.style.borderColor = 'rgba(239,68,68,0.4)';
                          el.style.color = 'var(--red)';
                        }}
                        onMouseLeave={(e) => {
                          const el = e.currentTarget as HTMLElement;
                          el.style.borderColor = 'var(--border-dark)';
                          el.style.color = 'var(--ink-3)';
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}

                {filtreliKonular.length === 0 && (
                  <div style={{ textAlign: 'center', padding: 48, color: 'var(--ink-4)' }}>
                    Konu bulunamadı
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {sekme === 'yorumlar' && (
          <div style={{ animation: 'fadeUp .4s ease both' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, color: 'var(--ink)', marginBottom: 4 }}>
                  Yorumlar
                </h1>
                <p style={{ fontSize: 13, color: 'var(--ink-4)' }}>Son {yorumlar.length} yorum</p>
              </div>

              <button
                onClick={yorumlariYukle}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-dark)',
                  borderRadius: 6,
                  padding: '8px 14px',
                  cursor: 'pointer',
                  color: 'var(--ink-3)',
                  fontSize: 13,
                }}
              >
                <RefreshCw size={13} /> Yenile
              </button>
            </div>

            {yukleniyor ? (
              <div style={{ textAlign: 'center', padding: 60, color: 'var(--ink-4)' }}>Yükleniyor...</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {yorumlar.map((y) => (
                  <div
                    key={y.id}
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius)',
                      padding: '14px 18px',
                      display: 'flex',
                      gap: 14,
                      alignItems: 'flex-start',
                      transition: 'border-color .15s',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-mid)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>@{y.yazar_ad}</span>
                        <span style={{ fontSize: 11, color: 'var(--ink-4)' }}>{zaman(y.created_at)}</span>
                        <span
                          style={{
                            fontSize: 10,
                            padding: '1px 8px',
                            borderRadius: 20,
                            background: 'var(--bg-muted)',
                            color: 'var(--ink-4)',
                            fontFamily: 'var(--font-mono)',
                          }}
                        >
                          konu: {y.konu_id.slice(0, 8)}...
                        </span>
                      </div>

                      <p style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.5 }}>
                        {y.icerik.slice(0, 300)}
                        {y.icerik.length > 300 ? '...' : ''}
                      </p>
                    </div>

                    <button
                      onClick={() => yorumSil(y)}
                      title="Yorumu sil"
                      style={{ ...iconBtn(), marginTop: 2 }}
                      onMouseEnter={(e) => {
                        const el = e.currentTarget as HTMLElement;
                        el.style.borderColor = 'rgba(239,68,68,0.4)';
                        el.style.color = 'var(--red)';
                      }}
                      onMouseLeave={(e) => {
                        const el = e.currentTarget as HTMLElement;
                        el.style.borderColor = 'var(--border-dark)';
                        el.style.color = 'var(--ink-3)';
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}

                {yorumlar.length === 0 && (
                  <div
                    style={{
                      textAlign: 'center',
                      padding: 48,
                      color: 'var(--ink-4)',
                      background: 'var(--bg-card)',
                      borderRadius: 'var(--radius-lg)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    Yorum bulunamadı
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {sifreModal && <SifreModal user={sifreModal} onClose={() => setSifreModal(null)} onToast={toast_} />}
      {silModal && (
        <SilModal
          baslik={silModal.baslik}
          mesaj={silModal.mesaj}
          onSil={silModal.onSil}
          onClose={() => setSilModal(null)}
        />
      )}
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
