-- Tooldur Çözüm Ağı: kalite, duplicate ve hız limiti korumaları
-- Yalnız Çözüm Ağı kategori slug'larına uygulanır; mevcut forum akışını etkilemez.

-- Guard sorguları kullanıcı + zaman penceresi üzerinden çalışır. Mevcut tek kolonlu
-- indexler büyüyen veri setinde yeterli seçiciliği sağlamadığından bu birleşik indexler
-- rate-limit ve duplicate kontrollerinin tüm tabloyu taramasını önler.
create index if not exists idx_forum_konular_yazar_created
  on public.forum_konular (yazar_uid, created_at desc);

create index if not exists idx_forum_konular_yazar_baslik_created
  on public.forum_konular (yazar_uid, lower(btrim(baslik)), created_at desc);

create index if not exists idx_forum_yorumlar_yazar_konu_created
  on public.forum_yorumlar (yazar_uid, konu_id, created_at desc);

create index if not exists idx_forum_yorumlar_yazar_created
  on public.forum_yorumlar (yazar_uid, created_at desc);

create or replace function public.cozum_agi_konu_guard()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog, public
as $$
declare
  v_slug text;
  v_uid uuid := auth.uid();
  v_recent_count integer;
begin
  select k.slug into v_slug
  from public.forum_kategoriler k
  where k.id = new.kategori_id;

  if v_slug is null or v_slug not in (
    'cad-teknik-cizim',
    'makine-uretim',
    'elektrik-otomasyon',
    'arac-mekanik',
    'yazilim-bilgisayar',
    'ev-teknik-cihazlar'
  ) then
    return new;
  end if;

  new.baslik := btrim(new.baslik);
  new.icerik := btrim(new.icerik);

  if char_length(new.baslik) < 12 or char_length(new.baslik) > 200 then
    raise exception 'Çözüm Ağı başlığı 12-200 karakter olmalı';
  end if;

  if char_length(new.icerik) < 80 or char_length(new.icerik) > 20000 then
    raise exception 'Çözüm Ağı içeriği 80-20000 karakter olmalı';
  end if;

  if coalesce(array_length(new.etiketler, 1), 0) > 8 then
    raise exception 'En fazla 8 etiket kullanılabilir';
  end if;

  if exists (
    select 1
    from unnest(coalesce(new.etiketler, array[]::text[])) etik(et)
    where char_length(btrim(etik.et)) > 30
  ) then
    raise exception 'Etiketler en fazla 30 karakter olabilir';
  end if;

  -- service-role / doğrudan yönetim işlemlerinde auth.uid() null olabilir.
  -- Normal kullanıcı yazımlarında RLS zaten yazar_uid = auth.uid() doğrulaması yapar.
  if v_uid is not null then
    if new.yazar_uid is distinct from v_uid then
      raise exception 'Yetkisiz yazar kimliği';
    end if;

    -- Hız ve duplicate kontrolleri yalnız yeni kayıtta çalışır. Kullanıcı kendi
    -- mevcut kaydını düzenlerken son 10 dakikadaki gönderimleri nedeniyle bloklanmaz.
    if tg_op = 'INSERT' then
      select count(*) into v_recent_count
      from public.forum_konular fk
      join public.forum_kategoriler kat on kat.id = fk.kategori_id
      where fk.yazar_uid = v_uid
        and fk.created_at >= now() - interval '10 minutes'
        and kat.slug in (
          'cad-teknik-cizim',
          'makine-uretim',
          'elektrik-otomasyon',
          'arac-mekanik',
          'yazilim-bilgisayar',
          'ev-teknik-cihazlar'
        );

      if v_recent_count >= 3 then
        raise exception 'Çok hızlı gönderim yapıyorsunuz. Birkaç dakika sonra tekrar deneyin.';
      end if;

      if exists (
        select 1
        from public.forum_konular fk
        join public.forum_kategoriler kat on kat.id = fk.kategori_id
        where fk.yazar_uid = v_uid
          and fk.created_at >= now() - interval '24 hours'
          and kat.slug in (
            'cad-teknik-cizim',
            'makine-uretim',
            'elektrik-otomasyon',
            'arac-mekanik',
            'yazilim-bilgisayar',
            'ev-teknik-cihazlar'
          )
          and lower(btrim(fk.baslik)) = lower(new.baslik)
      ) then
        raise exception 'Aynı başlıkla yakın zamanda zaten bir kayıt oluşturdunuz.';
      end if;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists cozum_agi_konu_guard_trigger on public.forum_konular;
create trigger cozum_agi_konu_guard_trigger
before insert or update of kategori_id, baslik, icerik, etiketler, yazar_uid
on public.forum_konular
for each row
execute function public.cozum_agi_konu_guard();

create or replace function public.cozum_agi_yorum_guard()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog, public
as $$
declare
  v_slug text;
  v_uid uuid := auth.uid();
  v_recent_count integer;
begin
  select kat.slug into v_slug
  from public.forum_konular konu
  join public.forum_kategoriler kat on kat.id = konu.kategori_id
  where konu.id = new.konu_id;

  if v_slug is null or v_slug not in (
    'cad-teknik-cizim',
    'makine-uretim',
    'elektrik-otomasyon',
    'arac-mekanik',
    'yazilim-bilgisayar',
    'ev-teknik-cihazlar'
  ) then
    return new;
  end if;

  new.icerik := btrim(new.icerik);

  if char_length(new.icerik) < 20 or char_length(new.icerik) > 5000 then
    raise exception 'Çözüm/deneyim 20-5000 karakter olmalı';
  end if;

  if v_uid is not null then
    if new.yazar_uid is distinct from v_uid then
      raise exception 'Yetkisiz yazar kimliği';
    end if;

    if tg_op = 'INSERT' then
      select count(*) into v_recent_count
      from public.forum_yorumlar fy
      join public.forum_konular fk on fk.id = fy.konu_id
      join public.forum_kategoriler kat on kat.id = fk.kategori_id
      where fy.yazar_uid = v_uid
        and fy.created_at >= now() - interval '10 minutes'
        and kat.slug in (
          'cad-teknik-cizim',
          'makine-uretim',
          'elektrik-otomasyon',
          'arac-mekanik',
          'yazilim-bilgisayar',
          'ev-teknik-cihazlar'
        );

      if v_recent_count >= 8 then
        raise exception 'Çok hızlı çözüm gönderiyorsunuz. Birkaç dakika sonra tekrar deneyin.';
      end if;

      if exists (
        select 1
        from public.forum_yorumlar fy
        where fy.yazar_uid = v_uid
          and fy.konu_id = new.konu_id
          and fy.created_at >= now() - interval '30 minutes'
          and lower(btrim(fy.icerik)) = lower(new.icerik)
      ) then
        raise exception 'Aynı çözümü yakın zamanda zaten gönderdiniz.';
      end if;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists cozum_agi_yorum_guard_trigger on public.forum_yorumlar;
create trigger cozum_agi_yorum_guard_trigger
before insert or update of konu_id, icerik, yazar_uid
on public.forum_yorumlar
for each row
execute function public.cozum_agi_yorum_guard();
