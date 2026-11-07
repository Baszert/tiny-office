#!/bin/zsh
# Screenshots dev/out/*.html at true device resolution (X = 1040x780 CSS scaled 1.8 by the framework).
cd "${0:a:h}/out"
C="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
for f in ${1:-*}.html; do
  id=${f:r}; case $id in *_x) s=1872,1404;; *) s=800,480;; esac
  "$C" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 --allow-file-access-from-files --virtual-time-budget=5000 --window-size=$s --screenshot=$PWD/$id.png "file://$PWD/$f" 2>/dev/null &
done; wait
