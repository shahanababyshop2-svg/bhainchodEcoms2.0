// Runs inline in <head>, BEFORE the app bundle has downloaded.
// It starts the homepage data requests right away so they travel in parallel with the
// JavaScript download (before: JS first, THEN the database request = one long chain).
// The app picks the results up from window.__sbsBoot (see StoreContext.tsx).
// If anything here fails, the app simply fetches the data itself like before.
(function () {
  try {
    var url = __SBS_URL__;
    var key = __SBS_KEY__;
    if (!url || !key || /your-project-ref/.test(url)) return;
    // Custom credentials saved from the admin panel: let the app handle those itself.
    if (localStorage.getItem('sbs_supabase_url') || localStorage.getItem('sbs_supabase_key')) return;

    var headers = { apikey: key };
    if (key.indexOf('eyJ') === 0) headers.Authorization = 'Bearer ' + key;

    function get(path) {
      return fetch(url + '/rest/v1/' + path, { headers: headers })
        .then(function (r) { return r.ok ? r.json() : null; })
        .catch(function () { return null; });
    }

    var boot = (window.__sbsBoot = {});
    boot.config = get('site_config?select=*&id=eq.1');
    boot.products = get('products?select=*&order=created_at.desc');

    // As soon as we know the first hero image, start downloading it too.
    // MUST build the same URLs as optimizedImage(image, 450) in src/utils/imageUrl.ts,
    // otherwise the browser cannot reuse the preloaded file.
    boot.config.then(function (rows) {
      var slide = rows && rows[0] && rows[0].hero_slides && rows[0].hero_slides[0];
      var src = slide && slide.image;
      if (!src || typeof src !== 'string') return;

      function proxy(w) {
        return 'https://wsrv.nl/?url=' + encodeURIComponent(src) + '&w=' + w + '&output=webp&q=75&we';
      }
      var one, srcset;
      if (src.indexOf('/assets/products/') === 0 && /\.png$/.test(src)) {
        one = src.replace(/\.png$/, '.webp');
      } else if (/^https?:\/\//i.test(src) && src.indexOf('wsrv.nl') < 0) {
        one = proxy(450);
        srcset = one + ' 1x, ' + proxy(900) + ' 2x';
      } else {
        return;
      }

      var link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = one;
      if (srcset) link.setAttribute('imagesrcset', srcset);
      link.setAttribute('fetchpriority', 'high');
      link.setAttribute('referrerpolicy', 'no-referrer');
      document.head.appendChild(link);
    });
  } catch (e) {}
})();
