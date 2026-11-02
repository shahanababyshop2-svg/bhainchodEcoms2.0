// Turns a picture chosen in the admin panel into a smaller data URL for the phone banner.
// The picture is saved inside the site settings (like the other admin uploads), so a 4 MB photo
// straight from a camera would make every page load slower. Wide banners are shrunk to
// 1200 px wide and saved as a JPEG, which keeps them around 100-250 KB.

export const BANNER_MAX_WIDTH = 1200;

// Never makes a picture bigger; keeps the shape.
export function bannerTargetSize(width: number, height: number, maxWidth = BANNER_MAX_WIDTH): { width: number; height: number } {
  if (width <= 0 || height <= 0) return { width: 0, height: 0 };
  if (width <= maxWidth) return { width, height };
  const scale = maxWidth / width;
  return { width: maxWidth, height: Math.max(1, Math.round(height * scale)) };
}

export function fileToBannerDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read the file.'));
    reader.onload = () => {
      const src = String(reader.result || '');
      const img = new Image();
      img.onerror = () => reject(new Error('That file is not a picture.'));
      img.onload = () => {
        const { width, height } = bannerTargetSize(img.naturalWidth, img.naturalHeight);
        if (!width || !height) {
          reject(new Error('That picture has no size.'));
          return;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          // no canvas support: keep the original
          resolve(src);
          return;
        }
        // JPEG has no transparency, so paint white first
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  });
}
