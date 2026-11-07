  // ============================================================ new special floors (dev/floors_new.js)
  // Paste after the last ROOM.* definition. Merge NF_TYPES into SPECIAL, NF_PAPER into PAPER,
  // NF_ROLE into ROLE, NF_GOSSIP into GOSSIP, NF_LIT into the list of rooms that stay lit.
  var NF_TYPES = ['warroom', 'factory', 'themepark', 'stocks', 'disco', 'haunted', 'dojo', 'greenhouse', 'capyspa'];
  // floor-relative wallpaper: y, top and fy are counted from the top of the storey
  var NF_PAPER = {
    warroom: function (x, y, top, fy) { var k = y - top; return k > fy - top - 12 ? (k === fy - top - 12 ? T.K : (x + k) % 6 === 0 ? T.DARK : T.MID) : (x % 24 === 0 || k % 24 === 0) ? T.MOTIF : T.WALL; },
    factory: function (x, y, top, fy) { var k = y - top; return k < 4 ? ((x + k) % 8 < 4 ? T.K : T.W) : (x % 12 === 0 || k % 9 === 4) ? T.MOTIF : T.WALL; },
    themepark: function (x, y, top) { var k = y - top; return (x % 10 < 5) ? (k % 14 === 0 ? T.MOTIF : T.WALL) : T.PALE; },
    stocks: function (x, y, top) { var k = y - top; return (x * 3 + k * 5) % 17 === 0 ? T.MOTIF : T.WALL; },
    disco: function (x, y, top, fy) { var k = y - top; return k > fy - top - 8 ? T.K : ((x + k) % 9 === 0 || (x - k + 900) % 9 === 0) ? T.MID : T.DARK; },
    haunted: function (x, y, top) { var k = y - top; return (k % 12 === 6 && x % 3 !== 0) || (x % 20 === 10 && (k >> 1) % 2 === 0) ? T.MID : T.DARK; },
    dojo: function (x, y, top, fy) { var k = y - top; return k > fy - top - 6 ? ((x % 24 === 0) ? T.MID : T.PALE) : (x % 30 < 1 || k % 22 === 3) ? T.MID : T.W; },
    greenhouse: function (x, y, top) { var k = y - top; return (x % 20 === 0 || k % 15 === 0) ? T.LIGHT : (x + k) % 23 === 0 ? T.PALE : T.W; },
    capyspa: function (x, y, top, fy) { var k = y - top; return k > fy - top - 22 ? ((x % 7 === 0 || k % 7 === 0) ? T.LIGHT : T.W) : ((x * 7 + k * 3) % 19 === 0 ? T.MOTIF : T.PALE); }
  };
  var NF_ROLE = { warroom: 'General, Operation Donut', factory: 'Factory worker', themepark: 'On the rollercoaster', stocks: 'Trader', disco: 'Karaoke star', haunted: 'Not scared at all', dojo: 'Black belt in Excel', greenhouse: 'Plant whisperer', capyspa: 'Relaxing with capybaras' };
  var NF_LIT = ['stocks', 'disco', 'factory'];
  var NF_GOSSIP = [
    'THE WAR ROOM HAS A NEW TARGET: THE LAST DONUT.', '{A} PRESSED THE BIG RED BUTTON. IT ORDERED SOUP.', 'GENERAL {A} MOVED A PIN. NOBODY KNOWS WHY.',
    'THE FACTORY TURNS DUCKS INTO STAPLERS. QUALITY IS UP.', '{A} WAS PROMOTED TO HEAD OF DUCKS.', 'THE ROBOT ARM WANTS A HOLIDAY.',
    'THE ROLLERCOASTER IS NOW PART OF THE COMMUTE.', '{A} WON A GOLDFISH AT THE FAIR. IT IS IN HR NOW.', '{A} AND {B} ARE STUCK ON THE CAROUSEL. HAPPILY.',
    'DONUT STOCK UP 12 PERCENT. {A} BOUGHT IT ALL.', 'MEOW CRASHED. THE CAT IS FINE.', '{A} SAYS HODL. NOBODY KNOWS WHAT IT MEANS.',
    '{A} SANG ABOUT SPREADSHEETS FOR 40 MINUTES.', 'THE MIRROR BALL IS NOW A VIP.', '{A} AND {B} DID A DUET. HR IS LOOKING INTO IT.',
    'THE GHOST ON THE HAUNTED FLOOR FILED A TIMESHEET.', '{A} SAYS THE PORTRAITS ARE WATCHING. THEY ARE.', 'GERALD THE GHOST STILL WANTS HIS MUG BACK.',
    '{A} BROKE A BOARD THAT SAID MONDAY. MORALE UP.', 'THE SENSEI CAN CLOSE 40 TABS AT ONCE.',
    'THE BIG PLANT IN THE GREENHOUSE ATE A STAPLER.', '{A} TALKS TO THE TOMATOES. THEY TALK BACK.', 'THE GIANT PUMPKIN HAS ITS OWN PARKING SPOT.',
    'THE CAPYBARAS GOT A RAISE. {A} DID NOT.', '{A} SHARED THE HOT TUB WITH A CAPYBARA. BOTH CALM.'
  ];
  // what animates: seconds live, a time-of-day moment on the TRMNL
  function nf_s(M) { return LIVE ? SEC : M.t * 3600; }
  function nf_p(R, key, k, mods) { var p = look(rng(R.day + key + k)); for (var m in mods || {}) p[m] = mods[m]; return p; }
  // headwear drawn over a bitizen's head (hy = top row of the head)
  function nf_hat(b, x, hy, kind) {
    if (kind === 'hard') b.spr(['...oooooo...', '..oWWWWWWo..', '.oWWWoWWWWo.', 'oooooooooooo'], x, hy - 3, { o: T.K, W: T.W });
    if (kind === 'general') b.spr(['..oooooooo..', '.oKKKWKKKKo.', '.oKKWWWKKKo.', 'oooooooooooo', '.......oooo.'], x, hy - 3, { o: T.K, K: T.DARK, W: T.W });
    if (kind === 'band') { b.hline(x + 1, hy + 3, 10, T.K); b.px(x + 11, hy + 4, T.K); b.px(x + 12, hy + 5, T.K); }
    if (kind === 'chef') b.spr(['..oo..oo....', '.oWWooWWo...', '.oWWWWWWWo..', '..oWWWWWo...', '..ooooooo...'], x + 1, hy - 4, { o: T.K, W: T.W });
  }
  // a sprite at double size
  function nf_spr2(b, rows, x, y, map) { for (var j = 0; j < rows.length; j++) for (var i = 0; i < rows[j].length; i++) { var c = rows[j].charAt(i); if (c in map) b.rect(x + i * 2, y + j * 2, 2, 2, map[c]); } }
  function nf_arrow(b, x, y, up, t) { b.spr(up ? ['..o..', '.ooo.', 'ooooo'] : ['ooooo', '.ooo.', '..o..'], x, y, { o: t }); }

  // ------------------------------------------------------------ war room: operation last donut
  ROOM.warroom = function (b, x, w, top, fy, f, here, M, R) {
    var s = nf_s(M), on = M.office, alert = LIVE ? (s % 47) < 4 : (Math.floor(M.t * 12) % 9 === 0);
    // the wall map
    var mw = Math.min(150, w - 90), mx = x + Math.floor((w - mw) / 2), my = top + 2, mh = 19, rs = rng('map' + f);
    if (mw > 40) {
      b.rect(mx, my, mw, mh, T.LIGHT); b.box(mx - 1, my - 1, mw + 2, mh + 2, T.K); b.box(mx - 2, my - 2, mw + 4, mh + 4, T.LIGHT);
      for (var c = 0; c < 6; c++) { var cx = mx + 6 + Math.floor(rs() * (mw - 12)), cy = my + 5 + Math.floor(rs() * (mh - 10)), cr = 3 + Math.floor(rs() * 4); for (var j = -cr; j <= cr; j++) for (var i = -cr - 3; i <= cr + 3; i++) if (i * i / 2 + j * j * 2 <= cr * cr && mx + 1 < cx + i && cx + i < mx + mw - 1 && my < cy + j && cy + j < my + mh - 1) b.px(cx + i, cy + j, T.W); }
      for (var gx = mx + 10; gx < mx + mw; gx += 10) for (var gy = my + 1; gy < my + mh; gy += 2) b.px(gx, gy, T.DARK);
      // the target: the last donut, and arrows creeping towards it
      var tx = mx + mw - 12, ty = my + 9;
      b.locking = true; disc(b, tx, ty, 4, T.W, T.K); b.px(tx, ty, T.K); b.locking = false;
      var pins = [[mx + 10, my + 12], [mx + 22, my + 15], [mx + 40, my + 10]];
      pins.forEach(function (pn, k) {
        var blink = LIVE ? Math.floor(s * 2 + k) % 2 : 1;
        if (blink) { b.locking = true; b.rect(pn[0], pn[1], 2, 2, T.W); b.locking = false; }
        var prog = LIVE ? wrap(s / 9 + k * 0.3, 1) : 0.5, ex = Math.round(lerp(pn[0], tx - 5, prog)), ey = Math.round(lerp(pn[1], ty, prog));
        for (var d = 0; d < 1; d += 0.08) { var lx = Math.round(lerp(pn[0], ex, d)), ly = Math.round(lerp(pn[1], ey, d)); b.px(lx, ly, T.K); }
        b.px(ex, ey - 1, T.K); b.px(ex, ey + 1, T.K); b.px(ex + 1, ey, T.K);
      });
      b.rect(mx, my, textW('OPERATION DONUT') + 4, 7, T.K); text(b, 'OPERATION DONUT', mx + 2, my + 1, T.W);
    }
    // the red alert lamp
    var lx0 = x + 14; b.rect(lx0, top, 7, 2, T.K); disc(b, lx0 + 3, top + 4, 3, alert ? T.W : T.DARK, T.K);
    if (alert) { b.locking = true; var rot = LIVE ? Math.floor(s * 6) % 4 : 0; var rays = [[-8, 2], [8, 2], [-6, 7], [6, 7]]; rays.forEach(function (ry, k) { if ((k + rot) % 2 === 0) b.line(lx0 + 3, top + 4, lx0 + 3 + ry[0], top + 4 + ry[1], T.W); }); b.locking = false; }
    // the big red button nobody may press
    var bx = x + w - 30;
    b.rect(bx, fy - 14, 14, 12, T.LIGHT); b.box(bx, fy - 14, 14, 12, T.K); disc(b, bx + 7, fy - 17, 4, T.DARK, T.K); b.px(bx + 6, fy - 19, T.W);
    b.rect(bx - 6, top + 6, 26, 9, T.W); b.box(bx - 6, top + 6, 26, 9, T.K); text(b, 'NO!', bx + 1, top + 8, T.K);
    // the planning table and its generals
    var tbx = x + Math.floor(w * 0.3), tw = Math.min(70, w - 110);
    if (on) {
      var n = Math.max(1, Math.min(4, Math.floor(tw / 18)));
      for (var g = 0; g < n; g++) { var p = nf_p(R, 'gen' + f, g, { shirt: T.DARK, sleeve: T.DARK, pants: T.DARK, mood: alert ? 'o' : g === 0 ? 'angry' : null }); var gxp = tbx + 4 + g * Math.floor(tw / n), hy = bit(b, p, gxp, fy - 2, g === 0 || alert ? 'wave' : 'stand'); nf_hat(b, gxp, hy, 'general'); if (g === 0 && mw > 40) b.line(gxp + 11, hy + 9, Math.min(mx + mw - 6, gxp + 34), my + mh + 1, T.K); }
      if (alert && LIVE) bubble(b, tbx + 10, top + 1, 'DEFCON DONUT!');
      // the intern, inching towards the button
      if (w > 200) { var ix = bx - 26 + (LIVE ? Math.round(bounce(s / 3, 8)) : 0), ip = INTERN.p; ip.mood = 'o'; bit(b, ip, ix, fy - 2, LIVE && (s % 20) < 3 ? 'wave' : 'stand'); }
    }
    if (tw > 20) { b.rect(tbx, fy - 13, tw, 4, T.MID); b.box(tbx, fy - 13, tw, 4, T.K); b.vline(tbx + 2, fy - 9, 7, T.K); b.vline(tbx + tw - 3, fy - 9, 7, T.K); for (var mm = tbx + 6; mm < tbx + tw - 4; mm += 9) b.rect(mm, fy - 15, 2, 2, T.K); }
  };

  // ------------------------------------------------------------ factory: ducks in, staplers out
  var NF_DUCK = ['..oo...', '.oWWo..', 'ooWKWo.', '..oWWWo', '.oWWWWo', '..oooo.'];
  var NF_STAPLER = ['.ooooooo', 'oKKKKKKo', 'oooooooo', 'oWWWWWWo', '.oooooo.'];
  ROOM.factory = function (b, x, w, top, fy, f, here, M, R) {
    var s = nf_s(M), on = M.office, run = on || (LIVE && M.t > 7 && M.t < 19);
    var bx0 = x + 34, bx1 = x + w - 34, by = fy - 12, press = bx0 + Math.floor((bx1 - bx0) * 0.5);
    // the duck hopper
    b.rect(x + 6, fy - 34, 26, 32, T.MID); b.box(x + 6, fy - 34, 26, 32, T.K); b.rect(x + 9, fy - 30, 20, 9, T.W); b.box(x + 9, fy - 30, 20, 9, T.K);
    text(b, 'DUCKS', x + 10, fy - 28, T.K); b.spr(NF_DUCK, x + 15, fy - 41, { o: T.K, W: T.W, K: T.DARK });
    // the belt with moving treads and rollers
    var off = run ? Math.floor(s * 12) : 0;
    b.rect(bx0, by, bx1 - bx0, 3, T.DARK); b.hline(bx0, by, bx1 - bx0, T.K); b.hline(bx0, by + 3, bx1 - bx0, T.K);
    for (var tx = bx0 + (off % 6); tx < bx1; tx += 6) b.px(tx, by + 1, T.LIGHT);
    for (var rl = bx0 + 3; rl < bx1; rl += 14) { disc(b, rl, by + 6, 2, T.MID, T.K); b.vline(rl, by + 8, fy - by - 9, T.K); }
    // the goods, riding along: ducks before the press, staplers after
    for (var it = -1; it < (bx1 - bx0) / 22 + 1; it++) {
      var ix = bx0 + 2 + it * 22 + (off % 22);
      if (ix < bx0 || ix > bx1 - 9) continue;
      if (ix + 4 < press) b.spr(NF_DUCK, ix, by - 6, { o: T.K, W: T.W, K: T.DARK }); else b.spr(NF_STAPLER, ix, by - 5, { o: T.K, W: T.W, K: T.MID });
    }
    // the stamping press: THUNK
    var cyc = run ? wrap(s, 2) : 1, down = cyc > 1.6 ? 6 : cyc > 1.3 ? Math.round((cyc - 1.3) * 20) : 0;
    b.rect(press - 9, top + 2, 20, 6, T.DARK); b.box(press - 9, top + 2, 20, 6, T.K); b.vline(press - 7, top + 8, by - top - 8, T.K); b.vline(press + 8, top + 8, by - top - 8, T.K);
    b.vline(press, top + 8, 12 + down, T.MID); b.rect(press - 5, top + 20 + down, 12, 5, T.LIGHT); b.box(press - 5, top + 20 + down, 12, 5, T.K);
    if (down === 6 && LIVE) { text(b, 'THUNK', press + 11, top + 22, T.K); b.px(press - 8, by - 3, T.K); b.px(press + 10, by - 4, T.K); }
    // the robot arm at the end, swinging goods into a crate
    var ax = bx1 + 6, sw = run ? Math.sin(s * 1.6) : 0, ex = ax + Math.round(sw * 9) - 4, ey = top + 14 + Math.round(Math.abs(sw) * 4);
    b.rect(ax - 3, fy - 8, 8, 6, T.DARK); b.box(ax - 3, fy - 8, 8, 6, T.K);
    b.line(ax, fy - 8, ax - 2, top + 20, T.K); b.line(ax + 1, fy - 8, ax - 1, top + 20, T.K); b.line(ax - 2, top + 20, ex, ey, T.K); b.line(ax - 1, top + 20, ex + 1, ey, T.K);
    disc(b, ax - 2, top + 20, 2, T.LIGHT, T.K); b.px(ex - 1, ey + 1, T.K); b.px(ex + 2, ey + 1, T.K); b.px(ex - 1, ey + 2, T.K); b.px(ex + 2, ey + 2, T.K);
    // the counter
    var made = run ? Math.max(0, Math.floor((M.t - 8) * 3600 / 1.8)) : Math.floor(10 * 3600 / 1.8), cs = 'MADE ' + made, cw = textW(cs) + 6, cxp = bx0 + 6;
    b.rect(cxp, top + 4, cw, 9, T.K); b.locking = true; text(b, cs, cxp + 3, top + 6, T.W); b.locking = false;
    // workers in hard hats
    if (on) [[bx0 + 26, 'stand'], [press + 26, LIVE && wrap(s, 6) < 1 ? 'wave' : 'stand']].forEach(function (wk, k) { if (wk[0] > bx1 - 14) return; var p = nf_p(R, 'fab' + f, k, { shirt: T.LIGHT, sleeve: T.LIGHT }), hy = bit(b, p, wk[0], fy - 2, wk[1], k ? null : 'papers'); nf_hat(b, wk[0], hy, 'hard'); b.rect(wk[0], by, 12, 3, T.DARK); b.hline(wk[0], by, 12, T.K); b.hline(wk[0], by + 3, 12, T.K); });
  };

  // ------------------------------------------------------------ theme park
  var NF_HORSE = ['......oo.', '.....oWWo', 'ooooooWo.', 'oWWWWWWo.', '.oWWWWo..', '.o.o.o.o.'];
  function nf_track(x, top, fy, tw) {
    var pts = [], add = function (a) { a.forEach(function (q) { pts.push(q); }); }, x0 = x + 8, base = fy - 12;
    add(bez([x0, base], [x0 + 12, base], [x0 + 22, base], 6));
    add(bez([x0 + 22, base], [x0 + 34, base], [x0 + 46, top + 8], 10).slice(1));
    add(bez([x0 + 46, top + 8], [x0 + 52, top + 2], [x0 + 60, top + 10], 6).slice(1));
    add(bez([x0 + 60, top + 10], [x0 + 70, fy - 4], [x0 + 84, fy - 10], 10).slice(1));
    if (tw > 150) { for (var a = 1; a <= 24; a++) { var an = Math.PI / 2 - a * Math.PI * 2 / 24; pts.push([x0 + 96 + Math.round(11 * Math.cos(an)) + Math.round(a / 2.4), fy - 21 + Math.round(-11 * Math.sin(an)) + 0]); } }
    var lx = pts[pts.length - 1][0];
    add(bez([lx, fy - 10], [lx + (x0 + tw - lx) / 2, top + 6], [x0 + tw, fy - 12], 12).slice(1));
    return pts;
  }
  ROOM.themepark = function (b, x, w, top, fy, f, here, M, R) {
    var s = nf_s(M), on = M.office || (CAL.wd === 0 || CAL.wd === 6) && M.t > 10 && M.t < 18, tw = Math.max(90, Math.min(w - 100, 220));
    if (w < 200) tw = w - 20;
    var pts = nf_track(x, top, fy, tw);
    // supports, then the rail
    pts.forEach(function (q, k) { if (k % 3 === 0 && q[1] < fy - 6) b.vline(Math.round(q[0]), Math.round(q[1]) + 2, fy - 2 - Math.round(q[1]) - 2, T.LIGHT); });
    for (var k = 1; k < pts.length; k++) { b.line(Math.round(pts[k - 1][0]), Math.round(pts[k - 1][1]), Math.round(pts[k][0]), Math.round(pts[k][1]), T.K); b.line(Math.round(pts[k - 1][0]), Math.round(pts[k - 1][1]) + 1, Math.round(pts[k][0]), Math.round(pts[k][1]) + 1, T.DARK); }
    // the cart, screaming
    if (on) {
      var u = LIVE ? wrap(s / 9, 1) : 0.45, ci = Math.min(pts.length - 1, Math.floor(u * pts.length)), cp = pts[ci], cxp = Math.round(cp[0]) - 5, cyp = Math.round(cp[1]) - 5;
      b.rect(cxp, cyp, 11, 4, T.W); b.box(cxp, cyp, 11, 4, T.K);
      [1, 6].forEach(function (hx, k) { var p = nf_p(R, 'rider' + f, k); disc(b, cxp + hx + 2, cyp - 2, 2, p.skin, T.K); b.hline(cxp + hx + 1, cyp - 4, 3, p.hair === T.W ? T.LIGHT : p.hair); b.px(cxp + hx, cyp - 6, T.K); b.px(cxp + hx + 4, cyp - 6, T.K); });
      if (ci > pts.length * 0.3 && ci < pts.length * 0.85 && LIVE) bubble(b, Math.min(x + w - 40, cxp + 10), Math.max(top, cyp - 16), 'AAAAH!');
    }
    // the station
    b.rect(x + 6, fy - 11, 26, 9, T.PALE); b.box(x + 6, fy - 11, 26, 9, T.K);
    if (w < 200) return;
    // the carousel, turning
    var cx = x + 8 + tw + Math.floor((w - tw - 8) / 2) - 4;
    if (x + w - cx > 28) {
      b.spr(['.......oo.......', '.....ooWWoo.....', '...ooWWKKWWoo...', '.ooWWKKWWKKWWoo.', 'oWWKKWWKKWWKKWWo', 'oooooooooooooooo'], cx - 16, top + 1, { o: T.K, W: T.W, K: T.MID });
      b.hline(cx - 16, top + 7, 16, T.K); b.hline(cx, top + 7, 16, T.K);
      b.rect(cx - 18, fy - 5, 37, 3, T.LIGHT); b.box(cx - 18, fy - 5, 37, 3, T.K);
      for (var h = 0; h < 4; h++) {
        var an = (LIVE ? s * 0.8 : M.t) + h * Math.PI / 2, hx = cx + Math.round(Math.cos(an) * 12) - 4, hy = fy - 20 + Math.round(Math.sin(s * 2 + h) * 2);
        b.vline(hx + 4, top + 7, fy - 6 - top - 7, T.K); b.spr(NF_HORSE, hx, hy, { o: T.K, W: Math.sin(an) > 0 ? T.W : T.LIGHT });
      }
    }
    // a kid with balloons and cotton candy, by the ticket booth
    var kx = x + 8 + tw - 20;
    if (on && kx > x + 40) {
      var kp = nf_p(R, 'kid' + f, 0, { mood: 'grin' }), khy = bit(b, kp, kx, fy - 2, 'wave');
      [[-6, -14], [0, -18], [5, -13]].forEach(function (bl, k) { var bxx = kx + 11 + bl[0] + (LIVE ? Math.round(Math.sin(s + k)) : 0), byy = khy + bl[1]; disc(b, bxx, byy, 3, k === 1 ? T.W : T.LIGHT, T.K); b.line(bxx, byy + 3, kx + 11, khy + 10, T.K); });
      disc(b, kx - 3, khy + 6, 3, T.PALE, T.LIGHT); b.vline(kx - 3, khy + 9, 4, T.K);
    }
  };

  // ------------------------------------------------------------ stock exchange
  var NF_TICK = ['DONUT', 'COFE', 'NAP', 'MEOW', 'DUCK', 'WIFI', 'BEAN', 'LOL'];
  var NF_BULL = ['oo..........oo', '.oo.oooooo.oo.', '..ooWWWWWWoo..', '..oWKWWWWKWo..', '..oWWWWWWWWoooo', '...oWooWWWWWWWo', '....oooWWWWWWWo', '......oWWWWWWWo', '......oWoWoWoWo', '......ooooooooo'];
  function nf_price(i, t) { var b0 = 10 + (hash('tick' + i) % 90); return b0 * (1 + 0.3 * Math.sin(t / (400 + i * 57) + i) + 0.1 * Math.sin(t / (31 + i * 3)) + 0.04 * ((hash('n' + i + Math.floor(t / 3)) % 100) / 50 - 1)); }
  function nf_fmt(v) { var c = Math.round(v * 100); return Math.floor(c / 100) + '.' + (c % 100 < 10 ? '0' : '') + (c % 100); }
  ROOM.stocks = function (b, x, w, top, fy, f, here, M, R) {
    var s = nf_s(M) + hash(R.day) % 5000, on = M.office;
    // the bull
    b.rect(x + 4, fy - 6, 20, 4, T.LIGHT); b.box(x + 4, fy - 6, 20, 4, T.K); b.spr(NF_BULL, x + 6, fy - 16, { o: T.K, W: T.MID, K: T.K });
    // the board
    var bw = Math.min(w - 40, 250), bx = x + 30, cols = bw > 220 ? 3 : bw > 140 ? 2 : 1, cw = Math.floor((bw - 4) / cols);
    b.locking = true; b.rect(bx, top + 2, bw, 16, T.K);
    for (var i = 0; i < cols * 2; i++) {
      var cx = bx + 3 + Math.floor(i / 2) * cw, cy = top + 4 + (i % 2) * 7, v = nf_price(i, s), up = v >= nf_price(i, s - 60);
      text(b, NF_TICK[i], cx, cy, T.W); var ps = nf_fmt(v); text(b, ps, cx + cw - textW(ps) - 10, cy, T.W); nf_arrow(b, cx + cw - 8, cy + 1, up, T.W);
    }
    // the tape along the bottom of the board
    var tape = ''; for (var t2 = 0; t2 < NF_TICK.length; t2++) { var dv = nf_price(t2, s) - nf_price(t2, s - 300); tape += NF_TICK[t2] + (dv >= 0 ? ' +' : ' -') + nf_fmt(Math.abs(dv)) + '   '; }
    var tw = textW(tape) + 12, toff = Math.floor(s * 12) % tw;
    b.clip = [bx + 1, top + 18, bx + bw - 1, top + 25]; b.rect(bx, top + 18, bw, 7, T.K); b.hline(bx, top + 18, bw, T.MID); text(b, tape, bx + 2 - toff, top + 19, T.W); text(b, tape, bx + 2 - toff + tw, top + 19, T.W); b.clip = null;
    b.box(bx - 1, top + 1, bw + 2, 25, T.K);
    // the chart, scrolling
    var chx = bx + bw + 6, chw = x + w - chx - 6;
    if (chw > 24) { b.rect(chx, top + 2, chw, 20, T.K); var vals = [], lo = 1e9, hi = -1e9; for (var c = 0; c < chw - 2; c++) { var cv = nf_price(0, s - (chw - c) * 4); vals.push(cv); lo = Math.min(lo, cv); hi = Math.max(hi, cv); } var py = -1; vals.forEach(function (cv, c) { var yy = top + 19 - Math.round((cv - lo) / Math.max(0.01, hi - lo) * 14); if (py >= 0) b.line(chx + c, py, chx + c + 1, yy, T.W); py = yy; }); text(b, 'DONUT', chx + 2, top + 3, T.LIGHT); }
    b.locking = false;
    // traders, shouting
    if (on) {
      var n = Math.max(1, Math.min(4, Math.floor((w - 60) / 40))), shouts = ['BUY!', 'SELL!', 'HODL!', 'MOON!', 'NO!!', 'BUY!!'];
      for (var k = 0; k < n; k++) {
        var tx = x + 40 + k * Math.floor((w - 70) / n), ph2 = LIVE ? Math.floor(s / 1.5 + k * 0.7) : k, p = nf_p(R, 'trader' + f, k, { tie: true, mood: (ph2 + k) % 3 ? 'o' : 'grin' });
        var hy = bit(b, p, tx, fy - 2, (ph2 + k) % 2 ? 'wave' : 'stand', (ph2 + k) % 2 ? null : 'papers');
        if (LIVE && (ph2 + k) % 3 === 0) bubble(b, tx + 12, hy - 1, shouts[hash('sh' + k + ph2) % shouts.length]);
      }
      if (LIVE) for (var pp = 0; pp < 4; pp++) { var px = x + 40 + (hash('pp' + pp) % Math.max(1, w - 80)), pyy = top + 26 + Math.floor(wrap(s * 6 + pp * 9, fy - top - 28)); b.rect(px + Math.round(Math.sin(s * 2 + pp) * 3), pyy, 3, 2, T.W); }
    }
  };

  // ------------------------------------------------------------ disco and karaoke
  var NF_LYRICS = ['OOH SPREADSHEET BABY', 'MY INBOX IS ON FIRE', 'I WILL REPLY ALL', 'DONT LEAVE ME ON READ', 'CIRCLE BACK TO ME', 'PER MY LAST EMAIL'];
  ROOM.disco = function (b, x, w, top, fy, f, here, M, R) {
    var s = nf_s(M), party = M.weekday && (M.t > 16.5 && M.t < 23 || CAL.wd === 5 && M.t > 15 || M.t > 12 && M.t < 13.5), sing = party || M.office, beat = Math.floor(s * 2);
    // the dance floor
    for (var tx = x + 4; tx < x + w - 4; tx += 8) { var on = party && (hash('tile' + tx + beat) % 3 === 0); b.locking = on; b.rect(tx, fy - 6, 7, 4, on ? T.W : T.MID); b.locking = false; b.box(tx, fy - 6, 7, 4, T.K); }
    // the mirror ball and its spots on the walls
    var mbx = x + Math.floor(w / 2); b.vline(mbx, top, 5, T.K); disc(b, mbx, top + 9, 4, T.LIGHT, T.K);
    for (var q = 0; q < 6; q++) b.px(mbx - 3 + (q % 3) * 3, top + 7 + Math.floor(q / 3) * 3, (q + beat) % 2 ? T.W : T.MID);
    if (party) { b.locking = true; for (var sp = 0; sp < 14; sp++) { var sx = x + 4 + Math.floor(wrap(hash('sp' + sp) + s * 9, w - 8)), sy = top + 4 + hash('spy' + sp) % 30; b.px(sx, sy, T.W); b.px(sx + 1, sy, T.W); } b.locking = false; }
    // the stage, the singer and the lyrics screen
    var stx = x + 8; b.rect(stx, fy - 9, 42, 7, T.DARK); b.box(stx, fy - 9, 42, 7, T.K);
    var lyr = NF_LYRICS[Math.floor(s / 8) % NF_LYRICS.length], lw = textW(lyr) + 8, lx = Math.min(x + w - lw - 4, stx + 46);
    b.locking = true; b.rect(lx, top + 3, lw, 11, T.K); text(b, sing ? lyr : 'KARAOKE', lx + 4, top + 6, T.W);
    if (sing) { var ball = Math.floor(wrap(s, 8) / 8 * (lw - 10)); disc(b, lx + 5 + ball, top + 2 - (Math.floor(s * 4) % 2), 1, T.W, T.K); }
    b.locking = false;
    if (sing) {
      var sp2 = nf_p(R, 'singer', Math.floor(M.t), { mood: 'laugh' }), shy = bit(b, sp2, stx + 14, fy - 9, beat % 2 ? 'wave' : 'stand');
      b.vline(stx + 26, shy + 10, 10, T.K); b.rect(stx + 25, shy + 8, 3, 3, T.K);
      for (var nt = 0; nt < 3; nt++) { var nx = stx + 30 + nt * 9, ny = shy - 2 - Math.floor(wrap(s * 5 + nt * 4, 12)); b.vline(nx + 2, ny, 4, T.K); b.rect(nx, ny + 3, 2, 2, T.K); b.px(nx + 3, ny, T.K); }
      // dancers, on the beat
      var n = party ? Math.max(1, Math.min(5, Math.floor((w - 80) / 30))) : Math.min(1, Math.floor((w - 80) / 30));
      for (var k = 0; k < n; k++) { var dx = x + 70 + k * Math.floor((w - 90) / n), p = nf_p(R, 'dancer' + f, k, { mood: (k + beat) % 3 ? 'grin' : 'laugh' }); bit(b, p, dx + ((beat + k) % 2 ? 1 : -1), fy - 6 - ((beat + k) % 2), (beat + k) % 2 ? 'wave' : 'stand'); }
    }
  };

  // ------------------------------------------------------------ the haunted floor
  var NF_GHOST = ['...oooo...', '..oWWWWo..', '.oWWWWWWo.', '.oWKWWKWo.', 'oWWWWWWWWo', 'oWWWKKWWWo', 'oWWWWWWWWo', 'oWWWWWWWWo', 'oWoWWoWWoo', 'o.o..o..o.'];
  ROOM.haunted = function (b, x, w, top, fy, f, here, M, R) {
    var s = nf_s(M), flick = LIVE ? hash('fl' + Math.floor(s * 5)) % 23 === 0 : false;
    // portraits whose eyes follow the ghost
    var gx = x + 20 + Math.round(bounce(s * 9, Math.max(1, w - 70)));
    for (var pt = 0; pt < Math.floor((w - 30) / 70); pt++) {
      var px = x + 20 + pt * 70; b.rect(px, top + 4, 16, 20, T.MID); b.box(px, top + 4, 16, 20, T.K); b.box(px - 1, top + 3, 18, 22, T.LIGHT);
      disc(b, px + 8, top + 12, 4, T.PALE, T.K); b.rect(px + 3, top + 17, 10, 7, T.DARK);
      var look2 = gx > px + 8 ? 1 : 0; b.px(px + 6 + look2, top + 11, T.K); b.px(px + 9 + look2, top + 11, T.K);
    }
    web(b, x + 1, top + 1); web(b, x + w - 9, top + 1);
    // candles, flickering
    [x + 10, x + w - 14].forEach(function (cx, k) { b.rect(cx, fy - 10, 3, 8, T.W); b.box(cx, fy - 10, 3, 8, T.K); var fl = LIVE ? Math.floor(s * 6 + k) % 2 : 0; b.locking = true; b.px(cx + 1, fy - 11 - fl, T.W); b.px(cx + 1, fy - 12, T.W); b.locking = false; });
    // a worker at the desk, typing, completely unbothered
    if (M.office && w > 180) { var dx = x + Math.floor(w * 0.6), p = nf_p(R, 'brave' + f, 0, { mood: flick ? 'o' : null }); bit(b, p, dx + 4, fy - 6, 'type'); b.rect(dx, fy - 13, 30, 3, T.LIGHT); b.box(dx, fy - 13, 30, 3, T.K); b.vline(dx + 2, fy - 10, 8, T.K); b.vline(dx + 27, fy - 10, 8, T.K); b.rect(dx + 17, fy - 21, 10, 8, T.K); b.locking = true; b.rect(dx + 18, fy - 20, 8, 6, T.W); b.locking = false; }
    // Gerald the ghost, drifting, holding his mug
    var gy = top + 6 + Math.round(Math.sin(s * 1.3) * 4);
    b.locking = true; nf_spr2(b, NF_GHOST, gx, gy, { o: T.LIGHT, W: T.W, K: T.K }); b.rect(gx + 20, gy + 9, 5, 5, T.W); b.box(gx + 20, gy + 9, 5, 5, T.LIGHT); b.px(gx + 25, gy + 10, T.LIGHT); b.px(gx + 25, gy + 11, T.LIGHT); b.locking = false;
    if (LIVE && wrap(s, 14) < 2.5) bubble(b, gx + 22, gy - 6, wrap(s, 28) < 14 ? 'BOO' : 'MY MUG');
    // a second, shy ghost peeking from behind the wall
    if (w > 220) { var sy = top + 18 + Math.round(Math.sin(s * 0.7) * 2); b.locking = true; b.clip = [x, top, x + w, fy]; b.spr(NF_GHOST, x + w - 6 - Math.round(Math.max(0, Math.sin(s * 0.4)) * 6), sy, { o: T.LIGHT, W: T.W, K: T.K }); b.clip = null; b.locking = false; }
    if (flick) b.shade(x, top, w, fy - top, DARKEN);
  };

  // ------------------------------------------------------------ dojo
  ROOM.dojo = function (b, x, w, top, fy, f, here, M, R) {
    var s = nf_s(M), on = M.office || (LIVE && M.t > 18 && M.t < 21), cyc = wrap(s, 8), gi = { shirt: T.W, sleeve: T.W, pants: T.W };
    // scrolls on the wall
    for (var sc = x + 14; sc < x + w - 20; sc += 80) { b.rect(sc, top + 3, 12, 24, T.PALE); b.box(sc, top + 3, 12, 24, T.K); b.hline(sc - 1, top + 3, 14, T.K); b.hline(sc - 1, top + 26, 14, T.K); var rr = rng('scroll' + sc); for (var st = 0; st < 4; st++) { b.hline(sc + 3 + Math.floor(rr() * 3), top + 7 + st * 4, 3 + Math.floor(rr() * 3), T.K); b.px(sc + 6, top + 6 + st * 4, T.K); } }
    if (!on) return;
    // the sensei, arms folded
    var sp = nf_p(R, 'sensei', 0, { shirt: T.K, sleeve: T.K, pants: T.K, mood: cyc > 5 && cyc < 6.5 ? 'smile' : null }), shy = bit(b, sp, x + 10, fy - 2, 'stand'); nf_hat(b, x + 10, shy, 'band');
    // board breaking: the board says MONDAY
    var hx = x + Math.floor(w * 0.45), holder = nf_p(R, 'holder' + f, 0, gi), hhy = bit(b, holder, hx + 18, fy - 2, 'wave'), broke = cyc > 5;
    holder.mood = broke ? 'o' : null;
    if (!broke) { b.rect(hx + 9, hhy + 8, 10, 14, T.PALE); b.box(hx + 9, hhy + 8, 10, 14, T.K); b.vline(hx + 13, hhy + 9, 12, T.LIGHT); text(b, 'M', hx + 12, hhy + 12, T.K); }
    else { var fly = Math.min(10, Math.round((cyc - 5) * 12)); b.rect(hx + 9 - fly, hhy + 8 - fly, 5, 7, T.PALE); b.box(hx + 9 - fly, hhy + 8 - fly, 5, 7, T.K); b.rect(hx + 14 + fly, hhy + 15 + Math.min(4, fly), 5, 7, T.PALE); b.box(hx + 14 + fly, hhy + 15 + Math.min(4, fly), 5, 7, T.K); }
    var kp = nf_p(R, 'karate' + f, 0, gi); kp.mood = broke ? 'laugh' : 'angry';
    var khy = bit(b, kp, hx - 6 + (cyc > 4.6 && cyc < 5.4 ? 4 : 0), fy - 2, cyc > 4.6 ? 'wave' : 'stand'); nf_hat(b, hx - 6, khy, 'band');
    if (LIVE && cyc > 4.8 && cyc < 6.5) bubble(b, hx - 10, khy - 12, 'HIYA!');
    if (LIVE && cyc > 5 && cyc < 7) text(b, 'MONDAY', hx + 22, top + 4, T.K);
    // students punching in a row
    var n = Math.max(0, Math.min(3, Math.floor((x + w - hx - 50) / 24)));
    for (var k = 0; k < n; k++) { var p = nf_p(R, 'student' + f, k, gi), punch = LIVE ? Math.floor(s * 1.5 + k) % 2 : k % 2; bit(b, p, hx + 44 + k * 24, fy - 2, punch ? 'wave' : 'stand'); }
  };

  // ------------------------------------------------------------ greenhouse
  ROOM.greenhouse = function (b, x, w, top, fy, f, here, M, R) {
    var s = nf_s(M), rs = rng('gh' + f), snap = wrap(s, 7), open = snap < 5 ? Math.round(4 + Math.sin(s * 2) * 2) : snap < 5.4 ? 0 : 6;
    // shelves of pots
    for (var sh = x + 6; sh < x + w - 100; sh += 50) {
      b.hline(sh, top + 18, 40, T.K); b.hline(sh, top + 19, 40, T.LIGHT);
      for (var pt = 0; pt < 4; pt++) { var px = sh + 3 + pt * 10; b.rect(px, top + 13, 6, 5, T.MID); b.box(px, top + 13, 6, 5, T.K); var hgt = 3 + Math.floor(rs() * 5); b.vline(px + 3, top + 13 - hgt, hgt, T.K); b.px(px + 2, top + 12 - hgt, T.DARK); b.px(px + 4, top + 11 - hgt, T.DARK); }
    }
    // the giant pumpkin with its prize ribbon
    var pkx = x + 14; disc(b, pkx + 9, fy - 10, 9, T.LIGHT, T.K); for (var rb = -6; rb <= 6; rb += 4) b.vline(pkx + 9 + rb, fy - 18, 15, T.MID); b.rect(pkx + 8, fy - 22, 3, 4, T.K);
    b.rect(pkx + 20, fy - 22, 9, 9, T.W); b.box(pkx + 20, fy - 22, 9, 9, T.K); text(b, '1', pkx + 23, fy - 20, T.K); b.vline(pkx + 22, fy - 13, 4, T.K); b.vline(pkx + 26, fy - 13, 4, T.K);
    // the big hungry plant: stem, leaves, and jaws that snap
    var gx = x + w - 60, hx = gx + 4 + (LIVE ? Math.round(Math.sin(s * 0.9) * 2) : 0), hy = top + 13;
    b.rect(gx - 4, fy - 10, 16, 8, T.DARK); b.box(gx - 4, fy - 10, 16, 8, T.K);
    for (var st = fy - 10; st > hy + 8; st--) b.px(gx + 4 + Math.round(Math.sin((st - hy) / 4) * 2), st, T.K);
    b.spr(['oo...', 'oKo..', 'oKKoo', '.oKKo', '..oo.'], gx - 2, fy - 22, { o: T.K, K: T.MID });
    for (var jj = 0; jj <= 6; jj++) { var jw = Math.round(Math.sqrt(49 - (6 - jj) * (6 - jj)) * 1.3); b.hline(hx + 1 - jw, hy - open - 6 + jj, 2 * jw, jj === 0 ? T.K : T.DARK); b.px(hx + 1 - jw, hy - open - 6 + jj, T.K); b.px(hx + jw, hy - open - 6 + jj, T.K); b.hline(hx + 1 - jw, hy + 13 - jj, 2 * jw, jj === 0 ? T.K : T.DARK); b.px(hx + 1 - jw, hy + 13 - jj, T.K); b.px(hx + jw, hy + 13 - jj, T.K); }
    b.rect(hx - 8, hy - open + 1, 18, open + 6, T.K); b.clip = null;
    for (var tt = hx - 7; tt < hx + 9; tt += 3) { b.px(tt, hy - open + 1, T.W); b.px(tt + 1, hy - open + 2, T.W); b.px(tt, hy + 6, T.W); b.px(tt + 1, hy + 5, T.W); }
    [[-4, -4], [2, -5], [5, 10], [-3, 10]].forEach(function (sp) { b.px(hx + sp[0], hy + sp[1] - (sp[1] < 0 ? open : 0), T.LIGHT); });
    if (snap >= 5 && snap < 5.6 && LIVE) text(b, 'CHOMP', hx - 30, hy - 2, T.K);
    // the plant whisperer with a watering can, flinching when it snaps
    if (M.office) {
      var flinch = snap >= 5 && snap < 6.2, wx = gx - 30 - (flinch ? 4 : 0), p = nf_p(R, 'garden' + f, 0, { shirt: T.MID, sleeve: T.MID, mood: flinch ? 'o' : 'smile' }), whyy = bit(b, p, wx, fy - 2, flinch ? 'wave' : 'stand');
      if (!flinch) { b.rect(wx + 11, whyy + 13, 5, 4, T.LIGHT); b.box(wx + 11, whyy + 13, 5, 4, T.K); b.line(wx + 16, whyy + 13, wx + 19, whyy + 11, T.K); if (LIVE) for (var dr = 0; dr < 3; dr++) b.px(wx + 20 + dr, whyy + 12 + Math.floor(wrap(s * 8 + dr * 3, 8)), T.DARK); }
      if (w > 260) { var tp = nf_p(R, 'tomato' + f, 0, { mood: 'love' }); bit(b, tp, x + Math.floor(w * 0.35), fy - 2, 'stand'); }
    }
  };

  // ------------------------------------------------------------ capybara spa
  var NF_CAPY = ['....oo...oo.', '..ooKKoooKKo', '.oKKKKKKKKKo', 'oKKoKKKKKKKo', 'oKKKKKKKKKo.', '.ooooooooo..'];
  ROOM.capyspa = function (b, x, w, top, fy, f, here, M, R) {
    var s = nf_s(M), tx = x + 30, tw = Math.max(60, Math.min(w - 90, 200)), wl = fy - 12;
    // a sign
    b.rect(x + 8, top + 4, 44, 9, T.W); b.box(x + 8, top + 4, 44, 9, T.K); text(b, 'CAPY SPA', x + 12, top + 6, T.K);
    // a colleague in a bathrobe, sharing the tub, completely at peace
    if (M.office && tw > 100) { var p = nf_p(R, 'robe' + f, 0, { shirt: T.W, sleeve: T.W, mood: 'sleepy' }); bit(b, p, tx + tw - 20, wl + 9, 'stand'); }
    // the water, with bubbles and steam
    b.rect(tx - 2, wl, tw + 4, fy - wl - 2, T.MID); for (var wx = tx; wx < tx + tw; wx += 4) b.px(wx + (LIVE ? Math.floor(s * 2) % 4 : 0), wl, T.LIGHT);
    b.box(tx - 3, wl - 1, tw + 6, fy - wl - 1, T.K); b.rect(tx - 4, wl - 2, tw + 8, 2, T.LIGHT); b.box(tx - 4, wl - 2, tw + 8, 2, T.K);
    // capybaras in the hot tub, oranges on their heads
    var n = Math.max(1, Math.floor(tw / 34));
    for (var k = 0; k < n; k++) {
      var cx = tx + 6 + k * Math.floor(tw / n), cy = wl - 6 + (LIVE ? Math.round(Math.sin(s * 0.8 + k * 2)) : 0), flip = k % 2 === 1;
      b.spr(NF_CAPY, cx, cy, { o: T.K, K: T.DARK }, flip); b.px(flip ? cx + 2 : cx + 9, cy + 2, T.K);
      if (k % 2 === 0 || n === 1) { disc(b, cx + 6, cy - 2, 2, T.LIGHT, T.K); b.px(cx + 6, cy - 5, T.K); }
      b.hline(cx - 1, wl + 1, 14, T.LIGHT); b.hline(cx, wl + 2, 12, T.MID);
    }
    for (var bb = 0; bb < 5; bb++) { var bx = tx + 4 + hash('bub' + bb) % Math.max(1, tw - 8), byy = wl + 6 - Math.floor(wrap(s * 3 + bb * 2, 8)); if (byy > wl) b.px(bx, byy, T.W); }
    for (var sm = 0; sm < 4; sm++) { var sx = tx + 10 + sm * Math.floor(tw / 4), sy = wl - 6 - Math.floor(wrap(s * 4 + sm * 5, 14)); b.px(sx + Math.round(Math.sin(s + sm) * 2), sy, T.W); b.px(sx + Math.round(Math.sin(s + sm) * 2) + 1, sy - 1, T.LIGHT); }
    // towels and a cucumber water dispenser
    var dx = x + w - 34;
    if (dx > tx + tw + 6) { b.rect(dx, fy - 22, 12, 20, T.W); b.box(dx, fy - 22, 12, 20, T.K); disc(b, dx + 6, fy - 26, 4, T.PALE, T.K); b.px(dx + 5, fy - 27, T.LIGHT); b.px(dx + 7, fy - 25, T.LIGHT); [0, 4, 8].forEach(function (o) { b.hline(dx + 2, fy - 18 + o, 8, T.LIGHT); }); }
  };
