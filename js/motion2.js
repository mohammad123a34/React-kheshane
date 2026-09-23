/* Kheshtaneh motion2.js — SECTIONS: typography, images, transitions, horizontal, finale.
   Each section owns its motion identity. Waits for motion.js context. Skips on RM. */
(function () {
  'use strict';
  function boot() {
    if (!window.gsap || !window.ScrollTrigger || !window.__motionCtx) { setTimeout(boot, 120); return; }
    if (window.__RM) return; // reduced motion: main.js simple reveals own everything
    var isMobile = Math.min(window.innerWidth, window.innerHeight) < 640;
    var isRTL = document.documentElement.dir === 'rtl';
    var PARA = window.__PARA || 1;
    window.__motionCtx.add(function () {
      // TYPOGRAPHY: word-mask reveal per h2 + faint scrub drift (no char splitting)
      try {
        document.querySelectorAll('main section h2').forEach(function (h) {
          if (h.closest('#home') || h.querySelector('.split-mask')) return;
          var words = h.textContent.trim().split(/\s+/);
          if (words.length < 2) return; // single-word headings keep static dignity
          h.innerHTML = words.map(function (w) { return '<span class="split-mask"><span class="split-word">' + w + '</span></span>'; }).join(' ');
          var ws = h.querySelectorAll('.split-word');
          gsap.set(ws, { yPercent: 90, opacity: 0, filter: 'blur(8px)' });
          gsap.to(ws, { yPercent: 0, opacity: 1, filter: 'blur(0px)', duration: 1, ease: 'expo.out', stagger: 0.07, scrollTrigger: { trigger: h, start: 'top 82%', once: true } });
          gsap.to(h, { y: -14 * PARA, ease: 'none', scrollTrigger: { trigger: h, start: 'top bottom', end: 'bottom top', scrub: 1 } });
        });
      } catch (e) {}
      // IMAGES: editorial clip reveal + container/image counter-motion (depth, not float)
      try {
        document.querySelectorAll('#learning img, #models img, #about img, #news img').forEach(function (img) {
          var box = img.parentElement;
          if (!box || box.dataset.motionImg) return;
          box.dataset.motionImg = '1';
          gsap.set(box, { clipPath: 'inset(8% 6% 8% 6% round 24px)', overflow: 'hidden' });
          gsap.set(img, { scale: 1.12 });
          ScrollTrigger.create({ trigger: box, start: 'top 85%', once: true, onEnter: function () {
            gsap.to(box, { clipPath: 'inset(0% 0% 0% 0% round 24px)', duration: 1.2, ease: 'expo.out' });
            gsap.to(img, { scale: 1, duration: 1.4, ease: 'expo.out' });
          }});
          gsap.fromTo(img, { y: 24 * PARA }, { y: -24 * PARA, ease: 'none', scrollTrigger: { trigger: box, start: 'top bottom', end: 'bottom top', scrub: 1 } });
        });
      } catch (e) {}
      // SECTION transitions: quiet rise (once) + trust layer drift
      try {
        document.querySelectorAll('main > section').forEach(function (sec) {
          if (sec.id === 'home' || sec.dataset.motionSec) return;
          sec.dataset.motionSec = '1';
          gsap.fromTo(sec, { y: 36, opacity: 0.55 }, { y: 0, opacity: 1, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: sec, start: 'top 88%', once: true } });
        });
        var trustGrid = document.querySelector('#trust .grid');
        if (trustGrid) gsap.fromTo(trustGrid, { y: 30 * PARA }, { y: -20 * PARA, ease: 'none', scrollTrigger: { trigger: '#trust', start: 'top bottom', end: 'bottom top', scrub: 1 } });
      } catch (e) {}
      // HORIZONTAL products: vertical scroll rides cards (desktop only, guarded)
      try {
        var track = document.getElementById('products-track');
        var showcase = document.getElementById('products-showcase');
        if (track && showcase && !isMobile && !track.dataset.motionH) {
          track.dataset.motionH = '1';
          track.classList.add('htrack');
          var wrap = document.createElement('div');
          wrap.className = 'hwrap';
          track.parentNode.insertBefore(wrap, track);
          wrap.appendChild(track);
          var getDist = function () { return Math.max(0, track.scrollWidth - wrap.clientWidth); };
          var dirSign = isRTL ? 1 : -1; // RTL track travels opposite
          gsap.to(track, { x: function () { return dirSign * getDist(); }, ease: 'none',
            scrollTrigger: { trigger: showcase, start: 'top top+=80', end: function () { return '+=' + (getDist() + 400); }, pin: true, scrub: 0.9, invalidateOnRefresh: true, anticipatePin: 1 } });
        }
      } catch (e) { /* products keep autoplay fallback */ }
      try {
        var wm = document.querySelector('.footer-watermark');
        if (wm) gsap.fromTo(wm, { x: isRTL ? 60 : -60 }, { x: isRTL ? -60 : 60, ease: 'none', scrollTrigger: { trigger: wm, start: 'top bottom', end: 'bottom top', scrub: 1 } });
        var ctaBox = document.querySelector('#contact footer');
        if (ctaBox) {
          var glow = document.createElement('div');
          glow.className = 'cta-glow';
          ctaBox.style.position = 'relative';
          ctaBox.insertBefore(glow, ctaBox.firstChild);
          gsap.fromTo(glow, { opacity: 0.4, scale: 0.96 }, { opacity: 1, scale: 1.04, ease: 'none', scrollTrigger: { trigger: ctaBox, start: 'top bottom', end: 'bottom top', scrub: 1 } });
        }
      } catch (e) {}
    });
    try { ScrollTrigger.refresh(); } catch (e) {}
  }
  if (document.readyState === 'complete') boot();
  else window.addEventListener('load', boot);
})();