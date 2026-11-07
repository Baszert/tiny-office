// Builds web/office.js, the drawing engine of the plugin, for Tiny Office Live.
// Upload the web/ folder to the site (data/ must be writable for the visitor count and the doorbell).
//   node dev/web.mjs [--dev]   (--dev skips minifying)
import fs from 'node:fs';
import path from 'node:path';
import { minify } from 'terser';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const src = fs.readFileSync(path.join(root, 'src/shared.liquid'), 'utf8');
const js = src.match(/<script>([\s\S]*?)<\/script>/)[1];
const out = process.argv.includes('--dev') ? js : (await minify(js, { compress: { passes: 2 }, mangle: true })).code;
fs.writeFileSync(path.join(root, 'web/office.js'), '/* Tiny Office engine, built from src/shared.liquid */\n' + out);
const live = fs.readFileSync(path.join(root, 'web/live.js'), 'utf8');
console.log(`web/office.js ${out.length} bytes, live.js ${live.length} bytes`);
