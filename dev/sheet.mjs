// Sprite sheet: every head x pose, 4-bit on top, 1-bit below. Usage: node dev/sheet.mjs && open dev/out/sheet.png
import fs from 'node:fs'; import path from 'node:path';
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const js = fs.readFileSync(path.join(root, 'src/shared.liquid'), 'utf8').match(/<script>([\s\S]*)<\/script>/)[1];
fs.writeFileSync(path.join(root, 'dev/out/sheet.html'), `<!doctype html><body style="margin:0;background:#fff"><script>${js}</script><script>
var O = window.__op, T = O.T, heads = Object.keys(O.HEAD), poses = Object.keys(O.BODY);
var W = poses.length * 18 + 4, H = heads.length * 40 + 4, S = 6;
var looks = [[T.K, T.W, T.W, T.DARK], [T.DARK, T.SKIN2, T.LIGHT, T.K], [T.LIGHT, T.SKIN3, T.DARK, T.MID], [T.MID, T.W, T.PALE, T.DARK], [T.K, T.SKIN3, T.MID, T.K]];
function sheet(depth, y0) {
  var b = new O.Bmp(W, H);
  b.rect(0, 0, W, H, T.WALL);
  heads.forEach(function (hd, r) { poses.forEach(function (ps, c) {
    var L = looks[r % looks.length], p = { head: hd, hair: L[0], skin: L[1], shirt: L[2], sleeve: L[2] === T.W ? T.PALE : L[2], pants: L[3], glasses: c === 2, beard: c === 3 && hd !== 'long', tie: c === 0 };
    O.person(b, p, 2 + c * 18, 2 + r * 40 + 36, ps, false);
  }); });
  var cv = document.createElement('canvas'); cv.width = W * S; cv.height = H * S; document.body.appendChild(cv);
  var ctx = cv.getContext('2d');
  for (var j = 0; j < H; j++) for (var i = 0; i < W; i++) { var t = b.p[j * W + i], v = depth === 1 ? O.ink1(t, i, j) : O.G4[t]; ctx.fillStyle = 'rgb(' + v + ',' + v + ',' + v + ')'; ctx.fillRect(i * S, j * S, S, S); }
}
sheet(4); sheet(1);
</script>`);
