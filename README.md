[![gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/steffanomcrey/gta6-cover-art-01/rank.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/steffanomcrey/gta6-cover-art-01/reward.svg)](https://make.fun/bounty/gta6-cover-art-01)

# Vice Heat — Key Art Cover Studio

A GTA 6-style cover art maker that runs offline in the browser. Four large
panels, one giant title, a single tagline: key art, not a collage. Load your
own photo (it never leaves your machine), pick a layout and a sunset/neon
grade, crop and position each panel, type the title, and export a PNG to
share.

## What it does

- 4 key-art layouts: Hero Top, Split Key, Quad Banner, Hero Stack. Every
  cover is four LARGE panels; the title is one giant Anton line across its
  own band, with a star row and one tagline. No per-panel tags, no badge.
- 5 grades: Vice Sunset, Neon Nights, Golden Hour, Palm Dusk, Mono Heat.
  Warm gradient-map washes, halftone dots, grain and vignette.
- Any photo: upload your own, or use the two bundled sample photos. Each
  panel has its own photo, zoom and focal point (across/down sliders), so
  faces stay visible: the cover fit is clamped, a photo can never slide
  out of its panel.
- Fast and easy: presets for the cover ideas, Surprise me, undo/redo, and
  one-click export of all three post sizes: 1080 x 1080, 1080 x 1350 and
  1920 x 1080.
- Offline: static files under `app/`, no network requests. Fonts are Anton
  and Pacifico under the SIL Open Font License, vendored under `app/fonts/`.
  No Rockstar logo, artwork or font anywhere.

## Run it

```
node serve.ts
```

Then open http://localhost:8080.

## Hand in

```
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` to the output directory and
writes `dossier.json` with the vendored make.fun library.

## License

MIT. See [LICENSE](LICENSE).
