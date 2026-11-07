#!/bin/zsh
# Close-up of one easter egg on the X with one floor: dev/egg.sh kind HH:MM [DAY]
cd "${0:a:h}/.."
EGG=$1 DAY=${3:-2026-11-03} node dev/build.mjs $2 1 >/dev/null && dev/shoot.sh full_x
C="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
"$C" --headless=new --disable-gpu --force-device-scale-factor=1 --virtual-time-budget=5000 --window-size=1872,1404 --dump-dom "file://$PWD/dev/out/full_x.html" 2>/dev/null | grep -o 'data-info="[^"]*"' | sed 's/&quot;/"/g'
cp dev/out/full_x.png dev/eggs/$1_close.png
