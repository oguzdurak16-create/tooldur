create table public.daily_traffic_visitors (
  day date not null,
  visitor_hash text not null check (visitor_hash ~ '^[a-f0-9]{64}$'),
  last_seen timestamptz not null,
  sessions integer not null default 1,
  primary key (day, visitor_hash)
);

alter table public.daily_traffic_visitors enable row level security;
revoke all on public.daily_traffic_visitors from public, anon, authenticated;

create function public.record_traffic_visit(p_day date, p_visitor_hash text)
returns void
language sql
security definer
set search_path = ''
as $$
  insert into public.daily_traffic_visitors as visitor (day, visitor_hash, last_seen)
  select p_day, p_visitor_hash, now()
  where p_day = (now() at time zone 'Europe/Istanbul')::date
  on conflict (day, visitor_hash) do update
  set last_seen = excluded.last_seen,
      sessions = visitor.sessions + case
        when visitor.last_seen <= excluded.last_seen - interval '30 minutes' then 1
        else 0 end
  where visitor.last_seen <= excluded.last_seen - interval '1 minute';
$$;

revoke all on function public.record_traffic_visit(date, text) from public, anon, authenticated;
grant execute on function public.record_traffic_visit(date, text) to service_role;

create function public.get_daily_traffic()
returns table(day date, visitors bigint, sessions bigint)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  today date := (now() at time zone 'Europe/Istanbul')::date;
  first_record date;
begin
  if not exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and is_admin is true and is_banned is not true
  ) then
    raise exception 'Admin access required' using errcode = '42501';
  end if;

  select min(v.day) into first_record from public.daily_traffic_visitors as v;
  return query
    select today - days.offset_days,
           case when today - days.offset_days >= first_record then coalesce(stats.visitors, 0) end,
           case when today - days.offset_days >= first_record then coalesce(stats.sessions, 0) end
    from generate_series(0, 13) as days(offset_days)
    left join (
      select v.day, count(*) as visitors, sum(v.sessions) as sessions
      from public.daily_traffic_visitors as v
      where v.day >= today - 13
      group by v.day
    ) as stats on stats.day = today - days.offset_days
    order by days.offset_days;
end;
$$;

revoke all on function public.get_daily_traffic() from public, anon, authenticated;
grant execute on function public.get_daily_traffic() to authenticated;

select cron.schedule(
  'tooldur_daily_traffic_retention', '17 1 * * *',
  $$delete from public.daily_traffic_visitors
    where day <= (now() at time zone 'Europe/Istanbul')::date - 30$$
);
