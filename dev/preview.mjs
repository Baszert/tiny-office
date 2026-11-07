// Interactive preview: scrub through the day, switch device, view, floors and storey.
// Usage: node dev/preview.mjs && open dev/out/preview.html
import fs from 'node:fs'; import path from 'node:path'; import { Liquid } from 'liquidjs';
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const read = (f) => fs.readFileSync(path.join(root, f), 'utf8');
const shared = await new Liquid().parseAndRender(read('src/shared.liquid'), { trmnl: { system: { timestamp_utc: 0 }, user: { utc_offset: 0 }, plugin_settings: { custom_fields_values: {} } } });
fs.mkdirSync(path.join(root, 'dev/out'), { recursive: true });
fs.writeFileSync(path.join(root, 'dev/out/preview.html'), `<!doctype html><html><head><meta charset="utf-8"><title>Tiny Office preview</title>
<link rel="stylesheet" href="../plugins.css"><script src="../plugins.js"></script>
<style>
  body.pv { margin: 0; background: #2a2a2a; color: #eee; font: 13px system-ui, sans-serif; }
  .pv-bar { position: sticky; top: 0; z-index: 9; display: flex; flex-wrap: wrap; gap: 14px; align-items: center; padding: 10px 16px; background: #1b1b1b; }
  .pv-bar label { display: flex; gap: 6px; align-items: center; }
  .pv-bar input[type=range] { width: 360px; }
  .pv-time { font: 600 20px ui-monospace, monospace; min-width: 70px; }
  .pv-stage { padding: 20px; transform-origin: 0 0; }
  .pv-note { opacity: .6; }
</style></head>
<body class="pv environment trmnl">
<div class="pv-bar">
  <span class="pv-time" id="clock">10:30</span>
  <input type="range" id="t" min="0" max="1439" step="5" value="630">
  <label>Dag <select id="day"><option value="2026-11-03">di 3 nov</option><option value="2026-11-06">vr 6 nov</option><option value="2026-11-07">za 7 nov</option><option value="2026-12-18">vr 18 dec</option><option value="2026-10-30">vr 30 okt</option><option value="2026-11-20">vr 20 nov</option><option value="2026-12-31">do 31 dec</option><option value="2027-04-27">di 27 apr</option><option value="2026-07-14">di 14 jul</option></select></label>
  <label>Scène <select id="egg"><option value="">toeval</option><option>ufo</option><option>cat</option><option>stuck</option><option>raccoon</option><option>robot</option><option>pizza</option><option>bday</option><option>broken</option><option>washer</option><option>ghost</option><option>dino</option><option>boom</option><option>diver</option><option>launch</option><option>strike</option><option>parrot</option><option>door</option><option>thirteen</option><option>kaiju</option><option>secret</option><option>outage</option><option>flood</option><option>snow</option></select></label>
  <label>Scherm <select id="dev"><option value="og">OG 1-bit</option><option value="og2">OG 2-bit</option><option value="x">X 4-bit</option></select></label>
  <label>Weergave <select id="view"><option>full</option><option>half_horizontal</option><option>half_vertical</option><option>quadrant</option></select></label>
  <label>Verdiepingen <select id="floors"><option value="">auto</option><option>1</option><option>2</option><option>3</option><option>4</option></select></label>
  <label>Camera <select id="focus"><option value="">auto</option>${Array.from({ length: 17 }, (_, i) => `<option>${i - 2}</option>`).join('')}</select></label>
  <label><input type="checkbox" id="news" checked> nieuws</label>
  <label><input type="checkbox" id="play"> afspelen</label>
  <span class="pv-note" id="info"></span>
</div>
<div class="pv-stage" id="stage"></div>
${shared.replace(/<style>[\s\S]*?<\/style>/, (m) => m)}
<script>
var DEV = { og: 'screen--og screen--1bit screen--md', og2: 'screen--ogv2 screen--2bit screen--md', x: 'screen--v2 screen--4bit screen--lg' };
var MASH = { half_horizontal: ['mashup--1Tx1B', 2], half_vertical: ['mashup--1Lx1R', 2], quadrant: ['mashup--2x2', 4] };
var $ = function (id) { return document.getElementById(id); };
function draw() {
  var m = +$('t').value, hh = String(Math.floor(m / 60)).padStart(2, '0'), mm = String(m % 60).padStart(2, '0');
  $('clock').textContent = hh + ':' + mm;
  var v = $('view').value, ts = Date.parse($('day').value + 'T' + hh + ':' + mm + ':00Z') / 1000;
  var op = '<div class="op" data-view="' + v + '" data-ts="' + ts + '" data-off="0" data-floors="' + $('floors').value + '" data-deco="true" data-news="' + $('news').checked + '"' + ($('egg').value ? ' data-egg="' + $('egg').value + '"' : '') + ($('focus').value !== '' ? ' data-focus="' + $('focus').value + '"' : '') + '></div>';
  var inner = '<div class="view view--' + v + '">' + op + '</div>', mk = MASH[v];
  if (mk) inner = '<div class="mashup ' + mk[0] + '">' + inner + new Array(mk[1]).join('<div class="view view--' + v + '"></div>') + '</div>';
  var st = $('stage');
  st.innerHTML = '<div><div class="screen screen--no-bleed ' + DEV[$('dev').value] + '">' + inner + '</div></div>';
  var fit = Math.min(1, (window.innerWidth - 40) / ($('dev').value === 'x' ? 1872 : 800));
  st.style.transform = 'scale(' + fit + ')';
  var el = st.querySelector('.op'); window.__op.render(el);
  var info = JSON.parse(el.getAttribute('data-info'));
  $('info').textContent = 'art ' + info.art.join('x') + ' · schaal ' + info.scale + ' · camera op ' + info.focus + (info.egg ? ' · ' + info.egg : '') + (info.news ? ' · ' + info.news : '');
}
['t', 'day', 'dev', 'view', 'floors', 'focus', 'egg', 'news'].forEach(function (id) { $(id).addEventListener('input', draw); });
var timer = null;
$('play').addEventListener('change', function () { clearInterval(timer); if (this.checked) timer = setInterval(function () { $('t').value = (+$('t').value + 5) % 1440; draw(); }, 400); });
window.addEventListener('load', draw);
</script>
</body></html>`);
