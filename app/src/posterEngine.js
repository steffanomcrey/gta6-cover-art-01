// posterEngine.js — Neon Shores cover renderer.
// Draws a GTA-style multi-panel poster onto a 2D canvas from a poster state.
// Every pixel is local: photos come from <img> elements the app loaded from
// app/samples/ or from the user's own machine, fonts are vendored TTFs.

export const POSTER_SIZES = {
  square: { w: 1080, h: 1080, label: 'Square 1080 x 1080' },
  story: { w: 1080, h: 1350, label: 'Story 1080 x 1350' },
  wide: { w: 1920, h: 1080, label: 'Wide 1920 x 1080' },
};

export const GRADES = {
  sunset: {
    name: 'Vice Sunset', wash: ['#ff9a3d', '#ff2e63', '#7b2ff7'],
    tint: 'rgba(255, 110, 60, 0.20)', ink: '#1c0b2e', warm: 0.55,
  },
  neon: {
    name: 'Neon Nights', wash: ['#ff2ea6', '#22d3ee', '#7b2ff7'],
    tint: 'rgba(255, 46, 166, 0.18)', ink: '#12041f', warm: 0.35,
  },
  vice: {
    name: 'Vice City', wash: ['#ff5e8a', '#ffb347', '#2dd4bf'],
    tint: 'rgba(255, 94, 138, 0.16)', ink: '#160a24', warm: 0.45,
  },
  gold: {
    name: 'Golden Hour', wash: ['#ffd166', '#ff7b00', '#c0392b'],
    tint: 'rgba(255, 183, 77, 0.22)', ink: '#241203', warm: 0.7,
  },
  ink: {
    name: 'Inkwave', wash: ['#1f2937', '#ff2e63', '#f8fafc'],
    tint: 'rgba(20, 20, 40, 0.28)', ink: '#0b0b12', warm: 0.15,
  },
  palm: {
    name: 'Palmwave', wash: ['#2dd4a7', '#ffd166', '#ff7b54'],
    tint: 'rgba(45, 212, 167, 0.14)', ink: '#08231c', warm: 0.5,
  },
};

// Skin-safe means the grade wash never pushes faces into orange mush:
// the wash is a low-alpha overlay plus a cool shadow lift, never a hard tint.
export function gradeWash(ctx, rect, grade) {
  const g = ctx.createLinearGradient(rect.x, rect.y, rect.x + rect.w, rect.y + rect.h);
  g.addColorStop(0, grade.wash[0]);
  g.addColorStop(0.55, grade.wash[1]);
  g.addColorStop(1, grade.wash[2]);
  ctx.save();
  ctx.globalCompositeOperation = 'overlay';
  ctx.globalAlpha = 0.34;
  ctx.fillStyle = g;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  ctx.globalCompositeOperation = 'soft-light';
  ctx.globalAlpha = 0.5;
  ctx.fillStyle = grade.tint;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  ctx.restore();
}

// Cover-fit draw of one photo into a rect, anchored at a focal point
// (fx, fy in 0..1 of the photo) and a zoom factor, clamped so the photo
// always covers the whole rect: no dark gaps at any focal point.
export function drawFittedPhoto(ctx, img, rect, focal, zoom) {
  if (!img || !img.naturalWidth) return false;
  const iw = img.naturalWidth, ih = img.naturalHeight;
  const scale = Math.max(rect.w / iw, rect.h / ih) * (zoom || 1);
  const dw = iw * scale, dh = ih * scale;
  const fx = focal && typeof focal.x === 'number' ? focal.x : 0.5;
  const fy = focal && typeof focal.y === 'number' ? focal.y : 0.5;
  let dx = rect.x + rect.w / 2 - fx * dw;
  let dy = rect.y + rect.h / 2 - fy * dh;
  dx = Math.min(rect.x, Math.max(rect.x + rect.w - dw, dx));
  dy = Math.min(rect.y, Math.max(rect.y + rect.h - dh, dy));
  ctx.drawImage(img, dx, dy, dw, dh);
  return true;
}

function clipShape(ctx, shape) {
  ctx.beginPath();
  if (shape.kind === 'poly') {
    shape.points.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
    ctx.closePath();
  } else {
    ctx.rect(shape.x, shape.y, shape.w, shape.h);
  }
  ctx.clip();
}

