// Product images moved from /assets/image_folder/* to /assets/products/*.
// Anything saved before the move (Supabase rows, localStorage, old orders) still has the old
// paths, so they get rewritten as data is loaded. Once supabase/migrations/001_rename_product_images.sql
// has been run and browsers have refreshed their cached data, this file can go.
const LEGACY_IMAGE_PATHS: Record<string, string> = {
  '/assets/image_folder/image_b32343d3.png': '/assets/products/shano-gen4-poster.png',
  '/assets/image_folder/image_171a78dd.png': '/assets/products/steel-cradle-offer.png',
  '/assets/image_folder/image_6d16add2.png': '/assets/products/safety-swing-placeholder.png',
};

export function upgradeImagePaths<T>(value: T): T {
  if (typeof value === 'string') {
    return (LEGACY_IMAGE_PATHS[value] ?? value) as T;
  }
  if (Array.isArray(value)) {
    return value.map((item) => upgradeImagePaths(item)) as T;
  }
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) {
      out[key] = upgradeImagePaths(val);
    }
    return out as T;
  }
  return value;
}
