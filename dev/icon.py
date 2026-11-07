# Plugin icon in the house template (512x512): shadow plate, lighter face, 20 px black strokes.
# One of the tower's people, smiling over a mug of coffee, in front of the lit tower.
from PIL import Image, ImageDraw
COL = {'o': (0, 0, 0), 'K': (0, 0, 0), 'e': (0, 0, 0), 'f': (0, 0, 0), 'h': (40, 40, 40), 's': (241, 205, 160), 'c': (255, 255, 255), 'C': (225, 225, 225),
       'p': (74, 74, 74), 'W': (255, 255, 255), 'D': (74, 74, 74), 'G': (140, 140, 140), 'L': (207, 207, 207), 'Y': (255, 236, 150), 'M': (122, 74, 42)}
FACE, SHADOW = (251, 227, 181), (139, 90, 43)
N, U = 28, 16
g = [[None] * N for _ in range(N)]
def px(x, y, c):
    if 0 <= x < N and 0 <= y < N: g[y][x] = c
def rect(x, y, w, h, c):
    for j in range(h):
        for i in range(w): px(x + i, y + j, c)
def box(x, y, w, h, c='K'):
    for i in range(w): px(x + i, y, c); px(x + i, y + h - 1, c)
    for j in range(h): px(x, y + j, c); px(x + w - 1, y + j, c)
def spr(rows, x, y):
    for j, r in enumerate(rows):
        for i, ch in enumerate(r):
            if ch != '.': px(x + i, y + j, ch)
# the tower behind, windows lit
rect(13, 3, 13, 23, 'D'); box(13, 3, 13, 23); px(19, 0, 'K'); px(19, 1, 'K'); px(19, 2, 'K'); rect(18, 1, 3, 1, 'K')
lit = 'YWYYW' 'WYWYY' 'YYWWY' 'WYYWY' 'YWYYW' 'YYWYW'
for r in range(6):
    for c in range(3):
        rect(15 + c * 4, 5 + r * 3, 2, 2, 'Y' if lit[r * 5 + c] == 'Y' else 'G')
# street
rect(0, 25, N, 3, 'G'); rect(0, 25, N, 1, 'K')
# a smiling bitizen, the same sprite as on screen
head = ['...oooooo...', '..ohhhhhho..', '.ohhhhhhhho.', 'ohhhhhhhhhho', 'ohhhssssshho', 'ohssssssssho', 'ossessssesso', 'osssssssssso', '.ossssssssso', '..osssssso..', '...oooooo...']
head = [list(r) for r in head]
for (i, j) in [(4, 8), (5, 8), (6, 8), (7, 8), (3, 7), (8, 7)]: head[j][i] = 'o'
body = ['..oCccccCo..', '.oCccccccCo.', 'oCCccccccCCo', 'oCoccccccoCo', 'osoccccccoso', '.ooppppppoo.', '..oppppppo..', '..oppooppo..', '..offooffo..', '..oooooooo..']
spr([''.join(r) for r in head], 2, 4); spr(body, 2, 15)
# the mug in hand, steaming
spr(['.WWWW.', 'oooooo', 'oMMMMoo', 'oMMMMo.o', 'oMMMMoo', '.oooo.'], 11, 16)
spr(['.W..W', 'W..W.', '.W..W'], 12, 12)
S = 4
im = Image.new('RGBA', (512 * S, 512 * S), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
d.rounded_rectangle([10 * S, 10 * S, 502 * S, 502 * S], 90 * S, fill=SHADOW)
face = Image.new('L', im.size, 0); fd = ImageDraw.Draw(face); fd.rounded_rectangle([10 * S, 10 * S, 463 * S, 464 * S], 50 * S, fill=255)
plate = Image.new('L', im.size, 0); ImageDraw.Draw(plate).rounded_rectangle([10 * S, 10 * S, 502 * S, 502 * S], 90 * S, fill=255)
from PIL import ImageChops; face = ImageChops.multiply(face, plate)
layer = Image.new('RGBA', im.size, FACE + (255,)); ld = ImageDraw.Draw(layer)
OX, OY = 12, 12
for y in range(N):
    for x in range(N):
        if g[y][x]: ld.rectangle([(OX + x * U) * S, (OY + y * U) * S, (OX + (x + 1) * U) * S - 1, (OY + (y + 1) * U) * S - 1], fill=COL[g[y][x]])
im.paste(layer, (0, 0), face)
d.rounded_rectangle([10 * S, 10 * S, 502 * S, 502 * S], 90 * S, outline=(0, 0, 0), width=20 * S)
im.resize((512, 512), Image.LANCZOS).save('dev/icon-house.png')
