// Returns a smaller, modern-format (WebP) version of an image so phones don't download
// 2-3 MB originals just to show a 200px card.
//
//  - Your own files in /assets/products/*.png  -> pre-made .webp (800px) or -thumb.webp (160px)
//  - Remote images (babydolnastore.com, Google thumbnails, ...) -> resized by the wsrv.nl image proxy
//  - data: URLs (admin uploads) and anything else -> returned untouched
//
// Set USE_IMAGE_PROXY to false if you ever want remote images loaded directly again.
const USE_IMAGE_PROXY = true;

export function optimizedImage(src: string | undefined, width = 480): string {
  if (!src) return '';

  if (src.startsWith('/assets/products/') && src.endsWith('.png')) {
    const base = src.slice(0, -'.png'.length);
    return width <= 200 ? `${base}-thumb.webp` : `${base}.webp`;
  }

  if (USE_IMAGE_PROXY && /^https?:\/\//i.test(src) && !src.includes('wsrv.nl')) {
    return `https://wsrv.nl/?url=${encodeURIComponent(src)}&w=${width}&output=webp&q=75&we`;
  }

  return src;
}

// 1x / 2x pair so high-density phones still get a sharp picture.
export function optimizedSrcSet(src: string | undefined, width = 480): string | undefined {
  if (!src || src.startsWith('data:')) return undefined;
  const one = optimizedImage(src, width);
  const two = optimizedImage(src, width * 2);
  if (one === two) return undefined;
  return `${one} 1x, ${two} 2x`;
}
