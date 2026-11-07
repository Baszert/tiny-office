// Tiny Office Live: the TRMNL tower, running. Everything follows the clock in
// Amsterdam, so everyone who watches at the same moment sees the same tower.
// URL options: ?name=ACME (another tower), ?t=23:30 and ?d=2026-12-31 (time travel),
// ?speed=60 (fast forward), ?egg=ghost (force a scene), ?floor=5 (start at a floor).
// Hover a person for their name, click to follow them around the tower, double-click to give them a fright,
// click a lift door to call the lift, click anywhere else to throw a paper plane (everyone watching sees it), order pizza or throw a party.
// Drag or scroll to look around (it glides on), pinch, ctrl+scroll or +/- to zoom.
// Lift calls, pizza, parties and the doorbell are shared: everyone watching sees them.
(function () {
  var OP = window.__op, FH = OP.FLOOR_H;
  var q = new URLSearchParams(location.search);
  var NAME = (q.get('name') || 'TINY OFFICE').slice(0, 24), EGG = q.get('egg') || '', SPEED = Math.max(1, Math.min(3600, parseFloat(q.get('speed')) || 1));
  var stage = document.getElementById('stage'), cv = document.getElementById('c'), ctx = cv.getContext('2d');
  var art = document.createElement('canvas'), actx = art.getContext('2d');
  var $ = function (id) { return document.getElementById(id); };
  var store = function (k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } };

  // ---------------------------------------------------------------- time
  var skew = 0, t0 = Date.now(); // server minus local clock, in ms
  var fmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Amsterdam', hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
  function wall(ms) { // the wall clock in Amsterdam, as UTC fields
    var p = {}; fmt.formatToParts(new Date(ms)).forEach(function (x) { p[x.type] = x.value; });
    return Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour % 24, +p.minute, +p.second) + (ms % 1000);
  }
  var travel = null; // a fixed start in wall time, from ?d and ?t
  if (q.get('t') || q.get('d')) {
    var now0 = new Date(wall(Date.now())), dd = (q.get('d') || '').split('-'), tt = (q.get('t') || '').split(':');
    travel = Date.UTC(dd[0] ? +dd[0] : now0.getUTCFullYear(), dd[1] ? +dd[1] - 1 : now0.getUTCMonth(), dd[2] ? +dd[2] : now0.getUTCDate(), tt[0] ? +tt[0] : now0.getUTCHours(), tt[1] ? +tt[1] : now0.getUTCMinutes(), 0);
  }
  function clock() {
    var real = Date.now() + skew, ms;
    if (travel != null) ms = travel + (Date.now() - t0) * SPEED;
    else ms = SPEED > 1 ? wall(t0 + skew) + (real - t0 - skew) * SPEED : wall(real);
    var d = new Date(ms);
    return { d: d, t: d.getUTCHours() + d.getUTCMinutes() / 60 + (d.getUTCSeconds() + d.getUTCMilliseconds() / 1000) / 3600 };
  }

  // ---------------------------------------------------------------- shared state: visitors, the doorbell, lift calls and pizza
  var me = store('office-id') || Math.random().toString(36).slice(2, 12); store('office-id', me);
  var online = 1, bellAt = 0, bell0 = null, api = true, srvEv = [], locEv = [], evKey = null, evSeen = {};
  var LIVE = travel == null && SPEED === 1; // shared events only make sense on the real clock
  function apply(j) {
    skew = j.now - Date.now(); online = j.online || 1; bellAt = j.bell || 0; if (bell0 == null) bell0 = bellAt;
    $('who').textContent = online > 1 ? online + ' watching' : ''; $('bell').hidden = false; $('pizza').hidden = false; $('party').hidden = false;
    if (j.planes) catchPlanes(j.planes);
    if (j.events) { var first = !apply.seen; apply.seen = true; srvEv = j.events; syncEvents(first); }
  }
  // paper planes from everyone watching; my own are already in the air
  var myPlanes = {}, seenPlanes = {}, planeBusy = 0;
  function catchPlanes(l) {
    var now = Date.now() + skew;
    l.forEach(function (q) {
      if (seenPlanes[q.p + q.at] || myPlanes[q.p]) return;
      seenPlanes[q.p + q.at] = 1; planeBusy = Date.now();
      if (now - q.at < 12000 && OP.plane) { OP.plane(Math.round(q.x * W), q.y, q.c, q.d); if (!document.hidden) sfx('plane'); }
    });
  }
  function toEngine(e) { // server event to engine event, in Amsterdam wall time
    var w = wall(e.at), d = new Date(w), y = d.getUTCFullYear(), m = d.getUTCMonth(), dd = d.getUTCDate();
    return { id: String(e.at), k: e.k, day: y + '-' + (m + 1) + '-' + dd, s: (w - Date.UTC(y, m, dd)) / 1000, f: e.f };
  }
  function syncEvents(quiet) { // quiet: events already there at the first load make no sound
    var cut = Date.now() + skew - 3 * 3600000;
    locEv = locEv.filter(function (e) { return e.at > cut; });
    var all = srvEv.concat(locEv), key = all.map(function (e) { return e.k + e.at + ':' + e.f; }).join(',');
    all.forEach(function (e) { var id = e.k + e.at; if (!evSeen[id]) { evSeen[id] = 1; if (!quiet) sfx(e.k); } });
    if (key === evKey) return;
    evKey = key;
    if (OP.events) OP.events(LIVE ? all.map(toEngine) : []);
  }
  function beat() {
    if (!api) return;
    fetch('api.php?id=' + me, { cache: 'no-store' }).then(function (r) { return r.json(); }).then(apply).catch(function () {
      api = false; // a plain static host: take the time from the server's Date header instead
      fetch(location.href, { method: 'HEAD', cache: 'no-store' }).then(function (r) { var h = r.headers.get('date'); if (h) skew = Date.parse(h) + 500 - Date.now(); }).catch(function () {});
    });
  }
  function post(args, done, fail) {
    args.id = me;
    fetch('api.php', { method: 'POST', body: new URLSearchParams(args) }).then(function (r) { return r.json(); }).then(function (j) { apply(j); done(j); }).catch(fail || function () {});
  }
  $('bell').onclick = function () {
    var b = $('bell'); b.disabled = true; setTimeout(function () { b.disabled = false; }, 30000);
    post({ action: 'bell' }, function (j) { toast(j.rang ? 'Ding dong! Everyone watching sees your visitor.' : 'Someone just rang. Try again in a bit.'); });
  };
  $('pizza').onclick = function () {
    post({ action: 'pizza' }, function (j) {
      if (!j.ok) { toast('The last pizza is still warm. Try again in ' + Math.max(1, Math.ceil((j.wait || 60) / 60)) + ' min.'); return; }
      toast('Pizza is on its way to the cafe!');
      if (fol == null) setTv(true); // the TV camera will find the pizza
    });
  };
  $('party').onclick = function () {
    post({ action: 'party' }, function (j) {
      if (!j.ok) { toast('The confetti is still being swept up. Try again in ' + Math.max(1, Math.ceil((j.wait || 60) / 60)) + ' min.'); return; }
      toast('Party! Everyone in the tower is dancing.');
    });
  };
  var liftLocal = 0, liftOk;
  function callLift(f) {
    liftOk = f ? 'A visitor takes the lift up to this floor. Everyone watching sees them.' : 'A visitor takes the lift up. Everyone watching sees them.';
    function local() { // no API: the lift still comes, for this viewer only
      var now = Date.now() + skew;
      if (now - liftLocal < 15000) { toast('The lift is busy. Try again in ' + Math.ceil((15000 - now + liftLocal) / 1000) + ' s.'); return; }
      liftLocal = now; locEv.push({ k: 'lift', at: now, f: f }); syncEvents(false); toast(liftOk);
    }
    if (!api) { local(); return; }
    post({ action: 'lift', f: f }, function (j) { toast(j.ok ? liftOk : 'The lift is busy. Try again in ' + (j.wait || 15) + ' s.'); }, local);
  }
  syncEvents(true);
  // poll every 10 s, or every 2.5 s while others are watching or planes are flying
  (function loop() { beat(); setTimeout(loop, online > 1 || Date.now() - planeBusy < 30000 ? 2500 : 10000); })();
  function toast(s) { var el = $('toast'); el.textContent = s; el.style.display = 'block'; clearTimeout(toast.h); toast.h = setTimeout(function () { el.style.display = 'none'; }, 3500); }

  // ---------------------------------------------------------------- sound: soft synthesized blips, off by default
  var snd = store('office-snd') === '1', AC = null;
  function audio(then) {
    if (!AC) { var A = window.AudioContext || window.webkitAudioContext; if (A) AC = new A(); }
    if (!AC) return;
    if (AC.state !== 'running') { var pr = AC.resume(); if (pr && pr.then) pr.then(function () { if (then) then(); }); }
    else if (then) then();
    // iOS only unlocks audio after something plays inside the tap itself
    var b = AC.createBuffer(1, 1, 22050), src = AC.createBufferSource(); src.buffer = b; src.connect(AC.destination); src.start(0);
  }
  function setSnd(on) {
    snd = on; store('office-snd', on ? '1' : '0'); $('snd').classList.toggle('on', on);
    if (on) audio(function () { sfx('ding'); toast('Sound on. On a phone, check that silent mode is off.'); }); else hum(0);
  }
  $('snd').classList.toggle('on', snd);
  $('snd').onclick = function () { setSnd(!snd); };
  // a stored preference can only start audio after a user gesture
  window.addEventListener('pointerdown', function () { if (snd) audio(); });
  function tone(f, at, dur, g, type) {
    var o = AC.createOscillator(), v = AC.createGain(), t = AC.currentTime + at;
    o.type = type || 'sine'; o.frequency.value = f;
    v.gain.setValueAtTime(0.0001, t); v.gain.exponentialRampToValueAtTime(g, t + 0.01); v.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(v); v.connect(AC.destination); o.start(t); o.stop(t + dur + 0.05);
  }
  // a soft, steady background: the vacuum cleaner, the lift motor
  var humO = null, humG = null;
  function hum(level, freq) {
    if (!AC || AC.state !== 'running') return;
    if (!humO) { humO = AC.createOscillator(); humG = AC.createGain(); var lp = AC.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 400; humO.type = 'sawtooth'; humO.connect(lp); lp.connect(humG); humG.connect(AC.destination); humG.gain.value = 0; humO.start(); }
    humG.gain.setTargetAtTime(snd ? level : 0, AC.currentTime, 0.15);
    if (freq) humO.frequency.setTargetAtTime(freq, AC.currentTime, 0.2);
  }
  function tick() { // one key on a keyboard
    var n = Math.floor(AC.sampleRate * 0.012), b = AC.createBuffer(1, n, AC.sampleRate), d = b.getChannelData(0);
    for (var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 3);
    var src = AC.createBufferSource(), g = AC.createGain(); src.buffer = b; g.gain.value = 0.05; src.connect(g); g.connect(AC.destination); src.start();
  }
  function noise(dur, g, f0, f1) { // filtered noise: a door, a step, a swoosh
    var n = Math.floor(AC.sampleRate * dur), b = AC.createBuffer(1, n, AC.sampleRate), d = b.getChannelData(0);
    for (var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.sin(Math.PI * i / n);
    var src = AC.createBufferSource(), bp = AC.createBiquadFilter(), v = AC.createGain(), t = AC.currentTime;
    bp.type = 'bandpass'; bp.Q.value = 1.2; bp.frequency.setValueAtTime(f0, t); bp.frequency.exponentialRampToValueAtTime(f1, t + dur);
    src.buffer = b; v.gain.value = g; src.connect(bp); bp.connect(v); v.connect(AC.destination); src.start();
  }
  function sfx(k) {
    if (!snd || !AC || AC.state !== 'running') return;
    if (k === 'tick') return tick();
    if (k === 'ding') { tone(1320, 0, 0.8, 0.12); tone(2640, 0, 0.5, 0.04); }
    else if (k === 'bell') { tone(660, 0, 0.7, 0.13, 'triangle'); tone(523, 0.45, 0.9, 0.13, 'triangle'); }
    else if (k === 'pizza') { for (var i = 0; i < 3; i++) tone(880 + i * 110, i * 0.14, 0.09, 0.04, 'square'); }
    else if (k === 'lift') tone(1800, 0, 0.05, 0.06, 'triangle');
    else if (k === 'party') { [523, 659, 784, 1047, 784, 1047].forEach(function (f, i) { tone(f, i * 0.09, 0.12, 0.05, 'square'); }); }
    else if (k === 'whoosh') noise(0.35, 0.025, 900, 2400);
    else if (k === 'step') noise(0.03, 0.03, 300, 300);
    else if (k === 'plane') noise(0.5, 0.02, 2200, 600);
    else if (k === 'boo') { tone(520, 0, 0.12, 0.08, 'square'); tone(780, 0.08, 0.18, 0.06, 'square'); }
  }

  // ---------------------------------------------------------------- colours
  // The art is drawn in grey tones; a palette maps the grey ramp onto colours.
  var PALS = [
    ['Ink', ['#141414', '#f2f2ee']],
    ['Game', ['#0f380f', '#306230', '#8bac0f', '#c4d68a']],
    ['Sepia', ['#2a1b0e', '#7a5a3a', '#e8d6b8', '#fbf4e6']],
    ['Blue', ['#0b1f3a', '#2d5b8a', '#bfe0ff', '#f1f8ff']],
    ['Paper', ['#000000', '#ffffff']]
  ];
  var pal = Math.max(0, Math.min(PALS.length - 1, parseInt(store('office-pal'), 10) || 0)), LUT = [];
  function hex(h) { return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; }
  function makeLut() {
    var stops = PALS[pal][1].map(hex);
    LUT = OP.G4.map(function (g) {
      var k = g / 255 * (stops.length - 1), i = Math.min(stops.length - 2, Math.floor(k)), f = k - i;
      return [0, 1, 2].map(function (c) { return Math.round(stops[i][c] + (stops[i + 1][c] - stops[i][c]) * f); });
    });
    $('pal').textContent = PALS[pal][0];
    var dark = LUT[4], light = LUT[0];
    document.documentElement.style.setProperty('--bg', 'rgb(' + dark.join(',') + ')');
    document.documentElement.style.setProperty('--bar', 'rgb(' + dark.map(function (v) { return Math.round(v * 0.7); }).join(',') + ')');
    document.documentElement.style.setProperty('--ink', 'rgb(' + light.join(',') + ')');
  }
  $('pal').onclick = function () { pal = (pal + 1) % PALS.length; store('office-pal', pal); makeLut(); };
  makeLut();

  // ---------------------------------------------------------------- size
  var W = 0, H = 0, S = 1, img = null, ZOOM = 0, S0 = 2;
  function resize() {
    var dpr = window.devicePixelRatio || 1, cw = (stage.clientWidth || innerWidth) * dpr, ch = (stage.clientHeight || innerHeight - 40) * dpr;
    if (cw < 2 || ch < 2) { img = null; return; }
    S0 = Math.max(2, Math.floor(Math.max(cw / 480, ch / 420))); // about 420 art pixels high, never wider than 480
    S = S0 + ZOOM; // zoomed in: bigger pixels, fewer of them
    W = Math.max(1, Math.floor(cw / S)); H = Math.max(1, Math.floor(ch / S));
    art.width = W; art.height = H; img = actx.createImageData(W, H);
    cv.width = W * S; cv.height = H * S; cv.style.width = (W * S / dpr) + 'px'; cv.style.height = (H * S / dpr) + 'px';
    ctx.imageSmoothingEnabled = false;
  }
  window.addEventListener('resize', resize); resize();
  // zoom in steps of one pixel size; the canvas eases from the old size to the new one
  function zoom(dz) {
    var z = Math.max(-1, Math.min(4, ZOOM + dz)); if (z === ZOOM || S0 + z < 1) return;
    var from = S; ZOOM = z; resize();
    cv.style.transition = 'none'; cv.style.transform = 'scale(' + (from / S) + ')';
    requestAnimationFrame(function () { cv.style.transition = 'transform .18s ease-out'; cv.style.transform = 'scale(1)'; });
  }

  // ---------------------------------------------------------------- camera: TV mode follows the action, follow a person, or drag and scroll yourself
  var FLOOR = q.get('floor'), cam = FLOOR != null ? parseFloat(FLOOR) : null, tv = cam == null, idle = tv ? 0 : Date.now() + 240000, top = 16; // ?floor=5 starts there
  var fol = null, lastSc = null; // the key of the person being followed, and the last scene drawn
  function setTv(on) { tv = on; $('tv').classList.toggle('on', on); }
  setTv(tv);
  function toggleTv() { var on = !tv; closeCard(); setTv(on); }
  $('tv').onclick = toggleTv;
  // the camera glides on a soft spring towards whatever it watches; a flick keeps it moving for a moment
  var vcam = 0, glideV = 0, DT = 1 / 30;
  function ease(target) { var acc = (target - cam) * 22 - vcam * 9.4; vcam += acc * DT; cam += vcam * DT; if (Math.abs(target - cam) < 0.002 && Math.abs(vcam) < 0.01) { cam = target; vcam = 0; } }
  function nudge(df) { closeCard(); setTv(false); idle = Date.now(); vcam = 0; cam = Math.max(-2, Math.min(top, (cam || 0) + df)); }
  function coast() { if (!glideV) return; cam = Math.max(-2, Math.min(top, cam + glideV * DT)); glideV *= Math.exp(-3.2 * DT); if (Math.abs(glideV) < 0.02 || cam <= -2 || cam >= top) glideV = 0; }

  // the card: who is this person and what are they doing
  var card = $('card'), cardT = 0;
  function follow(key) { fol = key; if (OP.follow) OP.follow(key); if (key != null) setTv(false); }
  function closeCard() { card.style.display = 'none'; if (fol != null) { follow(null); idle = Date.now(); } }
  function showWho(key, gone) {
    cardT = Date.now();
    if (gone) { $('cw').textContent = 'Left the building'; $('cx').textContent = ''; card.style.display = 'block'; return; }
    var w = OP.who ? OP.who(key) : null;
    if (!w) return;
    $('cn').textContent = w.name || ''; $('cr').textContent = w.role || ''; $('cw').textContent = w.now || ''; $('cx').textContent = w.next || '';
    card.style.display = 'block';
  }
  $('cardx').onclick = closeCard;
  card.addEventListener('pointerdown', function (e) { e.stopPropagation(); });
  card.addEventListener('pointerup', function (e) { e.stopPropagation(); });

  // which person or lift door is under the pointer, in art pixels
  function hit(e) {
    var b = lastSc && lastSc.b, r = cv.getBoundingClientRect();
    if (!b || r.width < 1 || r.height < 1) return null;
    var x = (e.clientX - r.left) / r.width * W, y = (e.clientY - r.top) / r.height * H, i, h, L;
    for (L = b.hits || [], i = L.length - 1; i >= 0; i--) { h = L[i]; if (x >= h.x - 1 && x <= h.x2 + 1 && y >= h.y - 1 && y <= h.y2 + 1) return { p: h }; }
    for (L = b.lifts || [], i = L.length - 1; i >= 0; i--) { h = L[i]; if (x >= h.x && x <= h.x2 && y >= h.y && y <= h.y2) return { l: h }; }
    return null;
  }
  // hovering shows a name; a double click gives somebody a fright
  var tip = document.createElement('div'); tip.id = 'tip'; stage.appendChild(tip);
  function hover(e) {
    var h = hit(e), w = h && h.p && OP.who ? OP.who(h.p.key) : null, sr = stage.getBoundingClientRect();
    stage.classList.toggle('hot', !!h);
    if (!w || !w.name) { tip.style.display = 'none'; return; }
    tip.textContent = w.name; tip.style.display = 'block';
    tip.style.left = Math.min(sr.width - tip.offsetWidth - 4, e.clientX - sr.left + 12) + 'px'; tip.style.top = Math.max(4, e.clientY - sr.top - 26) + 'px';
  }
  stage.addEventListener('pointerleave', function () { tip.style.display = 'none'; });
  var lastClick = { t: 0, key: null };
  function click(e) {
    var h = hit(e), now = Date.now();
    if (h && h.p && h.p.key != null && h.p.key === lastClick.key && now - lastClick.t < 400) { if (OP.poke) OP.poke(h.p.key); sfx('boo'); lastClick.t = 0; return; }
    lastClick = { t: now, key: h && h.p ? h.p.key : null };
    if (h && h.p) {
      closeCard();
      if (h.p.key != null) { follow(h.p.key); showWho(h.p.key, OP.locate ? OP.locate(h.p.key) == null : false); }
      else showWho(h.p.key, false);
    } else if (h && h.l) callLift(h.l.f);
    else {
      closeCard();
      var r = cv.getBoundingClientRect(), ax = (e.clientX - r.left) / r.width * W, ay = (e.clientY - r.top) / r.height * H;
      if (OP.plane && ay < H - 12) {
        var px = Math.round(ax) - 6, py = Math.round(ay) - 4, pd = ax < W / 2 ? 1 : -1, pid = Math.random().toString(36).slice(2, 12);
        OP.plane(px, py, cam, pd); sfx('plane'); myPlanes[pid] = 1; planeBusy = Date.now();
        if (api && LIVE) post({ action: 'plane', p: pid, x: (px / W).toFixed(4), y: py, c: cam.toFixed(3), d: pd }, function () {});
      }
    }
  }

  var wheelZ = 0;
  stage.addEventListener('wheel', function (e) {
    e.preventDefault();
    if (e.ctrlKey) { wheelZ += e.deltaY; if (Math.abs(wheelZ) > 40) { zoom(wheelZ < 0 ? 1 : -1); wheelZ = 0; } return; } // trackpad pinch arrives as ctrl+wheel
    var df = -e.deltaY / (FH * S) * (window.devicePixelRatio || 1);
    nudge(df * 0.5); glideV = Math.max(-12, Math.min(12, glideV + df * 9));
  }, { passive: false });
  var down = null, dragging = false, dragY = 0, dragV = 0, dragT = 0, pts = {}, pinch = 0; // a press only becomes a drag after 6 CSS px
  function pdist() { var k = Object.keys(pts); return k.length < 2 ? 0 : Math.hypot(pts[k[0]].x - pts[k[1]].x, pts[k[0]].y - pts[k[1]].y); }
  stage.addEventListener('pointerdown', function (e) {
    pts[e.pointerId] = { x: e.clientX, y: e.clientY };
    if (Object.keys(pts).length === 2) { pinch = pdist(); down = null; dragging = false; return; }
    down = { x: e.clientX, y: e.clientY }; dragging = false; dragY = e.clientY; dragV = 0; dragT = performance.now(); glideV = 0; stage.setPointerCapture(e.pointerId);
  });
  stage.addEventListener('pointermove', function (e) {
    if (pts[e.pointerId]) pts[e.pointerId] = { x: e.clientX, y: e.clientY };
    if (pinch) { var d = pdist(); if (d > pinch * 1.3) { zoom(1); pinch = d; } else if (d < pinch / 1.3) { zoom(-1); pinch = d; } return; }
    if (!down) { if (e.pointerType === 'mouse') hover(e); return; }
    if (!dragging) { if (Math.hypot(e.clientX - down.x, e.clientY - down.y) < 6) return; dragging = true; stage.classList.add('drag'); tip.style.display = 'none'; }
    var df = (e.clientY - dragY) * (window.devicePixelRatio || 1) / (FH * S), now = performance.now(), dt = Math.max(1, now - dragT) / 1000;
    nudge(df); dragV = dragV * 0.6 + (df / dt) * 0.4; dragT = now; dragY = e.clientY;
  });
  function lift(e) { delete pts[e.pointerId]; if (Object.keys(pts).length < 2) pinch = 0; }
  stage.addEventListener('pointerup', function (e) { lift(e); if (down && !dragging) click(e); else if (dragging && performance.now() - dragT < 120) glideV = Math.max(-14, Math.min(14, dragV)); down = null; dragging = false; stage.classList.remove('drag'); });
  stage.addEventListener('pointercancel', function (e) { lift(e); down = null; dragging = false; stage.classList.remove('drag'); });
  window.addEventListener('keydown', function (e) { if (e.key === 'ArrowUp') { glideV = 0; nudge(0.5); } if (e.key === 'ArrowDown') { glideV = 0; nudge(-0.5); } if (e.key === '+' || e.key === '=') zoom(1); if (e.key === '-') zoom(-1); if (e.key === 't') toggleTv(); if (e.key === 'Escape') closeCard(); });
  $('fs').onclick = function () { if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen && document.documentElement.requestFullscreen(); };

  // ---------------------------------------------------------------- the loop: about 30 frames a second
  var last = 0;
  function frame(ts) {
    requestAnimationFrame(frame);
    if (ts - last < 31 || document.hidden) return;
    DT = Math.min(0.1, (ts - last) / 1000);
    if (!img || cv.width !== W * S) resize();
    if (!img) return;
    last = ts;
    var c = clock(), real = Date.now() + skew;
    if (!tv && fol == null && Date.now() - idle > 60000) setTv(true);
    var ringing = real - bellAt < 20000;
    if (ringing && !frame.ring && bellAt !== bell0) sfx('bell');
    frame.ring = ringing;
    OP.guests(online, ringing);
    var o = { w: W, h: H, d: c.d, t: c.t, name: NAME, deco: true, news: true, egg: EGG, view: 'live', live: true, focus: cam == null ? 0 : cam };
    var sc = OP.scene(o);
    top = sc.top;
    if (cam == null) { cam = sc.pick; sc = OP.scene((o.focus = cam, o)); }
    lastSc = sc;
    if (tv) ease(sc.pick);
    else if (fol == null) coast();
    else if (fol != null) { var lf = OP.locate ? OP.locate(fol) : null; if (lf != null) ease(lf); if (Date.now() - cardT >= 250) showWho(fol, OP.locate && lf == null); }
    var car = sc.M && sc.M.car;
    var view = H / FH / 2 + 0.5, inView = function (f) { return f != null && Math.abs(f - cam) <= view; };
    if (car) { var open = car.open > 0; if (open && frame.open === false && inView(car.f)) { sfx('ding'); setTimeout(function () { sfx('whoosh'); }, 250); } frame.open = open; }
    if (snd && AC && AC.state === 'running') {
      var M = sc.M || {}, busy = 0;
      if (M.on) for (var fl in M.on) if (inView(+fl) && OP.locate) busy += M.on[fl].filter(function (o) { return o.s && o.s.at === 'desk'; }).length;
      if (M.office && Math.random() < Math.min(0.5, busy * 0.03) * 0.4) sfx('tick');
      // zoomed in, you hear footsteps
      if (ZOOM > 0) { var walkers = (sc.b.hits || []).filter(function (h) { return h.pose === 'walk'; }).length; if (walkers && Math.random() < Math.min(0.4, walkers * 0.08)) sfx('step'); }
      var vac = M.cleaner && inView(M.cleaner.floor), lift = car && car.dir && !car.open && inView(car.f);
      hum(vac ? 0.035 : lift ? 0.02 : 0, vac ? 95 : 60);
    }
    var p = sc.b.p, data = img.data;
    for (var i = 0, n = W * H; i < n; i++) { var col = LUT[p[i]], k = i * 4; data[k] = col[0]; data[k + 1] = col[1]; data[k + 2] = col[2]; data[k + 3] = 255; }
    actx.putImageData(img, 0, 0);
    ctx.drawImage(art, 0, 0, W * S, H * S);
    var hh = c.d.getUTCHours(), mm = c.d.getUTCMinutes(), ss = c.d.getUTCSeconds(), pad = function (v) { return (v < 10 ? '0' : '') + v; };
    $('clock').textContent = pad(hh) + ':' + pad(mm) + ':' + pad(ss) + (travel != null || SPEED > 1 ? ' (time travel)' : '');
  }
  requestAnimationFrame(frame);
})();
