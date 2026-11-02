-- Product images were renamed (assets/image_folder/image_xxxx.png -> assets/products/<name>.png).
-- Run this once in the Supabase SQL editor so existing rows point at the new files.
-- Safe to run more than once.

update products set image = '/assets/products/shano-gen4-poster.png'
  where image = '/assets/image_folder/image_b32343d3.png';
update products set image = '/assets/products/steel-cradle-offer.png'
  where image = '/assets/image_folder/image_171a78dd.png';
update products set image = '/assets/products/safety-swing-placeholder.png'
  where image = '/assets/image_folder/image_6d16add2.png';

-- hero slides live in a jsonb column on site_config, so rewrite them as text
update site_config
set hero_slides = replace(replace(replace(hero_slides::text,
    '/assets/image_folder/image_b32343d3.png', '/assets/products/shano-gen4-poster.png'),
    '/assets/image_folder/image_171a78dd.png', '/assets/products/steel-cradle-offer.png'),
    '/assets/image_folder/image_6d16add2.png', '/assets/products/safety-swing-placeholder.png')::jsonb
where hero_slides::text like '%image_folder%';
