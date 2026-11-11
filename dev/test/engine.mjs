// Loads the engine from src/shared.liquid for tests: no browser, no canvas.
import fs from 'node:fs';
import path from 'node:path';
export const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
export function load(file = 'src/shared.liquid') {
  const src = fs.readFileSync(path.join(root, file), 'utf8').match(/<script>([\s\S]*?)<\/script>/)[1];
  const window = { addEventListener() {}, innerWidth: 800, innerHeight: 480 };
  const doc = { querySelector: () => null, querySelectorAll: () => [], addEventListener() {}, readyState: 'complete', body: {} };
  new Function('window', 'document', 'setTimeout', 'setInterval', 'MutationObserver', src)(window, doc, () => {}, () => {}, function () { this.observe = () => {}; });
  return window.__op;
}
// one live frame of the whole tower at second s of the day
export function frame(OP, day, s, o = {}) {
  const [Y, M, D] = day.split('-').map(Number), t = s / 3600;
  const d = new Date(Date.UTC(Y, M - 1, D, Math.floor(t), Math.floor((t % 1) * 60), Math.floor(s % 60), Math.round((s % 1) * 1000)));
  return OP.scene({ w: o.w || 480, h: o.h || 1300, d, t, name: o.name || 'TINY OFFICE', deco: true, news: true, view: 'live', live: true, focus: o.focus == null ? 10 : o.focus, egg: o.egg || '' });
}
export const evDay = (day) => day.split('-').map(Number).join('-');
