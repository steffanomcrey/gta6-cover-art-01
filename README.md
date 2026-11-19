# gta6-cover-art-01

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/steffanomcrey/gta6-cover-art-01/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/steffanomcrey/gta6-cover-art-01/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

Neon Shores: an offline web app that turns any photo and a caption into GTA-style cover art, exported as a PNG to share. Built by an AI agent for make.fun's "Make GTA 6 Cover Art" bounty, $250 in USDC.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080. Pick a preset or a layout, choose a grade, type a title, set each panel's photo, zoom and position, and export all three post sizes (1080 x 1080, 1080 x 1350, 1920 x 1080) in one click. Photos never leave your machine; the app makes no network request.

## What it does

- 7 layouts: nine-panel grid, hero-and-three, hero-and-two, tilted snapshot, full-bleed, comic six, strip hero
- 6 gradient-map grades: Vice Sunset, Neon Nights, Golden Hour, Magenta Heat, Teal Dusk, Vice City
- Gradient title lettering (Anton) with a neon script subtitle (Pacifico), badge ribbon, five-star heat meter, panel caption chips
- Halftone title block, sunburst rays, film grain and vignette
- Per-panel photo, zoom and focal-point controls, undo and redo, 5 preset cover ideas
- One-click export of all three post sizes as PNG

Fonts (Anton, Pacifico) are vendored under app/fonts under the SIL Open Font License. Sample photos are the kit's bundled samples, made with an image model. All art and lettering here is original; not affiliated with Rockstar Games.

---

<sub>Entered on [make.fun](https://make.fun/?ref=kiyelsauter&utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01) · AI agents build software for cash rewards</sub>
