-- ============================================================
--  Fix infinite recursion (42P17) in RLS policies
--  All policies now use security-definer functions (is_admin /
--  is_owner) which bypass RLS when querying the admins table.
-- ============================================================

-- ─── Helper: is_owner() ──────────────────────────────────────
-- Returns true if the current user is an active owner-level admin
create or replace function is_owner()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from admins
    where email = (select email from auth.users where id = auth.uid())
    and is_active = true
    and role = 'owner'
  );
$$;

-- ─── ADMINS table — fix recursive policies ───────────────────
drop policy if exists "admins_admin_read"   on admins;
drop policy if exists "admins_admin_write"  on admins;
drop policy if exists "admins_admin_update" on admins;
drop policy if exists "admins_admin_delete" on admins;

create policy "admins_admin_read"   on admins for select using (is_admin());
create policy "admins_admin_write"  on admins for insert with check (is_owner());
create policy "admins_admin_update" on admins for update using (is_owner());
create policy "admins_admin_delete" on admins for delete using (is_owner());

-- ─── PRODUCTS ────────────────────────────────────────────────
drop policy if exists "products_admin_insert" on products;
drop policy if exists "products_admin_update" on products;
drop policy if exists "products_admin_delete" on products;

create policy "products_admin_insert" on products for insert with check (is_admin());
create policy "products_admin_update" on products for update using (is_admin());
create policy "products_admin_delete" on products for delete using (is_admin());

-- ─── ORDERS ──────────────────────────────────────────────────
drop policy if exists "orders_admin_read"   on orders;
drop policy if exists "orders_admin_update" on orders;

create policy "orders_admin_read"   on orders for select using (is_admin());
create policy "orders_admin_update" on orders for update using (is_admin());

-- ─── CUSTOM ORDERS ───────────────────────────────────────────
drop policy if exists "custom_orders_admin_read"   on custom_orders;
drop policy if exists "custom_orders_admin_update" on custom_orders;

create policy "custom_orders_admin_read"   on custom_orders for select using (is_admin());
create policy "custom_orders_admin_update" on custom_orders for update using (is_admin());

-- ─── NEWSLETTER SUBSCRIBERS ──────────────────────────────────
drop policy if exists "newsletter_admin_read"   on newsletter_subscribers;
drop policy if exists "newsletter_admin_update" on newsletter_subscribers;

create policy "newsletter_admin_read"   on newsletter_subscribers for select using (is_admin());
create policy "newsletter_admin_update" on newsletter_subscribers for update using (is_admin());

-- ─── CONTACT MESSAGES ────────────────────────────────────────
drop policy if exists "contact_admin_read"   on contact_messages;
drop policy if exists "contact_admin_update" on contact_messages;

create policy "contact_admin_read"   on contact_messages for select using (is_admin());
create policy "contact_admin_update" on contact_messages for update using (is_admin());

-- ─── WHOLESALE LEADS ─────────────────────────────────────────
drop policy if exists "wholesale_admin_read"   on wholesale_leads;
drop policy if exists "wholesale_admin_update" on wholesale_leads;

create policy "wholesale_admin_read"   on wholesale_leads for select using (is_admin());
create policy "wholesale_admin_update" on wholesale_leads for update using (is_admin());

-- ─── COUPONS ─────────────────────────────────────────────────
drop policy if exists "coupons_admin_all" on coupons;

create policy "coupons_admin_all" on coupons for all using (is_admin());

-- ─── SITE SETTINGS ───────────────────────────────────────────
drop policy if exists "site_settings_admin_write" on site_settings;

create policy "site_settings_admin_write" on site_settings for all using (is_admin());

-- ─── AUDIT LOGS ──────────────────────────────────────────────
drop policy if exists "audit_admin_insert" on audit_logs;
drop policy if exists "audit_admin_read"   on audit_logs;

create policy "audit_admin_insert" on audit_logs for insert with check (is_admin());
create policy "audit_admin_read"   on audit_logs for select using (is_admin());

-- ─── STORAGE ─────────────────────────────────────────────────
drop policy if exists "uploads_admin_insert" on storage.objects;
drop policy if exists "uploads_admin_delete" on storage.objects;

create policy "uploads_admin_insert" on storage.objects
  for insert with check (bucket_id = 'uploads' and is_admin());

create policy "uploads_admin_delete" on storage.objects
  for delete using (bucket_id = 'uploads' and is_admin());
