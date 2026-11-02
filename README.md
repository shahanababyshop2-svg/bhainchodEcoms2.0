# Shahana Baby Shop

Online shop for baby cradles (dolna), swings and bedding, mostly for customers in Bangladesh.
Bangla + English, cash on delivery only, with an admin panel for products, orders and site settings.

Built with React 19, TypeScript, Vite, Tailwind v4 and Supabase.

## Run it

```bash
npm install
cp .env.example .env.local   # then fill in your Supabase url + key
npm run dev                  # http://localhost:5173
```

If the env vars are missing it falls back to the project hardcoded in `src/lib/supabase.ts`.
Change that before pointing it at your own database, otherwise you're writing into the wrong project.

Products, orders, cart and config are also copied into localStorage, so the site still shows something
if Supabase is down.

## Database

Run `supabase/schema.sql` in the Supabase SQL editor (new database), then follow "Admin login and database security" below.
For a database that already exists, run only the migrations in `supabase/migrations/`.

If your database was created before the image folder rename (`assets/image_folder/*` -> `assets/products/*`),
run `supabase/migrations/001_rename_product_images.sql` once as well. Until then `src/utils/imagePaths.ts`
rewrites the old paths on load. Delete that file after the migration.

## Order tracking (customers)

Customers open **Track Order** (header, footer, mobile menu, or the button on the "order placed" popup),
enter their Order ID + the phone number they ordered with, and see a status timeline.

It needs the SQL in `supabase/schema.sql` (section 1b, the `tr_orders_status_history` trigger and the
`track_order` function in section 4b). Re-run the script once on your live database. It is safe to re-run.

- `orders.status_history` + the trigger store *when* each status was reached. The admin panel needs no
  change: switching an order's status there is what moves the timeline.
- `track_order(order_id, phone)` returns only the one matching order, so the site does not need to
  download every order to answer a customer.
- If the SQL has not been run yet, tracking still works (it falls back to a single-order lookup), but
  there are no per-step timestamps.
- Orders placed before the SQL was run show the current status without step times.

## Where things are

- `src/components/` storefront pieces; `admin/` has the panel (one file per tab); `AdminLoginPage.tsx` is the login at `/dihanadmin`
- `src/context/StoreContext.tsx` products, cart, orders, config and the Supabase sync (big, I know)
- `src/utils/` pricing, delivery fee, phone check
- `public/assets/products/` images
- `tests/` and `src/utils/*.test.ts` the tests (`npm test`, 30 right now)

`npm run lint` is only a type-check.

## Customer data (admin)

In **Admin -> Orders**, the **Customer data** button next to a customer's name (and "All customer data" in the order
details popup) opens that customer's full profile: totals (orders, delivered, cancelled, money spent), every name and
address used, the BD Courier delivery history, and all their orders. Orders are matched by phone number, so
`+8801712345678` and `01712345678` count as the same customer. The logic is in `src/utils/customerProfile.ts`.

## Delivery fee

Set in the admin panel. Default is 60 BDT inside Dhaka, 120 outside, plus a nationwide free-delivery
switch and an optional minimum order for free delivery.
The switch ships **off**, but the announcement banner says free delivery. One of them needs to change.

## Admin page

The admin panel is its own page at **`/dihanadmin`** (e.g. `https://yourshop.com/dihanadmin`).
The Admin button in the header and the footer link both go there, and you can also type the address directly.
If you are not logged in, that page shows the login form; after login it shows the dashboard.

- Rename the URL in one place: `ADMIN_PATH` in `src/utils/adminRoute.ts`, and the same path in `public/_redirects`.
- `public/_redirects` makes the host serve the app for `/dihanadmin` (needed for refresh / direct visits on
  Netlify or Cloudflare Pages). On other hosts add the equivalent rewrite to `index.html`
  (Vercel: `vercel.json` rewrites).
- The page is marked `noindex` so search engines skip it. The URL is not a secret, though: the real protection
  is the Supabase login below.

## Admin login and database security

The admin panel uses a real Supabase login (email + password). There is no passcode in the code any more.

One-time setup:
1. Supabase -> Authentication -> Users -> **Add user** (your admin email + a strong password).
2. Supabase -> Authentication -> Sign In / Providers -> turn **off** "Allow new users to sign up".
3. Deploy this version of the website.
4. Run `supabase/migrations/002_lock_down_with_admin_login.sql` once in the SQL Editor
   (edit the email on its last INSERT line if your admin email is different).

After that, with the public key visitors can only: read products / settings / reviews, place a new order,
and look up their own order with Order ID + phone. Everything else (reading orders, editing products,
settings, deleting) needs the admin login.

Do step 4 only after step 3, otherwise the old admin panel stops working.
To add another admin later: create the user in Authentication, then
`INSERT INTO public.admin_emails (email) VALUES ('new@example.com');`

