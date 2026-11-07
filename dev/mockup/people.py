# Mockup: options for more detailed bitizens. python3 dev/mockup/people.py -> dev/mockup/people.png
from PIL import Image, ImageDraw, ImageFont
import os
G = {'W': 255, 'P': 221, 'L': 170, 'M': 119, 'D': 85, 'K': 0}
SC = 7

def person(colors):
    c = dict(o=0, e=0, k=0, K=0, w=255, W=255, m=60)
    c.update(colors); return c

def spr(img, rows, x, y, pal, flip=False):
    px = img.load()
    for j, row in enumerate(rows):
        r = row[::-1] if flip else row
        for i, ch in enumerate(r):
            if ch == '.' or ch not in pal: continue
            v = pal[ch]
            for a in range(SC):
                for b in range(SC):
                    px[(x + i) * SC + a, (y + j) * SC + b] = (v, v, v)

def check(rows, w):
    for r in rows: assert len(r) == w, (r, len(r), w)

# ---------------------------------------------------------------- 1. now
HEAD = {
 'short': ['...oooooo...', '..ohhhhhho..', '.ohhhhhhhho.', 'ohhhhhhhhhho', 'ohhhssssshho', 'ohssssssssho', 'ossessssesso', 'osssssssssso', '.ossssoossso', '..osssssso..', '...oooooo...'],
 'long': ['...oooooo...', '..ohhhhhho..', '.ohhhhhhhho.', 'ohhhhhhhhhho', 'ohhhsssshhho', 'ohssssssssho', 'ohsessssesho', 'ohssssssssho', 'ohsssoosssho', 'ohhossssohho', '.ohhoooohho.'],
 'bun': ['....oooo....', '...ohhhho...', '..oohhhhoo..', '.ohhhhhhhho.', 'ohhhhhhhhhho', 'ohhsssssshho', 'ossessssesso', 'osssssssssso', '.ossssoossso', '..osssssso..', '...oooooo...'],
 'curly': ['..oo.oo.oo..', '.ohhohhohho.', 'ohhhhhhhhhho', 'ohhhhhhhhhho', 'ohhsssssshho', 'ohssssssssho', 'ossessssesso', 'osssssssssso', '.ossssoossso', '..osssssso..', '...oooooo...'],
}
BODY = ['..oCccccCo..', '.oCccccccCo.', 'oCCccccccCCo', 'oCoccccccoCo', 'osoccccccoso', '.ooppppppoo.', '..oppppppo..', '..oppooppo..', '..offooffo..', '..oooooooo..']

# ---------------------------------------------------------------- 2. more detail, same size (12 x 21)
HEAD2 = {
 'short': ['...oooooo...', '..ohhHHhho..', '.ohhHhhhhho.', 'ohhhhhhhhhho', 'ohhhssssshho', 'ohskksskksho', 'ossessssesSo', 'osbssssssbSo', '.ossssmmssSo', '..osssssSo..', '...oooooo...'],
 'long': ['...oooooo...', '..ohhHHhho..', '.ohhHhhhhho.', 'ohhhhhhhhhho', 'ohhhsssshhho', 'ohskksskksho', 'ohsessssesho', 'ohbssssssbho', 'ohsssmmssSho', 'ohhossssohho', '.ohhoooohho.'],
 'bun': ['....oooo....', '...ohHhho...', '..oohhhhoo..', '.ohhHhhhhho.', 'ohhhhhhhhhho', 'ohskksskkSho', 'ossessssesSo', 'osbssssssbSo', '.ossssmmssSo', '..osssssSo..', '...oooooo...'],
 'curly': ['..oo.oo.oo..', '.ohHohHohho.', 'ohhhhhhhhhho', 'ohHhhhhhhHho', 'ohhsssssshho', 'ohskksskkSho', 'ossessssesSo', 'osbssssssbSo', '.ossssmmssSo', '..osssssSo..', '...oooooo...'],
}
BODY2 = ['..oCcwwcCo..', '.oCDcwwcDCo.', 'oCCDcckcDCCo', 'oCoDcccccoCo', 'osocckccDoso', '.ookkkkkkoo.', '..oppppPpo..', '..oppooPpo..', '..ofWoofWo..', '..oooooooo..']

# ---------------------------------------------------------------- 3. clothes and accessories (same size)
HOODIE = ['..oCccccCo..', '.oCcoccocCo.', 'oCCcwccwcCCo', 'oCocwccwcoCo', 'osoccDDccoso', '.ooppppppoo.', '..oppppppo..', '..oppooppo..', '..offooffo..', '..oooooooo..']
BLAZER = ['..oCwwwwCo..', '.oCCwwwwCCo.', 'oCCCkwwkCCCo', 'oCoCCkkCCoCo', 'osoCCCCCCoso', '.ooppppppoo.', '..oppppppo..', '..oppooppo..', '..offooffo..', '..oooooooo..']
DRESS = ['..oCccccCo..', '.oCccccccCo.', 'oCCccccccCCo', 'oCoccccccoCo', 'osocccccco so'.replace(' ', ''), '.occcccccco.', 'occcccccccco', 'oooooooooooo', '...os..so...', '...of..fo...']
STRIPES = ['..oCccccCo..', '.oCkkkkkkCo.', 'oCCccccccCCo', 'oCokkkkkkoCo', 'osoccccccoso', '.ooppppppoo.', '..oppppppo..', '..oppooppo..', '..offooffo..', '..oooooooo..']
for b in (HOODIE, BLAZER, DRESS, STRIPES): check(b, 12)

