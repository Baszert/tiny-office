// Builds web/office.js, the drawing engine of the plugin, for Tiny Office Live.
// Upload the web/ folder to the site (data/ must be writable for the visitor count and the doorbell).
//   node dev/web.mjs [--dev]   (--dev skips minifying)
// Run it after every change to src/shared.liquid or web/live.js: it also stamps the scripts in index.html.
import fs from 'node:fs';
import path from 'node:path';
import { minify } from 'terser';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const src = fs.readFileSync(path.join(root, 'src/shared.liquid'), 'utf8');
const js = src.match(/<script>([\s\S]*?)<\/script>/)[1];
const out = process.argv.includes('--dev') ? js : (await minify(js, { compress: { passes: 2 }, mangle: true })).code;
fs.writeFileSync(path.join(root, 'web/office.js'), '/* Tiny Office engine, built from src/shared.liquid */\n' + out);
const live = fs.readFileSync(path.join(root, 'web/live.js'), 'utf8');
// The host lets browsers keep scripts for a week, so the page asks for them by the hash of what is in
// them: a new build is a new address, and nobody keeps running last week's code.
const { createHash } = await import('node:crypto');
const stamp = (file) => createHash('sha256').update(fs.readFileSync(path.join(root, 'web', file))).digest('hex').slice(0, 10);
const page = path.join(root, 'web/index.html');
fs.writeFileSync(page, fs.readFileSync(page, 'utf8').replace(/src="(office|live)\.js(\?v=[0-9a-f]*)?"/g, (m, name) => `src="${name}.js?v=${stamp(name + '.js')}"`));
console.log(`web/office.js ${out.length} bytes, live.js ${live.length} bytes, index.html stamped`);