function strokeShape(ctx, shape, color, width) {
  ctx.beginPath();
  if (shape.kind === 'poly') {
    shape.points.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
    ctx.closePath();
  } else {
    ctx.rect(shape.x, shape.y, shape.w, shape.h);
  }
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.stroke();
}

// Panel geometry per layout. Coordinates are pixels inside the photo zone
// (zoneW x zoneH). Panels may be rects or slashed polygons.
export function layoutPanels(layout, zoneW, zoneH) {
  const g = Math.max(4, Math.round(zoneW * 0.006));
  const R = (x, y, w, h) => ({ kind: 'rect', x, y, w, h });
  const P = (points) => ({ kind: 'poly', points });
  const third = zoneW / 3, half = zoneW / 2, q = zoneH / 4;
  switch (layout) {
    case 'ninePanel': {
      const cw = (zoneW - g * 2) / 3, ch = (zoneH - g * 2) / 3;
      const out = [];
      for (let r = 0; r < 3; r++)
        for (let c = 0; c < 3; c++)
          out.push(R(c * (cw + g), r * (ch + g), cw, ch));
      return out;
    }
    case 'heroTrio': {
      const heroW = zoneW * 0.62, sideW = zoneW - heroW - g;
      const sh = (zoneH - g * 2) / 3;
      return [R(0, 0, heroW, zoneH),
        R(heroW + g, 0, sideW, sh), R(heroW + g, sh + g, sideW, sh),
        R(heroW + g, 2 * (sh + g), sideW, sh)];
    }
    case 'heroDuo': {
      const heroW = zoneW * 0.66, sideW = zoneW - heroW - g;
      const sh = (zoneH - g) / 2;
      return [R(0, 0, heroW, zoneH),
        R(heroW + g, 0, sideW, sh), R(heroW + g, sh + g, sideW, sh)];
    }
    case 'keyArtSlash': {
      // Key-art slash: a big hero up top, then two panels cut by one
      // diagonal slash across the lower band.
      const heroH = zoneH * 0.56, bandY = heroH + g, bandH = zoneH - bandY;
      const slash = zoneW * 0.16;
      return [R(0, 0, zoneW, heroH),
        P([[0, bandY], [half - slash / 2, bandY], [half + slash / 2, bandY + bandH], [0, bandY + bandH]]),
        P([[half + slash / 2, bandY], [zoneW, bandY], [zoneW, bandY + bandH], [half - slash / 2, bandY + bandH]])];
    }
    case 'inkedPanels': {
      // Inked poster press: four panels with slanted cuts and heavy ink.
      const topH = zoneH * 0.52, botY = topH + g, botH = zoneH - botY;
      const cut = zoneW * 0.1;
      return [
        P([[0, 0], [half + cut, 0], [half - cut, topH], [0, topH]]),
        P([[half + cut, 0], [zoneW, 0], [zoneW, topH], [half - cut, topH]]),
        P([[0, botY], [half - cut, botY], [half + cut, botY + botH], [0, botY + botH]]),
        P([[half - cut, botY], [zoneW, botY], [zoneW, botY + botH], [half + cut, botY + botH]]),
      ];
    }
    case 'tiltSnap': {
      const cw = (zoneW - g) / 2, ch = (zoneH - g) / 2;
      return [R(0, 0, cw, ch), R(cw + g, 0, cw, ch),
        R(0, ch + g, cw, ch), R(cw + g, ch + g, cw, ch)];
    }
    case 'stripHero': {
      // A tall hero strip: on a wide cover the strip is only ~300px tall
      // against a 1920px-wide photo, so a short strip can never hold a
      // whole face (cover scale 2.7x). Give the hero half the photo zone
      // so the face band (eyes to mouth) reads as a deliberate close-up.
      const heroH = zoneH * 0.5, rowY = heroH + g, rowH = zoneH - rowY;
      const cw = (zoneW - g * 2) / 3;
      return [R(0, 0, zoneW, heroH),
        R(0, rowY, cw, rowH), R(cw + g, rowY, cw, rowH), R(2 * (cw + g), rowY, cw, rowH)];
    }
    case 'comicSix': {
      const cw = (zoneW - g * 2) / 3, ch = (zoneH - g) / 2;
      const out = [];
      for (let r = 0; r < 2; r++)
        for (let c = 0; c < 3; c++)
          out.push(R(c * (cw + g), r * (ch + g), cw, ch));
      return out;
    }
    case 'fullBleed':
    default:
      return [R(0, 0, zoneW, zoneH)];
  }
}

