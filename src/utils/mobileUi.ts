// Small pure helpers behind the phone UI (src/mobile/). Kept free of React and the browser
// so they can be unit-tested (see mobileUi.test.ts).

// Tailwind's `md` breakpoint is 768px. Below it the phone UI is used, at 768px and up the
// original tablet/desktop UI is used. Keep the two numbers in step.
export const PHONE_MAX_WIDTH = 767;

export type UiMode = 'new' | 'classic';

// What is saved in the browser. Anything unknown (empty, old value, junk) means the new UI.
export function parseUiMode(raw: string | null | undefined): UiMode {
  return raw === 'classic' ? 'classic' : 'new';
}

// The new phone UI shows on phone-sized screens, unless the visitor chose "Classic view".
export function shouldShowMobileUi(isPhone: boolean, mode: UiMode): boolean {
  return isPhone && mode === 'new';
}

// Which banner slide is on screen, from how far the swipe row has been scrolled.
export function slideIndexFromScroll(scrollLeft: number, slideWidth: number, count: number): number {
  if (count <= 0 || slideWidth <= 0) return 0;
  const raw = Math.round(scrollLeft / slideWidth);
  return Math.min(count - 1, Math.max(0, raw));
}

// The small tags under a product name: the first few non-empty, different features.
export function pickFeatureChips(features: string[] | undefined, max = 3): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of features || []) {
    const text = (raw || '').trim();
    if (!text) continue;
    const key = text.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(text);
    if (out.length >= max) break;
  }
  return out;
}

// "01354-245072" -> "tel:01354245072"
export function telHref(phone: string): string {
  return `tel:${(phone || '').replace(/[^0-9]/g, '')}`;
}

// wa.me link with a ready-typed message
export function whatsappHref(number: string, text: string): string {
  return `https://wa.me/${(number || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(text)}`;
}
