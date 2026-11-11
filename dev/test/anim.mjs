// Watches the tower frame by frame and reports everything that does not move the way it should:
//   node dev/test/anim.mjs [day] [from HH:MM] [minutes] [fps]
// jump: somebody moves further in one frame than a walk allows.  teleport: somebody changes floor outside the lift.
// pop: somebody appears or vanishes in the middle of a room.     slide: somebody moves while standing still.
// moonwalk: a walk pose that does not move.                      flicker: a pose that changes and changes back at once.
// car: the lift car jumps.
import { load, frame, evDay } from './engine.mjs';
const OP = load();
const day = process.argv[2] || '2026-11-05', [h0, m0] = (process.argv[3] || '08:40').split(':').map(Number), mins = +(process.argv[4] || 10), fps = +(process.argv[5] || 30);
const s0 = h0 * 3600 + m0 * 60, dt = 1 / fps, n = Math.round(mins * 60 * fps), ed = evDay(day);
if (!process.env.NOEV) OP.events([{ id: 'a', k: 'lift', day: ed, s: s0 + 60, f: 5 }, { id: 'b', k: 'pizza', day: ed, s: s0 + 90 }, { id: 'c', k: 'party', day: ed, s: s0 + 200 }, { id: 'd', k: 'lift', day: ed, s: s0 + 240, f: 0 }]);
const hm = (s) => { const p = (v) => String(Math.floor(v)).padStart(2, '0'); return p(s / 3600) + ':' + p(s / 60 % 60) + ':' + (s % 60).toFixed(2).padStart(5, '0'); };
const prev = new Map(), found = {}, W = 480;
// what is meant to look like this: dancing and kata are steps on the spot, a cyclist rolls without walking,
// the intern inches towards the button, table tennis is a quick swing, and Gus hides somewhere new every hour
const meant = [/^(jump|slide|flicker) x:(disco|dojo):/, /^(jump|slide) x:street:.* (stand|wave)>(stand|wave)$/, /^slide x:warroom:/, /^flicker x:(game|bowling):/, /^pop x:\w+:cap4503 /, /^teleport x:roof:/];
const note = (kind, s, key, msg) => { if (meant.some((m) => m.test(kind + ' ' + key + ' ' + msg))) return; (found[kind] = found[kind] || []).push(hm(s) + ' ' + key + ' ' + msg); };
let car0 = null, t0 = Date.now();
for (let i = 0; i < n; i++) {
  const s = s0 + i * dt, sc = frame(OP, day, s), seen = new Map(), dup = new Set();
  // somebody drawn twice is in the lift between two floors (keep one), or an extra with a twin (cannot be told apart)
  for (const h of sc.b.hits) { h.lift = h.x < 34; if (seen.has(h.key) && !h.lift) dup.add(h.key); seen.set(h.key, h); }
  for (const k of dup) seen.delete(k);
  for (const [key, h] of seen) {
    const p = prev.get(key);
    if (p && p.i === i - 1) {
      const dx = h.x - p.x, dy = h.y2 - p.y2, where = 'f' + h.f + ' ' + h.room + ' x' + p.x + '>' + h.x + ' ' + p.pose + '>' + h.pose;
      if (h.f !== p.f && !(p.lift || h.lift)) note('teleport', s, key, 'f' + p.f + '>f' + h.f + ' ' + p.room + '>' + h.room + ' x' + p.x + '>' + h.x);
      else if (h.f === p.f) {
        if (Math.abs(dx) > Math.max(2, 70 * dt)) { if (h.x > -12 && h.x < W && p.x > -12 && p.x < W) note('jump', s, key, where); }
        else if (dx && h.pose !== 'walk' && p.pose !== 'walk') note('slide', s, key, where);
        if (Math.abs(dy) > 2 && !dx && !h.lift) note('hop', s, key, where + ' y' + p.y2 + '>' + h.y2);
      }
      h.still = h.pose === 'walk' && !dx ? (p.still || 0) + dt : 0;
      if (h.still > 0.4 && !(p.still > 0.4)) note('moonwalk', s, key, where);
      // a pose that comes back within a quarter of a second
      h.hist = (p.hist || []).concat(h.pose !== p.pose ? [[s, p.pose, h.pose]] : []).slice(-3);
      const q = h.hist; if (h.pose !== p.pose && q.length >= 2 && q[q.length - 1][2] === q[q.length - 2][1] && s - q[q.length - 2][0] < 0.25) note('flicker', s, key, where);
    } else if (i > 0 && !p) { if (h.x > 40 && h.x < W - 40) note('pop', s, key, 'in  f' + h.f + ' ' + h.room + ' x' + h.x + ' ' + h.pose); }
    else if (p && p.i < i - 1 && s - p.s < 1) note('blink', s, key, 'gone for ' + (s - p.s).toFixed(2) + 's f' + h.f + ' ' + h.room + ' x' + h.x);
    h.i = i; h.s = s; prev.set(key, h);
  }
  for (const [key, p] of prev) if (p.i === i - 1 && !seen.has(key) && !dup.has(key) && p.x > 40 && p.x < W - 40) note('pop', s, key, 'out f' + p.f + ' ' + p.room + ' x' + p.x + ' ' + p.pose);
  for (const [key, p] of prev) if (i - p.i > fps * 2) prev.delete(key);
  const car = sc.M && sc.M.car;
  if (car && car0 && Math.abs(car.f - car0.f) > 3 * dt) note('car', s, 'lift', car0.f.toFixed(3) + '>' + car.f.toFixed(3));
  if (car && car0 && Math.abs(car.open - car0.open) > 4 * dt) note('doors', s, 'lift', car0.open.toFixed(2) + '>' + car.open.toFixed(2));
  car0 = car ? { f: car.f, open: car.open } : null;
}
// grouped by what it is and where: staff are the people with a desk or a job, extras live in one room
const groups = {};
for (const k in found) for (const l of found[k]) {
  const [time, key, ...rest] = l.split(' '), room = (rest.join(' ').match(/f-?\d+ ([a-z]+)/) || [])[1] || '-', g = k + ' ' + (key.startsWith('x:') ? 'extra' : key === 'lift' ? 'lift' : 'staff') + ' ' + room;
  (groups[g] = groups[g] || []).push(l);
}
console.log(day, hm(s0), mins + ' min at ' + fps + ' fps,', n, 'frames,', ((Date.now() - t0) / n).toFixed(1) + ' ms each');
const show = +(process.env.SHOW || 2), only = process.env.ONLY;
let total = 0;
Object.keys(groups).sort().forEach((g) => { if (only && !g.includes(only)) return; const L = groups[g]; total += L.length; console.log(g.padEnd(34), L.length); L.slice(0, show).forEach((l) => console.log('     ', l)); });
console.log(total ? total + ' things to look at' : 'all smooth');
process.exitCode = total ? 1 : 0;
