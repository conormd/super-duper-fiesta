/**
 * Phase 0 — labelling foundation. Validates the reference-image library that
 * the image matcher learns from:
 *
 *   - every implant view points at a file that actually exists under public/
 *   - every real reference image carries `credit` and `license` (domain rule)
 *   - flags image files on disk that no implant references (orphans)
 *
 * Run with: npm run validate:images
 * Exits non-zero if any referenced image is missing or unlicensed, so it can
 * gate a commit or CI step.
 */
import { existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { PUBLIC_DIR, referenceImages, resolveSrc } from './refImages';

const RADIOGRAPHS_DIR = join(PUBLIC_DIR, 'radiographs');

const refs = referenceImages();
const errors: string[] = [];
const warnings: string[] = [];

// 1. Referenced files must exist and be licensed.
const referencedLocal = new Set<string>();
for (const r of refs) {
  const label = `${r.implantId} (${r.view})`;
  if (r.remote) {
    warnings.push(`${label}: remote src not checked offline — ${r.src}`);
  } else {
    referencedLocal.add(r.src.replace(/^\/+/, ''));
    if (!existsSync(resolveSrc(r.src))) {
      errors.push(`${label}: image not found at ${r.src}`);
    }
  }
  if (!r.credit) errors.push(`${label}: missing credit`);
  if (!r.license) errors.push(`${label}: missing license`);
}

// 2. Report image files on disk that nothing references.
if (existsSync(RADIOGRAPHS_DIR)) {
  for (const file of readdirSync(RADIOGRAPHS_DIR)) {
    const full = join(RADIOGRAPHS_DIR, file);
    if (!statSync(full).isFile()) continue;
    if (!/\.(jpe?g|png|webp|gif)$/i.test(file)) continue;
    if (!referencedLocal.has(`radiographs/${file}`)) {
      warnings.push(`orphan image not referenced by any implant: radiographs/${file}`);
    }
  }
}

const withImages = new Set(refs.map((r) => r.implantId)).size;
console.log(
  `Checked ${refs.length} reference image(s) across ${withImages} implant(s).`,
);
for (const w of warnings) console.log(`  warn:  ${w}`);
for (const e of errors) console.error(`  error: ${e}`);

if (errors.length > 0) {
  console.error(`\n${errors.length} error(s). Fix before building embeddings.`);
  process.exit(1);
}
console.log('\nReference image library OK.');
