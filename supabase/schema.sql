-- ====================================================================
-- SHAHANA BABY SHOP (শাহানা বেবি শপ) - SUPABASE DATABASE SCHEMA & SEED
-- Run this complete script in your Supabase Dashboard:
-- 1. Open your Supabase Dashboard (https://supabase.com/dashboard)
-- 2. Click "SQL Editor" on the left navigation bar
-- 3. Click "New query", paste this entire script, and click "Run"
-- ====================================================================

-- 1. CREATE TABLES
-- Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    model_no TEXT NOT NULL,
    title_en TEXT NOT NULL,
    title_bn TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    original_price NUMERIC(10, 2) NOT NULL,
    category TEXT NOT NULL DEFAULT 'dolna',
    image TEXT NOT NULL,
    description_en TEXT,
    description_bn TEXT,
    features_en JSONB DEFAULT '[]'::jsonb,
    features_bn JSONB DEFAULT '[]'::jsonb,
    in_stock BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    material TEXT,
    warranty TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_address TEXT NOT NULL,
    customer_city_district TEXT NOT NULL,
    delivery_area TEXT NOT NULL DEFAULT 'dhaka_inside',
    payment_method TEXT NOT NULL DEFAULT 'cod',
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0,
    delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 0,
    total NUMERIC(10, 2) NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending',
    notes TEXT,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Site Configuration Table
CREATE TABLE IF NOT EXISTS public.site_config (
    id INT PRIMARY KEY DEFAULT 1,
    announcement_en TEXT,
    announcement_bn TEXT,
    phone1 TEXT,
    phone2 TEXT,
    whatsapp_number TEXT,
    whatsapp_prefill_text TEXT,
    store_address_en TEXT,
    store_address_bn TEXT,
    facebook_url TEXT,
    review_group_url TEXT,
    hero_slides JSONB DEFAULT '[]'::jsonb,
    is_delivery_free_nationwide BOOLEAN DEFAULT false,
    delivery_fee_inside_dhaka NUMERIC(10, 2) DEFAULT 60,
    delivery_fee_outside_dhaka NUMERIC(10, 2) DEFAULT 120,
    free_delivery_min_order NUMERIC(10, 2) DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Customer Reviews Table
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id TEXT REFERENCES public.products(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL,
    author_location TEXT,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    verified BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 1b. ADD NEW COLUMNS (safe to re-run; also upgrades databases that already exist)
-- Add multiple images support to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;

-- Add featured categories photo customizer support to site_config table
ALTER TABLE public.site_config 
ADD COLUMN IF NOT EXISTS featured_categories JSONB DEFAULT '[]'::jsonb;

-- Add status history to orders table (powers the customer Order Tracking timeline)
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS status_history JSONB DEFAULT '[]'::jsonb;

-- 2. CREATE AUTO-UPDATE TIMESTAMP FUNCTION & TRIGGERS
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS tr_products_updated_at ON public.products;
CREATE TRIGGER tr_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_orders_updated_at ON public.orders;
CREATE TRIGGER tr_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_site_config_updated_at ON public.site_config;
CREATE TRIGGER tr_site_config_updated_at
    BEFORE UPDATE ON public.site_config
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Records WHEN each order status was reached (pending -> confirmed -> shipped -> delivered)
CREATE OR REPLACE FUNCTION public.handle_order_status_history()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        NEW.status_history = jsonb_build_array(
            jsonb_build_object('status', NEW.status, 'at', NEW.created_at)
        );
    ELSIF NEW.status IS DISTINCT FROM OLD.status THEN
        NEW.status_history = COALESCE(OLD.status_history, '[]'::jsonb) || jsonb_build_array(
            jsonb_build_object('status', NEW.status, 'at', now())
        );
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS tr_orders_status_history ON public.orders;
CREATE TRIGGER tr_orders_status_history
    BEFORE INSERT OR UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_order_status_history();

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

-- 4b. CUSTOMER ORDER TRACKING FUNCTION
-- Lets a customer look up ONE order by Order ID + the phone number used to place it.
-- The website calls this instead of downloading the whole orders table.
CREATE OR REPLACE FUNCTION public.track_order(p_order_id TEXT, p_phone TEXT)
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT to_jsonb(o)
    FROM public.orders o
    WHERE upper(o.id) = upper(btrim(p_order_id))
      AND length(regexp_replace(p_phone, '[^0-9]', '', 'g')) >= 10
      AND right(regexp_replace(o.customer_phone, '[^0-9]', '', 'g'), 10)
        = right(regexp_replace(p_phone, '[^0-9]', '', 'g'), 10)
    LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.track_order(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.track_order(TEXT, TEXT) TO anon, authenticated;

-- Make the new function visible to the API immediately
NOTIFY pgrst, 'reload schema';

-- 4c. YOUR ADMIN EMAIL
-- Create the admin user in Supabase (Authentication -> Users -> Add user), then add the same
-- email here by replacing the example below and removing the two dashes at the start.
-- INSERT INTO public.admin_emails (email) VALUES ('you@example.com') ON CONFLICT DO NOTHING;

-- 5. SEED INITIAL DATA
-- Initial Products
INSERT INTO public.products (
    id, model_no, title_en, title_bn, price, original_price, category, image,
    description_en, description_bn, features_en, features_bn, in_stock, is_featured, material, warranty
) VALUES
(
    'prod-gen-4',
    'Shano Gen 4',
    'Shano Gen 4 Premium Baby Dolna with Bedding Set',
    'শ্যানো জেন ৪ প্রিমিয়াম বেবি দোলনা (ফ্রি বেড সেট ও মশারি সহ)',
    2190.00,
    2690.00,
    'dolna',
    '/assets/products/shano-gen4-poster.png',
    'Reliable quality, maximum comfort, and an affordable price. The perfect cozy cradle for your baby''s sweet dreams. Includes free bed set, mosquito net, and lockable wheels.',
    'আপনার সোনামণির জন্য সর্বোচ্চ আরামদায়ক ও মজবুত খাঁটি এমএস স্টিল ফ্রেমের বেবি দোলনা। সাথে পাচ্ছেন আকর্ষণীয় বেড সেট ও সুরক্ষাকারী মশারি সম্পূর্ণ বিনামূল্যে।',
    '["100% MS Heavy Duty Steel Frame", "Free Soft Cotton Bed Set Included", "Anti-Mosquito Net Canopy", "Smooth Silent Rocking Mechanism", "Caster Wheels with Quick Brakes", "Cash on Delivery with Free Home Delivery"]'::jsonb,
    '["১০০% হেভি ডিউটি এমএস স্টিল ফ্রেম", "ফ্রি সফট কটন বেড সেট ও বালিশ", "উচ্চ ঘনত্বের সুরক্ষাকারী মশারি", "মসৃণ ও সম্পূর্ণ শব্দহীন দোলনা সিস্টেম", "লক সুবিধাসহ মজবুত চাকা", "সারা বাংলাদেশে ফ্রি হোম ডেলিভারি ও ক্যাশ অন ডেলিভারি"]'::jsonb,
    true,
    true,
    'Heavy Duty MS Steel Pipe & Soft Cotton',
    '1 Year Warranty'
),
(
    'prod-gen-6',
    'Shano Gen 6',
    'Shano Gen 6 Luxury Auto-Balance Baby Cradle',
    'শ্যানো জেন ৬ লাক্সারি অটো-ব্যালেন্স বেবি দোলনা',
    2750.00,
    3100.00,
    'dolna',
    '/assets/products/steel-cradle-offer.png',
    'Our flagship cradle designed with ultra-reinforced arch frame, double-layer safety netting, and silent gliding bearings. Offers supreme comfort for newborns up to 3 years.',
    'সোনামণির আরামদায়ক ঘুমের জন্য আমাদের সবচেয়ে জনপ্রিয় ফ্ল্যাগশিপ মডেল। মজবুত ফিনিশ ও ডাবল লেয়ার সেফটি মেটিং।',
    '["Reinforced Dual Arch MS Frame", "Patented Easy Balance Swing", "Dual Layer Breathable Mosquito Canopy", "Extra Deep Anti-Roll Bassinet", "Lockable 360 Degree Swivel Wheels"]'::jsonb,
    '["দ্বিগুণ মজবুত ডুয়াল আর্চ স্টিল ফ্রেম", "সহজ ব্যালেন্স সুইং প্রযুক্তি", "দ্বিস্তর বিশিষ্ট বাতাস চলাচলকারী মশারি", "অতিরিক্ত গভীর বেসিনেট যা বাচ্চার পড়ে যাওয়া রোধ করে", "৩৬০ ডিগ্রি লক করা চাকা"]'::jsonb,
    true,
    true,
    'MS Electroplated Steel Frame',
    '2 Years Free Service'
),
(
    'prod-501',
    'Model 501',
    'Model 501 Baby Swing with Safety Lock',
    '৫০১ মডেল প্রিমিয়াম সেফটি লক বেবি দোলনা',
    2450.00,
    2850.00,
    'safety',
    '/assets/products/steel-cradle-offer.png',
    'Equipped with a premium safety lock to keep your baby 100% safe and secure. The swing locks into a stationary crib whenever needed.',
    'আমাদের ৫০১ মডেলের সাথে পাচ্ছেন প্রিমিয়াম কোয়ালিটির সেফটি লক (Safety Lock), যা আপনার সোনামণিকে রাখবে একদম নিরাপদ ও সুরক্ষিত।',
    '["One-Touch Fixed Position Safety Lock", "Foldable Compact Design", "Ultra Soft Washable Bedding", "Reinforced Side Railings", "Nationwide Free Delivery"]'::jsonb,
    '["ওয়ান-টাচ ফিক্সড পজিশন সেফটি লক", "সহজে ভাঁজযোগ্য কম্প্যাক্ট ডিজাইন", "ওয়াশেবল নরম বেডিং ও প্যাডিং", "মজবুত চারপাশের সেফটি রেলিং", "সারা বাংলাদেশে ফ্রি ডেলিভারি"]'::jsonb,
    true,
    true,
    'MS Pipe Structure',
    '1 Year Warranty'
),
(
    'prod-733',
    'Model 733',
    'Model 733 Best Seller Baby Dolna',
    '৭৩৩ মডেল বেস্ট সেলার বেবি দোলনা',
    2290.00,
    2700.00,
    'dolna',
    '/assets/products/shano-gen4-poster.png',
    'One of our most popular and highest reviewed models across Bangladesh. Unrivaled stability and supreme softness for your little angel.',
    'আমাদের অন্যতম সেরা সেল হওয়া ৭৩৩ মডেলের দোলনাটি। দীর্ঘস্থায়ী স্থায়িত্ব এবং সর্বোচ্চ কোমলতা।',
    '["Most Loved Model with 500+ Reviews", "Heavy Load Capacity (Up to 25kg)", "Integrated Bedding + Netting Included", "Free Delivery & Pay on Delivery"]'::jsonb,
    '["৫০০+ পজিটিভ রিভিউ পাওয়া সেরা মডেল", "২৫ কেজি পর্যন্ত ওজন বহন ক্ষমতা", "বেড সেট ও মশারি একসাথে অন্তর্ভুক্ত", "হাতে পেয়ে টাকা পরিশোধের সুবিধা"]'::jsonb,
    true,
    true,
    'Solid MS Steel Structure',
    '1 Year Warranty'
),
(
    'prod-bedding-set',
    'Deluxe Bed Set',
    'Deluxe Baby Cradle Bedding & Mosquito Net Set',
    'ডিলাক্স বেবি দোলনা বেড সেট ও স্পেশাল মশারি',
    790.00,
    990.00,
    'bedding',
    '/assets/products/shano-gen4-poster.png',
    'Soft hypoallergenic cotton mattress, matching bolster pillows, and universal fine mesh mosquito canopy suitable for all standard cradles.',
    'শিশুর কোমল ত্বকের জন্য সম্পূর্ণ আরামদায়ক নরম সুতি কাপড়ের গদি ও ফাইন মেশের মশারি।',
    '["100% Breathable Organic Cotton", "Hypoallergenic Pillow Included", "Zipper Net for Easy Access"]'::jsonb,
    '["১০০% নরম সুতি কাপড়", "অ্যালার্জি মুক্ত তুলতুলে বালিশ", "সহজে খোলা ও লাগানোর জিপার মশারি"]'::jsonb,
    true,
    false,
    'Export Quality Cotton',
    'Quality Guarantee'
)
ON CONFLICT (id) DO UPDATE SET
    price = EXCLUDED.price,
    original_price = EXCLUDED.original_price,
    title_bn = EXCLUDED.title_bn,
    title_en = EXCLUDED.title_en;

-- Initial Site Configuration
INSERT INTO public.site_config (
    id,
    announcement_en,
    announcement_bn,
    phone1,
    phone2,
    whatsapp_number,
    whatsapp_prefill_text,
    store_address_en,
    store_address_bn,
    facebook_url,
    review_group_url,
    hero_slides,
    is_delivery_free_nationwide,
    delivery_fee_inside_dhaka,
    delivery_fee_outside_dhaka,
    free_delivery_min_order
) VALUES (
    1,
    'Free Home Delivery across Bangladesh & Cash on Delivery Available | Hotline: 01354-245072 / 01518986640',
    'সারা বাংলাদেশে ফ্রি হোম ডেলিভারি এবং পণ্য হাতে পেয়ে মূল্য পরিশোধ (ক্যাশ অন ডেলিভারি) | হেল্পলাইন: 01354-245072 / 01518986640',
    '01354-245072',
    '01518986640',
    '8801354245072',
    'Hello Shahana Baby Shop, I want to order a baby dolna.',
    'Dhaka, Bangladesh (Nationwide Delivery)',
    'ঢাকা, বাংলাদেশ (সারা দেশে ফ্রী হোম ডেলিভারি)',
    'https://www.facebook.com/share/g/19LvWhBNgn/',
    'https://www.facebook.com/share/g/19LvWhBNgn/',
    '[
        {
            "id": "slide-1",
            "badgeEn": "Special Offer: Free Home Delivery",
            "badgeBn": "বিশেষ অফার: সারা দেশে ফ্রি হোম ডেলিভারি",
            "titleEn": "Shano Gen 6 Luxury Baby Cradle",
            "titleBn": "আপনার সোনামণির ঘুমের রাজত্বকে আরামদায়ক করুন",
            "subtitleEn": "Original MS Heavy Steel Frame, Safety Lock & Breathable Mosquito Canopy. Pay after receiving parcel.",
            "subtitleBn": "১০০% হেভি ডিউটি এমএস স্টিল, সেফটি লক ও ফ্রি বেড সেট। পণ্য হাতে পেয়ে টাকা দিন।",
            "priceTagEn": "Only ৳2,750 (Regular ৳3,100)",
            "priceTagBn": "মাত্র ৳২,৭৫০ (রেগুলার ৳৩,১০০)",
            "image": "/assets/products/steel-cradle-offer.png",
            "buttonTextEn": "Order Now (Cash on Delivery)",
            "buttonTextBn": "সরাসরি অর্ডার করুন (ক্যাশ অন ডেলিভারি)",
            "productId": "prod-gen-6"
        },
        {
            "id": "slide-2",
            "badgeEn": "Best Seller 2026",
            "badgeBn": "বেস্ট সেলার ২০২৬",
            "titleEn": "Shano Gen 4 Premium Baby Dolna",
            "titleBn": "শ্যানো জেন ৪ বেবি দোলনা - সাথে ফ্রি বেড সেট",
            "subtitleEn": "Reliable quality, maximum comfort, and an affordable price. Loved by 4,800+ mothers in Bangladesh.",
            "subtitleBn": "সোনামণির সুরক্ষায় ১০০% নিরাপদ খাঁটি এমএস স্টিল ফ্রেম। আকর্ষণীয় বেড সেট সম্পূর্ণ ফ্রি!",
            "priceTagEn": "Special ৳2,190 (Regular ৳2,690)",
            "priceTagBn": "স্পেশাল ৳২,১৯০ (রেগুলার ৳২,৬৯০)",
            "image": "/assets/products/shano-gen4-poster.png",
            "buttonTextEn": "Order Shano Gen 4",
            "buttonTextBn": "শ্যানো জেন ৪ অর্ডার করুন",
            "productId": "prod-gen-4"
        }
    ]'::jsonb,
    false,
    60,
    120,
    0
)
ON CONFLICT (id) DO UPDATE SET
    delivery_fee_inside_dhaka = EXCLUDED.delivery_fee_inside_dhaka,
    delivery_fee_outside_dhaka = EXCLUDED.delivery_fee_outside_dhaka,
    is_delivery_free_nationwide = EXCLUDED.is_delivery_free_nationwide;

-- Helpful comment:
COMMENT ON TABLE public.products IS 'Shahana Baby Shop product inventory and specifications';
COMMENT ON TABLE public.orders IS 'Shahana Baby Shop customer orders placed online';
COMMENT ON TABLE public.site_config IS 'Shahana Baby Shop global settings, hero slides, and delivery pricing';
