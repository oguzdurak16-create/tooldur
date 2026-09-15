-- Tooldur Çözüm Ağı: kullanıcı raporlama altyapısı
-- Production'a uygulanmadan önce Supabase üzerinde migration olarak gözden geçirilmeli.

create table if not exists public.cozum_agi_raporlar (
  id uuid primary key default gen_random_uuid(),
  konu_id uuid null references public.forum_konular(id) on delete cascade,
  yorum_id uuid null references public.forum_yorumlar(id) on delete cascade,
  bildiren_uid uuid not null references auth.users(id) on delete cascade,
  neden text not null,
  aciklama text not null default '',
  durum text not null default 'bekliyor',
  created_at timestamptz not null default now(),
  constraint cozum_agi_rapor_hedef_chk check ((konu_id is not null) <> (yorum_id is not null)),
  constraint cozum_agi_rapor_neden_chk check (neden in ('spam','yanlis_bilgi','hakaret','reklam','diger')),
  constraint cozum_agi_rapor_durum_chk check (durum in ('bekliyor','incelendi','reddedildi','islem_yapildi')),
  constraint cozum_agi_rapor_aciklama_chk check (char_length(aciklama) <= 1000)
);

create unique index if not exists cozum_agi_rapor_konu_unique
  on public.cozum_agi_raporlar (bildiren_uid, konu_id)
  where konu_id is not null;

create unique index if not exists cozum_agi_rapor_yorum_unique
  on public.cozum_agi_raporlar (bildiren_uid, yorum_id)
  where yorum_id is not null;

create index if not exists cozum_agi_rapor_durum_created_idx
  on public.cozum_agi_raporlar (durum, created_at desc);

alter table public.cozum_agi_raporlar enable row level security;

drop policy if exists cozum_rapor_insert_own on public.cozum_agi_raporlar;
create policy cozum_rapor_insert_own
on public.cozum_agi_raporlar
for insert
to authenticated
with check (bildiren_uid = auth.uid());

drop policy if exists cozum_rapor_select_own on public.cozum_agi_raporlar;
create policy cozum_rapor_select_own
on public.cozum_agi_raporlar
for select
to authenticated
using (bildiren_uid = auth.uid() or public.is_mod_or_admin());

drop policy if exists cozum_rapor_update_mod on public.cozum_agi_raporlar;
create policy cozum_rapor_update_mod
on public.cozum_agi_raporlar
for update
to authenticated
using (public.is_mod_or_admin())
with check (public.is_mod_or_admin());

drop policy if exists cozum_rapor_delete_mod on public.cozum_agi_raporlar;
create policy cozum_rapor_delete_mod
on public.cozum_agi_raporlar
for delete
to authenticated
using (public.is_mod_or_admin());

-- Kullanıcı yalnız Çözüm Ağı kategorilerindeki hedefleri raporlayabilsin.
create or replace function public.cozum_agi_rapor_guard()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog, public
as $$
declare
  v_slug text;
begin
  if new.bildiren_uid is distinct from auth.uid() then
    raise exception 'Yetkisiz rapor gönderen kimliği';
  end if;

  if new.konu_id is not null then
    select kat.slug into v_slug
    from public.forum_konular konu
    join public.forum_kategoriler kat on kat.id = konu.kategori_id
    where konu.id = new.konu_id;
  else
    select kat.slug into v_slug
    from public.forum_yorumlar yorum
    join public.forum_konular konu on konu.id = yorum.konu_id
    join public.forum_kategoriler kat on kat.id = konu.kategori_id
    where yorum.id = new.yorum_id;
  end if;

  if v_slug is null or v_slug not in (
    'cad-teknik-cizim',
    'makine-uretim',
    'elektrik-otomasyon',
    'arac-mekanik',
    'yazilim-bilgisayar',
    'ev-teknik-cihazlar'
  ) then
    raise exception 'Bu içerik Çözüm Ağı raporlama kapsamı dışında';
  end if;

  new.aciklama := left(btrim(coalesce(new.aciklama, '')), 1000);
  return new;
end;
$$;

drop trigger if exists cozum_agi_rapor_guard_trigger on public.cozum_agi_raporlar;
create trigger cozum_agi_rapor_guard_trigger
before insert on public.cozum_agi_raporlar
for each row
execute function public.cozum_agi_rapor_guard();
