// A working gta6-cover-art-01 entry (Node 22, standard library only): the app is this directory's app/ folder, plain
// static files a desktop browser loads offline (app/index.html and its ES modules, no library and no network
// request), and the program hands it in. It copies app/ and screenshots/ from beside this file to /output and writes
// /output/dossier.json, the summary the judge reads, with the vendored make.fun library. Only the plumbing, not the
// cover art the bounty asks for: Cover Snap, a plain one-photo square cover with a sunset tint and a bold caption,
// exported as a 1080 x 1080 PNG. Its two sample photos (app/samples/) were made for make.fun with an image model and
// are free to use. Build your own GTA-style cover maker in its place, put your 3 or 4 PNG or JPEG screenshots in
// screenshots/ (the first by name is the cover) and run it.
//
// Serve it locally with `node serve.ts`, then open http://localhost:8080.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

import { readFileSync, readdirSync, statSync } from 'node:fs';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Pre-flight validation, authored for iter3: refuse to build when a required
// input is missing, naming the exact file, instead of copying a broken tree.
function requireInputs(): string[] {
  const missing: string[] = [];
  const required: Array<[string, string]> = [
    ['app entry', join(here, 'app', 'index.html')],
    ['cover screenshot', join(here, 'screenshots', '1-cover.jpg')],
  ];
  const shotsPath = join(here, 'shots.json');
  if (existsSync(shotsPath)) {
    const shots = JSON.parse(readFileSync(shotsPath, 'utf8')) as Array<{ name?: unknown }>;
    for (const shot of shots) {
      if (typeof shot.name === 'string' && shot.name.length > 0) {
        required.push(['screenshot listed in shots.json', join(here, 'screenshots', shot.name)]);
      }
    }
  }
  for (const [label, path] of required) {
    if (!existsSync(path)) missing.push(`${label} (${path})`);
  }
  if (missing.length > 0) {
    throw new Error(`missing required input file(s):\n${missing.map((m) => `  - ${m}`).join('\n')}`);
  }
  return required.map(([, path]) => path);
}

// Build summary, authored for iter3: one line per output fact so a failed or
// partial build is visible without opening the dossier.
function printBuildSummary(): void {
  const dossierPath = join(out, 'dossier.json');
  const dossierBytes = existsSync(dossierPath) ? statSync(dossierPath).size : 0;
  const appFiles = readdirSync(join(out, 'app'), { recursive: true }).length;
  const shotFiles = existsSync(join(out, 'screenshots'))
    ? readdirSync(join(out, 'screenshots')).filter((f) => /\.(png|jpe?g)$/i.test(f)).length
    : 0;
  console.log(`build summary: dossier ${dossierBytes} bytes, app files ${appFiles}, screenshots ${shotFiles}`);
}

requireInputs();

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// Offline audit, authored for iter3: the app must work with no network
// request, so any http:// or https:// reference in the copied app text files
// fails the build and lists every offending URL.
function auditOfflineApp(): void {
  const textExts = new Set(['.html', '.htm', '.js', '.mjs', '.cjs', '.ts', '.css', '.json', '.svg']);
  const appOut = join(out, 'app');
  const offenders: string[] = [];
  const walk = (dir: string): void => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(path);
      } else if (textExts.has(entry.name.slice(entry.name.lastIndexOf('.')).toLowerCase())) {
        let text: string;
        try {
          text = readFileSync(path, 'utf8');
        } catch {
          continue;
        }
        for (const url of text.match(/https?:\/\/[^\s"'<>]+/g) ?? []) {
          offenders.push(`${path}: ${url}`);
        }
      }
    }
  };
  walk(appOut);
  if (offenders.length > 0) {
    throw new Error(`external URL reference(s) found in copied app (offline app must have none):\n${offenders.map((o) => `  - ${o}`).join('\n')}`);
  }
  console.log('offline audit: no external URL references in app/');
}

auditOfflineApp();

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the bytes; the others refuse an entry the
// scorer would refuse (more than 4 screenshots or one over 256 KiB; more than 993 files in app/ or 48 MiB of app
// files, in all, or a path under app/ over 1000 bytes: app/ counts beside /output's own 1000-entry cap, its
// screenshots/ and dossier.json).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
    app_path_max_bytes: 1000,
  }),
);

printBuildSummary();
