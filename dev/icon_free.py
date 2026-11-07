# Free-form icon (no house template): one floor of the tower, cut open like on the screen.
# Roof with the sign and antenna, the lift shaft, a smiling worker at the desk with coffee.
# Pure pixels on a 40x40 grid, written as SVG with crisp edges and a transparent background.
N = 40
COL = {'K': '#000', 'W': '#fff', 'G': '#8c8c8c', 'L': '#cfcfcf', 'D': '#4a4a4a', 'S': '#e9e9e9'}
g = [[None] * N for _ in range(N)]
def px(x, y, c):
    if 0 <= x < N and 0 <= y < N: g[y][x] = c
def rect(x, y, w, h, c):
    for j in range(h):
        for i in range(w): px(x + i, y + j, c)
def box(x, y, w, h, c='K'):
    for i in range(w): px(x + i, y, c); px(x + i, y + h - 1, c)
    for j in range(h): px(x, y + j, c); px(x + w - 1, y + j, c)
def spr(rows, x, y, m):
    for j, r in enumerate(rows):
        for i, ch in enumerate(r):
            if ch in m: px(x + i, y + j, m[ch])
FONT = {'T': '111010010010010', 'I': '111010010010111', 'N': '110101101101101', 'Y': '101101010010010', '1': '010110010010111'}
def text(s, x, y, c='K'):
    for k, ch in enumerate(s):
        for i, bit in enumerate(FONT[ch]):
            if bit == '1': px(x + k * 4 + i % 3, y + i // 3, c)
# roof: antenna, sign on posts
for y in range(1, 11): px(31, y, 'K')
rect(29, 3, 5, 1, 'K'); rect(30, 5, 3, 1, 'K')
rect(8, 2, 19, 8, 'W'); box(8, 2, 19, 8); text('TINY', 10, 4)
px(12, 10, 'K'); px(22, 10, 'K')
# slab and outer walls
rect(0, 11, N, 3, 'G'); rect(0, 11, N, 1, 'K'); rect(0, 13, N, 1, 'K')
box(0, 11, N, 28)
# lift shaft with the floor plate
rect(1, 14, 8, 24, 'D'); rect(9, 14, 1, 24, 'K')
px(4, 17, 'W'); px(5, 17, 'W')  # lift is here
rect(2, 22, 6, 15, 'L'); box(2, 21, 6, 17); rect(4, 22, 2, 15, 'K')
# room: dotted wallpaper, lamp, window with a skyline
rect(10, 14, 29, 24, 'W')
for y in range(16, 36, 4):
    for x in range(12, 38, 5): px(x, y, 'L')
rect(27, 17, 10, 9, 'L'); box(26, 16, 12, 11)
for i, h in enumerate([3, 6, 4, 7, 2, 5, 4, 3, 6, 2]): rect(27 + i, 26 - h, 1, h, 'G' if i % 3 else 'D')
rect(31, 16, 1, 11, 'K')
# the worker: same head as on screen, smiling, glasses off
head = ['...oooooo...', '..ohhhhhho..', '.ohhhhhhhho.', 'ohhhhhhhhhho', 'ohhhssssshho', 'ohssssssssho', 'ossessssesso', 'osssssssssso', '.ossssssssso', '..osssssso..', '...oooooo...']
head = [list(r) for r in head]
for (i, j) in [(4, 8), (5, 8), (6, 8), (7, 8), (3, 7), (8, 7)]: head[j][i] = 'o'
spr(['..oCccccCo..', '.oCccccccCo.', 'oCCccccccCCo', 'oCoccccccoCo'], 12, 29, {'o': 'K', 'C': 'L', 'c': 'W'})
spr([''.join(r) for r in head], 12, 18, {'o': 'K', 'e': 'K', 'h': 'K', 's': 'S'})
# desk, monitor, mug with steam
rect(11, 33, 27, 1, 'K'); rect(12, 34, 25, 3, 'L'); box(12, 34, 25, 4)
rect(25, 26, 10, 7, 'K'); rect(26, 27, 8, 4, 'W'); rect(27, 28, 5, 1, 'K'); rect(27, 30, 3, 1, 'G'); rect(28, 32, 4, 1, 'K')
rect(34, 29, 4, 4, 'W'); box(34, 29, 4, 4); px(33, 30, 'K'); px(33, 31, 'K')
for (x, y) in [(35, 27), (36, 26), (35, 25)]: px(x, y, 'G')
# floor
rect(0, 38, N, 1, 'K')
rects = ''.join(f'<rect x="{x}" y="{y}" width="1" height="1" fill="{COL[g[y][x]]}"/>' for y in range(N) for x in range(N) if g[y][x])
open('icon.svg', 'w').write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {N} {N}" width="512" height="512" shape-rendering="crispEdges">{rects}</svg>\n')
