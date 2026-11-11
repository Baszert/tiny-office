// Draws the tower thousands of times, live and the way the TRMNL does it, and fails on any error:
//   node dev/test/smoke.mjs
import { load } from './engine.mjs';
const OP = load();
let n = 0, err = 0, t0 = Date.now();
const run = (label, o, days, step, sizes) => {
  for (const dd of days) for (let s = 0; s < 86400; s += step) {
    const d = new Date(dd + 'T00:00:00Z'), t = s / 3600; d.setUTCHours(Math.floor(t), Math.floor((t % 1) * 60), Math.floor(s % 60));
    for (const [w, h, focus, depth] of sizes) {
      try { const sc = OP.scene({ w, h, d, t, name: 'TINY OFFICE', deco: true, news: true, depth, focus, ...o }); n++; if (sc.b.hits.length && n % 40 === 0) { const k = sc.b.hits[sc.b.hits.length - 1].key; OP.who(k); OP.locate(k); } }
      catch (e) { if (err++ < 5) console.log('ERR', label, dd, s, w + 'x' + h, e.stack.split('\n').slice(0, 3).join(' | ')); }
    }
  }
};
const day = '2026-11-5';
OP.events([{ id: '1', k: 'lift', day, s: 10 * 3600 + 30, f: 6 }, { id: '2', k: 'pizza', day, s: 12.9 * 3600 }, { id: '3', k: 'party', day, s: 15 * 3600 }]);
run('live', { view: 'live', live: true }, ['2026-11-05', '2026-11-07', '2026-12-24', '2026-01-01'], 241, [[480, 420, 0], [480, 420, 6], [250, 514, 12], [480, 1300, 10]]);
OP.events([]);
run('trmnl', { view: 'full', live: true, auto: true }, ['2026-11-05', '2026-11-08', '2026-10-31'], 97, [[800, 480, null, 2], [800, 480, null, 1], [400, 240, null, 4]]);
run('still', { view: 'full' }, ['2026-11-05'], 301, [[800, 480, null, 2]]);
console.log(n, 'scenes,', err, 'errors,', ((Date.now() - t0) / n).toFixed(2), 'ms each');
process.exitCode = err ? 1 : 0;
