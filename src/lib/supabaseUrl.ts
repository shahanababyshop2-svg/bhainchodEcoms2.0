// People paste all kinds of things into the Supabase URL box: the dashboard link,
// just the project ref, or the real endpoint. Turn any of them into https://<ref>.supabase.co
export function normalizeSupabaseUrl(url: string): string {
  if (!url) return '';
  const cleaned = url.trim();

  const dashboard = cleaned.match(/supabase\.com\/dashboard\/project\/([a-z0-9_-]+)/i);
  if (dashboard) return `https://${dashboard[1]}.supabase.co`;

  if (!/^https?:\/\//.test(cleaned)) {
    return cleaned.includes('.supabase.co') ? `https://${cleaned}` : `https://${cleaned}.supabase.co`;
  }

  return cleaned.replace(/\/+$/, '');
}