export const LAYOUTS = {
  ninePanel: 'Nine Panel Grid', heroTrio: 'Hero + Trio', heroDuo: 'Hero + Duo',
  keyArtSlash: 'Key Art Slash', inkedPanels: 'Inked Slashed Panels',
  tiltSnap: 'Tilted Snapshot', stripHero: 'Strip Hero', comicSix: 'Comic Six',
  fullBleed: 'Full Bleed',
};

// Poster-formula lettering: one huge Anton title with a sunset gradient
// fill and a thick dark outline, a Pacifico neon script subtitle, and a
// quote line. The title lives in its own band, never over a face.
function drawTitleBlock(ctx, state, band, grade) {
  const { x, y, w, h } = band;
  // Scrim so the lettering reads on any photo.
  const scrim = ctx.createLinearGradient(0, y, 0, y + h);
  scrim.addColorStop(0, 'rgba(10, 4, 24, 0)');
  scrim.addColorStop(0.35, 'rgba(10, 4, 24, 0.82)');
  scrim.addColorStop(1, 'rgba(10, 4, 24, 0.96)');
  ctx.fillStyle = scrim;
  ctx.fillRect(x, y, w, h);

  // Halftone dots across the top of the band.
  ctx.save();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.16)';
  const dotGap = Math.max(14, w / 72);
  for (let dx = x + dotGap / 2; dx < x + w; dx += dotGap) {
    const row = Math.floor((dx - x) / dotGap) % 2;
    ctx.beginPath();
    ctx.arc(dx, y + 10 + row * 4, 2.1, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Sunburst rays fanning behind the title, clipped to the band so they
  // never leak up into the photo panels.
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.globalAlpha = 0.12;
  ctx.fillStyle = '#ffd166';
  const cx = x + w / 2, cy = y + h * 0.62;
  for (let i = 0; i < 12; i++) {
    const a = Math.PI + (i / 11) * Math.PI;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, w * 0.75, a - 0.035, a + 0.035);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  const titleSize = Math.min(h * 0.36, w / Math.max(6, state.caption.length * 0.62));
  const titleY = y + h * 0.46;
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  // Star meter sits above the title, inside the band.
  drawStars(ctx, cx, y + h * 0.13, Math.min(w * 0.028, 26), state.stars);
  // Title: gradient fill, thick ink outline, slight upward slant feel via
  // letter spacing baked into the font size.
  ctx.font = `${Math.round(titleSize)}px Anton, sans-serif`;
  const tg = ctx.createLinearGradient(0, titleY - titleSize / 2, 0, titleY + titleSize / 2);
  tg.addColorStop(0, '#ffe259');
  tg.addColorStop(0.5, '#ffa751');
  tg.addColorStop(1, '#ff2e63');
  ctx.lineJoin = 'round';
  ctx.lineWidth = Math.max(4, titleSize * 0.09);
  ctx.strokeStyle = grade.ink;
  ctx.strokeText(state.caption.toUpperCase(), cx, titleY);
  ctx.fillStyle = tg;
  ctx.fillText(state.caption.toUpperCase(), cx, titleY);
  // Neon script subtitle.
  ctx.font = `${Math.round(titleSize * 0.32)}px Pacifico, cursive`;
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = '#ff2ea6';
  ctx.shadowBlur = Math.max(8, titleSize * 0.12);
  ctx.fillText(state.subtitle, cx, titleY + titleSize * 0.58);
  ctx.restore();

  // Quote line + seal + HEAT pill + tags, in the lower band. The quote
  // sits clear below the subtitle, the tags clear above the palm band.
  const lowY = y + h * 0.78;
  ctx.save();
  ctx.textAlign = 'center';
  ctx.font = `italic ${Math.round(h * 0.075)}px Georgia, serif`;
  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  ctx.fillText(`\u201c${state.quote}\u201d`, cx, lowY);
  ctx.restore();
  drawSeal(ctx, x + w * 0.055, lowY, Math.min(w * 0.032, 30));
  drawHeatPill(ctx, x + w - w * 0.055, lowY, Math.min(w * 0.032, 30), state.stars);
  // Tag chips under the quote, clear of the palm band below.
  const tags = state.tags.slice(0, 4);
  const tagY = y + h * 0.88;
  ctx.save();
  ctx.font = `${Math.round(h * 0.058)}px Anton, sans-serif`;
  ctx.textAlign = 'center';
  const widths = tags.map((t) => ctx.measureText('#' + t.toUpperCase()).width + 22);
  const total = widths.reduce((a, b) => a + b + 10, -10);
  let tx = cx - total / 2;
  tags.forEach((t, i) => {
    ctx.fillStyle = 'rgba(255,255,255,0.14)';
    roundRect(ctx, tx, tagY - h * 0.03, widths[i], h * 0.06, h * 0.03);
    ctx.fill();
    ctx.fillStyle = '#ffe9a8';
    ctx.fillText('#' + t.toUpperCase(), tx + widths[i] / 2, tagY + h * 0.002);
    tx += widths[i] + 10;
  });
  ctx.restore();
}

function drawStars(ctx, cx, cy, r, count) {
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const gap = r * 2.3;
  for (let i = 0; i < 5; i++) {
    const x = cx + (i - 2) * gap;
    ctx.font = `${Math.round(r * 2)}px sans-serif`;
    ctx.fillStyle = i < count ? '#ffd166' : 'rgba(255,255,255,0.28)';
    ctx.fillText('\u2605', x, cy);
  }
  ctx.restore();
}

function drawSeal(ctx, cx, cy, r) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fillStyle = '#ff2e63';
  ctx.fill();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = '#ffe259';
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.font = `${Math.round(r * 0.72)}px Anton, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('NS', 0, 1);
  ctx.restore();
}

function drawHeatPill(ctx, cx, cy, r, stars) {
  ctx.save();
  const label = `HEAT ${stars}/5`;
  ctx.font = `${Math.round(r * 0.62)}px Anton, sans-serif`;
  const w = ctx.measureText(label).width + r * 1.6;
  ctx.fillStyle = '#ffe259';
  roundRect(ctx, cx - w / 2, cy - r * 0.62, w, r * 1.24, r * 0.62);
  ctx.fill();
  ctx.fillStyle = '#1c0b2e';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, cx, cy + 1);
  ctx.restore();
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// A small palm silhouette strip along the very bottom edge.
function drawPalmBand(ctx, x, y, w, h) {
  ctx.save();
  ctx.fillStyle = 'rgba(8, 20, 14, 0.85)';
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = 'rgba(45, 212, 167, 0.75)';
  ctx.lineWidth = Math.max(2, h * 0.08);
  const n = Math.floor(w / (h * 2.4));
  for (let i = 0; i < n; i++) {
    const px = x + (i + 0.5) * (w / n);
    const py = y + h;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.quadraticCurveTo(px - h * 0.3, py - h * 0.7, px - h * 0.75, py - h * 0.55);
    ctx.moveTo(px, py);
    ctx.quadraticCurveTo(px + h * 0.1, py - h * 0.85, px + h * 0.55, py - h * 0.8);
    ctx.moveTo(px, py);
    ctx.quadraticCurveTo(px + h * 0.35, py - h * 0.6, px + h * 0.9, py - h * 0.35);
    ctx.stroke();
  }
  ctx.restore();
}

function drawBadge(ctx, text, x, y, scale) {
  ctx.save();
  ctx.font = `${Math.round(15 * scale)}px Anton, sans-serif`;
  const w = ctx.measureText(text).width + 26 * scale;
  const h = 30 * scale;
  ctx.translate(x, y);
  ctx.rotate(-0.03);
  ctx.fillStyle = '#ffe259';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(w, 0);
  ctx.lineTo(w - 10 * scale, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#1c0b2e';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, w / 2, h / 2 + 1);
  ctx.restore();
}

function drawChip(ctx, text, x, y, scale) {
  ctx.save();
  ctx.font = `${Math.round(13 * scale)}px Anton, sans-serif`;
  const w = ctx.measureText(text).width + 18 * scale;
  const h = 24 * scale;
  ctx.fillStyle = 'rgba(10, 4, 24, 0.78)';
  roundRect(ctx, x, y, w, h, 5 * scale);
  ctx.fill();
  ctx.fillStyle = '#ffe9a8';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x + 9 * scale, y + h / 2 + 1);
  ctx.restore();
}

// Seeded grain so the export is deterministic across runs.
function drawGrain(ctx, w, h, seed) {
  let s = seed;
  const rnd = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
  ctx.save();
  ctx.globalAlpha = 0.05;
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < 2600; i++) {
    ctx.fillRect(rnd() * w, rnd() * h, 1.4, 1.4);
  }
  ctx.restore();
}

function drawVignette(ctx, w, h) {
  const g = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.42, w / 2, h / 2, Math.max(w, h) * 0.72);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, 'rgba(0,0,0,0.34)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

// Main entry: render one poster at an exact pixel size.
export function renderPoster(canvas, state, images, size) {
  const W = size.w, H = size.h;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  const grade = GRADES[state.grade] || GRADES.sunset;
  const scale = W / 1080;

  // Backdrop.
  ctx.fillStyle = grade.ink;
  ctx.fillRect(0, 0, W, H);

  // The title band owns the bottom 24% (story covers get 22% so the
  // panels stay tall); panels live above it and never under the title.
  const bandH = Math.round(H * (size.h > size.w ? 0.22 : 0.24));
  const photoH = H - bandH;
  const panels = layoutPanels(state.layout, W, photoH);
  const gutter = Math.max(4, Math.round(W * 0.006));

  panels.forEach((shape, i) => {
    const panel = state.panels[i] || {};
    const img = images[panel.photo] || images[state.defaultPhoto] || null;
    ctx.save();
    clipShape(ctx, shape);
    const rect = shape.kind === 'poly'
      ? { x: Math.min(...shape.points.map((p) => p[0])), y: Math.min(...shape.points.map((p) => p[1])), w: Math.max(...shape.points.map((p) => p[0])) - Math.min(...shape.points.map((p) => p[0])), h: Math.max(...shape.points.map((p) => p[1])) - Math.min(...shape.points.map((p) => p[1])) }
      : shape;
    const painted = drawFittedPhoto(ctx, img, rect, panel.focus, panel.zoom);
    if (!painted) {
      ctx.fillStyle = '#3a2b52';
      ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    }
    gradeWash(ctx, rect, grade);
    ctx.restore();
    // Ink outline around every panel, white gutter line between them.
    strokeShape(ctx, shape, 'rgba(255,255,255,0.92)', Math.max(2, gutter * 0.7));
    if (state.grade === 'ink') strokeShape(ctx, shape, '#0b0b12', Math.max(3, gutter));
    // Caption chip, bottom-left inside the panel.
    const label = panel.caption || `0${i + 1} ${panelLabel(panel.photo)}`;
    const bx = (shape.kind === 'poly' ? Math.min(...shape.points.map((p) => p[0])) : shape.x) + 10 * scale;
    const by = (shape.kind === 'poly' ? Math.max(...shape.points.map((p) => p[1])) : shape.y + shape.h) - 34 * scale;
    if (rect.w > 130 * scale) drawChip(ctx, label.toUpperCase(), bx, by, scale);
  });

  // Diagonal white split line for the tilted snapshot layout.
  if (state.layout === 'tiltSnap') {
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.95)';
    ctx.lineWidth = Math.max(6, 10 * scale);
    ctx.beginPath();
    ctx.moveTo(W * 0.08, photoH * 0.92);
    ctx.lineTo(W * 0.92, photoH * 0.08);
    ctx.stroke();
    ctx.restore();
  }

  // Badge ribbon, top-left, clear of faces (panels' faces sit low).
  drawBadge(ctx, state.badge, 14 * scale, 14 * scale, scale);

  // Gold rule dividing the photo zone from the title band.
  ctx.save();
  ctx.fillStyle = '#ffe259';
  ctx.fillRect(0, photoH - Math.max(2, 3 * scale), W, Math.max(2, 3 * scale));
  ctx.restore();

  // Title band + palm band. The palm band is a fixed share of the band
  // height so the tag chips above it never collide with it.
  drawTitleBlock(ctx, state, { x: 0, y: photoH, w: W, h: bandH }, grade);
  const palmH = Math.max(10, Math.round(bandH * 0.07));
  drawPalmBand(ctx, 0, H - palmH, W, palmH);

  drawGrain(ctx, W, H, 20261119);
  drawVignette(ctx, W, H);
  return { width: W, height: H };
}

function panelLabel(photo) {
  return photo === 'pier' ? 'Pier 9' : photo === 'boulevard' ? 'Boulevard' : 'Photo';
}
