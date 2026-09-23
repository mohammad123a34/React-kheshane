/* Kheshtaneh — wall3d.js: real 3D wavy brick wall (Three.js) with scroll-driven explode.
   Falls back to the sliced-photo effect in main.js when WebGL/CDN is unavailable. */
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
  var smallScreen = Math.min(window.innerWidth, window.innerHeight) < 640;

  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  } catch (e) { return fail(); }
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, smallScreen ? 1.5 : 2));

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(36, 1, 0.1, 200);
  camera.position.set(12.5, 6.2, 21);
  camera.lookAt(0, 0.2, 0);

  // ---------- lights ----------
  scene.add(new THREE.HemisphereLight(0xfff2e2, 0x8a6a4f, 0.85));
  var key = new THREE.DirectionalLight(0xffe6c4, 1.05);
  key.position.set(8, 15, 10);
  key.castShadow = true;
  key.shadow.mapSize.set(smallScreen ? 1024 : 2048, smallScreen ? 1024 : 2048);
  key.shadow.camera.left = -14; key.shadow.camera.right = 14;
  key.shadow.camera.top = 14; key.shadow.camera.bottom = -6;
  key.shadow.camera.far = 50;
  key.shadow.bias = -0.0004;
  key.shadow.normalBias = 0.02;
  scene.add(key);
  var fill = new THREE.DirectionalLight(0xcfe0ff, 0.35);
  fill.position.set(-9, 6, -7);
  scene.add(fill);
  var rim = new THREE.DirectionalLight(0x9db8ff, 0); // wakes up during explode
  rim.position.set(-6, 9, -12);
  scene.add(rim);

  // floating dust motes for atmosphere
  var P_COUNT = smallScreen ? 90 : 160;
  var pGeo = new THREE.BufferGeometry();
  var pArr = new Float32Array(P_COUNT * 3);
  for (var pi = 0; pi < P_COUNT; pi++) {
    pArr[pi * 3] = (Math.random() - 0.5) * 24;
    pArr[pi * 3 + 1] = -2 + Math.random() * 11;
    pArr[pi * 3 + 2] = (Math.random() - 0.5) * 16;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pArr, 3));
  var dust = new THREE.Points(pGeo, new THREE.PointsMaterial({ color: 0xd8a86a, size: 0.09, transparent: true, opacity: 0.5, depthWrite: false }));
  scene.add(dust);

  // ---------- wall parameters (match the photo: S-curved wall on a slab) ----------
  var BW = 0.62, BH = 0.30, BD = 0.36, GAP = 0.05;
  var PITCH_X = BW + GAP, PITCH_Y = BH + GAP;
  var COLS = smallScreen ? 26 : 30;
  var ROWS = smallScreen ? 20 : 24;
  function spineZ(x) { return 2.4 * Math.sin(x * 0.30) - 0.007 * x * x; }
  function slopeAt(x) {
    var e = 0.05;
    return (spineZ(x + e) - spineZ(x - e)) / (2 * e);
  }

  var group = new THREE.Group();
  scene.add(group);

  // base slab
  var slabLen = COLS * PITCH_X + 1.6;
  var slab = new THREE.Mesh(
    new THREE.BoxGeometry(slabLen, 0.55, 7.2),
    new THREE.MeshStandardMaterial({ color: new THREE.Color(0xc9b28d).convertSRGBToLinear(), roughness: 1, metalness: 0 })
  );
  slab.position.y = -0.275;
  slab.receiveShadow = true;
  slab.castShadow = true;
  group.add(slab);

  // ---------- bricks (InstancedMesh) ----------
  var placements = [];
  var half = (COLS - 1) / 2;
  for (var row = 0; row < ROWS; row++) {
    var y = row * PITCH_Y + BH / 2 + 0.02;
    var odd = row % 2 === 1;
    for (var c = 0; c < COLS; c++) {
      var x = (c - half) * PITCH_X + (odd ? PITCH_X / 2 : 0);
      if (Math.abs(x) > half * PITCH_X + 0.1) continue;
      var z = spineZ(x);
      var yaw = -Math.atan(slopeAt(x));
      placements.push({ x: x, y: y, z: z, yaw: yaw });
    }
  }

  var brickGeo = new THREE.BoxGeometry(BW, BH, BD);
  var brickMat = new THREE.MeshStandardMaterial({ roughness: 0.93, metalness: 0 });
  var bricks = new THREE.InstancedMesh(brickGeo, brickMat, placements.length);
  bricks.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  bricks.castShadow = true;
  bricks.receiveShadow = true;
  group.add(bricks);

  // per-brick explode data + clay color variation
  var tmpColor = new THREE.Color();
  var center = new THREE.Vector3(0, ROWS * PITCH_Y * 0.45, 0);
  for (var i = 0; i < placements.length; i++) {
    var p = placements[i];
    var h = 0.075 + Math.random() * 0.03;      // hue: clay
    var s = 0.42 + Math.random() * 0.2;
    var l = 0.5 + Math.random() * 0.14;
    tmpColor.setHSL(h, s, l);
    tmpColor.convertSRGBToLinear();
    bricks.setColorAt(i, tmpColor);
    var dir = new THREE.Vector3(p.x - center.x, (p.y - center.y) * 1.1, (p.z - center.z) * 1.2 + 0.9).normalize();
    p.dir = dir;
    p.spread = 2.2 + Math.random() * 3.0;
    p.lift = Math.random() * 1.6;
    p.spin = { x: (Math.random() - 0.5) * 1.6, y: (Math.random() - 0.5) * 1.6, z: (Math.random() - 0.5) * 1.2 };
    p.jx = (Math.random() - 0.5) * 0.03;
    p.jr = (Math.random() - 0.5) * 0.04;
  }
  bricks.instanceColor.needsUpdate = true;
  group.position.y = -3.4;
  group.scale.setScalar(0.92);

  // ---------- interaction: drag to orbit, scroll explodes ----------
  var dragRot = 0, dragTarget = 0, idleSpin = 0, lastTouch = 0;
  var dragging = false, lastX = 0;
  canvas.addEventListener('pointerdown', function (ev) {
    dragging = true; lastX = ev.clientX;
    lastTouch = performance.now();
    try { canvas.setPointerCapture(ev.pointerId); } catch (e) {}
  });
  canvas.addEventListener('pointermove', function (ev) {
    if (!dragging) return;
    dragTarget += (ev.clientX - lastX) * 0.006;
    dragTarget = Math.max(-1.1, Math.min(1.1, dragTarget));
    lastX = ev.clientX;
    lastTouch = performance.now();
  });
  function endDrag() { dragging = false; lastTouch = performance.now(); }
  canvas.addEventListener('pointerup', endDrag);
  canvas.addEventListener('pointercancel', endDrag);

  function manualExplode() {
    var r = document.getElementById('explode-range');
    if (!r) return 0;
    return (parseInt(r.value, 10) || 0) / 100;
  }
  function scrollExplode() {
    var wrap = document.getElementById('hero-pin');
    if (!wrap) return 0;
    var vh = window.innerHeight;
    var rect = wrap.getBoundingClientRect();
    var total = rect.height - vh;
    if (total <= 0) return 0;
    return Math.min(1, Math.max(0, (-rect.top) / total));
  }

  // ---------- camera auto-fit (never crops the wall) ----------
  var camTarget = new THREE.Vector3(0, 0.2, 0);
  var camBase = { dist: 20, dir: new THREE.Vector3(0.45, 0.24, 0.86).normalize(), center: new THREE.Vector3() };
  function applyCam(mul) {
    camera.position.copy(camBase.center).addScaledVector(camBase.dir, camBase.dist * mul);
    camera.lookAt(camBase.center);
  }
  function fitCamera() {
    var box = new THREE.Box3();
    var v = new THREE.Vector3();
    for (var i = 0; i < placements.length; i++) {
      v.set(placements[i].x, placements[i].y, placements[i].z);
      box.expandByPoint(v);
    }
    box.expandByPoint(new THREE.Vector3(-slabLen / 2, -0.55, -3.6));
    box.expandByPoint(new THREE.Vector3(slabLen / 2, 0, 3.6));
    var center = box.getCenter(new THREE.Vector3());
    var size = box.getSize(new THREE.Vector3());
    // world space (group offset + scale)
    center.multiplyScalar(0.92); center.y += -3.4;
    var vfov = camera.fov * Math.PI / 180;
    var fitH = (size.y * 0.92 / 2) / Math.tan(vfov / 2);
    var fitW = (size.x * 0.92 / 2) / (Math.tan(vfov / 2) * camera.aspect);
    var dist = Math.max(fitH, fitW, size.z) * 1.32;
    var dir = new THREE.Vector3(0.45, 0.24, 0.86).normalize();
    camBase.dist = dist; camBase.dir.copy(dir); camBase.center.copy(center);
    applyCam(1);
    camTarget.copy(center);
  }

  // ---------- resize ----------
  function resize() {
    var w = wrap.clientWidth || 1, h = wrap.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    fitCamera();
  }
  window.addEventListener('resize', resize);
  resize();

  // ---------- animate ----------
  var tmpM = new THREE.Matrix4();
  var tmpP = new THREE.Vector3();
  var tmpQ = new THREE.Quaternion();
  var tmpE = new THREE.Euler();
  var tmpS = new THREE.Vector3(1, 1, 1);
  var cur = reduceMotion ? 0 : 1; // start exploded -> auto-assembles on load (cinematic intro)
  var dollyT = reduceMotion ? 1 : 0; // camera dolly-in 0..1
  var firstFrame = true, last = performance.now(), frameCount = 0;

  window.__wall3d = true; // tell main.js to stand down its slice renderer

  function frame(now) {
    requestAnimationFrame(frame);
    var dt = Math.min((now - last) / 1000, 0.1);
    last = now;

    var rect = heroSection.getBoundingClientRect();
    if (rect.bottom < -200 || rect.top > window.innerHeight + 200) return;

    var lin = scrollExplode();
    var target = Math.min(1, Math.sin(lin * Math.PI) + manualExplode());
    if (reduceMotion && target > manualExplode()) target = manualExplode();
    cur += (target - cur) * (1 - Math.exp(-4 * dt)); // frame-rate independent
    if (Math.abs(target - cur) < 0.0005) cur = target;
    if (window.__setExplodeUI) window.__setExplodeUI(cur);

    // cinematic camera dolly-in on load
    if (dollyT < 1) {
      dollyT = Math.min(1, dollyT + dt / 2.4);
      var de = 1 - Math.pow(1 - dollyT, 3);
      applyCam(1.55 - 0.55 * de);
    }

    for (var i = 0; i < placements.length; i++) {
      var p = placements[i];
      var e = cur;
      tmpP.set(
        p.x + p.dir.x * e * p.spread + p.jx,
        p.y + p.dir.y * e * p.spread + e * p.lift,
        p.z + p.dir.z * e * p.spread
      );
      tmpE.set(p.spin.x * e + p.jr, p.yaw + p.spin.y * e, p.spin.z * e);
      tmpQ.setFromEuler(tmpE);
      tmpM.compose(tmpP, tmpQ, tmpS);
      bricks.setMatrixAt(i, tmpM);
    }
    bricks.instanceMatrix.needsUpdate = true;

    if (!reduceMotion && !dragging && now - lastTouch > 3000) idleSpin += dt * 0.07;
    dragRot += ((dragTarget + idleSpin) - dragRot) * (1 - Math.exp(-6 * dt));
    group.rotation.y = dragRot + (lin - 0.5) * 0.9; // scroll choreography: showcase turn
    key.intensity = 1.05 + cur * 0.3;
    rim.intensity = cur * 0.9; // cool rim wakes up as bricks fly apart
    dust.rotation.y += dt * 0.02;

    renderer.render(scene, camera);
    frameCount++;
    if (frameCount % 30 === 0) {
      wrap.setAttribute('data-frames', String(frameCount));
      wrap.setAttribute('data-cur', cur.toFixed(4));
      wrap.setAttribute('data-target', target.toFixed(4));
    }
    if (firstFrame) {
      firstFrame = false;
      wrap.classList.add('ready');
      stage.classList.add('mode-3d');
    }
  }
  // seed matrices before first paint
  for (var s = 0; s < placements.length; s++) {
    var q = placements[s];
    tmpP.set(q.x, q.y, q.z);
    tmpE.set(0, q.yaw, 0);
    tmpQ.setFromEuler(tmpE);
    tmpM.compose(tmpP, tmpQ, tmpS);
    bricks.setMatrixAt(s, tmpM);
  }
  bricks.instanceMatrix.needsUpdate = true;
  requestAnimationFrame(frame);
})();
