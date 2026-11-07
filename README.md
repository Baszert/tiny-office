# Tiny Office

A pixel-art office tower that lives along with your day, drawn in black and white. People arrive in the lobby, ride the lift, work at their desks and queue for coffee, and the cafe counts every cup poured today. Evenings get quiet, the cleaner and the night guard take over, and only a few windows stay lit.

It runs on [TRMNL](https://trmnl.com) e-ink displays, and live in your browser at **[trmnl.achtnegen.nl/office](https://trmnl.achtnegen.nl/office/)**.

## What goes on in the tower

Every day is different: birthdays, Friday drinks, a broken coffee machine on a bad Monday, a window washer, a queue for the loo, a slide from the game room to the cafe, pigeons on the roof, mini golf on the roof, rain and snow days, power cuts, a flooded basement, a cat in the air ducts, an intern who ends up everywhere, Gus in his striped jumper to find somewhere in the tower, an archive in the basement, a floor 13 that is almost never there, holidays on the right days and a few rare surprises.

Every tower gets eight special floors out of twenty, in its own order:

- a dino hall, a shark tank, a lab, a jungle, a podcast studio, nap pods, a bowling alley, mission control, a zero-gravity space station, a library with a secret and an escape room
- **the war room**, planning Operation Donut, with a big red button nobody may press (the intern is inching towards it)
- **the factory**, turning out rubber ducks and staplers
- **the theme park floor**, with a rollercoaster and a carousel
- **the stock exchange**, where DONUT, COFE, NAP and MEOW go up and down all day, and someone keeps shouting MOON!
- **the disco**, with karaoke in the middle and office lyrics on the screen
- **the haunted floor**, where Gerald the ghost still looks for his mug among floating candles
- **the dojo**, where someone breaks the MONDAY board
- **the greenhouse**, with a giant pumpkin and a plant that bites
- **the capybara spa**, with oranges

## TRMNL screens and settings

All four sizes (full, half horizontal, half vertical, quadrant), on the TRMNL OG (1-bit and 2-bit) and the TRMNL X (4-bit). The art is drawn on a canvas in whole device pixels, so it stays sharp on every screen.

- **Company name:** shown on the roof sign and in the lobby. Every name gets its own tower, with its own special floors in its own order.
- **Floors:** auto, or 1, 2 or 3 floors in view.
- **Holidays and seasons:** decorations on or off.
- **Office news:** a line of gossip along the bottom, about what is going on in the tower.

Static strategy, there is no data source. `src/shared.liquid` draws the tower from the device time, seeded by the date, so every screen of the same moment looks the same and every day is different. The view files only place the canvas. On TRMNL the engine renders a live snapshot, so people are caught mid-walk, in the lift or at the counter.

## Tiny Office Live (web)

A running version of the tower in `web/`. Everything follows the clock in Amsterdam, so everyone sees the same tower at the same moment.

- **Smooth motion:** people walk with eased steps, stretch, shift their weight and cast a shadow. The lift settles with a bounce and its doors open with a ding. Lights flicker off floor by floor in the evening, the sky changes colour at sunset, mugs steam, plants sway, and the news types itself out.
- **Look around:** scroll or drag with inertia, flick to glide, zoom with `+`/`-`, ctrl+scroll or a pinch. TV mode glides through the tower on its own.
- **Click a person** to see who they are and follow them through the tower. Double click to poke them.
- **Click a lift door** to send a visitor up. **Pizza** brings a courier to the cafe and a dozen hungry colleagues. **Party** gets the whole tower dancing, with confetti.
- **Click anywhere else** to throw a paper plane. Everyone watching sees it fly.
- Sound is off until you switch it on: footsteps when zoomed in, the lift, the doorbell, planes and parties.
- URL options: `?name=ACME`, `?t=23:30`, `?d=2026-12-31`, `?speed=60`, `?egg=snow`, `?floor=5` (start at a floor, by index).

`api.php` counts who is watching and keeps the shared events, all rate limited per visitor and for everyone:

| Event | Everyone | Per visitor |
|---|---|---|
| Doorbell | once per 20 s | once a minute |
| Lift call | once per 15 s | once a minute |
| Pizza | once per 10 min | once per 30 min |
| Party | once per 5 min | once per 20 min |
| Paper plane | 40 in the air | 4 per 10 s |

It stores no IP addresses, only a short-lived salted hash. Without PHP the page still runs, without the shared events.

## Development

```bash
node dev/build.mjs 10:30            # renders every view and device into dev/out (HH:MM [floors] [floor in focus])
dev/shoot.sh && python3 dev/verify.py   # screenshots at device size, then checks the pixel grid
node dev/preview.mjs                # dev/out/preview.html: scrub through the day, pick a day, scene and device
dev/egg.sh ghost 21:30              # close-up of one scene (ufo, cat, stuck, raccoon, robot, pizza, ghost, dino, boom, diver, launch, strike, parrot, door, thirteen, kaiju, secret, outage, flood, snow, bday, broken, washer)
python3 dev/icon_free.py            # icon.svg (render icon.png from it at 512x512)
php -S localhost:8795 -t web        # the live site, locally
```

`DAY=2026-12-31`, `EGG=…`, `NAME=ACME`, `DECO=false` and `NEWS=false` in the environment change what `dev/build.mjs` renders. `dev/build.mjs` and `dev/preview.mjs` expect the TRMNL framework files `dev/plugins.css` and `dev/plugins.js`, which are not in this repository.

### Deploy

```bash
node dev/web.mjs                    # web/office.js from src/shared.liquid
node dev/dist.mjs                   # web/trmnl/office-<hash>.js and the TRMNL markup in dev/dist
```

1. Upload `index.html`, `office.js`, `live.js`, `api.php` and the `data/` folder (with its `.htaccess`) to a PHP host. `data/` must be writable by PHP.
2. Upload `web/trmnl/office-<hash>.js` (and `web/trmnl/.htaccess`) to `/office/trmnl/`.
3. Push the plugin: `(cd dev/dist && trmnlp push -f)`.

The TRMNL markup loads the script from the website, so there is no size limit. If it cannot load, the screen says Tiny Office is out for lunch. `node dev/dist.mjs --inline` puts a stripped script in the markup instead (TRMNL caps that near 100 KB).
