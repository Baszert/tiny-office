// Follows one person for a while: node dev/test/who.mjs key 2026-11-05 12:11:10 [seconds=5] [fps=30]
import { load, frame, evDay } from './engine.mjs';
const [key, day, hms, secs = 5, fps = 30] = process.argv.slice(2), OP = load(), [hh, mm, ss] = hms.split(':').map(Number), s0 = hh * 3600 + mm * 60 + (ss || 0);
if (process.env.EV) { const e0 = +process.env.EV; OP.events([{ id: 'a', k: 'lift', day: evDay(day), s: e0 + 60, f: 5 }, { id: 'b', k: 'pizza', day: evDay(day), s: e0 + 90 }, { id: 'c', k: 'party', day: evDay(day), s: e0 + 200 }, { id: 'd', k: 'lift', day: evDay(day), s: e0 + 240, f: 0 }]); }
let last = '';
for (let i = 0; i < secs * fps; i++) {
  const s = s0 + i / fps, sc = frame(OP, day, s), h = sc.b.hits.filter((q) => q.key === key), o = sc.M.all.filter((q) => (q.p.key || q.p.floor + '.' + q.p.seat) === key)[0];
  const line = h.map((q) => 'f' + q.f + ' x' + q.x + ' y' + q.y2 + ' ' + q.pose).join(' | ') + '  state ' + (o ? o.s.at + (o.s.why ? ':' + o.s.why : '') + (o.s.wait ? ':wait' : '') + (o.s.z ? '>' + o.s.z : '') : '-');
  if (line !== last) console.log((s % 60).toFixed(2).padStart(5, '0'), line); last = line;
}
