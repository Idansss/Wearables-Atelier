-- Reviews table for product reviews
create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  product_slug text not null,
  name text not null,
  location text not null default '',
  rating int not null check (rating between 1 and 5),
  body text not null,
  status text not null default 'pending' check (status in ('pending', 'approved')),
  created_at timestamptz not null default now()
);

create index if not exists reviews_slug_status on reviews (product_slug, status);

-- RLS
alter table reviews enable row level security;

drop policy if exists "reviews_public_read" on reviews;
create policy "reviews_public_read" on reviews
  for select using (status = 'approved');

drop policy if exists "reviews_public_insert" on reviews;
create policy "reviews_public_insert" on reviews
  for insert with check (true);

drop policy if exists "reviews_admin_all" on reviews;
create policy "reviews_admin_all" on reviews
  for all using (is_admin());
