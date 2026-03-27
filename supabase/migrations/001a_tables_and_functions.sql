-- ============================================================
--  PART 1: Tables, RLS Policies, RPC Functions, Admin Seed
--  Paste and run this first in the Supabase SQL Editor
-- ============================================================

create extension if not exists "pgcrypto";

-- ─── ADMINS (first — policies on other tables reference admins) ─
create table if not exists admins (
  email      text primary key,
  role       text not null default 'editor',
  is_active  boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table admins enable row level security;
drop policy if exists "admins_admin_read" on admins;
drop policy if exists "admins_admin_write" on admins;
drop policy if exists "admins_admin_update" on admins;
drop policy if exists "admins_admin_delete" on admins;
create policy "admins_admin_read" on admins for select using (
  exists (select 1 from admins a where a.email = (select email from auth.users where id = auth.uid()) and a.is_active = true)
);
create policy "admins_admin_write" on admins for insert with check (
  exists (select 1 from admins a where a.email = (select email from auth.users where id = auth.uid()) and a.is_active = true and a.role = 'owner')
);
create policy "admins_admin_update" on admins for update using (
  exists (select 1 from admins a where a.email = (select email from auth.users where id = auth.uid()) and a.is_active = true and a.role = 'owner')
);
create policy "admins_admin_delete" on admins for delete using (
  exists (select 1 from admins a where a.email = (select email from auth.users where id = auth.uid()) and a.is_active = true and a.role = 'owner')
);

-- ─── PRODUCTS ────────────────────────────────────────────────
create table if not exists products (
  slug          text primary key,
  name          text not null,
  category      text not null default '',
  price         numeric(12,2) not null default 0,
  sale_price    numeric(12,2),
  description   text not null default '',
  sizes         text[] not null default '{}',
  details       text[] not null default '{}',
  images        text[] not null default '{}',
  badge         text,
  badge_color   text,
  in_stock      boolean not null default true,
  featured      boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
alter table products enable row level security;
drop policy if exists "products_public_read" on products;
drop policy if exists "products_admin_insert" on products;
drop policy if exists "products_admin_update" on products;
drop policy if exists "products_admin_delete" on products;
create policy "products_public_read" on products for select using (true);
create policy "products_admin_insert" on products for insert with check (
  exists (select 1 from admins where email = (select email from auth.users where id = auth.uid()) and is_active = true)
);
create policy "products_admin_update" on products for update using (
  exists (select 1 from admins where email = (select email from auth.users where id = auth.uid()) and is_active = true)
);
create policy "products_admin_delete" on products for delete using (
  exists (select 1 from admins where email = (select email from auth.users where id = auth.uid()) and is_active = true)
);

-- ─── ORDERS ──────────────────────────────────────────────────
create table if not exists orders (
  id              uuid primary key default gen_random_uuid(),
  ref             text not null,
  customer        jsonb not null default '{}',
  items           jsonb not null default '[]',
  subtotal        numeric(12,2) not null default 0,
  discount_amount numeric(12,2) not null default 0,
  coupon_code     text,
  total           numeric(12,2) not null default 0,
  status          text not null default 'received',
  payment_status  text not null default 'pending',
  paystack_ref    text not null default '',
  notes           text,
  tracking_code   text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
alter table orders enable row level security;
drop policy if exists "orders_public_insert" on orders;
drop policy if exists "orders_admin_read" on orders;
drop policy if exists "orders_admin_update" on orders;
create policy "orders_public_insert" on orders for insert with check (true);
create policy "orders_admin_read" on orders for select using (
  exists (select 1 from admins where email = (select email from auth.users where id = auth.uid()) and is_active = true)
);
create policy "orders_admin_update" on orders for update using (
  exists (select 1 from admins where email = (select email from auth.users where id = auth.uid()) and is_active = true)
);

-- ─── CUSTOM ORDERS ───────────────────────────────────────────
create table if not exists custom_orders (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  email        text not null,
  phone        text not null default '',
  occasion     text not null default '',
  garment      text not null default '',
  budget       text not null default '',
  event_date   text not null default '',
  measurements jsonb not null default '{}',
  inspiration  text not null default '',
  notes        text not null default '',
  status       text not null default 'new',
  admin_notes  text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
alter table custom_orders enable row level security;
drop policy if exists "custom_orders_public_insert" on custom_orders;
drop policy if exists "custom_orders_admin_read" on custom_orders;
drop policy if exists "custom_orders_admin_update" on custom_orders;
create policy "custom_orders_public_insert" on custom_orders for insert with check (true);
create policy "custom_orders_admin_read" on custom_orders for select using (
  exists (select 1 from admins where email = (select email from auth.users where id = auth.uid()) and is_active = true)
);
create policy "custom_orders_admin_update" on custom_orders for update using (
  exists (select 1 from admins where email = (select email from auth.users where id = auth.uid()) and is_active = true)
);

-- ─── NEWSLETTER SUBSCRIBERS ──────────────────────────────────
create table if not exists newsletter_subscribers (
  id            uuid primary key default gen_random_uuid(),
  email         text not null unique,
  source        text not null default 'footer',
  status        text not null default 'active',
  subscribed_at timestamptz not null default now()
);
alter table newsletter_subscribers enable row level security;
drop policy if exists "newsletter_admin_read" on newsletter_subscribers;
drop policy if exists "newsletter_admin_update" on newsletter_subscribers;
create policy "newsletter_admin_read" on newsletter_subscribers for select using (
  exists (select 1 from admins where email = (select email from auth.users where id = auth.uid()) and is_active = true)
);
create policy "newsletter_admin_update" on newsletter_subscribers for update using (
  exists (select 1 from admins where email = (select email from auth.users where id = auth.uid()) and is_active = true)
);

-- ─── CONTACT MESSAGES ────────────────────────────────────────
create table if not exists contact_messages (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  subject    text not null default '',
  message    text not null,
  status     text not null default 'unread',
  created_at timestamptz not null default now()
);
alter table contact_messages enable row level security;
drop policy if exists "contact_public_insert" on contact_messages;
drop policy if exists "contact_admin_read" on contact_messages;
drop policy if exists "contact_admin_update" on contact_messages;
create policy "contact_public_insert" on contact_messages for insert with check (true);
create policy "contact_admin_read" on contact_messages for select using (
  exists (select 1 from admins where email = (select email from auth.users where id = auth.uid()) and is_active = true)
);
create policy "contact_admin_update" on contact_messages for update using (
  exists (select 1 from admins where email = (select email from auth.users where id = auth.uid()) and is_active = true)
);

-- ─── WHOLESALE LEADS ─────────────────────────────────────────
create table if not exists wholesale_leads (
  id         uuid primary key default gen_random_uuid(),
  business   text not null,
  name       text not null,
  email      text not null,
  phone      text not null default '',
  categories text not null default '',
  quantity   text not null default '',
  message    text not null default '',
  status     text not null default 'new',
  created_at timestamptz not null default now()
);
alter table wholesale_leads enable row level security;
drop policy if exists "wholesale_public_insert" on wholesale_leads;
drop policy if exists "wholesale_admin_read" on wholesale_leads;
drop policy if exists "wholesale_admin_update" on wholesale_leads;
create policy "wholesale_public_insert" on wholesale_leads for insert with check (true);
create policy "wholesale_admin_read" on wholesale_leads for select using (
  exists (select 1 from admins where email = (select email from auth.users where id = auth.uid()) and is_active = true)
);
create policy "wholesale_admin_update" on wholesale_leads for update using (
  exists (select 1 from admins where email = (select email from auth.users where id = auth.uid()) and is_active = true)
);

-- ─── COUPONS ─────────────────────────────────────────────────
create table if not exists coupons (
  id          uuid primary key default gen_random_uuid(),
  code        text not null unique,
  discount    numeric(5,2) not null default 0,
  description text,
  max_uses    integer,
  used_count  integer not null default 0,
  expires_at  timestamptz,
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);
alter table coupons enable row level security;
drop policy if exists "coupons_public_read" on coupons;
drop policy if exists "coupons_admin_all" on coupons;
create policy "coupons_public_read" on coupons for select using (active = true);
create policy "coupons_admin_all" on coupons for all using (
  exists (select 1 from admins where email = (select email from auth.users where id = auth.uid()) and is_active = true)
);

-- ─── SITE SETTINGS ───────────────────────────────────────────
create table if not exists site_settings (
  id                    text primary key default 'site',
  announcement_messages text[] not null default '{}',
  collections           jsonb not null default '[]',
  storefront            jsonb not null default '{}',
  simple_pages          jsonb not null default '{}',
  updated_at            timestamptz not null default now()
);
alter table site_settings enable row level security;
drop policy if exists "site_settings_public_read" on site_settings;
drop policy if exists "site_settings_admin_write" on site_settings;
create policy "site_settings_public_read" on site_settings for select using (true);
create policy "site_settings_admin_write" on site_settings for all using (
  exists (select 1 from admins where email = (select email from auth.users where id = auth.uid()) and is_active = true)
);

-- ─── AUDIT LOGS ──────────────────────────────────────────────
create table if not exists audit_logs (
  id        uuid primary key default gen_random_uuid(),
  uid       text not null,
  email     text not null,
  action    text not null,
  details   jsonb not null default '{}',
  timestamp timestamptz not null default now()
);
alter table audit_logs enable row level security;
drop policy if exists "audit_admin_insert" on audit_logs;
drop policy if exists "audit_admin_read" on audit_logs;
create policy "audit_admin_insert" on audit_logs for insert with check (
  exists (select 1 from admins where email = (select email from auth.users where id = auth.uid()) and is_active = true)
);
create policy "audit_admin_read" on audit_logs for select using (
  exists (select 1 from admins where email = (select email from auth.users where id = auth.uid()) and is_active = true)
);

-- ============================================================
--  RPC FUNCTIONS
-- ============================================================

create or replace function is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from admins
    where email = (select email from auth.users where id = auth.uid())
    and is_active = true
  );
$$;

create or replace function subscribe_newsletter(p_email text, p_source text)
returns uuid
language plpgsql
security definer
as $$
declare
  v_id uuid;
begin
  insert into newsletter_subscribers (email, source, status, subscribed_at)
  values (lower(trim(p_email)), p_source, 'active', now())
  on conflict (email) do update
    set status = 'active',
        source = excluded.source
  returning id into v_id;
  return v_id;
end;
$$;

create or replace function increment_coupon_use(p_id uuid)
returns void
language sql
security definer
as $$
  update coupons set used_count = used_count + 1 where id = p_id;
$$;

-- ============================================================
--  SEED: Your first admin
-- ============================================================
insert into public.admins (email, role, is_active)
values ('bolawearables@gmail.com', 'owner', true)
on conflict (email) do nothing;
