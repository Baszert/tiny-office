# Checks every rendered page in dev/out: art pixels must be uniform device-pixel blocks.
# Usage: node dev/build.mjs HH:MM && dev/shoot.sh && python3 dev/verify.py
import json, os, re, subprocess, glob
from PIL import Image
C = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'out'))
bad_total = 0
for f in sorted(glob.glob('*_og.html') + glob.glob('*_og2.html') + glob.glob('*_x.html')):
    id = f[:-5]; size = '1872,1404' if id.endswith('_x') else '800,480'
    dom = subprocess.run([C, '--headless=new', '--disable-gpu', '--force-device-scale-factor=1', '--virtual-time-budget=5000', '--window-size=' + size, '--dump-dom', 'file://' + os.path.abspath(f)], capture_output=True, text=True).stdout
    m = re.search(r'data-info="([^"]*)"', dom)
    if not m: print(f'{id:22s} NO RENDER'); bad_total += 1; continue
    d = json.loads(m.group(1).replace('&quot;', '"')); s = d['scale']; aw, ah = d['art']; dw, dh = d['device']
    ox, oy = (dw - aw * s) // 2, (dh - ah * s) // 2
    im = Image.open(id + '.png').convert('L'); px = im.load(); bad = 0
    for by in range(oy + 4 * s, oy + (ah - 4) * s, s):
        for bx in range(ox + 4 * s, ox + (aw - 4) * s, s):
            v = px[bx, by]
            if any(px[bx + i, by + j] != v for j in range(s) for i in range(s)): bad += 1
    bad_total += bad
    print(f'{id:22s} art {aw}x{ah} scale {s} focus {d["focus"]:>2}  non-uniform {bad}')
print('OK' if bad_total == 0 else f'FAIL ({bad_total})')
