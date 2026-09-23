/* Kheshtaneh motion.js — FOUNDATION: boot, Lenis, hero intro+outro.
   Single owner of GSAP context. Guards: CDN fail -> silent exit (main.js covers).
   Respects reduced-motion, mobile softening, RTL. No competing rAF loops. */
(function () {
  'use strict';
  function boot() {
    if (!window.gsap || !window.ScrollTrigger) return; // CDN blocked: main.js fallback owns page
    gsap.registerPlugin(ScrollTrigger);
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var finePointer = window.matchMedia('(pointer: fine)').matches;
    var smallScreen = Math.min(window.innerWidth, window.innerHeight) < 640;
    window.__PARA = smallScreen ? 0.35 : 1;
    window.__RM = reduceMotion;
    window.__FINE = finePointer;
    var PARA = window.__PARA;

    // Lenis <-> GSAP ticker sync (single loop, no lag smoothing fights)
    try {
      if (!reduceMotion && window.Lenis && !window.__lenis) {
        var lenis = new Lenis({ lerp: 0.11, smoothWheel: true });
        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
        gsap.ticker.lagSmoothing(0);
        window.__lenis = lenis;
      }
    } catch (e) { /* Lenis optional: native scroll stays */ }

    window.__motionCtx = gsap.context(function () {
      // HERO intro: word-mask reveal (split AFTER fonts, no FOUC)
      try {
        var heroLines = document.querySelectorAll('#home .hero-huge-text');
        heroLines.forEach(function (line) {
          if (line.querySelector('.split-mask')) return;
          var words = line.textContent.trim().split(/\s+/);
          line.innerHTML = words.map(function (w) {
            return '<span class="split-mask"><span class="split-word">' + w + '</span></span>';
          }).join(' ');
        });
        var heroWords = document.querySelectorAll('#home .split-word');
        if (heroWords.length && !reduceMotion) {
          gsap.set(heroWords, { yPercent: 110, opacity: 0, filter: 'blur(10px)' });
          gsap.to(heroWords, { yPercent: 0, opacity: 1, filter: 'blur(0px)', duration: 1.2, ease: 'expo.out', stagger: 0.09, delay: 0.25 });
        } else if (heroWords.length && reduceMotion) {
          gsap.set(heroWords, { yPercent: 0, opacity: 1, filter: 'blur(0px)' });
        }
        var heroVisual = document.getElementById('hero-visual');
        if (heroVisual && !reduceMotion) {
          gsap.fromTo(heroVisual, { scale: 1.08, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.6, ease: 'expo.out', delay: 0.45 });
        }
        var heroCtas = document.querySelectorAll('#home a[href="#preorder"], #home .max-w-sm');
        if (heroCtas.length && !reduceMotion) {
          gsap.fromTo(heroCtas, { y: 26, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'power3.out', stagger: 0.12, delay: 0.8 });
        }
      } catch (e) { /* hero stays readable */ }
      // HERO scroll exit: card settles, text lifts (scrubbed to pin)
      try {
        if (!reduceMotion) {
          var heroCard = document.querySelector('#home .hero-card');
          var heroText = document.querySelectorAll('#home [data-hero]');
          if (heroCard) gsap.to(heroCard, { scale: 0.96, opacity: 0.55, ease: 'power2.inOut', scrollTrigger: { trigger: '#hero-pin', start: '55% top', end: 'bottom bottom', scrub: 0.8 } });
          if (heroText.length) gsap.to(heroText, { y: -60 * PARA, ease: 'power2.inOut', scrollTrigger: { trigger: '#hero-pin', start: '30% top', end: 'bottom top', scrub: 0.8 } });
        }
      } catch (e) {}
    });
    window.addEventListener('load', function () { try { ScrollTrigger.refresh(); } catch (e) {} });
    window.__motionCleanup = function () { try { window.__motionCtx.revert(); } catch (e) {} };
  }
  if (document.readyState === 'complete') boot();
  else window.addEventListener('load', boot);
})();