## Fraud check (BD Courier)

In **Admin -> Orders**, every order has a **Fraud check** button under the phone number, and the order
details popup has a full report. It asks BD Courier (`https://api.bdcourier.com/courier-check`) how that
phone number has behaved with other couriers, and shows Safe / Be careful / High risk customer.

The BD Courier API key is a secret. It must **never** go into the React code or a `VITE_` variable, because
everything in the browser is public. It lives in a Supabase Edge Function instead
(`supabase/functions/fraud-check/index.ts`). The browser asks that function, the function adds the key.
The function only answers the logged-in shop admin (same `is_shop_admin()` check as the orders table), so
nobody else can spend your API credits.

One-time setup (needs the [Supabase CLI](https://supabase.com/docs/guides/cli), logged in and linked to your project):

```bash
supabase secrets set BDCOURIER_API_KEY=your_real_key_here
supabase functions deploy fraud-check
```

No CLI? In the Supabase dashboard: **Edge Functions -> Deploy a new function**, name it `fraud-check`, paste in
`supabase/functions/fraud-check/index.ts`; then **Edge Functions -> Secrets** and add `BDCOURIER_API_KEY`.

Notes:
- Results are remembered until the page is refreshed, so re-opening an order does not spend another credit.
  The small refresh icon (or "Check again") forces a new lookup.
- The badge comes from BD Courier's `risk_level` field. Per-courier numbers are shown when the response has
  them. Open "Raw response from BD Courier" in the order popup to see exactly what came back; if a field you
  want is not shown, `parseFraudResponse` in `src/utils/fraudCheck.ts` is the one place to adjust.
- If the button says the function is "not deployed yet", the deploy step above has not been done.
- Changing `supabase/functions/fraud-check/index.ts` here does nothing on its own: **re-deploy it** after every change
  (`supabase functions deploy fraud-check`, or paste the file into the dashboard again).
- If you are logged in to the admin panel but the check still says you are not the admin, the message now says why:
  - *"Logged in as X, but that email is not in the shop admin list"*: run the `INSERT INTO public.admin_emails ...` line it shows.
  - *"The database has no is_shop_admin() function yet"*: run `supabase/migrations/002_lock_down_with_admin_login.sql`.
  - *"Your admin login has expired"*: log out of the admin panel and log in again.

## Phone view (screens narrower than 768 px)

Phones get their own layout. It lives in `src/mobile/` and is switched on in `src/App.tsx`; the original layout is
untouched and is still what tablets and desktops see.

- Bigger text (body 16 px; product cards 15 px names and 18 px prices), two product cards per row (photo, name, price,
  Order Now; Add to Cart and WhatsApp are on the product page), 3-column category grid,
  orange bottom bar (Home / Menu / Cart / Track), cart as a bottom sheet, full-screen order form with a pinned
  Confirm button, and a product page with a pinned Call / WhatsApp / Order bar.
- **Classic view switch:** the new phone menu has a "Classic view" button (goes back to the old phone layout). The old
  menu has a "Switch to the new phone view" button. The choice is remembered in the browser (`sbs_ui_mode`).
- **Product page boxes and features:** Admin -> Products -> Edit has *Frame Material*, *Warranty & Service* (the two
  boxes under the Details tab) and a *Features list* (Bangla and English, one per line). Leave a box empty to hide it.
- **Phone banner pictures:** Admin -> UI customizer -> each slide has an optional *Phone banner image*. Use a wide
  picture, about **1200 x 500 px**. Uploads are shrunk to 1200 px wide automatically. A slide without one is shown
  as a compact card built from the poster picture, title and price.
- **Zoom:** pinch-zoom still works on page content, but the top bar, bottom bar, menu, cart, order screens and the banner ignore
  it so the page does not zoom by accident (`touch-action` rules in `src/index.css`, `minimum-scale=1` in `index.html`).
- Phone text sizes and spacing are plain Tailwind classes inside `src/mobile/*.tsx`; to change a size, edit the
  `text-[..px]` value in the file for that screen.
- `src/mobile/data.ts` keeps a copy of the review list from `CustomerReviews`; change both when you edit reviews.
- The Android back button leaves the site instead of closing the product page / cart (no browser-history hookup yet).

## Still broken / to do

- Anyone can still send fake orders (customers must be allowed to place orders). Consider a rate limit / captcha.
- `safety-swing-placeholder.png` is a cropped screenshot. Needs a real photo.
- Order ids are `SBS-` + 4 random digits, they will collide eventually.
- Prices and totals are computed in the browser and trusted as sent. No server-side check.
- `src/lib/supabaseSchemaCode.ts` is a second copy of the SQL and can drift from `supabase/schema.sql`.
"# bhainchodEcoms2.0" 
