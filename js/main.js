/* Kheshtaneh — main.js: scroll animations + bugfix enhancements */
(function () {
  'use strict';

  // ---------- Runtime cleanup of template leftovers ----------
  try {
    // Bento header Angular artifacts
    document.querySelectorAll('span[data-path-to-node], source-footnote').forEach(function (n) { n.remove(); });
    var bentoP = document.querySelector('#learning p.text-neutral-600');
    if (bentoP && bentoP.textContent.trim().length < 20) {
      bentoP.textContent = 'Guides include step-by-step videos and technical articles.';
    }
    // Elementor dump in About -> clean readable block
    var elx = document.querySelector('.elementor-element');
    if (elx) {
      var box = document.createElement('div');
      box.className = 'space-y-3 text-justify text-[15px] leading-7 text-[#333]';
      box.innerHTML = '<p><strong>Kheshtaneh</strong> is a multi-purpose educational construction kit for small-scale brick structures.</p><p>With real clay bricks, water-soluble mortar and miniature masonry tools you can build arches, domes, walls and windcatchers — wash and rebuild endlessly.</p>';
      elx.replaceWith(box);
    }
    // Mosaic AI-dump block: strip giant inline styles, keep layout safe
    var mosaic = document.querySelector('[id^="model-response"]');
    if (mosaic) {
      mosaic.removeAttribute('style');
      mosaic.setAttribute('id', 'mosaic-desc');
      if (mosaic.textContent.trim().length < 20) {
        mosaic.innerHTML = '<p class="text-on-surface-variant text-base sm:text-lg max-w-xl mx-auto leading-relaxed">Gallery of models built with Kheshtaneh.</p>';
      }
    }
    var emptyP = document.querySelector('#models p.text-on-surface-variant');
    if (emptyP && emptyP.textContent.trim().length === 0) {
      emptyP.textContent = 'Gallery of models built with Kheshtaneh.';
    }
  } catch (e) { /* no-op */ }

  // ---------- Image fallback (hotlink safety) ----------
  var FALLBACK = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><rect width="100%" height="100%" fill="#F4EAD9"/><text x="50%" y="52%" font-size="34" text-anchor="middle" fill="#8C4A3C" font-family="sans-serif">خشتانه</text></svg>'
  );
  document.querySelectorAll('img').forEach(function (img) {
    img.setAttribute('loading', 'lazy');
    img.setAttribute('decoding', 'async');
    img.addEventListener('error', function h() {
      img.removeEventListener('error', h);
      if (!img.src || img.src.indexOf('data:image') !== 0) img.src = FALLBACK;
    });
  });

  // ---------- Base reveal on scroll (hands off when GSAP motion owns it) ----------
  var motionOwnsScroll = false;
  try { motionOwnsScroll = !!(window.gsap && window.ScrollTrigger); } catch (e) {}
  var revealTargets = document.querySelectorAll(
    'main section > div, main section h2, main section h3, footer'
  );
  revealTargets.forEach(function (el, i) {
    if (el.closest('#products-track') || el.closest('#articles-slider-track')) return;
    if (el.closest('#home')) return; // hero has its own entrance
    if (motionOwnsScroll && (el.tagName === 'H2' || (el.tagName === 'DIV' && el.querySelector(':scope > img')))) return; // motion.js owns these
    if (!el.classList.contains('reveal')) {
      el.classList.add('reveal');
      el.style.setProperty('--reveal-delay', Math.min((i % 4) * 80, 240) + 'ms');
    }
  });
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add('reveal-visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });

  // ---------- Hero entrance on load (Quora staggered rise) ----------
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      document.querySelectorAll('[data-hero]').forEach(function (el) { el.classList.add('hero-in'); });
    });
  });

  // ---------- Quora-style mobile menu (overlay pops from navbar) ----------
  var menuBtn = document.getElementById('menu-btn');
  var mobileMenu = document.getElementById('mobile-menu');
  var menuClose = document.getElementById('menu-close');
  function setMenu(open) {
    if (!mobileMenu) return;
    mobileMenu.classList.toggle('open', open);
    mobileMenu.setAttribute('aria-hidden', open ? 'false' : 'true');
    if (menuBtn) {
      menuBtn.classList.toggle('open', open);
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      menuBtn.setAttribute('aria-label', open ? 'بستن منو' : 'باز کردن منو');
    }
    document.body.style.overflow = open ? 'hidden' : '';
    // replay link stagger each time it opens
    if (open) {
      var links = mobileMenu.querySelectorAll('nav a');
      links.forEach(function (a) {
        a.style.animation = 'none';
        void a.offsetWidth;
        a.style.animation = '';
      });
    }
  }
  if (menuBtn) menuBtn.addEventListener('click', function () { setMenu(!mobileMenu.classList.contains('open')); });
  if (menuClose) menuClose.addEventListener('click', function () { setMenu(false); });
  if (mobileMenu) mobileMenu.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function () { setMenu(false); });
  });
  document.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape' && mobileMenu && mobileMenu.classList.contains('open')) setMenu(false);
  });

  // ---------- Header hide/shrink + progress + back-to-top ----------
  var header = document.getElementById('site-header');
  var progress = document.querySelector('#scroll-progress span');
  var toTop = document.getElementById('back-to-top');
  var lastY = window.scrollY;
  function onScroll() {
    var y = window.scrollY;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
    if (header) {
      header.classList.toggle('header-scrolled', y > 24);
      if (y > 40 && y > lastY + 2) header.classList.add('header-hidden');
      else if (y < lastY - 2 || y <= 40) header.classList.remove('header-hidden');
    }
    if (toTop) toTop.classList.toggle('show', y > 600);
    lastY = y;
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  if (toTop) toTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ---------- Smooth anchor scroll (Lenis-aware, RTL safe) ----------
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (ev) {
      var id = a.getAttribute('href');
      if (!id || id === '#') return;
      var t = document.querySelector(id);
      if (!t) return;
      ev.preventDefault();
      try {
        if (window.__lenis) window.__lenis.scrollTo(t, { offset: -90, duration: 1.4 });
        else t.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } catch (e) { t.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
      history.replaceState(null, '', id);
    });
  });

  // ---------- Sliders: smooth autoplay (ping-pong) + manual controls ----------
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function autoplaySlider(trackId, prevBtn, nextBtn, opts) {
    var track = document.getElementById(trackId);
    if (!track) return;
    opts = opts || {};
    var speed = opts.speed || 0.55; // px per frame @60fps
    var dwell = opts.dwell || 1400; // ms pause at edges before turning
    var resumeDelay = opts.resumeDelay || 5000; // ms pause after manual nav
    var dir = opts.dir || -1;
    var running = true;
    var paused = false;
    var inView = true;
    var dwellingUntil = 0;
    var stuckFrames = 0;
    var last = performance.now();
    var resumeTimer = null;

    track.style.scrollBehavior = 'auto';
    track.classList.add('autoplay-track');

    function stepWidth() {
      var card = track.querySelector(':scope > *');
      if (!card) return 340;
      var cs = getComputedStyle(track);
      var gap = parseFloat(cs.columnGap || cs.gap || '24');
      return card.getBoundingClientRect().width + (isNaN(gap) ? 24 : gap);
    }
    function scheduleResume(ms) {
      clearTimeout(resumeTimer);
      resumeTimer = setTimeout(function () { running = true; }, ms);
    }
    function manual(d) {
      track.scrollBy({ left: d * stepWidth(), behavior: 'smooth' });
      running = false;
      scheduleResume(resumeDelay);
    }
    if (prevBtn) prevBtn.addEventListener('click', function () { manual(1); }); // RTL: prev = +x
    if (nextBtn) nextBtn.addEventListener('click', function () { manual(-1); });
    ['wheel', 'touchstart', 'pointerdown'].forEach(function (ev) {
      track.addEventListener(ev, function () { running = false; scheduleResume(resumeDelay); }, { passive: true });
    });

    track.addEventListener('mouseenter', function () { paused = true; track.style.scrollSnapType = ''; });
    track.addEventListener('mouseleave', function () { paused = false; });
    track.addEventListener('focusin', function () { paused = true; track.style.scrollSnapType = ''; });
    track.addEventListener('focusout', function () { paused = false; });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { inView = es[0].isIntersecting; }, { threshold: 0.05 }).observe(track);
    }
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) scheduleResume(600);
    });

    function frame(now) {
      requestAnimationFrame(frame);
      if (reduceMotion || !running || paused || !inView || document.hidden) {
        last = now;
        track.style.scrollSnapType = '';
        return;
      }
      if (now < dwellingUntil) { last = now; return; }
      var dt = Math.min((now - last) / 16.666, 3);
      last = now;
      track.style.scrollSnapType = 'none';
      var before = track.scrollLeft;
      track.scrollLeft += dir * speed * dt;
      if (track.scrollLeft === before) {
        // stuck at an edge (works in every RTL scroll model) -> dwell, then turn
        if (++stuckFrames > 5) {
          stuckFrames = 0;
          dir *= -1;
          dwellingUntil = now + dwell;
          track.style.scrollSnapType = '';
        }
      } else {
        stuckFrames = 0;
      }
    }
    setTimeout(function () { last = performance.now(); requestAnimationFrame(frame); }, opts.delay || 0);
  }
  autoplaySlider('products-track',
    document.querySelector('[data-products-prev]'),
    document.querySelector('[data-products-next]'),
    { speed: 0.55, dir: -1, delay: 500 });
  autoplaySlider('articles-slider-track',
    document.querySelector('[data-articles-prev]'),
    document.querySelector('[data-articles-next]'),
    { speed: 0.8, dir: -1, delay: 1400 });

  // ---------- FAQ accordion (div-based markup) ----------
  var faqWrap = document.querySelector('#faq .lg\\:col-span-7, #faq [data-faq-list]');
  if (!faqWrap) {
    var h = document.getElementById('faq');
    if (h) faqWrap = h.querySelector('.flex.flex-col.space-y-3\\.5, .flex.flex-col');
  }
  if (faqWrap) {
    var items = Array.prototype.slice.call(faqWrap.children);
    items.forEach(function (item, idx) {
      if (!item.classList.contains('faq-item')) item.classList.add('faq-item');
      var titleRow = item.querySelector('.flex.items-center.justify-between, .flex');
      var answer = item.querySelector('p');
      var sign = item.querySelector('span:last-child');
      if (answer && !item.querySelector('.faq-answer')) {
        var wrap = document.createElement('div');
        wrap.className = 'faq-answer';
        var inner = document.createElement('div');
        answer.parentNode.insertBefore(wrap, answer);
        wrap.appendChild(inner);
        inner.appendChild(answer);
      }
      if (sign) sign.classList.add('faq-toggle');
      if (item.style.cursor !== 'pointer') item.style.cursor = 'pointer';
      if (idx === 0) item.classList.add('open');
      item.addEventListener('click', function () {
        var isOpen = item.classList.contains('open');
        items.forEach(function (it) { it.classList.remove('open'); });
        if (!isOpen) item.classList.add('open');
      });
    });
  }

  // ---------- Active nav link ----------
  var links = Array.prototype.slice.call(document.querySelectorAll('.nav-link'));
  var map = {};
  links.forEach(function (l) {
    var href = l.getAttribute('href');
    if (href && href.charAt(0) === '#') map[href.slice(1)] = l;
  });
  var secIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting && map[e.target.id]) {
        links.forEach(function (l) { l.classList.remove('active'); });
        map[e.target.id].classList.add('active');
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  Object.keys(map).forEach(function (id) {
    var s = document.getElementById(id);
    if (s) secIO.observe(s);
  });

  // ---------- Headings blur-in + staggered grids ----------
  try {
    document.querySelectorAll('main section h2').forEach(function (h) { h.classList.add('reveal-blur'); });
    var staggerGroups = document.querySelectorAll('#models .grid > div, #faq [data-faq-list] > div');
    staggerGroups.forEach(function (el) {
      var sibs = Array.prototype.slice.call(el.parentNode.children);
      var idx = sibs.indexOf(el);
      el.classList.add('reveal');
      el.style.setProperty('--reveal-delay', (idx * 90) + 'ms');
      io.observe(el);
    });
  } catch (e) { /* no-op */ }

  // ---------- Hero 3D exploded view (scroll-driven) ----------
  var finePointer = window.matchMedia('(pointer: fine)').matches;
  var heroSection = document.getElementById('home');
  var heroCard = heroSection ? heroSection.querySelector('.max-w-7xl') : null;
  var heroStack = document.getElementById('hero-stack');
  var heroImgEl = document.getElementById('hero-img');
  var heroSlices = [];
  var heroManual = 0; // 0..1 from range control
  var heroRX = 0, heroRY = 0, heroTRX = 0, heroTRY = 0;
  var SLICES = 7;

  function buildHero() {
    if (window.__wall3d || !heroStack || !heroImgEl) return;
    if (!heroImgEl.complete || heroImgEl.naturalWidth === 0) return;
    var src = heroImgEl.getAttribute('src');
    var H = 100 / SLICES;
    for (var i = 0; i < SLICES; i++) {
      var slice = document.createElement('div');
      slice.className = 'hero-slice';
      slice.style.top = (i * H) + '%';
      slice.style.height = H + '%';
      var inner = document.createElement('div');
      inner.className = 'hero-slice-inner';
      inner.style.height = (SLICES * 100) + '%';
      inner.style.top = (-(i * 100)) + '%';
      inner.style.backgroundImage = 'url("' + src + '")';
      var edge = document.createElement('div');
      edge.className = 'hero-slice-edge';
      slice.appendChild(inner);
      slice.appendChild(edge);
      heroStack.appendChild(slice);
      heroSlices.push({ el: slice, edge: edge, i: i });
    }
    document.getElementById('hero-3d').classList.add('built');
  }
  if (heroImgEl) {
    if (heroImgEl.complete) buildHero();
    else heroImgEl.addEventListener('load', buildHero);
  }

  // explode control pill (injected, no markup risk)
  var explodeRange = null, explodeVal = null;
  if (heroCard) {
    var ctrl = document.createElement('div');
    ctrl.className = 'hero-explode-ctrl';
    ctrl.setAttribute('dir', 'rtl');
    ctrl.innerHTML = '<span>نمای انفجاری</span>';
    explodeRange = document.createElement('input');
    explodeRange.type = 'range';
    explodeRange.min = '0'; explodeRange.max = '100'; explodeRange.value = '0';
    explodeRange.setAttribute('aria-label', 'نمای انفجاری قطعات');
    explodeVal = document.createElement('span');
    explodeVal.className = 'hero-explode-val';
    explodeVal.textContent = '۰٪';
    var faDigits = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
    explodeRange.addEventListener('input', function () {
      heroManual = (parseInt(explodeRange.value, 10) || 0) / 100;
      if (window.__setExplodeUI) window.__setExplodeUI(Math.min(1, Math.sin(heroPinProgress() * Math.PI) + heroManual));
    });
    ctrl.appendChild(explodeRange);
    ctrl.appendChild(explodeVal);
    var bar = document.createElement('span');
    bar.className = 'hero-explode-bar';
    var barFill = document.createElement('i');
    bar.appendChild(barFill);
    ctrl.appendChild(bar);
    heroCard.appendChild(ctrl);
    window.__setExplodeUI = function (p) {
      p = Math.min(1, Math.max(0, p));
      var n = Math.round(p * 100);
      var s = String(n).replace(/[0-9]/g, function (d) { return faDigits[+d]; }) + '٪';
      if (explodeVal.textContent !== s) explodeVal.textContent = s;
      barFill.style.width = n + '%';
    };
  }

  function heroPinProgress() {
    // Pinned hero: 0 at enter, 1 at release — drives growth + 3D timeline
    var wrap = document.getElementById('hero-pin');
    if (!wrap) return 0;
    var vh = window.innerHeight;
    var rect = wrap.getBoundingClientRect();
    var total = rect.height - vh;
    if (total <= 0) return 0;
    return Math.min(1, Math.max(0, (-rect.top) / total));
  }

  // phase caption overlay — tiny storytelling pill during the pinned sequence
  var phaseEl = null;
  if (heroCard) {
    phaseEl = document.createElement('div');
    phaseEl.className = 'hero-phase';
    phaseEl.id = 'hero-phase';
    var phaseSpan = document.createElement('span');
    phaseSpan.textContent = 'اسکرول کن تا خشت شکل بگیره';
    phaseEl.appendChild(phaseSpan);
    heroCard.appendChild(phaseEl);
  }
  function heroPhaseFrame() {
    if (!phaseEl || !heroSection) return;
    var pp = heroPinProgress();
    var txt;
    if (window.__cine) {
      txt = pp < 0.12 ? 'از ذره تا سازه — اسکرول کن' : pp < 0.30 ? 'شکل‌گیری خشت' : pp < 0.48 ? 'برش و جداسازی' : pp < 0.68 ? 'پرواز ماژول‌ها' : pp < 0.88 ? 'شکل‌گیری سازه' : 'ورود به سازه';
    } else {
      txt = pp < 0.12 ? 'اسکرول کن تا قطعات باز بشن' : pp < 0.45 ? 'نمای انفجاری — جداسازی آجرها' : pp < 0.75 ? 'اوج انفجار قطعات' : 'بازسازی دیوار';
    }
    if (phaseEl.firstChild.textContent !== txt) phaseEl.firstChild.textContent = txt;
    phaseEl.style.opacity = (pp > 0.015 && pp < 0.985) ? '1' : '0';
  }

  if (finePointer && heroCard) {
    heroCard.addEventListener('mousemove', function (ev) {
      var r = heroCard.getBoundingClientRect();
      heroTRY = ((ev.clientX - r.left) / r.width - 0.5) * 14;
      heroTRX = -((ev.clientY - r.top) / r.height - 0.5) * 10;
    });
    heroCard.addEventListener('mouseleave', function () { heroTRX = 0; heroTRY = 0; });
  }

  function heroFrame() {
    if (window.__wall3d || !heroSection || heroSlices.length === 0) return;
    var vh = window.innerHeight;
    var rect = heroSection.getBoundingClientRect();
    if (rect.bottom < -100 || rect.top > vh + 100) return;
    var explode = Math.min(1, Math.sin(heroPinProgress() * Math.PI) + heroManual);
    if (window.__setExplodeUI) window.__setExplodeUI(explode);
    heroRX += (heroTRX - heroRX) * 0.08;
    heroRY += (heroTRY - heroRY) * 0.08;
    heroStack.style.transform = 'rotateX(' + heroRX.toFixed(2) + 'deg) rotateY(' + heroRY.toFixed(2) + 'deg)';
    var center = (SLICES - 1) / 2;
    for (var k = 0; k < heroSlices.length; k++) {
      var s = heroSlices[k];
      var off = s.i - center;
      var y = off * explode * 34;
      var z = Math.abs(off) * explode * 72;
      s.el.style.transform = 'translate3d(0,' + y.toFixed(1) + 'px,' + z.toFixed(1) + 'px)';
      s.edge.style.opacity = explode.toFixed(2);
    }
  }

  // ---------- Quora-like scroll motion: parallax + zoom + watermark (single rAF loop) ----------
  var parallaxEls = [];
  try {
    var heroIntro = heroSection ? heroSection.querySelector('.max-w-sm') : null;
    if (heroIntro) parallaxEls.push({ el: heroIntro, speed: 0.06 });
    document.querySelectorAll('main section h2').forEach(function (h) {
      parallaxEls.push({ el: h, speed: 0.04 });
    });
    // hero visual drifts slower than text (depth like Framer hero)
    var heroVisual = document.getElementById('hero-visual');
    if (heroVisual) parallaxEls.push({ el: heroVisual, speed: -0.08 });
  } catch (e) { /* no-op */ }
  var zoomImgs = [];
  try {
    zoomImgs = Array.prototype.slice.call(document.querySelectorAll('#models img, #learning img'));
  } catch (e) { /* no-op */ }
  var watermark = null;
  try { watermark = document.querySelector('.footer-watermark'); } catch (e) { /* no-op */ }

  var scrollTicking = false;
  function scrollLoop() {
    scrollTicking = false;
    heroFrame();
    heroPhaseFrame();
    var vh = window.innerHeight;
    // hero card grows with scroll while pinned: 0.86 -> 1 -> release
    if (heroCard && heroSection) {
      try {
        var pinP = heroPinProgress();
        var rect = heroSection.getBoundingClientRect();
        var pinned = rect.top <= 1 && rect.top > -(window.innerHeight * 3);
        if (pinned) {
          var grow = 0.88 + 0.12 * Math.min(1, pinP * 1.6);
          heroCard.style.transform = 'scale(' + grow.toFixed(4) + ')';
        } else if (rect.top > 1) {
          heroCard.style.transform = '';
        }
      } catch (e) { /* no-op */ }
    }
    for (var i = 0; i < parallaxEls.length; i++) {
      (function (p) {
        if (p.el.classList.contains('reveal') && !p.el.classList.contains('reveal-visible')) return;
        if (p.el.hasAttribute && p.el.hasAttribute('data-hero') && !p.el.classList.contains('hero-in')) return;
        var r = p.el.getBoundingClientRect();
        if (r.bottom < -100 || r.top > vh + 100) return;
        var off = (r.top + r.height / 2 - vh / 2) * p.speed;
        // keep hero entrance transform intact: combine with parallax via margin-insensitive translate
        p.el.style.translate = '0 ' + (-off).toFixed(1) + 'px';
      })(parallaxEls[i]);
    }
    for (var j = 0; j < zoomImgs.length; j++) {
      (function (img) {
        var box = img.parentNode.getBoundingClientRect();
        if (box.bottom < -100 || box.top > vh + 100) return;
        var vis = Math.min(1, Math.max(0, (vh - box.top) / (vh + box.height)));
        img.style.transform = 'scale(' + (1 + vis * 0.12).toFixed(3) + ')';
      })(zoomImgs[j]);
    }
    // Quora giant wordmark drifts horizontally with scroll (Framer useTransform feel)
    if (watermark) {
      try {
        var wr = watermark.getBoundingClientRect();
        if (wr.top < vh + 200 && wr.bottom > -200) {
          var wp = Math.min(1, Math.max(0, (vh - wr.top) / (vh + wr.height)));
          var dx = (wp - 0.5) * 120; // -60..60px drift
          watermark.style.transform = 'translateX(' + dx.toFixed(1) + 'px)';
        }
      } catch (e) { /* no-op */ }
    }
  }
  function requestScrollLoop() {
    if (!scrollTicking) { scrollTicking = true; requestAnimationFrame(scrollLoop); }
  }
  window.addEventListener('scroll', requestScrollLoop, { passive: true });
  window.addEventListener('resize', requestScrollLoop);
  requestScrollLoop();

  // ---------- 3D tilt on cards + magnetic hero CTA ----------
  if (finePointer && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('#products-track > div, #articles-slider-track > article').forEach(function (card) {
      card.setAttribute('data-tilt', '');
      card.addEventListener('mousemove', function (ev) {
        var r = card.getBoundingClientRect();
        var ry = ((ev.clientX - r.left) / r.width - 0.5) * 10;
        var rx = -((ev.clientY - r.top) / r.height - 0.5) * 10;
        card.style.transform = 'perspective(800px) rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg) translateY(-4px)';
      });
      card.addEventListener('mouseleave', function () { card.style.transform = ''; });
    });
    var cta = heroSection ? heroSection.querySelector('a[href="#preorder"]') : null;
    if (cta) {
      cta.addEventListener('mousemove', function (ev) {
        var r = cta.getBoundingClientRect();
        var x = (ev.clientX - r.left - r.width / 2) * 0.15;
        var y = (ev.clientY - r.top - r.height / 2) * 0.25;
        cta.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)';
      });
      cta.addEventListener('mouseleave', function () { cta.style.transform = ''; });
    }
  }
})();
