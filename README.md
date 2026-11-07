# Tiny Office for TRMNL

A pixel-art office tower that lives along with your day, drawn in black and white. People arrive in the lobby, ride the lift, work at their desks and queue for coffee, and the cafe counts every cup poured today. Evenings get quiet, the cleaner and the night guard take over, and only a few windows stay lit.

Every day is different: birthdays, Friday drinks, a broken coffee machine on a bad Monday, a window washer, a queue for the loo, a slide from the game room to the cafe, pigeons on the roof, five special floors out of twelve (a dino hall, a shark tank, a lab, a jungle, a podcast studio, nap pods, a bowling alley, mission control, a ball pit meeting room, a zero-gravity space station, a library with a secret, an escape room), mini golf on the roof, snow days, power cuts, a flooded basement, a cat in the air ducts, an intern who ends up everywhere, Gus in his striped jumper to find somewhere in the tower, an archive in the basement, a floor 13 that is almost never there, holidays on the right days and a few rare surprises.

## Screens and settings

All four sizes (full, half horizontal, half vertical, quadrant), on the TRMNL OG (1-bit and 2-bit) and the TRMNL X (4-bit). The art is drawn on a canvas in whole device pixels, so it stays sharp on every screen.

- **Company name:** shown on the roof sign and in the lobby. Every name gets its own tower, with its own special floors in its own order.
- **Floors:** auto, or 1, 2 or 3 floors in view.
- **Holidays and seasons:** decorations on or off.
- **Office news:** a line of gossip along the bottom, about what is going on in the tower.

## How it works

Static strategy: there is no data source. `src/shared.liquid` draws the tower from the device time, seeded by the date, so every screen of the same moment looks the same and every day is different. The view files only place the canvas.

## Development

```bash
node dev/build.mjs 10:30            # renders every view and device into dev/out (HH:MM [floors] [floor in focus])
dev/shoot.sh && python3 dev/verify.py   # screenshots at device size, then checks the pixel grid
node dev/preview.mjs                # dev/out/preview.html: scrub through the day, pick a day, scene and device
dev/egg.sh ghost 21:30              # close-up of one scene (ufo, cat, stuck, raccoon, robot, pizza, ghost, dino, boom, diver, launch, strike, parrot, door, thirteen, kaiju, secret, outage, flood, snow, bday, broken, washer)
python3 dev/icon_free.py            # icon.svg (render icon.png from it at 512x512)
node dev/dist.mjs   # writes web/trmnl/office-<hash>.js and dev/dist
# upload web/trmnl/office-<hash>.js (and web/trmnl/.htaccess) to trmnl.achtnegen.nl/office/trmnl/ first, then:
(cd dev/dist && trmnlp push -f)
# the markup loads the script from there, so there is no size limit; if it cannot load, the screen says Tiny Office is out for lunch.
# node dev/dist.mjs --inline puts a stripped script in the markup instead (TRMNL caps that near 100 KB)
```

TRMNL refuses a `shared.liquid` that is too large (126 KB was refused), so always push from `dev/dist`, where the script is minified (about 75 KB). `SRC=dev/dist/src node dev/build.mjs` renders the minified version.

`DAY=2026-12-31`, `EGG=…`, `NAME=ACME`, `DECO=false` and `NEWS=false` in the environment change what `dev/build.mjs` renders.

## Tiny Office Live (web)

A running version of the tower for the web, in `web/`. People walk, the lift rides, fish swim, and everything follows the clock in Amsterdam, so everyone sees the same tower at the same moment.

- On top of the TRMNL people (brows, blush, collars, outfits, headphones, lanyards, more faces, typing and phoning), live adds a passing stride, alternating hands while typing, and bags and winter beanies on the way in and out.
- Build the engine: `node dev/web.mjs` (writes `web/office.js` from `src/shared.liquid`).
- Deploy: upload `index.html`, `office.js`, `live.js`, `api.php` and the `data/` folder (with its `.htaccess`) to a PHP host, for example achtnegen.nl/office/. `data/` must be writable by PHP.
- `api.php` counts who is watching and keeps the shared events: the doorbell (once per 20 s for everyone, once a minute per visitor), lift calls (once per 15 s, once a minute per visitor) and pizza (once per 10 min, once per 30 min per visitor). It stores no IP addresses, only a short-lived hash. Without PHP the page still runs, without the shared events.
- Click a person to see who they are and follow them through the tower. Click a lift door to send a visitor up. Pizza brings a courier to the cafe and a dozen hungry colleagues. Sound is off until you switch it on.
- Live only: one lift timetable for everybody (the cleaner and the guard ride it too), people walk at a steady pace and queue in order, empty desks get a jacket on the chair, birthdays gather the floor around the cake, the window washer glides down between floors.
- URL options: `?name=ACME`, `?t=23:30`, `?d=2026-12-31`, `?speed=60`, `?egg=snow`, `?floor=5` (start at a floor, by index).
- Local test: `php -S localhost:8795 -t web`.
