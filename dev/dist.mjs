// Builds dev/dist, the copy of the plugin that is pushed to TRMNL:
//   node dev/dist.mjs && (cd dev/dist && trmnlp push -f)
// By default the drawing script is not in the markup: it goes to web/trmnl/office-<hash>.js, which is
// uploaded to trmnl.achtnegen.nl/office/trmnl/ BEFORE pushing, and the markup loads it from there. The name
// changes with the content, so a push never picks up a file that changed afterwards, and old versions
// keep working until they are deleted. If the file cannot be loaded the screen says so.
//   node dev/dist.mjs --inline   puts a stripped, minified script in the markup instead (TRMNL caps
//                                shared.liquid near 100 KB, so live-only code is dropped then)
import fs from 'node:fs';
import path from 'node:path';
import { minify } from 'terser';
import crypto from 'node:crypto';

const HOST = 'https://trmnl.achtnegen.nl/office/trmnl/';
const INLINE = process.argv.includes('--inline');

// Functions only the live web page runs: their bodies are dropped from the TRMNL copy to stay under the size limit.
const LIVE_ONLY = ['crew', 'who', 'locate', 'findKey', 'stateFloor', 'hitKey', 'placeTrips', 'guests', 'liveShaft', 'liftPlan', 'liveWhere', 'tripsOf', 'carAt', 'tripPeople', 'bubble', 'settled', 'callAt', 'hhmm', 'liveNews', 'escapeLive', 'who', 'trolley', 'stroll'];
// Word lists only the live page uses: emptied in the TRMNL copy.
const LIVE_VARS = ['GOSSIP', 'NAMES2', 'ROLE', 'WHY', 'NEXT'];
function stripLive(js) {
  for (const name of LIVE_ONLY) {
    const at = js.indexOf('function ' + name + '(');
    if (at < 0) throw new Error('no function ' + name);
    let i = js.indexOf('{', at), depth = 0, q = null;
    const start = i;
    for (; i < js.length; i++) {
      const c = js[i];
      if (q) { if (c === '\\') i++; else if (c === q) q = null; continue; }
      if (c === "'" || c === '"') q = c;
      else if (c === '{') depth++;
      else if (c === '}' && --depth === 0) break;
    }
    js = js.slice(0, start) + '{}' + js.slice(i + 1);
  }
  for (const name of LIVE_VARS) {
    const m = js.match(new RegExp('var ' + name + ' = ([\\[{])'));
    if (!m) throw new Error('no var ' + name);
    const open = m[1], close = open === '[' ? ']' : '}', start = m.index + m[0].length - 1;
    let i = start, depth = 0, q = null;
    for (; i < js.length; i++) {
      const c = js[i];
      if (q) { if (c === '\\') i++; else if (c === q) q = null; continue; }
      if (c === "'" || c === '"') q = c;
      else if (c === open) depth++;
      else if (c === close && --depth === 0) break;
    }
    js = js.slice(0, start) + open + close + js.slice(i + 1);
  }
  return js;
}
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const out = path.join(root, 'dev', 'dist');
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(path.join(out, 'src'), { recursive: true });
fs.copyFileSync(path.join(root, '.trmnlp.yml'), path.join(out, '.trmnlp.yml'));
for (const f of fs.readdirSync(path.join(root, 'src'))) {
  let body = fs.readFileSync(path.join(root, 'src', f), 'utf8');
  if (f === 'shared.liquid') {
    const m = body.match(/<script>([\s\S]*?)<\/script>/);
    if (INLINE) {
      const min = await minify(stripLive(m[1]), { compress: { passes: 2 }, mangle: true, format: { comments: false } });
      body = body.replace(m[1], () => min.code);
      console.log(`shared.liquid ${m[1].length} -> ${min.code.length} bytes of script, ${body.length} in all`);
    } else {
      const min = await minify(m[1], { compress: { passes: 2 }, mangle: true, format: { comments: false } });
      const code = '/* Tiny Office for TRMNL, built from src/shared.liquid */\n' + min.code;
      const name = 'office-' + crypto.createHash('sha1').update(code).digest('hex').slice(0, 10) + '.js';
      fs.mkdirSync(path.join(root, 'web', 'trmnl'), { recursive: true });
      fs.writeFileSync(path.join(root, 'web', 'trmnl', name), code);
      // the fallback: a plain message in every .op box when the script did not load
      const fallback = "(function(){function f(){if(window.__op)return;var e=document.querySelectorAll('.op');for(var i=0;i<e.length;i++)e[i].innerHTML='<div style=\"display:flex;height:100%;align-items:center;justify-content:center;text-align:center;font-family:monospace;font-size:20px;line-height:1.4\">TINY OFFICE<br>is out for lunch,<br>back at the next refresh</div>';}if(document.readyState==='complete')f();else window.addEventListener('load',f);})();";
      body = body.replace(m[0], () => '<script src="' + HOST + name + '"></script>\n<script>' + fallback + '</script>');
      console.log(`web/trmnl/${name} ${code.length} bytes; shared.liquid ${body.length} bytes. Upload web/trmnl/${name} to ${HOST} before pushing.`);
    }
  }
  fs.writeFileSync(path.join(out, 'src', f), body);
}
