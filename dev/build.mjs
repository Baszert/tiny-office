// Renders src/*.liquid into dev/out/<name>.html with the framework CSS/JS, one page per device and view.
// Usage: node dev/build.mjs [HH:MM] [floors] [focus storey]
import fs from 'node:fs'; import path from 'node:path'; import { Liquid } from 'liquidjs';
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const read = (f) => fs.readFileSync(path.join(root, f), 'utf8');
const [hm = '10:30', floors = 'auto', focus = ''] = process.argv.slice(2);
const [H, M] = hm.split(':').map(Number);
// Env: DAY=YYYY-MM-DD (default Tue 3 Nov 2026), EGG=kind, DECO=true|false, NEWS=true|false
const [Y, Mo, D] = (process.env.DAY || '2026-11-03').split('-').map(Number);
const ts = Date.UTC(Y, Mo - 1, D, H, M) / 1000 - 3600; // local = UTC+1
const DEV = { og: 'screen--og screen--1bit screen--md', og2: 'screen--ogv2 screen--2bit screen--md', x: 'screen--v2 screen--4bit screen--lg' };
const MASH = { half_horizontal: ['mashup--1Tx1B', 2], half_vertical: ['mashup--1Lx1R', 2], quadrant: ['mashup--2x2', 4] };
const engine = new Liquid();
const ctx = { trmnl: { system: { timestamp_utc: ts }, user: { utc_offset: 3600, locale: 'en' }, plugin_settings: { custom_fields_values: { floors, decorations: process.env.DECO !== 'false', news: process.env.NEWS !== 'false', ...(process.env.NAME ? { company: process.env.NAME } : {}) } } } };
fs.mkdirSync(path.join(root, 'dev/out'), { recursive: true });
for (const v of ['full', 'half_horizontal', 'half_vertical', 'quadrant']) for (const [dk, dc] of Object.entries(DEV)) {
  let body = await engine.parseAndRender(read((process.env.SRC || 'src') + '/shared.liquid') + read(`src/${v}.liquid`), ctx);
  if (process.env.EGG) body = body.replace('class="op"', `class="op" data-egg="${process.env.EGG}"`);
  if (focus) body = body.replace('class="op"', `class="op" data-focus="${focus}"`);
  let inner = `<div class="view view--${v}">${body}</div>`;
  const m = MASH[v];
  if (m) inner = `<div class="mashup ${m[0]}">${inner}${`<div class="view view--${v}"></div>`.repeat(m[1] - 1)}</div>`;
  fs.writeFileSync(path.join(root, `dev/out/${v}_${dk}.html`), `<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="../plugins.css"><script src="../plugins.js"></script></head><body class="environment trmnl"><div class="screen screen--no-bleed ${dc}">${inner}</div></body></html>`);
}
