/* KHESHTANEH — cine.js: award-level scroll-driven cinematic hero.
   ACT I   micro clay particles drifting in atmosphere
   ACT II  particles converge & form a premium adobe brick
   ACT III brick rotates, cuts open, separates into modules
   ACT IV  modules assemble into an abstract Persian-modern composition
   ACT V   camera journey through the structure, entering the packages world
   Scroll (pinned hero) drives the whole timeline. Graceful fallback if no WebGL. */
(function () {
  'use strict';

  function fail() {
    var w = document.getElementById('wall3d');
    if (w) w.style.display = 'none';
  }
  if (!window.THREE) return fail();

  var wrap = document.getElementById('wall3d');
  var canvas = document.getElementById('wall3d-canvas');
  var heroSection = document.getElementById('home');
  var heroCard = heroSection ? heroSection.querySelector('.max-w-7xl') : null;
  var stage = document.getElementById('hero-3d');
  if (!wrap || !canvas || !heroSection || !stage) return fail();

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var narrow = Math.min(window.innerWidth, window.innerHeight) < 640;

  function sstep(a, b, x) {
    x = Math.min(1, Math.max(0, (x - a) / (b - a)));
    return x * x * (3 - 2 * x);
  }
  function lerp(a, b, t) { return a + (b - a) * t; }

  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  } catch (e) { return fail(); }
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, narrow ? 1.5 : 2));

  var scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xf6e7cf, 16, 34);
  var camera = new THREE.PerspectiveCamera(narrow ? 42 : 35, 1, 0.1, 120);

  // ---------- cinematic lighting: large soft key, cool rim, warm fill ----------
  scene.add(new THREE.HemisphereLight(0xfff4e6, 0x8a6a4f, 0.75));
  var key = new THREE.DirectionalLight(0xffe9c8, 1.0);
  key.position.set(7, 13, 9);
  key.castShadow = true;
  key.shadow.mapSize.set(narrow ? 1024 : 2048, narrow ? 1024 : 2048);
  key.shadow.camera.left = -10; key.shadow.camera.right = 10;
  key.shadow.camera.top = 12; key.shadow.camera.bottom = -4;
  key.shadow.camera.far = 60;
  key.shadow.bias = -0.0004;
  key.shadow.normalBias = 0.02;
  scene.add(key);
  var rim = new THREE.DirectionalLight(0xa9c0ff, 0.25);
  rim.position.set(-7, 6, -10);
  scene.add(rim);
  var fill = new THREE.DirectionalLight(0xffd9b0, 0.3);
  fill.position.set(-4, 2, 8);
  scene.add(fill);

  // ---------- clay material (physically-based, rough, imperfect) ----------
  function clayMat(h, s, l) {
    var c = new THREE.Color().setHSL(h, s, l);
    c.convertSRGBToLinear();
    return new THREE.MeshStandardMaterial({ color: c, roughness: 0.92, metalness: 0.0 });
  }
  // premium rounded slab via extruded rounded rect (bevel = soft product edges)
  function roundedSlab(w, h, d, r, mat) {
    var s = new THREE.Shape();
    var x = -w / 2, y = -h / 2;
    s.moveTo(x + r, y);
    s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
    s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
    s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
    var g = new THREE.ExtrudeGeometry(s, {
      depth: Math.max(0.05, d - r * 2), bevelEnabled: true,
      bevelThickness: r, bevelSize: r * 0.9, bevelSegments: 2, curveSegments: 6
    });
    g.center();
    var m = new THREE.Mesh(g, mat);
    m.castShadow = true; m.receiveShadow = true;
    return m;
  }

  var world = new THREE.Group();
  scene.add(world);

  // ================= ACT I — micro clay particles =================
  var P_COUNT = narrow ? 150 : 380;
  var pGeo = new THREE.DodecahedronGeometry(1, 0);
  var pMat = new THREE.MeshStandardMaterial({ roughness: 0.95, metalness: 0, transparent: true });
  var particles = new THREE.InstancedMesh(pGeo, pMat, P_COUNT);
  particles.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  particles.castShadow = false; particles.receiveShadow = false;
  world.add(particles);

  var BC = new THREE.Vector3(0, 1.5, -0.2); // brick centre, staged in its own zone
  var BW = 3.4, BH = 1.6, BD = 1.8;
  var pBase = [], pAmp = [], pSpd = [], pPh = [], pTgt = [], pDly = [], pScl = [], pRot = [];
  var tmpC = new THREE.Color();
  for (var i = 0; i < P_COUNT; i++) {
    var th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1);
    var rr = 2.2 + Math.random() * 4.2;
    pBase.push(new THREE.Vector3(
      BC.x + rr * Math.sin(ph) * Math.cos(th),
      BC.y + (Math.random() - 0.5) * 4.5,
      rr * Math.sin(ph) * Math.sin(th) * 0.45
    ));
    pAmp.push(0.15 + Math.random() * 0.3);
    pSpd.push(0.12 + Math.random() * 0.22);
    pPh.push(Math.random() * Math.PI * 2);
    pTgt.push(new THREE.Vector3(
      BC.x + (Math.random() - 0.5) * BW * 0.96,
      BC.y + (Math.random() - 0.5) * BH * 0.96,
      (Math.random() - 0.5) * BD * 0.96
    ));
    pDly.push(Math.random());
    pScl.push(0.05 + Math.random() * 0.17);
    pRot.push({ x: Math.random() * 3, y: Math.random() * 3, rx: (Math.random() - 0.5) * 1.4, ry: (Math.random() - 0.5) * 1.4 });
    tmpC.setHSL(0.07 + Math.random() * 0.035, 0.4 + Math.random() * 0.22, 0.42 + Math.random() * 0.2);
    tmpC.convertSRGBToLinear();
    particles.setColorAt(i, tmpC);
  }
  particles.instanceColor.needsUpdate = true;

  // ================= ACT II — the premium brick (8 flush modules = visible seams) =================
  var SEG_W = BW / 4, SEG_H = BH / 2;
  var segMat = clayMat(0.078, 0.52, 0.55);
  var segs = [];
  var sh = 0;
  for (var r = 0; r < 2; r++) {
    for (var c = 0; c < 4; c++) {
      (function (cc, rr2) {
        var m = roundedSlab(SEG_W - 0.024, SEG_H - 0.024, BD, 0.06, segMat);
        world.add(m);
        segs.push({
          mesh: m,
          lx: (cc - 1.5) * SEG_W, ly: (rr2 - 0.5) * SEG_H,
          spin: (sh % 2 === 0 ? 1 : -1) * (0.5 + Math.random() * 0.7)
        });
        sh++;
      })(c, r);
    }
  }
  // scatter directions: tight composed cluster, biased away from the text side
  var SCATTER = [
    new THREE.Vector3(-2.4, 1.2, 3.0), new THREE.Vector3(1.8, 1.6, 4.0),
    new THREE.Vector3(0.3, 2.7, -3.1), new THREE.Vector3(-3.1, -0.3, 0.9),
    new THREE.Vector3(2.6, 0.5, -0.9), new THREE.Vector3(0.9, 2.3, 2.5),
    new THREE.Vector3(-1.7, 3.1, -2.3), new THREE.Vector3(0.1, -1.9, 1.6)
  ];
  // ACT IV slots — abstract iwan-gate composition (Persian-modern brutalism)
  var SLOTS = [
    { p: new THREE.Vector3(-2.7, 2.1, -0.8), s: new THREE.Vector3(1.25, 4.6, 1.25), ry: 0 },
    { p: new THREE.Vector3(-0.1, 2.1, -0.8), s: new THREE.Vector3(1.25, 4.6, 1.25), ry: 0 },
    { p: new THREE.Vector3(-1.4, 4.35, -0.8), s: new THREE.Vector3(4.4, 1.15, 1.15), ry: 0 },
    { p: new THREE.Vector3(-1.4, 0.28, 0.2), s: new THREE.Vector3(3.2, 0.7, 2.4), ry: 0 },
    { p: new THREE.Vector3(-1.4, 0.75, -0.1), s: new THREE.Vector3(2.2, 0.6, 1.8), ry: 0 },
    { p: new THREE.Vector3(0.9, 2.9, 0.9), s: new THREE.Vector3(2.4, 0.5, 1.5), ry: 0.3 },
    { p: new THREE.Vector3(-3.4, 3.4, -1.6), s: new THREE.Vector3(1.15, 1.15, 1.15), ry: 0.5 },
    { p: new THREE.Vector3(-1.4, 1.7, -3.4), s: new THREE.Vector3(3.8, 3.4, 0.45), ry: 0 }
  ];
  // keystone arch (Persian arch nod) fades in behind
  var archMat = clayMat(0.075, 0.48, 0.5);
  archMat.transparent = true; archMat.opacity = 0;
  var arch = new THREE.Mesh(new THREE.TorusGeometry(2.8, 0.3, 12, 42, Math.PI), archMat);
  arch.position.set(-1.4, 0.2, -3.8);
  arch.castShadow = true;
  world.add(arch);

  // soft grounding shadow — the composition feels "placed", not thrown
  var shC = document.createElement('canvas'); shC.width = shC.height = 256;
  var shG = shC.getContext('2d');
  var grd = shG.createRadialGradient(128, 128, 10, 128, 128, 128);
  grd.addColorStop(0, 'rgba(66,43,27,0.42)');
  grd.addColorStop(1, 'rgba(66,43,27,0)');
  shG.fillStyle = grd; shG.fillRect(0, 0, 256, 256);
  var groundShadow = new THREE.Mesh(
    new THREE.PlaneGeometry(11, 6.5),
    new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(shC), transparent: true, depthWrite: false, opacity: 0.85 })
  );
  groundShadow.rotation.x = -Math.PI / 2;
  groundShadow.position.set(-1.0, 0.02, -0.5);
  world.add(groundShadow);

  // ================= ACT V — camera journey =================
  var camCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(3.2, 1.0, 7.5),
    new THREE.Vector3(4.6, 2.2, 10.0),
    new THREE.Vector3(2.0, 1.8, 8.2),
    new THREE.Vector3(-4.8, 2.6, 9.0),
    new THREE.Vector3(-1.6, 1.6, 4.6),
    new THREE.Vector3(-1.4, 1.7, 0.9)
  ]);
  var lookKeys = [
    new THREE.Vector3(0, 0.8, 0), new THREE.Vector3(-0.3, 1.2, -0.3),
    new THREE.Vector3(-0.6, 1.2, -0.5), new THREE.Vector3(-1.2, 1.8, -0.8),
    new THREE.Vector3(-1.3, 1.6, -1.5), new THREE.Vector3(-1.4, 1.6, -3.0)
  ];
  var lookShiftX = 0; // staged zone already keeps text side clean
  function camLook(p, out) {
    var f = Math.min(4.999, Math.max(0, p * 5));
    var k = Math.floor(f), t = f - k;
    t = t * t * (3 - 2 * t);
    out.copy(lookKeys[k]).lerp(lookKeys[k + 1], t);
    out.x += lookShiftX;
    return out;
  }

  // ---------- overlays: vignette + seamless wipe into packages ----------
  var vignette = document.createElement('div');
  vignette.className = 'cine-vignette';
  vignette.setAttribute('aria-hidden', 'true');
  heroCard.appendChild(vignette);
  var wipe = document.createElement('div');
  wipe.id = 'cine-wipe';
  wipe.setAttribute('aria-hidden', 'true');
  heroCard.appendChild(wipe);

  // ---------- mouse parallax (damped, inertial) ----------
  var mx = 0, my = 0, tmx = 0, tmy = 0;
  if (window.matchMedia('(pointer: fine)').matches && !reduceMotion && heroCard) {
    heroCard.addEventListener('mousemove', function (ev) {
      var r = heroCard.getBoundingClientRect();
      tmx = ((ev.clientX - r.left) / r.width - 0.5) * 2;
      tmy = ((ev.clientY - r.top) / r.height - 0.5) * 2;
    });
    heroCard.addEventListener('mouseleave', function () { tmx = 0; tmy = 0; });
  }
  canvas.style.cursor = 'default';

  // ---------- manual separation boost (existing pill) ----------
  function manualBoost() {
    var r = document.getElementById('explode-range');
    if (!r) return 0;
    return (parseInt(r.value, 10) || 0) / 100;
  }
  // Scroll-driven timeline: pin progress drives the whole 5-act story.
  // 0 = particles, ~0.6 = composed architecture, ~1 = camera journey + wipe.
  function pinProgress() {
    var w = document.getElementById('hero-pin');
    if (!w) return 0;
    var vh = window.innerHeight;
    var rect = w.getBoundingClientRect();
    var total = rect.height - vh;
    if (total <= 0) return 0;
    return Math.min(1, Math.max(0, (-rect.top) / total));
  }

  function resize() {
    var wpx = wrap.clientWidth || 1, hpx = wrap.clientHeight || 1;
    renderer.setSize(wpx, hpx, false);
    camera.aspect = wpx / hpx;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);
  resize();

  // ---------- per-frame ----------
  var tmpM = new THREE.Matrix4(), tmpP = new THREE.Vector3(), tmpQ = new THREE.Quaternion(),
      tmpE = new THREE.Euler(), tmpS = new THREE.Vector3(), tmpL = new THREE.Vector3(),
      tmpLook = new THREE.Vector3();
  var T = reduceMotion ? 0 : Math.random() * 100;
  var firstFrame = true, frameCount = 0;

  window.__cine = true;
  window.__wall3d = true; // reuse main.js slice guard

  function frame(now) {
    requestAnimationFrame(frame);
    var rect = heroSection.getBoundingClientRect();
    if (rect.bottom < -200 || rect.top > window.innerHeight + 200) return;
    if (!reduceMotion) T += 0.016;

    // Scroll timeline + tiny idle breathing so hero feels alive even when held
    var scrollP = pinProgress();
    var p = Math.min(1, Math.max(0, scrollP + Math.sin(T * 0.6) * 0.008));
    var boost = manualBoost();
    mx += (tmx - mx) * 0.05; my += (tmy - my) * 0.05;

    // ---- ACT I/II: particles drift, then converge into the brick ----
    var pGone = sstep(0.36, 0.5, p);
    particles.visible = pGone < 1;
    if (particles.visible) {
      for (var i = 0; i < P_COUNT; i++) {
        var dl = Math.min(1, Math.max(0, (p - (0.06 + pDly[i] * 0.18)) / 0.22));
        dl = dl * dl * (3 - 2 * dl);
        var b = pBase[i];
        tmpP.set(
          b.x + Math.sin(T * pSpd[i] + pPh[i]) * pAmp[i],
          b.y + Math.sin(T * pSpd[i] * 1.3 + pPh[i] * 2) * pAmp[i] * 0.8,
          b.z + Math.cos(T * pSpd[i] * 0.8 + pPh[i]) * pAmp[i]
        );
        var tg = pTgt[i];
        tmpP.x = lerp(tmpP.x, tg.x, dl);
        tmpP.y = lerp(tmpP.y, tg.y, dl);
        tmpP.z = lerp(tmpP.z, tg.z, dl);
        var sc = pScl[i] * (1 - 0.3 * dl) * (1 - pGone);
        tmpE.set(pRot[i].x + T * pRot[i].rx, pRot[i].y + T * pRot[i].ry, 0);
        tmpQ.setFromEuler(tmpE);
        tmpS.set(sc, sc, sc);
        tmpM.compose(tmpP, tmpQ, tmpS);
        particles.setMatrixAt(i, tmpM);
      }
      particles.instanceMatrix.needsUpdate = true;
      pMat.opacity = 1 - pGone;
    }

    // ---- brick body: turntable, then split ----
    var rotB = lerp(-0.5, 1.15, sstep(0.02, 0.5, p));
    var eSplit, eForm;
    var cosB = Math.cos(rotB), sinB = Math.sin(rotB);
    for (var s2 = 0; s2 < segs.length; s2++) {
      (function (sg, idx) {
        var stag = (idx % 4) * 0.018;
        eSplit = sstep(0.42 + stag, 0.60 + stag, p);
        eForm = sstep(0.58 + stag, 0.80 + stag, p);
        // brick-space home position (rotated with the brick)
        var homeX = BC.x + sg.lx * cosB;
        var homeZ = -sg.lx * sinB;
        var homeY = BC.y + sg.ly;
        var sc2 = SCATTER[idx].clone().multiplyScalar(1 + boost * 0.9);
        var sx = homeX + sc2.x, sy = homeY + sc2.y, sz = homeZ + sc2.z;
        var sl = SLOTS[idx];
        var ex = lerp(lerp(homeX, sx, eSplit), sl.p.x, eForm);
        var ey = lerp(lerp(homeY, sy, eSplit), sl.p.y, eForm) + Math.sin(T * 0.9 + idx * 1.7) * 0.07 * eForm;
        var ez = lerp(lerp(homeZ, sz, eSplit), sl.p.z, eForm);
        sg.mesh.position.set(ex, ey, ez);
        var ry = lerp(lerp(rotB, rotB + sg.spin, eSplit), sl.ry, eForm);
        sg.mesh.rotation.set(0, ry, 0);
        sg.mesh.scale.set(lerp(1, sl.s.x, eForm), lerp(1, sl.s.y, eForm), lerp(1, sl.s.z, eForm));
      })(segs[s2], s2);
    }

    // ---- keystone arch fades in ----
    var eArch = sstep(0.60, 0.78, p);
    archMat.opacity = eArch;
    arch.visible = eArch > 0;
    arch.scale.setScalar(0.85 + 0.15 * eArch);

    // ---- ACT V: camera journey + seamless wipe into next section ----
    var pe = p * p * (3 - 2 * p);
    camCurve.getPoint(pe, tmpP);
    camLook(p, tmpLook);
    camera.position.set(
      tmpP.x + mx * 0.55,
      tmpP.y - my * 0.35,
      tmpP.z
    );
    camera.lookAt(tmpLook.x + mx * 0.3, tmpLook.y - my * 0.2, tmpLook.z);
    wipe.style.opacity = sstep(0.90, 0.995, p).toFixed(3); // white handoff to next section
    var gSplit = sstep(0.42, 0.62, p);
    groundShadow.material.opacity = (0.85 - 0.3 * gSplit).toFixed(3);
    groundShadow.scale.setScalar(1 + gSplit * 0.2);
    if (window.__setExplodeUI) window.__setExplodeUI(sstep(0.42, 0.62, p));

    renderer.render(scene, camera);
    frameCount++;
    if (frameCount % 30 === 0) {
      wrap.setAttribute('data-frames', String(frameCount));
      wrap.setAttribute('data-act', p < 0.25 ? 'micro' : p < 0.45 ? 'brick' : p < 0.62 ? 'split' : p < 0.82 ? 'architect' : 'journey');
    }
    if (firstFrame) {
      firstFrame = false;
      wrap.classList.add('ready');
      stage.classList.add('mode-3d');
    }
  }
  requestAnimationFrame(frame);
})();
