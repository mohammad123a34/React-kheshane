/* Kheshtaneh motion3.js 3/3: micro-interactions + custom cursor */
(function () {
  'use strict';
  function boot() {
    if (!window.gsap) { setTimeout(boot, 120); return; }
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var finePointer = window.matchMedia('(pointer: fine)').matches;
    var isMobile = Math.min(window.innerWidth, window.innerHeight) < 640;
    var isRTL = document.documentElement.dir === 'rtl';
    if (reduceMotion) return;
    try {
      if (finePointer && !isMobile) {
        document.querySelectorAll('a[href="#preorder"], a[href="#cart"]').forEach(function (btn) {
          btn.addEventListener('mouseenter', function () {
            gsap.to(btn, { y: -2, duration: 0.25, ease: 'power2.out' });
            var arrow = btn.querySelector('span:last-child');
            if (arrow) gsap.to(arrow, { x: isRTL ? 4 : -4, duration: 0.25, ease: 'power2.out' });
          });
          btn.addEventListener('mouseleave', function () {
            gsap.to(btn, { y: 0, duration: 0.35, ease: 'power3.out' });
            var arrow2 = btn.querySelector('span:last-child');
            if (arrow2) gsap.to(arrow2, { x: 0, duration: 0.35, ease: 'power3.out' });
          });
        });
      }
    } catch (e) {}
    try {
      var cursor = document.getElementById('cursor');
      if (cursor && finePointer && !isMobile) {
        cursor.classList.add('on');
        var cx = gsap.quickTo(cursor, 'left', { duration: 0.18, ease: 'power3.out' });
        var cy = gsap.quickTo(cursor, 'top', { duration: 0.18, ease: 'power3.out' });
        window.addEventListener('mousemove', function (ev) { cx(ev.clientX); cy(ev.clientY); }, { passive: true });
        document.querySelectorAll('a, button, summary').forEach(function (el) {
          el.addEventListener('mouseenter', function () { cursor.classList.add('is-link'); });
          el.addEventListener('mouseleave', function () { cursor.classList.remove('is-link'); });
        });
        document.querySelectorAll('#models img, #learning img, #products-track img').forEach(function (el) {
          el.addEventListener('mouseenter', function () { cursor.classList.add('is-view'); });
          el.addEventListener('mouseleave', function () { cursor.classList.remove('is-view'); });
        });
      }
    } catch (e) {}
  }
  if (document.readyState === 'complete') boot();
  else window.addEventListener('load', boot);
})();