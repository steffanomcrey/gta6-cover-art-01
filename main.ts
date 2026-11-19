// Neon Shores, a gta6-cover-art-01 entry (Node 22, standard library only).
//
// The program hands the app in: it copies this repository's app/ and
// screenshots/ into /output and writes /output/dossier.json with the
// vendored make.fun library's buildDossier. The app itself is plain static
// files under app/ (index.html plus ES modules, vendored fonts, two sample
// photos) that run offline in a desktop browser and draw GTA-style
// multi-panel cover art on a canvas, exported as PNG.
//
// Serve the app locally with `node serve.ts`, then open http://localhost:8080.
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outputDir, { recursive: true });
cpSync(join(repoRoot, 'app'), join(outputDir, 'app'), { recursive: true });
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) {
  cpSync(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'), { recursive: true });
}

// Gate limits from the kit's reference/gate.json: the dossier text cap is
// the only one that shapes bytes; the rest refuse entries the scorer
// would refuse anyway (too many or too large screenshots, app/ over its
// file count or byte cap, an app/ path over 1000 bytes).
writeFileSync(
  join(outputDir, 'dossier.json'),
  buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
    app_path_max_bytes: 1000,
  }),
);