# ---------------------------------------------------------------- 4. bigger: 16 x 28
HEAD4 = ['.....oooooo.....', '...oohhhhhhoo...', '..ohhhHHhhhhho..', '.ohhhHHhhhhhhho.', '.ohhhhhhhhhhhho.', 'ohhhhssssssshhho', 'ohhssssssssssSho', 'ohsskkssskkssSho', 'osssKKsssKKsssSo', 'osssKWsssKWsssSo', 'osbbsssssssbbsSo', '.osssssmmmsssSo.', '..osssssssssSo..', '...oossssssoo...', '.....oooooo.....']
HEAD4L = ['.....oooooo.....', '...oohhhhhhoo...', '..ohhhHHhhhhho..', '.ohhhHHhhhhhhho.', '.ohhhhhhhhhhhho.', 'ohhhhsssssshhhho', 'ohhssssssssssSho', 'ohsskkssskkssSho', 'ohssKKsssKKsssho', 'ohssKWsssKWsssho', 'ohbbsssssssbbsho', 'ohhsssssmmsssSho', 'ohhosssssssssoho', '.ohhoossssssohho', '..ohhoooooooohh.']
BODY4 = ['....oCcwwcCo....', '...oCccwwccCo...', '..oCCcccKcccCCo.', '.oCCDcccccccDCCo', '.oCoDcccKcccDoCo', '.osoKKKKKKKKKoso', '..oopppppppPoo..', '...opppppppPo...', '...oppPooppPo...', '...oppPooppPo...', '..offfWoofffWo..', '..oooooooooooo..']
for h in (HEAD4, HEAD4L): check(h, 16)
check(BODY4, 16)

# ---------------------------------------------------------------- 5. faces (on the current head)
def face(rows, kind):
    r = [list(x) for x in rows]
    def put(i, j, ch): r[j][i] = ch
    for i in range(3, 9):
        for j in (6, 7, 8):
            if r[j][i] in 'eo': r[j][i] = 's'
    if kind == 'smile': [put(i, 6, 'e') for i in (3, 8)]; [put(i, 8, 'o') for i in (4, 5, 6, 7)]; put(3, 7, 'o'); put(8, 7, 'o')
    if kind == 'laugh': [put(i, 6, 'o') for i in (2, 3, 8, 9)] if False else None; put(3, 6, 'o'); put(4, 5, 'o'); put(8, 6, 'o'); put(7, 5, 'o'); [put(i, 8, 'o') for i in (4, 5, 6, 7)]; put(5, 9, 'm'); put(6, 9, 'm')
    if kind == 'angry': put(3, 5, 'o'); put(4, 6, 'o'); put(8, 5, 'o'); put(7, 6, 'o'); put(3, 6, 'e'); put(8, 6, 'e'); [put(i, 8, 'o') for i in (5, 6)]
    if kind == 'sleepy': [put(i, 6, 'o') for i in (3, 4, 7, 8)]; put(6, 8, 'o')
    if kind == 'shock': put(3, 6, 'e'); put(8, 6, 'e'); put(3, 5, 'o'); put(8, 5, 'o'); [put(i, j, 'o') for i in (5, 6) for j in (8, 9)]
    if kind == 'love': put(3, 6, 'o'); put(8, 6, 'o'); put(2, 7, 'b'); put(9, 7, 'b'); [put(i, 8, 'o') for i in (5, 6)]
    return [''.join(x) for x in r]

# ---------------------------------------------------------------- the sheet
people = [
  person(dict(h=0, H=85, s=255, S=221, c=255, C=221, D=187, p=85, P=0, f=0, b=221)),
  person(dict(h=85, H=170, s=187, S=150, c=119, C=85, D=85, p=0, P=0, f=0, b=150)),
  person(dict(h=170, H=221, s=221, S=187, c=85, C=60, D=60, p=119, P=85, f=0, b=187)),
  person(dict(h=0, H=119, s=150, S=119, c=221, C=187, D=187, p=85, P=60, f=0, b=119)),
]
heads = ['short', 'long', 'bun', 'curly']
W, H = 128, 236
img = Image.new('RGB', (W * SC, H * SC), (238, 238, 238))
d = ImageDraw.Draw(img)
try: font = ImageFont.truetype('/System/Library/Fonts/Supplemental/Courier New Bold.ttf', 26)
except Exception: font = ImageFont.load_default()
def label(y, s): d.text((6 * SC, y * SC), s, fill=(0, 0, 0), font=font)
def floor(y): d.rectangle([0, y * SC, W * SC, (y + 1) * SC], fill=(0, 0, 0)); d.rectangle([0, (y + 1) * SC, W * SC, (y + 3) * SC], fill=(170, 170, 170))

