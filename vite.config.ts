import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv, type Plugin } from 'vite';
import { readFileSync } from 'node:fs';
import { normalizeSupabaseUrl } from './src/lib/supabaseUrl';
import { DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_KEY } from './src/lib/supabaseDefaults';

// Inlines src/boot/prefetch.js into index.html with the same Supabase URL/key the app uses.
function bootPrefetch(mode: string): Plugin {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const url = normalizeSupabaseUrl((env.VITE_SUPABASE_URL || '').trim() || DEFAULT_SUPABASE_URL);
  const key = (env.VITE_SUPABASE_ANON_KEY || '').trim() || DEFAULT_SUPABASE_KEY;
  return {
    name: 'sbs-boot-prefetch',
    transformIndexHtml(html) {
      const code = readFileSync('src/boot/prefetch.js', 'utf8')
        .replace('__SBS_URL__', JSON.stringify(url))
        .replace('__SBS_KEY__', JSON.stringify(key));
      return html.replace('<!--sbs-boot-->', `<script>${code}</script>`);
    },
  };
}

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss(), bootPrefetch(mode)],
  build: {
    // hashed JS/CSS/font files go to /static (cached for 1 year via public/_headers);
    // /assets/products keeps your product photos, which are NOT hashed.
    assetsDir: 'static',
  },
}));
