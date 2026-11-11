// Where is everything on screen: node dev/test/where.mjs 2026-11-05 08:31:00  -> floor, room, y range of people
import { load, frame } from './engine.mjs';
const [day, hms] = process.argv.slice(2), OP = load(), [hh, mm, ss] = hms.split(':').map(Number), sc = frame(OP, day, hh * 3600 + mm * 60 + (ss || 0)), rows = {};
for (const h of sc.b.hits) { const k = h.room + ' f' + h.f; rows[k] = rows[k] || { y: h.y2, n: 0, xs: [] }; rows[k].n++; rows[k].xs.push(h.x); }
for (const l of sc.b.lifts) console.log('lift f' + l.f, 'y', l.y, '-', l.y2);
for (const k in rows) console.log(k.padEnd(16), 'feet y', rows[k].y, 'people', rows[k].n, 'x', rows[k].xs.join(','));
