#!/usr/bin/env bash
# Copies the game page into the app, wrapped in a full HTML document. three.js and the fonts are
# bundled in assets/game, so the app never goes online (no Google Fonts or CDN requests).
# Usage: scripts/sync-game.sh web/turbo-rush.html
set -euo pipefail
src="${1:?usage: scripts/sync-game.sh web/turbo-rush.html}"
out="$(cd "$(dirname "$0")/.." && pwd)/app/src/main/assets/game/index.html"
{
  echo '<!doctype html><html lang="en"><head><meta charset="utf-8">'
  echo '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no">'
  echo '<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}[hidden]{display:none!important}img{max-width:100%}</style>'
  echo '</head><body>'
  echo '<link rel="stylesheet" href="fonts/fonts.css">'
  sed -e 's#https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js#three.min.js#' \
      -e '/fonts\.googleapis\.com/d' -e '/fonts\.gstatic\.com/d' "$src"
  echo '</body></html>'
} > "$out"
grep -q 'src="three.min.js"' "$out" || { echo "three.js script tag not found in $src" >&2; exit 1; }
if grep -Eq 'https?://(fonts\.|cdnjs\.|cdn\.)' "$out"; then echo "index.html still loads something from the internet" >&2; exit 1; fi
echo "Wrote $out"
