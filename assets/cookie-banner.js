/* Sencillo Cookie Consent
   - Plain JS, no dependencies
   - Equally-prominent Accept / Reject buttons (UK ICO compliant)
   - Granular category opt-in (Functional / Analytics / Marketing)
   - Persisted in localStorage as "sencilloCookieConsent" = { necessary:true, functional:bool, analytics:bool, marketing:bool, ts:ISOString }
   - Exposes window.openCookiePreferences() and window.getCookieConsent()
   - Fires window event "sencilloConsentUpdate" with detail = consent object whenever consent changes
*/
(function(){
  var STORE_KEY = 'sencilloCookieConsent';
  var WRAP_ID = 'sencillo-cookie-banner';
  var MODAL_ID = 'sencillo-cookie-modal';

  function read(){ try { return JSON.parse(localStorage.getItem(STORE_KEY)); } catch(e){ return null; } }
  function write(obj){ obj.ts = new Date().toISOString(); localStorage.setItem(STORE_KEY, JSON.stringify(obj)); window.dispatchEvent(new CustomEvent('sencilloConsentUpdate', { detail: obj })); }

  window.getCookieConsent = function(){ return read(); };
  window.openCookiePreferences = function(){ buildModal(); var m = document.getElementById(MODAL_ID); if (m) { m.classList.add('open'); document.body.style.overflow = 'hidden'; } };

  function buildBanner(){
    if (document.getElementById(WRAP_ID)) return;
    var el = document.createElement('div');
    el.id = WRAP_ID;
    el.setAttribute('role','region');
    el.setAttribute('aria-label','Cookie consent');
    el.innerHTML = '\
      <div class="sc-cookie-card">\
        <div class="sc-cookie-copy">\
          <p class="sc-cookie-title">We use cookies</p>\
          <p class="sc-cookie-text">We use strictly necessary cookies to run this site. With your consent we also use cookies to understand how you use the site and to personalise marketing. Read our <a href="cookies.html">cookie policy</a> for the detail.</p>\
        </div>\
        <div class="sc-cookie-actions">\
          <button type="button" class="sc-btn sc-btn-secondary" data-action="reject">Reject all</button>\
          <button type="button" class="sc-btn sc-btn-secondary" data-action="customise">Customise</button>\
          <button type="button" class="sc-btn sc-btn-primary" data-action="accept">Accept all</button>\
        </div>\
      </div>';
    document.body.appendChild(el);
    el.addEventListener('click', function(e){
      var act = e.target && e.target.getAttribute && e.target.getAttribute('data-action');
      if (act === 'accept') { write({ necessary:true, functional:true, analytics:true, marketing:true }); hideBanner(); }
      else if (act === 'reject') { write({ necessary:true, functional:false, analytics:false, marketing:false }); hideBanner(); }
      else if (act === 'customise') { hideBanner(); window.openCookiePreferences(); }
    });
    requestAnimationFrame(function(){ el.classList.add('show'); });
  }

  function hideBanner(){ var el = document.getElementById(WRAP_ID); if (el) { el.classList.remove('show'); setTimeout(function(){ if (el && el.parentNode) el.parentNode.removeChild(el); }, 300); } }

  function buildModal(){
    if (document.getElementById(MODAL_ID)) return;
    var stored = read() || { necessary:true, functional:false, analytics:false, marketing:false };
    var el = document.createElement('div');
    el.id = MODAL_ID;
    el.setAttribute('role','dialog');
    el.setAttribute('aria-modal','true');
    el.setAttribute('aria-labelledby','sc-cookie-modal-title');
    el.innerHTML = '\
      <div class="sc-modal-backdrop" data-close></div>\
      <div class="sc-modal-card">\
        <button type="button" class="sc-modal-close" aria-label="Close" data-close>✕</button>\
        <h2 id="sc-cookie-modal-title">Cookie preferences</h2>\
        <p class="sc-modal-lede">Choose which cookies you allow. You can change your mind anytime via the "Manage cookies" link in the footer.</p>\
        <div class="sc-cat">\
          <div class="sc-cat-head"><strong>Strictly necessary</strong><span class="sc-cat-toggle sc-cat-toggle-locked">Always on</span></div>\
          <p>Required for the site to work — age verification, cart, security. These cannot be turned off.</p>\
        </div>\
        <div class="sc-cat">\
          <div class="sc-cat-head"><label for="sc-cat-functional"><strong>Functional</strong></label><label class="sc-switch"><input type="checkbox" id="sc-cat-functional" '+(stored.functional?'checked':'')+'><span class="sc-switch-track"></span></label></div>\
          <p>Remember preferences such as your saved location or display settings.</p>\
        </div>\
        <div class="sc-cat">\
          <div class="sc-cat-head"><label for="sc-cat-analytics"><strong>Analytics</strong></label><label class="sc-switch"><input type="checkbox" id="sc-cat-analytics" '+(stored.analytics?'checked':'')+'><span class="sc-switch-track"></span></label></div>\
          <p>Help us understand how visitors use the site so we can improve it.</p>\
        </div>\
        <div class="sc-cat">\
          <div class="sc-cat-head"><label for="sc-cat-marketing"><strong>Marketing</strong></label><label class="sc-switch"><input type="checkbox" id="sc-cat-marketing" '+(stored.marketing?'checked':'')+'><span class="sc-switch-track"></span></label></div>\
          <p>Personalise the ads you see for Sencillo on other sites.</p>\
        </div>\
        <div class="sc-modal-actions">\
          <button type="button" class="sc-btn sc-btn-secondary" data-action="reject-modal">Reject all</button>\
          <button type="button" class="sc-btn sc-btn-primary" data-action="save">Save preferences</button>\
        </div>\
      </div>';
    document.body.appendChild(el);
    el.addEventListener('click', function(e){
      var act = e.target && e.target.getAttribute && e.target.getAttribute('data-action');
      var close = e.target && e.target.hasAttribute && e.target.hasAttribute('data-close');
      if (act === 'save') {
        write({ necessary:true,
          functional: document.getElementById('sc-cat-functional').checked,
          analytics: document.getElementById('sc-cat-analytics').checked,
          marketing: document.getElementById('sc-cat-marketing').checked
        });
        closeModal();
      } else if (act === 'reject-modal') {
        write({ necessary:true, functional:false, analytics:false, marketing:false });
        closeModal();
      } else if (close) { closeModal(); }
    });
  }
  function closeModal(){ var el = document.getElementById(MODAL_ID); if (el) { el.classList.remove('open'); document.body.style.overflow = ''; setTimeout(function(){ if (el && el.parentNode) el.parentNode.removeChild(el); }, 250); } }

  // Inject CSS once
  if (!document.getElementById('sencillo-cookie-css')) {
    var style = document.createElement('style');
    style.id = 'sencillo-cookie-css';
    style.textContent = '\
#sencillo-cookie-banner { position: fixed; left: 50%; bottom: 20px; transform: translateX(-50%) translateY(20px); z-index: 9990; width: calc(100% - 32px); max-width: 980px; opacity: 0; pointer-events: none; transition: transform 0.42s cubic-bezier(0.16,1,0.3,1), opacity 0.32s ease; font-family: \'Jost\', system-ui, sans-serif; }\
#sencillo-cookie-banner.show { opacity: 1; pointer-events: auto; transform: translateX(-50%) translateY(0); }\
.sc-cookie-card { background: #fff; color: #1A1A1A; border-radius: 18px; padding: 1.5rem 1.75rem; display: grid; grid-template-columns: 1fr auto; gap: 1.5rem; align-items: center; box-shadow: 0 24px 60px -20px rgba(0,0,0,0.35), 0 0 0 1px rgba(0,0,0,0.05); }\
.sc-cookie-title { font-weight: 800; font-size: 1rem; letter-spacing: -0.01em; margin-bottom: 0.3rem; }\
.sc-cookie-text { font-size: 0.85rem; line-height: 1.55; color: #555; max-width: 640px; }\
.sc-cookie-text a { color: #E10072; font-weight: 700; text-decoration: underline; text-underline-offset: 2px; }\
.sc-cookie-actions { display: flex; gap: 0.55rem; flex-shrink: 0; flex-wrap: wrap; justify-content: flex-end; }\
.sc-btn { font-family: inherit; font-weight: 700; font-size: 0.72rem; letter-spacing: 0.13em; text-transform: uppercase; padding: 0.78rem 1.2rem; border-radius: 9999px; cursor: pointer; border: 2px solid #1A1A1A; background: transparent; color: #1A1A1A; transition: background 0.2s, color 0.2s, transform 0.2s cubic-bezier(0.34,1.56,0.64,1); white-space: nowrap; }\
.sc-btn:hover { transform: translateY(-1px); }\
.sc-btn-primary { background: #E10072; border-color: #E10072; color: #fff; }\
.sc-btn-primary:hover { background: #c80068; border-color: #c80068; }\
.sc-btn-secondary:hover { background: #1A1A1A; color: #fff; }\
@media (max-width: 760px) { .sc-cookie-card { grid-template-columns: 1fr; padding: 1.35rem; } .sc-cookie-actions { justify-content: stretch; } .sc-btn { flex: 1; min-width: 0; } }\
#sencillo-cookie-modal { position: fixed; inset: 0; z-index: 9995; display: none; align-items: center; justify-content: center; padding: 1.5rem; font-family: \'Jost\', system-ui, sans-serif; }\
#sencillo-cookie-modal.open { display: flex; }\
.sc-modal-backdrop { position: absolute; inset: 0; background: rgba(26,26,26,0.6); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); }\
.sc-modal-card { position: relative; background: #fff; color: #1A1A1A; border-radius: 22px; width: 100%; max-width: 540px; padding: 2.25rem 2rem 1.75rem; box-shadow: 0 30px 80px -20px rgba(0,0,0,0.55); max-height: 90vh; overflow-y: auto; }\
.sc-modal-close { position: absolute; top: 0.85rem; right: 0.85rem; background: transparent; border: none; font-size: 1.25rem; cursor: pointer; padding: 8px; color: #555; line-height: 1; }\
#sc-cookie-modal-title { font-weight: 900; font-size: 1.85rem; letter-spacing: -0.025em; margin-bottom: 0.6rem; }\
.sc-modal-lede { font-size: 0.9rem; line-height: 1.6; color: #555; margin-bottom: 1.5rem; }\
.sc-cat { border-top: 1px solid rgba(0,0,0,0.08); padding: 1rem 0; }\
.sc-cat-head { display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-bottom: 0.35rem; }\
.sc-cat-head strong { font-weight: 700; font-size: 0.98rem; }\
.sc-cat p { font-size: 0.83rem; line-height: 1.55; color: #666; }\
.sc-cat-toggle-locked { font-size: 0.7rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #999; }\
.sc-switch { position: relative; display: inline-block; width: 44px; height: 24px; flex-shrink: 0; cursor: pointer; }\
.sc-switch input { opacity: 0; width: 0; height: 0; }\
.sc-switch-track { position: absolute; inset: 0; background: #ccc; border-radius: 999px; transition: background 0.2s; }\
.sc-switch-track::before { content: \'\'; position: absolute; top: 3px; left: 3px; width: 18px; height: 18px; background: #fff; border-radius: 50%; transition: transform 0.24s cubic-bezier(0.34,1.56,0.64,1); }\
.sc-switch input:checked + .sc-switch-track { background: #E10072; }\
.sc-switch input:checked + .sc-switch-track::before { transform: translateX(20px); }\
.sc-switch input:focus-visible + .sc-switch-track { outline: 3px solid #FFBC00; outline-offset: 2px; }\
.sc-modal-actions { display: flex; gap: 0.6rem; margin-top: 1.5rem; justify-content: flex-end; }\
@media (max-width: 540px) { .sc-modal-actions { flex-direction: column-reverse; } .sc-modal-actions .sc-btn { width: 100%; } }';
    document.head.appendChild(style);
  }

  // Only show banner if no decision yet
  function init(){
    if (!read()) {
      buildBanner();
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
