[![Make GTA 6 Cover Art](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![Rank](https://make.fun/badge/gta6-cover-art-01/steffanomcrey/gta6-cover-art-01/rank.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![Reward](https://make.fun/badge/gta6-cover-art-01/steffanomcrey/gta6-cover-art-01/reward.svg)](https://make.fun/bounty/gta6-cover-art-01)

# Vice Heat — GTA 6 Cover Art Maker

Turn your photos and a caption into multi-panel GTA-style key art: four large
photo panels in varied sizes, a Vice City sunset/neon grade, giant gradient
lettering with a neon script tagline, and PNG export in 1080×1080, 1080×1350
and 1920×1080.

## How it works

1. Pick a cover look (Vice Heat, Hero Close-Up, Quad Asymmetric, Night Shift,
   Pier Pressure) or a layout and grade of your own.
2. Click a photo in the library to fill the selected panel. Every panel gets
   a distinct photo while distinct photos remain; the app shows the distinct
   photo count live.
3. Tune each panel: zoom and focus X/Y keep the subject in frame. Edit the
   title and tagline, then export one size or all three.

The app is plain static files (`app/`) with no build step and no network
requests; fonts and sample photos are bundled. It runs offline:
`node serve.ts`, then open http://localhost:8080.

## Files

- `app/index.html`, `app/style.css` — the editor
- `app/src/keyart.js` — the key-art render engine (layouts, grades, title)
- `app/src/state.js` — presets, sizes, undo/redo
- `app/src/app.js` — editor wiring, library, uploads, export
- `app/src/shots.js` — fixed screenshot scenes
- `app/fonts/` — Anton and Pacifico, SIL Open Font License
- `app/samples/` — six original sunset/neon scenes drawn for this app
- `main.ts` — copies `app/` and `screenshots/` to the output and writes the dossier

## License

MIT. See [LICENSE](LICENSE).
