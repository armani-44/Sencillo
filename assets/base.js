// ─── Scroll Reveal ───────────────────────────────────────────────
const revealIO = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      revealIO.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => revealIO.observe(el));

// ─── Animated Counters ───────────────────────────────────────────
function animateCounter(el, target) {
  const suffix = el.querySelector('span') ? el.querySelector('span').outerHTML : '';
  const duration = 1800;
  const start = performance.now();
  const update = (now) => {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - (1 - progress) * (1 - progress);
    const current = Math.floor(eased * target);
    el.innerHTML = (current >= 1000 ? (current / 1000).toFixed(1).replace('.0', '') + 'k' : current) + suffix;
    if (progress < 1) requestAnimationFrame(update);
    else el.innerHTML = (target >= 1000 ? (target / 1000).toFixed(1).replace('.0', '') + 'k' : target) + suffix;
  };
  requestAnimationFrame(update);
}

const statIO = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const target = parseInt(e.target.dataset.target);
      if (target) animateCounter(e.target, target);
      statIO.unobserve(e.target);
    }
  });
}, { threshold: 0.5 });
document.querySelectorAll('[data-target]').forEach(el => statIO.observe(el));

// ─── Promo Bar Carousel ──────────────────────────────────────────
(function () {
  const track = document.getElementById('promoTrack');
  const msgs = track ? track.querySelectorAll('.promo-msg') : [];
  let current = 0, timer;
  function goTo(idx) {
    current = (idx + msgs.length) % msgs.length;
    track.style.transform = 'translateX(-' + (current * 100) + '%)';
  }
  function advance() { goTo(current + 1); }
  function startTimer() { timer = setInterval(advance, 4000); }
  function resetTimer() { clearInterval(timer); startTimer(); }
  if (track && msgs.length) {
    const next = document.getElementById('promoNext');
    const prev = document.getElementById('promoPrev');
    if (next) next.addEventListener('click', () => { goTo(current + 1); resetTimer(); });
    if (prev) prev.addEventListener('click', () => { goTo(current - 1); resetTimer(); });
    startTimer();
  }
})();

// ─── Ticker Pause on Hover ───────────────────────────────────────
document.querySelectorAll('.ticker-track').forEach(t => {
  t.parentElement.addEventListener('mouseenter', () => t.style.animationPlayState = 'paused');
  t.parentElement.addEventListener('mouseleave', () => t.style.animationPlayState = 'running');
});

// ─── Cart Count (Shopify AJAX) ───────────────────────────────────
function updateCartBadge() {
  fetch('/cart.js')
    .then(r => r.json())
    .then(cart => {
      document.querySelectorAll('.cart-count').forEach(el => {
        el.textContent = cart.item_count;
      });
    })
    .catch(() => {});
}

document.querySelectorAll('.js-add-to-cart').forEach(form => {
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const btn = form.querySelector('[type="submit"]');
    const origText = btn.textContent;
    const data = new FormData(form);
    fetch('/cart/add.js', { method: 'POST', body: data })
      .then(r => r.json())
      .then(() => {
        btn.textContent = '✓ Added!';
        btn.style.background = '#1A1A1A';
        updateCartBadge();
        setTimeout(() => { btn.textContent = origText; btn.style.background = ''; }, 1800);
      })
      .catch(() => {
        btn.textContent = 'Error — try again';
        setTimeout(() => { btn.textContent = origText; }, 2000);
      });
  });
});

updateCartBadge();

// ─── Product Page Quantity ────────────────────────────────────────
const qtyInput = document.getElementById('qty-input');
if (qtyInput) {
  document.getElementById('qty-minus')?.addEventListener('click', () => {
    if (parseInt(qtyInput.value) > 1) qtyInput.value = parseInt(qtyInput.value) - 1;
  });
  document.getElementById('qty-plus')?.addEventListener('click', () => {
    qtyInput.value = parseInt(qtyInput.value) + 1;
  });
}

// ─── Product Page Tabs ────────────────────────────────────────────
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.tab;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.style.display = 'none');
    btn.classList.add('active');
    const panel = document.getElementById('tab-' + target);
    if (panel) panel.style.display = 'block';
  });
});