y = 2
label(y, '1. NU (12 x 21)'); y += 6
for k in range(4): spr(img, HEAD[heads[k]], 8 + k * 28, y, people[k]); spr(img, BODY, 8 + k * 28, y + 11, people[k])
floor(y + 21); y += 27

label(y, '2. MEER DETAIL, ZELFDE MAAT'); y += 6
for k in range(4): spr(img, HEAD2[heads[k]], 8 + k * 28, y, people[k]); spr(img, BODY2, 8 + k * 28, y + 11, people[k])
floor(y + 21); y += 27

label(y, '3. KLEDING EN ACCESSOIRES'); y += 7
outfits = [HOODIE, BLAZER, DRESS, STRIPES]
for k in range(4):
    x = 8 + k * 28
    spr(img, HEAD2[heads[k]], x, y, people[k]); spr(img, outfits[k], x, y + 11, people[k])
# accessories on top: headphones, lanyard, beanie, bag strap
pk = dict(K=0, W=255, L=170, D=85)
spr(img, ['.KKKKKKKKKK.', 'K..........K'], 8, y - 1, pk); spr(img, ['KK', 'KK', 'KK'], 7, y + 4, pk); spr(img, ['KK', 'KK', 'KK'], 18, y + 4, pk)          # headphones
spr(img, ['K....K', '.K..K.', '..WW..', '..WW..'], 8 + 28 + 3, y + 11, pk)                                                          # lanyard
spr(img, ['...KKKKKK...', '..KDLDLDLK..', '.KDLDLDLDLK.'], 8 + 56, y - 1, pk)                                                       # beanie
spr(img, ['K.........', '.K........', '..K.......', '...K......', '....KKKKK.', '....KDDDK.', '....KKKKK.'], 8 + 84 + 4, y + 11, pk)  # bag
floor(y + 21); y += 27

label(y, '4. GROTER (16 x 27)'); y += 6
for k in range(4): x = 8 + k * 28; hd = HEAD4L if heads[k] == 'long' else HEAD4; spr(img, hd, x, y, people[k]); spr(img, BODY4, x, y + 15, people[k])
floor(y + 27); y += 33

label(y, '5. GEZICHTEN'); y += 6
for k, kind in enumerate(['smile', 'laugh', 'angry', 'sleepy', 'shock', 'love']):
    x = 6 + k * 20; p = people[k % 4]
    spr(img, face(HEAD['short'] if k % 2 == 0 else HEAD['bun'], kind), x, y, p); spr(img, BODY, x, y + 11, p)
floor(y + 21); y += 27

label(y, '6. HOUDINGEN'); y += 6
WALKA = ['..oCccccCo..', '.oCccccccCo.', 'oCCccccccCCo', 'oCoccccccoso', 'osocccccco..', '.ooppppppoo.', '..oppppppo..', '.oppo..oppo.', '.offo..offo.', '.oooo..oooo.']
PASS = ['..oCccccCo..', '.oCccccccCo.', '.oCccccccCo.', '.osccccccso.', '..occcccco..', '..oppppppo..', '..oppppppo..', '...opppo....', '...offfo....', '...ooooo....']
TYPE = ['..oCccccCo..', '.oCccccccCo.', 'oCCccccccCCo', 'oCCccccccCCo', '.osocccosso.', '..ooooooo...', '............', '............', '............', '............']
COFFEE = ['..oCccccCoWW', '.oCcccccCoWk', 'oCCcccccsoWW', 'oCocccccco..', 'osocccccco..', '.ooppppppoo.', '..oppppppo..', '..oppooppo..', '..offooffo..', '..oooooooo..']
PHONE = ['..oCccccCok.', '.oCccccccsk.', 'oCCcccccCo..', 'oCocccccco..', 'osocccccco..', '.ooppppppoo.', '..oppppppo..', '..oppooppo..', '..offooffo..', '..oooooooo..']
SIT = ['..oCccccCo..', '.oCccccccCo.', 'oCCccccccCCo', 'oCoccccccoCo', 'osoccccccoso', '.ooppppppppo', '..oppppppppo', '..oooooooofo', '.........ofo', '.........ooo']
for b in (WALKA, PASS, TYPE, COFFEE, PHONE, SIT): check(b, 12)
poses = [(WALKA, False, 0), (PASS, False, -1), (WALKA, True, 0), (PASS, True, -1), (TYPE, False, 0), (COFFEE, False, 0), (PHONE, False, 0), (SIT, False, 0)]
for k, (bd, fl, dy) in enumerate(poses):
    x = 4 + k * 15; p = people[k % 4]
    spr(img, HEAD2['short'], x, y + dy, p); spr(img, bd, x, y + 11 + dy, p, fl)
    if bd is TYPE: spr(img, ['KKKKKKKKKKKK', 'KLLLLLLLLLLK', 'KKKKKKKKKKKK'], x, y + 16, pk)
floor(y + 21); y += 27

img = img.crop((0, 0, W * SC, y * SC))
out = os.path.join(os.path.dirname(__file__), 'people.png'); img.save(out); print(out, img.size)
