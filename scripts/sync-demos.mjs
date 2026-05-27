#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const REPO = process.env.AVA_REPO ?? 'https://github.com/mahimairaja/awesome-voice-apps.git';
const REF = process.env.AVA_REF ?? 'main';
const TARGET = path.resolve(process.cwd(), '..', 'awesome-voice-apps');
const BAKED_PATH = path.resolve(process.cwd(), 'lib/demos/_generated.json');
const IS_VERCEL = process.env.VERCEL === '1';
const IS_STRICT = process.env.AVA_SYNC_STRICT === '1';

function log(message) {
  console.log(`[sync-demos] ${message}`);
}

function clone() {
  log(`cloning ${REPO}#${REF} into ${TARGET}`);
  execFileSync('git', ['clone', '--depth', '1', '--branch', REF, REPO, TARGET], {
    stdio: 'inherit',
  });
}

function warnAndContinue(err) {
  const message = err instanceof Error ? err.message : String(err);
  console.warn(`[sync-demos] clone failed: ${message}`);
  console.warn(
    '[sync-demos] continuing without sibling manifests; reference seed data will render'
  );
  if (IS_STRICT) process.exit(1);
}

/**
 * After the cookbook is on disk (cloned or reused), walk
 * '<TARGET>/demos/<slug>/playground.json' and write a single JSON blob inside
 * the project tree at 'lib/demos/_generated.json'. The loader imports this
 * file directly, so manifests survive Vercel's serverless-function bundling
 * (the sibling clone target lives outside the project root and is not
 * included in the deploy artifacts otherwise).
 */
function bakeManifests() {
  const demosRoot = path.join(TARGET, 'demos');
  const baked = [];

  if (fs.existsSync(demosRoot)) {
    const entries = fs.readdirSync(demosRoot, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      if (entry.name.startsWith('.') || entry.name.startsWith('_')) continue;

      const manifestPath = path.join(demosRoot, entry.name, 'playground.json');
      if (!fs.existsSync(manifestPath)) continue;

      let parsed;
      try {
        parsed = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        throw new Error(`invalid JSON in ${manifestPath}: ${message}`);
      }
      baked.push({ slug: entry.name, ...parsed });
    }
  }

  fs.mkdirSync(path.dirname(BAKED_PATH), { recursive: true });
  fs.writeFileSync(BAKED_PATH, JSON.stringify(baked, null, 2) + '\n');
  log(`baked ${baked.length} manifest(s) into ${path.relative(process.cwd(), BAKED_PATH)}`);
}

try {
  const exists = fs.existsSync(TARGET);

  if (IS_VERCEL) {
    if (exists) {
      log(`vercel build: removing stale ${TARGET}`);
      fs.rmSync(TARGET, { recursive: true, force: true });
    }
    clone();
  } else if (!exists) {
    log('local build: sibling not present, cloning');
    clone();
  } else {
    log(`reusing local sibling at ${TARGET}`);
  }

  bakeManifests();
} catch (err) {
  warnAndContinue(err);
  // Always emit an empty baked file so the loader's static import never fails
  // even when the clone or bake step did not complete.
  try {
    fs.mkdirSync(path.dirname(BAKED_PATH), { recursive: true });
    if (!fs.existsSync(BAKED_PATH)) {
      fs.writeFileSync(BAKED_PATH, '[]\n');
      log(`wrote empty fallback to ${path.relative(process.cwd(), BAKED_PATH)}`);
    }
  } catch {
    /* ignore - loader will fall back to reference seed if import fails */
  }
}
