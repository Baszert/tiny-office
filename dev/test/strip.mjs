// A film strip of the tower: the same crop, frame after frame, side by side in one PNG.
//   node dev/test/strip.mjs out.png 2026-11-05 08:46:30 x,y,w,h [frames=12] [step=0.1] [scale=4] [cols=6]
// FOCUS=10 H=1300 pick the camera; EV=1 adds test events (a lift call at +0s to floor 5, pizza at +5s).
import fs from 'node:fs';
import zlib from 'node:zlib';
import { load, frame, evDay } from './engine.mjs';
const [out, day, hms, crop, nf = 12, step = 0.1, scale = 4, cols = 6] = process.argv.slice(2);
const OP = load(), [hh, mm, ss] = hms.split(':').map(Number), s0 = hh * 3600 + mm * 60 + (ss || 0), [cx, cy, cw, ch] = crop.split(',').map(Number);
const N = +nf, S = +scale, C = Math.min(+cols, N), R = Math.ceil(N / C), pad = 2, W = C * (cw * S + pad) + pad, H = R * (ch * S + pad) + pad, o = { focus: process.env.FOCUS == null ? 10 : +process.env.FOCUS, h: +(process.env.H || 1300) };
if (process.env.EV) OP.events([{ id: 'a', k: 'lift', day: evDay(day), s: s0, f: 5 }, { id: 'b', k: 'pizza', day: evDay(day), s: s0 + 5 }]);
const px = Buffer.alloc(W * H, 255), sim = 1 / 30;
for (let k = 30; k > 0; k--) frame(OP, day, s0 - k * sim, o); // warm up, so smoothing has a past
if (process.env.PLANE) { const [px0, py0, pd = 1] = process.env.PLANE.split(',').map(Number); console.log('lands', JSON.stringify(OP.plane(px0, py0, o.focus, pd))); } // PLANE=x,y,dir throws a paper plane
if (process.env.TORCH) { const [tx, ty] = process.env.TORCH.split(',').map(Number); OP.torch(tx, ty); } // TORCH=x,y holds a torch there
for (let i = 0; i < N; i++) {
  if (i) for (let u = +step - sim; u > 0.001; u -= sim) frame(OP, day, s0 + i * +step - u, o); // the frames in between, so motion that depends on the last frame is right
  const sc = frame(OP, day, s0 + i * +step, o), ox = pad + (i % C) * (cw * S + pad), oy = pad + Math.floor(i / C) * (ch * S + pad);
  for (let y = 0; y < ch * S; y++) for (let x = 0; x < cw * S; x++) px[(oy + y) * W + ox + x] = OP.G4[sc.b.p[(cy + Math.floor(y / S)) * sc.b.w + cx + Math.floor(x / S)]];
}
const raw = Buffer.alloc((W + 1) * H); for (let y = 0; y < H; y++) px.copy(raw, y * (W + 1) + 1, y * W, (y + 1) * W);
const tab = []; for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; tab[n] = c >>> 0; }
const crc = (b) => { let c = 0xffffffff; for (const x of b) c = tab[(c ^ x) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
const chunk = (ty, d) => { const l = Buffer.alloc(4); l.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(ty), d]), c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([l, td, c]); };
const ih = Buffer.alloc(13); ih.writeUInt32BE(W, 0); ih.writeUInt32BE(H, 4); ih[8] = 8; ih[9] = 0;
fs.writeFileSync(out, Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ih), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]));
