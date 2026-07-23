/* MB Servis Production — script.js */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Téma (den/noc) ---------- */
  var root = document.documentElement;
  try {
    var saved = localStorage.getItem('mb-theme');
    if (saved) root.setAttribute('data-theme', saved);
  } catch (e) {}
  function syncThemeIcon() {
    var light = root.getAttribute('data-theme') === 'light';
    document.querySelectorAll('[data-theme-toggle] i').forEach(function (i) {
      i.className = light ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
    });
  }
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-theme-toggle]');
    if (!t) return;
    var light = root.getAttribute('data-theme') === 'light';
    if (light) root.removeAttribute('data-theme'); else root.setAttribute('data-theme', 'light');
    try { localStorage.setItem('mb-theme', light ? 'dark' : 'light'); } catch (e) {}
    syncThemeIcon();
  });
  syncThemeIcon();

  /* ---------- Mobilní navigace ---------- */
  var nav = document.getElementById('nav');
  var toggle = document.querySelector('.nav__toggle');
  var backdrop = document.querySelector('.nav-backdrop');
  function syncToggleIcon(open) {
    var i = toggle && toggle.querySelector('i');
    if (i) i.className = open ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
  }
  function closeNav() {
    if (!nav) return;
    nav.classList.remove('is-open');
    backdrop && backdrop.classList.remove('is-open');
    toggle && toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    syncToggleIcon(false);
  }
  if (toggle) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      backdrop && backdrop.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
      syncToggleIcon(open);
    });
  }
  backdrop && backdrop.addEventListener('click', closeNav);
  nav && nav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeNav); });
  window.addEventListener('resize', function () { if (window.innerWidth > 1024) closeNav(); });

  /* ---------- Accordion (FAQ) ---------- */
  document.querySelectorAll('.acc__q').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var acc = btn.closest('.acc');
      var body = acc.querySelector('.acc__a');
      var open = acc.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', String(open));
      body.style.maxHeight = open ? body.scrollHeight + 'px' : '0';
    });
  });

  /* ---------- Reveal on scroll ---------- */
  var revs = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  if (reduce || !('IntersectionObserver' in window)) {
    revs.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
    }, { threshold: 0.14, rootMargin: '0px 0px -6% 0px' });
    revs.forEach(function (el) { io.observe(el); });
    setTimeout(function () { revs.forEach(function (el) { el.classList.add('is-in'); }); }, 3000);
  }

  /* ---------- Count-up ---------- */
  var nums = Array.prototype.slice.call(document.querySelectorAll('[data-count]'));
  function runCount(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    if (isNaN(target)) return;
    var suffix = el.getAttribute('data-suffix') || '';
    var dur = 1400, t0 = performance.now();
    function step(t) {
      var p = Math.min((t - t0) / dur, 1);
      var e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * e) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if (nums.length && !reduce && 'IntersectionObserver' in window) {
    var io2 = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { runCount(e.target); io2.unobserve(e.target); } });
    }, { threshold: 0.6 });
    nums.forEach(function (n) { io2.observe(n); });
  } else {
    nums.forEach(function (n) { n.textContent = (n.getAttribute('data-count') || n.textContent) + (n.getAttribute('data-suffix') || ''); });
  }

  /* ---------- Hero parallax ---------- */
  var heroImg = document.querySelector('.hero__bg img');
  if (heroImg && !reduce) {
    window.addEventListener('scroll', function () {
      var y = window.scrollY || 0;
      if (y < 900) heroImg.style.transform = 'translateY(' + (y * 0.18) + 'px) scale(1.12)';
    }, { passive: true });
  }

  /* ---------- Magnetická tlačítka ---------- */
  if (!reduce && window.matchMedia('(pointer:fine)').matches) {
    document.querySelectorAll('[data-magnetic]').forEach(function (btn) {
      btn.addEventListener('mousemove', function (e) {
        var r = btn.getBoundingClientRect();
        btn.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.2) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.3) + 'px)';
      });
      btn.addEventListener('mouseleave', function () { btn.style.transform = ''; });
    });
  }

  /* ---------- Cookie lišta ---------- */
  var cookie = document.getElementById('cookie');
  if (cookie) {
    var decided = false;
    try { decided = !!localStorage.getItem('mb-cookie'); } catch (e) {}
    if (!decided) setTimeout(function () { cookie.classList.add('is-visible'); }, 900);
    cookie.addEventListener('click', function (e) {
      var b = e.target.closest('[data-cookie]');
      if (!b) return;
      try { localStorage.setItem('mb-cookie', b.getAttribute('data-cookie')); } catch (e) {}
      cookie.classList.remove('is-visible');
    });
  }

  /* ---------- Formulář (honeypot) ---------- */
  document.querySelectorAll('form[data-antispam]').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      var hp = f.querySelector('input[name="_gotcha"]');
      if (hp && hp.value) { e.preventDefault(); return; }
      var consent = f.querySelector('input[name="souhlas"]');
      var err = f.querySelector('.consent__err');
      if (consent && !consent.checked) {
        e.preventDefault();
        if (err) err.hidden = false;
        consent.classList.add('is-touched');
        consent.focus();
      }
    });
    var c = f.querySelector('input[name="souhlas"]');
    if (c) c.addEventListener('change', function () {
      var err = f.querySelector('.consent__err');
      if (c.checked && err) err.hidden = true;
    });
  });

  /* ---------- Vlastní kurzor (tečka + radar efekt) ---------- */
  if (!reduce && window.matchMedia('(pointer:fine)').matches) {
    root.classList.add('custom-cursor');
    var cursor = document.createElement('div');
    cursor.className = 'cursor';
    cursor.innerHTML = '<span class="cursor__radar"></span><span class="cursor__dot"></span>';
    cursor.setAttribute('aria-hidden', 'true');
    document.body.appendChild(cursor);

    var shown = false;
    document.addEventListener('mousemove', function (e) {
      cursor.style.transform = 'translate(' + e.clientX + 'px,' + e.clientY + 'px)';
      if (!shown) { cursor.classList.add('is-visible'); shown = true; }
    });
    document.addEventListener('mouseleave', function () { cursor.classList.remove('is-visible'); });
    document.addEventListener('mouseenter', function () { if (shown) cursor.classList.add('is-visible'); });

    var hoverSel = 'a, button, .btn, input, select, textarea, [data-magnetic]';
    document.addEventListener('mouseover', function (e) {
      if (e.target.closest && e.target.closest(hoverSel)) cursor.classList.add('is-hover');
    });
    document.addEventListener('mouseout', function (e) {
      if (e.target.closest && e.target.closest(hoverSel)) cursor.classList.remove('is-hover');
    });
  }
})();
