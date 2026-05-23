/* Sencillo Consent Loader
   -------------------------------------------------------------
   Loads analytics and marketing tags ONLY after the visitor has
   given consent via the cookie banner.

   Relies on cookie-banner.js to expose:
     - window.getCookieConsent()  → { necessary, functional, analytics, marketing, ts }
     - "sencilloConsentUpdate"    custom event with detail = consent

   To activate a tag: replace the [TODO: …] ID and remove the
   surrounding `return;` guard at the top of each loader.
   -------------------------------------------------------------
*/
(function () {
  // -----------------------------
  // Configuration — fill in IDs
  // -----------------------------
  var CONFIG = {
    // Analytics
    ga4MeasurementId: 'TODO_G-XXXXXXXXXX',        // e.g. 'G-1A2B3C4D5E'  (Google Analytics 4)
    // Marketing
    googleAdsId:      'TODO_AW-XXXXXXXXXX',       // e.g. 'AW-1234567890' (Google Ads conversion ID)
    metaPixelId:      'TODO_META_PIXEL_ID',       // e.g. '1234567890123456'
    tiktokPixelId:    'TODO_TIKTOK_PIXEL_ID',     // e.g. 'C4ABCDEF123456789'
    pinterestTagId:   'TODO_PINTEREST_TAG_ID'     // e.g. '2612345678901'
  };

  var loaded = { ga4: false, gads: false, meta: false, tiktok: false, pinterest: false };

  function isPlaceholder(v) { return !v || /^TODO[_-]/.test(v); }
  function getConsent() { try { return (window.getCookieConsent && window.getCookieConsent()) || null; } catch (e) { return null; } }

  // -----------------------------
  // ANALYTICS — Google Analytics 4
  // -----------------------------
  function loadGA4() {
    if (loaded.ga4) return;
    if (isPlaceholder(CONFIG.ga4MeasurementId)) return; // unconfigured — do nothing
    loaded.ga4 = true;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + CONFIG.ga4MeasurementId;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', CONFIG.ga4MeasurementId, { anonymize_ip: true });
  }

  // -----------------------------
  // MARKETING — Google Ads (shares gtag.js with GA4)
  // -----------------------------
  function loadGoogleAds() {
    if (loaded.gads) return;
    if (isPlaceholder(CONFIG.googleAdsId)) return;
    loaded.gads = true;
    // If GA4 already loaded gtag, reuse it; otherwise inject gtag for Ads.
    if (!window.gtag) {
      var s = document.createElement('script');
      s.async = true;
      s.src = 'https://www.googletagmanager.com/gtag/js?id=' + CONFIG.googleAdsId;
      document.head.appendChild(s);
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { window.dataLayer.push(arguments); };
      window.gtag('js', new Date());
    }
    window.gtag('config', CONFIG.googleAdsId);
  }

  // -----------------------------
  // MARKETING — Meta (Facebook/Instagram) Pixel
  // -----------------------------
  function loadMetaPixel() {
    if (loaded.meta) return;
    if (isPlaceholder(CONFIG.metaPixelId)) return;
    loaded.meta = true;
    !(function (f, b, e, v, n, t, s) {
      if (f.fbq) return;
      n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
      if (!f._fbq) f._fbq = n;
      n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = [];
      t = b.createElement(e); t.async = !0; t.src = v;
      s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('init', CONFIG.metaPixelId);
    window.fbq('track', 'PageView');
  }

  // -----------------------------
  // MARKETING — TikTok Pixel
  // -----------------------------
  function loadTikTokPixel() {
    if (loaded.tiktok) return;
    if (isPlaceholder(CONFIG.tiktokPixelId)) return;
    loaded.tiktok = true;
    !(function (w, d, t) {
      w.TiktokAnalyticsObject = t;
      var ttq = w[t] = w[t] || [];
      ttq.methods = ['page','track','identify','instances','debug','on','off','once','ready','alias','group','enableCookie','disableCookie'];
      ttq.setAndDefer = function (t, e) { t[e] = function () { t.push([e].concat(Array.prototype.slice.call(arguments, 0))); }; };
      for (var i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]);
      ttq.instance = function (t) { for (var e = ttq._i[t] || [], n = 0; n < ttq.methods.length; n++) ttq.setAndDefer(e, ttq.methods[n]); return e; };
      ttq.load = function (e, n) {
        var r = 'https://analytics.tiktok.com/i18n/pixel/events.js';
        ttq._i = ttq._i || {}; ttq._i[e] = []; ttq._i[e]._u = r; ttq._t = ttq._t || {}; ttq._t[e] = +new Date(); ttq._o = ttq._o || {}; ttq._o[e] = n || {};
        var o = document.createElement('script'); o.type = 'text/javascript'; o.async = !0; o.src = r + '?sdkid=' + e + '&lib=' + t;
        var a = document.getElementsByTagName('script')[0]; a.parentNode.insertBefore(o, a);
      };
      ttq.load(CONFIG.tiktokPixelId);
      ttq.page();
    })(window, document, 'ttq');
  }

  // -----------------------------
  // MARKETING — Pinterest Tag
  // -----------------------------
  function loadPinterestTag() {
    if (loaded.pinterest) return;
    if (isPlaceholder(CONFIG.pinterestTagId)) return;
    loaded.pinterest = true;
    !(function (e) {
      if (!window.pintrk) {
        window.pintrk = function () { window.pintrk.queue.push(Array.prototype.slice.call(arguments)); };
        var n = window.pintrk; n.queue = []; n.version = '3.0';
        var t = document.createElement('script'); t.async = !0; t.src = e;
        var r = document.getElementsByTagName('script')[0]; r.parentNode.insertBefore(t, r);
      }
    })('https://s.pinimg.com/ct/core.js');
    window.pintrk('load', CONFIG.pinterestTagId);
    window.pintrk('page');
  }

  // -----------------------------
  // Apply consent
  // -----------------------------
  function applyConsent(c) {
    if (!c) return;
    if (c.analytics) { loadGA4(); }
    if (c.marketing) { loadGoogleAds(); loadMetaPixel(); loadTikTokPixel(); loadPinterestTag(); }
    // We never "unload" pixels mid-session — if the user revokes consent we stop
    // loading them on next page load. Their cookies are deleted by the
    // categorisation tools below, where appropriate.
  }

  // Reactive: re-evaluate when consent changes
  window.addEventListener('sencilloConsentUpdate', function (e) { applyConsent(e.detail); });

  // On initial load, apply any stored consent
  function init() { applyConsent(getConsent()); }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
