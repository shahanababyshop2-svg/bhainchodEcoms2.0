-- ====================================================================
-- 002: lock the database (admin login + real security rules)
-- Run this ONCE in Supabase -> SQL Editor, AFTER the new website code is live.
-- It is safe to run again.
--
-- BEFORE you run it:
--   1. Supabase -> Authentication -> Users: your admin user must exist.
--   2. Supabase -> Authentication -> Sign In / Providers: turn OFF "Allow new users to sign up".
-- ====================================================================

-- 3. ADMIN LIST + ROW LEVEL SECURITY (RLS)
-- Who is the shop admin? Only people who log in with Supabase Auth AND whose email is in
-- this table. The table has no policies on purpose: nobody can read it through the public
-- API, only the is_shop_admin() function below can.
CREATE TABLE IF NOT EXISTS public.admin_emails (
    email TEXT PRIMARY KEY
);
ALTER TABLE public.admin_emails ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.admin_emails FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.is_shop_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.admin_emails a
        WHERE lower(a.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    );
$$;

REVOKE ALL ON FUNCTION public.is_shop_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_shop_admin() TO anon, authenticated;

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Remove every older policy first (including the old wide-open ones)
DROP POLICY IF EXISTS "Public can view products" ON public.products;
DROP POLICY IF EXISTS "Anyone can insert/update products" ON public.products;
DROP POLICY IF EXISTS "Customers can place orders" ON public.orders;
DROP POLICY IF EXISTS "Public can view orders" ON public.orders;
DROP POLICY IF EXISTS "Allow order status updates" ON public.orders;
DROP POLICY IF EXISTS "Allow order deletion" ON public.orders;
DROP POLICY IF EXISTS "Public can view site config" ON public.site_config;
DROP POLICY IF EXISTS "Allow site config management" ON public.site_config;
DROP POLICY IF EXISTS "Public can view reviews" ON public.reviews;
DROP POLICY IF EXISTS "Public can submit reviews" ON public.reviews;
DROP POLICY IF EXISTS "products_public_read" ON public.products;
DROP POLICY IF EXISTS "products_admin_write" ON public.products;
DROP POLICY IF EXISTS "orders_customer_insert" ON public.orders;
DROP POLICY IF EXISTS "orders_admin_all" ON public.orders;
DROP POLICY IF EXISTS "site_config_public_read" ON public.site_config;
DROP POLICY IF EXISTS "site_config_admin_write" ON public.site_config;
DROP POLICY IF EXISTS "reviews_public_read" ON public.reviews;
DROP POLICY IF EXISTS "reviews_admin_write" ON public.reviews;

-- 4. RLS POLICIES
-- Products: everyone can look, only the admin can add / edit / delete
CREATE POLICY "products_public_read"
    ON public.products FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "products_admin_write"
    ON public.products FOR ALL
    TO authenticated
    USING ((SELECT public.is_shop_admin()))
    WITH CHECK ((SELECT public.is_shop_admin()));

-- Orders: a visitor can ONLY place a new order (as "pending"). Reading, changing and deleting
-- orders is admin only. Customers look their own order up with track_order() below.
CREATE POLICY "orders_customer_insert"
    ON public.orders FOR INSERT
    TO anon, authenticated
    WITH CHECK (status = 'pending');

CREATE POLICY "orders_admin_all"
    ON public.orders FOR ALL
    TO authenticated
    USING ((SELECT public.is_shop_admin()))
    WITH CHECK ((SELECT public.is_shop_admin()));

-- Site settings: everyone can read, only the admin can change
CREATE POLICY "site_config_public_read"
    ON public.site_config FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "site_config_admin_write"
    ON public.site_config FOR ALL
    TO authenticated
    USING ((SELECT public.is_shop_admin()))
    WITH CHECK ((SELECT public.is_shop_admin()));

-- Reviews: everyone can read, only the admin can add or remove
-- (the website does not use this table yet, so nobody can fill your database with spam)
CREATE POLICY "reviews_public_read"
    ON public.reviews FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "reviews_admin_write"
    ON public.reviews FOR ALL
    TO authenticated
    USING ((SELECT public.is_shop_admin()))
    WITH CHECK ((SELECT public.is_shop_admin()));

-- Your admin email (must be the same email as the user in Authentication -> Users)
INSERT INTO public.admin_emails (email) VALUES ('shahanababyshop2@gmail.com')
ON CONFLICT DO NOTHING;

NOTIFY pgrst, 'reload schema';
