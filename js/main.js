document.addEventListener('DOMContentLoaded', function () {
  // Mark JS availability — reveal styles only hide content under html.js-enabled
  document.documentElement.classList.add('js-enabled');

  // Mobile nav toggle
  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      links.classList.toggle('open');
    });
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { links.classList.remove('open'); });
    });
  }

  // Mark active nav link based on current page
  var path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(function (a) {
    var href = a.getAttribute('href');
    if (href === path) a.classList.add('active');
  });

  // Contact form (front-end only demo — no backend wired up)
  var form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var msg = document.getElementById('form-status');
      if (msg) {
        msg.textContent = 'Thanks! Your message has been noted. (Connect this form to an email service or backend to actually receive submissions.)';
        msg.style.display = 'block';
      }
      form.reset();
    });
  }

  // ---------- Scroll-reveal animations ----------
  // Elements start hidden (CSS, scoped to html.js-enabled) and slide in
  // when they enter the viewport. Sibling groups are auto-staggered by JS;
  // the reveal classes and inline delay are removed once the transition
  // ends so normal stylesheet transitions (e.g. card hover lift) take over.
  var REVEAL_SELECTOR = '.reveal, .reveal-left, .reveal-right, .reveal-scale';
  var CLEANUP_CLASSES = ['reveal', 'reveal-left', 'reveal-right', 'reveal-scale'];
  var CLEANUP_AFTER_MS = 1300; // .65s transition + up to .45s stagger, plus margin

  var revealEls = Array.prototype.slice.call(document.querySelectorAll(REVEAL_SELECTOR));
  var observer = ('IntersectionObserver' in window)
    ? new IntersectionObserver(onIntersect, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' })
    : null;

  // Auto-stagger: siblings that reveal together get an index-based delay,
  // inlined as transition-delay and cleared after the reveal so normal
  // stylesheet transitions (e.g. card hover lift) are unaffected.
  function staggerDelay(el) {
    var parent = el.parentElement;
    if (!parent) return 0;
    var siblings = Array.prototype.filter.call(parent.children, function (c) {
      return CLEANUP_CLASSES.some(function (cls) { return c.classList.contains(cls); });
    });
    var idx = siblings.indexOf(el);
    return idx <= 0 ? 0 : Math.min(idx * 90, 450);
  }

  function cleanupReveal(el) {
    window.setTimeout(function () {
      el.classList.remove('visible');
      CLEANUP_CLASSES.forEach(function (c) { el.classList.remove(c); });
      el.style.removeProperty('transition-delay');
    }, CLEANUP_AFTER_MS);
  }

  function revealNow(el) {
    if (el.dataset.revealed) return;
    el.dataset.revealed = '1';
    if (observer) observer.unobserve(el);
    el.style.transitionDelay = staggerDelay(el) + 'ms';
    el.classList.add('visible');
    cleanupReveal(el);
  }

  function onIntersect(entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) revealNow(entry.target);
    });
  }

  // Safety net for environments where rendering frames are throttled
  // (hidden/backgrounded tabs): IntersectionObserver only delivers during
  // rendering frames, but timers and scroll events still run. Reveal anything
  // already inside the viewport that the observer hasn't handled yet.
  function sweepViewport() {
    var vh = window.innerHeight || document.documentElement.clientHeight;
    revealEls.forEach(function (el) {
      if (el.dataset.revealed) return;
      var r = el.getBoundingClientRect();
      if (r.top < vh * 0.92 && r.bottom > 0) revealNow(el);
    });
  }

  if (observer && revealEls.length) {
    revealEls.forEach(function (el) { observer.observe(el); });
  }
  window.addEventListener('scroll', sweepViewport, { passive: true });
  window.addEventListener('resize', sweepViewport, { passive: true });
  [200, 600, 1200].forEach(function (t) { window.setTimeout(sweepViewport, t); });

  // ---------- Back-to-top button ----------
  var backToTop = document.querySelector('.back-to-top');
  if (backToTop) {
    var updateVisibility = function () {
      backToTop.classList.toggle('show', window.scrollY > 400);
    };
    window.addEventListener('scroll', updateVisibility, { passive: true });
    updateVisibility();
    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
});
