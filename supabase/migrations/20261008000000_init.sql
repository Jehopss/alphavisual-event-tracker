-- =====================================================================
-- Alpha Visual Event Tracker: skema awal
--   team_members       : daftar email Gmail yang boleh mengakses data
--   events             : data event bersama satu tim
--   google_connections : refresh token Google Calendar per user (rahasia)
--   calendar_links     : pemetaan event tracker <-> event di kalender tiap user
-- =====================================================================

-- ---------------------------------------------------------------------
-- Anggota tim
-- ---------------------------------------------------------------------
create table public.team_members (
  email text primary key check (email = lower(email)),
  name text,
  created_at timestamptz not null default now()
);

-- Tanpa policy: hanya bisa diubah lewat dashboard / SQL editor (service role)
alter table public.team_members enable row level security;
revoke all on public.team_members from anon, authenticated;

-- Dipakai oleh semua policy di bawah. security definer agar bisa membaca team_members
create function public.is_team_member()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.team_members
    where email = lower(auth.jwt() ->> 'email')
  );
$$;

revoke execute on function public.is_team_member() from public, anon;
grant execute on function public.is_team_member() to authenticated;

-- ---------------------------------------------------------------------
-- Event
-- ---------------------------------------------------------------------
create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(trim(title)) > 0),
  client text not null check (length(trim(client)) > 0),
  category text not null default 'Wedding'
    check (category in ('Wedding', 'Corporate', 'Music/Gig', 'Birthday', 'Workshop', 'Lainnya')),
  -- Jam dinding lokal (WIB), sengaja tanpa zona waktu agar sama persis dengan input form
  start_date timestamp not null,
  end_date timestamp check (end_date is null or end_date >= start_date),
  location text not null default '',
  fee bigint not null default 0 check (fee >= 0),
  status text not null default 'Inquiry'
    check (status in ('Inquiry', 'Negosiasi', 'Confirmed', 'Selesai', 'Dibatalkan')),
  payment_status text not null default 'Belum DP'
    check (payment_status in ('Belum DP', 'Sudah DP', 'Menunggu Pelunasan', 'Lunas')),
  doc_link text not null default '',
  notes text not null default '',
  created_by uuid default auth.uid() references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index events_start_date_idx on public.events (start_date);

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger events_set_updated_at
  before update on public.events
  for each row execute function public.set_updated_at();

alter table public.events enable row level security;
revoke all on public.events from anon;

create policy "Anggota tim bisa melihat event"
  on public.events for select to authenticated
  using ((select public.is_team_member()));

create policy "Anggota tim bisa menambah event"
  on public.events for insert to authenticated
  with check ((select public.is_team_member()));

create policy "Anggota tim bisa mengubah event"
  on public.events for update to authenticated
  using ((select public.is_team_member()))
  with check ((select public.is_team_member()));

create policy "Anggota tim bisa menghapus event"
  on public.events for delete to authenticated
  using ((select public.is_team_member()));

-- Perubahan event langsung terlihat oleh anggota tim lain (Realtime)
alter publication supabase_realtime add table public.events;

-- ---------------------------------------------------------------------
-- Koneksi Google Calendar per user
-- refresh_token hanya bisa dibaca Edge Function (service role), tidak pernah oleh browser
-- ---------------------------------------------------------------------
create table public.google_connections (
  user_id uuid primary key references auth.users (id) on delete cascade,
  google_email text,
  refresh_token text not null,
  sync_enabled boolean not null default true,
  needs_reconnect boolean not null default false,
  connected_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger google_connections_set_updated_at
  before update on public.google_connections
  for each row execute function public.set_updated_at();

alter table public.google_connections enable row level security;
revoke all on public.google_connections from anon, authenticated;

-- Browser hanya boleh melihat status koneksinya sendiri (tanpa kolom refresh_token)
grant select (user_id, google_email, sync_enabled, needs_reconnect, connected_at)
  on public.google_connections to authenticated;
grant update (sync_enabled) on public.google_connections to authenticated;

create policy "User melihat koneksi kalendernya sendiri"
  on public.google_connections for select to authenticated
  using (user_id = (select auth.uid()));

create policy "User mengatur sync kalendernya sendiri"
  on public.google_connections for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------
-- Pemetaan event -> event Google per user
-- event_id sengaja TANPA foreign key: saat event dihapus, baris ini masih dibutuhkan
-- untuk tahu event Google mana yang harus ikut dihapus.
-- ---------------------------------------------------------------------
create table public.calendar_links (
  event_id uuid not null,
  user_id uuid not null references auth.users (id) on delete cascade,
  google_event_id text not null,
  synced_at timestamptz not null default now(),
  primary key (event_id, user_id)
);

alter table public.calendar_links enable row level security;
revoke all on public.calendar_links from anon, authenticated;
