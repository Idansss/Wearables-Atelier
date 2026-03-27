-- Flyers table for admin-controlled popup flyers
create table if not exists flyers (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  title text not null default '',
  is_active boolean not null default false,
  delay_seconds int not null default 5,
  created_at timestamptz not null default now()
);

-- RLS
alter table flyers enable row level security;

drop policy if exists "flyers_public_read" on flyers;
create policy "flyers_public_read" on flyers
  for select using (true);

drop policy if exists "flyers_admin_all" on flyers;
create policy "flyers_admin_all" on flyers
  for all using (is_admin());
