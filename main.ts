// Neon Shores Cover Studio — entry program for gta6-cover-art-01.
// Node 22, standard library only. It hands the app in: copy app/ and
// screenshots/ from this repository into the output directory and write
// dossier.json with the vendored make.fun library, exactly as the kit's
// starter does. Outside the grader, MAKEFUN_OUTPUT_DIR stands in for
// /output:  mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outputDir, { recursive: true });
cpSync(join(repoRoot, 'app'), join(outputDir, 'app'), { recursive: true });
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
const shotsDir = join(repoRoot, 'screenshots');
if (existsSync(shotsDir)) cpSync(shotsDir, join(outputDir, 'screenshots'), { recursive: true });

// Gate caps from the kit's reference/gate.json: the dossier text cap is
// the one that shapes bytes; the rest refuse entries the scorer refuses
// (more than 4 screenshots, one over 256 KiB, app/ over 993 files or
// 48 MiB, a path under app/ over 1000 bytes).
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
