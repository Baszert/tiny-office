// Face test sheet: every mood, with and without glasses, drawn 8x.
import fs from 'node:fs'; import path from 'node:path'; import { Liquid } from 'liquidjs';
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const sh = await new Liquid().parseAndRender(fs.readFileSync(path.join(root, 'src/shared.liquid'), 'utf8'), { trmnl: { system: { timestamp_utc: 0 }, user: { utc_offset: 0 }, plugin_settings: { custom_fields_values: {} } } });
fs.writeFileSync(path.join(root, 'dev/out/faces.html'), '<!doctype html><body style=margin:0>' + sh.replace(/<style>[\s\S]*?<\/style>/, '') + `<canvas id=c></canvas><script>
var o = window.__op, T = o.T, W = 120, b = new o.Bmp(W, 60); b.p.fill(T.WALL);
[null, 'smile', 'grin', 'o', 'frown'].forEach(function (m, i) { ['short', 'long'].forEach(function (h, r) {
  o.person(b, { head: h, hair: r ? T.DARK : T.K, skin: T.SKIN2, shirt: T.W, sleeve: T.PALE, pants: T.DARK, mood: m, glasses: i % 2 === 0, id: 1 }, 4 + i * 22, 27 + r * 30, 'stand'); }); });
var c = document.getElementById('c'), s = 8; c.width = W * s; c.height = 60 * s; var x = c.getContext('2d');
for (var i = 0; i < b.p.length; i++) { var g = o.G4[b.p[i]]; x.fillStyle = 'rgb(' + g + ',' + g + ',' + g + ')'; x.fillRect((i % W) * s, Math.floor(i / W) * s, s, s); }
</script>`);
