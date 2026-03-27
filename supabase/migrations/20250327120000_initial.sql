-- Wearables Atelier — Supabase schema + RLS
-- Run via Supabase SQL editor or `supabase db push` after linking a project.

-- ─── Admin check (used by RLS + client RPC) ─────────────────────────────────
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.admins a
    where a.is_active = true
    and (
      a.user_id = auth.uid()
      or (
        auth.jwt() ->> 'email' is not null
        and lower(trim(a.email)) = lower(trim(auth.jwt() ->> 'email'))
      )
    )
  );
$$;

grant execute on function public.is_admin() to anon, authenticated;

-- ─── Tables ────────────────────────────────────────────────────────────────

create table if not exists public.products (
  slug text primary key,
  name text not null,
  category text not null default '',
  price numeric not null default 0,
  sale_price numeric,
  description text not null default '',
  sizes text[] not null default '{}',
  details text[] not null default '{}',
  images text[] not null default '{}',
  badge text,
  badge_color text,
  in_stock boolean not null default true,
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  ref text not null,
  customer jsonb not null,
  items jsonb not null,
  subtotal numeric not null,
  discount_amount numeric not null default 0,
  coupon_code text,
  total numeric not null,
  status text not null,
  payment_status text not null,
  paystack_ref text not null default '',
  notes text,
  tracking_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.custom_orders (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text not null default '',
  occasion text not null default '',
  garment text not null default '',
  budget text not null default '',
  event_date text not null default '',
  measurements jsonb not null default '{}',
  inspiration text not null default '',
  notes text not null default '',
  status text not null,
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  source text not null,
  status text not null default 'active',
  subscribed_at timestamptz not null default now()
);

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  status text not null default 'unread',
  created_at timestamptz not null default now()
);

create table if not exists public.wholesale_leads (
  id uuid primary key default gen_random_uuid(),
  business text not null,
  name text not null,
  email text not null,
  phone text not null default '',
  categories text not null default '',
  quantity text not null default '',
  message text not null default '',
  status text not null default 'new',
  created_at timestamptz not null default now()
);

create table if not exists public.admins (
  email text primary key,
  user_id uuid references auth.users (id) on delete set null unique,
  role text not null default 'editor',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  uid text not null default '',
  email text not null default '',
  action text not null,
  details jsonb not null default '{}',
  timestamp timestamptz not null default now()
);

create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  discount numeric not null,
  description text,
  max_uses int,
  used_count int not null default 0,
  expires_at timestamptz,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  id text primary key default 'site',
  announcement_messages text[] not null default '{}',
  collections jsonb,
  storefront jsonb,
  simple_pages jsonb,
  updated_at timestamptz not null default now()
);

-- ─── Coupon increment (checkout; avoids broad UPDATE on coupons) ───────────
create or replace function public.increment_coupon_use(p_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.coupons
  set used_count = coalesce(used_count, 0) + 1
  where id = p_id;
end;
$$;

grant execute on function public.increment_coupon_use(uuid) to anon, authenticated;

-- Newsletter: insert + duplicate handling without exposing SELECT to anon
create or replace function public.subscribe_newsletter(p_email text, p_source text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_id uuid;
begin
  insert into public.newsletter_subscribers (email, source, status)
  values (lower(trim(p_email)), p_source, 'active')
  returning id into new_id;
  return new_id;
exception
  when unique_violation then
    return null;
end;
$$;

grant execute on function public.subscribe_newsletter(text, text) to anon, authenticated;

-- ─── Row Level Security ─────────────────────────────────────────────────────
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.custom_orders enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.contact_messages enable row level security;
alter table public.wholesale_leads enable row level security;
alter table public.admins enable row level security;
alter table public.audit_logs enable row level security;
alter table public.coupons enable row level security;
alter table public.site_settings enable row level security;

-- products
create policy "products_select_all" on public.products for select using (true);
create policy "products_insert_admin" on public.products for insert with check (public.is_admin());
create policy "products_update_admin" on public.products for update using (public.is_admin());
create policy "products_delete_admin" on public.products for delete using (public.is_admin());

-- orders
create policy "orders_insert_any" on public.orders for insert with check (true);
create policy "orders_select_admin" on public.orders for select using (public.is_admin());
create policy "orders_update_admin" on public.orders for update using (public.is_admin());

-- custom_orders
create policy "custom_orders_insert_any" on public.custom_orders for insert with check (true);
create policy "custom_orders_select_admin" on public.custom_orders for select using (public.is_admin());
create policy "custom_orders_update_admin" on public.custom_orders for update using (public.is_admin());

-- newsletter
create policy "newsletter_insert_any" on public.newsletter_subscribers for insert with check (true);
create policy "newsletter_select_admin" on public.newsletter_subscribers for select using (public.is_admin());
create policy "newsletter_update_admin" on public.newsletter_subscribers for update using (public.is_admin());

-- contact
create policy "contact_insert_any" on public.contact_messages for insert with check (true);
create policy "contact_select_admin" on public.contact_messages for select using (public.is_admin());
create policy "contact_update_admin" on public.contact_messages for update using (public.is_admin());

-- wholesale
create policy "wholesale_insert_any" on public.wholesale_leads for insert with check (true);
create policy "wholesale_select_admin" on public.wholesale_leads for select using (public.is_admin());
create policy "wholesale_update_admin" on public.wholesale_leads for update using (public.is_admin());

-- admins
create policy "admins_select_admin" on public.admins for select using (public.is_admin());
create policy "admins_insert_admin" on public.admins for insert with check (public.is_admin());
create policy "admins_update_admin" on public.admins for update using (public.is_admin());
create policy "admins_delete_admin" on public.admins for delete using (public.is_admin());

-- audit
create policy "audit_insert_admin" on public.audit_logs for insert with check (public.is_admin());
create policy "audit_select_admin" on public.audit_logs for select using (public.is_admin());

-- coupons
create policy "coupons_select" on public.coupons for select using (active = true or public.is_admin());
create policy "coupons_insert_admin" on public.coupons for insert with check (public.is_admin());
create policy "coupons_update_admin" on public.coupons for update using (public.is_admin());
create policy "coupons_delete_admin" on public.coupons for delete using (public.is_admin());

-- site settings
create policy "site_select" on public.site_settings for select using (true);
create policy "site_insert_admin" on public.site_settings for insert with check (public.is_admin());
create policy "site_update_admin" on public.site_settings for update using (public.is_admin());

-- ─── Storage bucket (create in Dashboard if this insert is restricted) ───────
insert into storage.buckets (id, name, public)
values ('uploads', 'uploads', true)
on conflict (id) do nothing;

-- Storage policies reference public.is_admin()
create policy "uploads_public_read"
  on storage.objects for select
  using (bucket_id = 'uploads');

create policy "uploads_insert_admin"
  on storage.objects for insert
  with check (bucket_id = 'uploads' and public.is_admin());

create policy "uploads_update_admin"
  on storage.objects for update
  using (bucket_id = 'uploads' and public.is_admin());

create policy "uploads_delete_admin"
  on storage.objects for delete
  using (bucket_id = 'uploads' and public.is_admin());
