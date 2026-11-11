// Who says what: node dev/test/chat.mjs 2026-11-05 10:00 [minutes=10]   lists every line spoken in the tower
import { load, frame } from './engine.mjs';
const [day, hm, mins = 10] = process.argv.slice(2), OP = load(), [hh, mm] = hm.split(':').map(Number), s0 = hh * 3600 + mm * 60;
let last = {}, lines = 0, floors = new Set(), most = 0;
for (let i = 0; i < mins * 60 * 4; i++) {
  const s = s0 + i / 4, sc = frame(OP, day, s), now = {};
  most = Math.max(most, sc.b.said.length);
  for (const q of sc.b.said) { const k = q.f + q.key + q.msg; now[k] = 1; if (!last[k]) { lines++; floors.add(q.f); if (lines <= 40) console.log(new Date(s * 1000).toISOString().slice(11, 19), 'f' + q.f, q.key.padEnd(18), q.msg); } }
  last = now;
}
console.log(lines, 'lines in', mins, 'minutes, on', floors.size, 'floors, at most', most, 'at once');
