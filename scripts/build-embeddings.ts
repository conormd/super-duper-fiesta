/**
 * Phase 1 — build-time image embeddings. Runs every reference radiograph
 * through a pretrained CLIP image encoder once and writes the resulting
 * vectors to public/embeddings.json. The browser matcher (src/lib/imageMatch)
 * embeds an uploaded image with the SAME model and ranks implants by cosine
 * similarity against this file — no training, and adding an implant just means
 * adding its images and re-running this script.
 *
 * Run with: npm run build:embeddings
 */
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pipeline, RawImage } from '@huggingface/transformers';
import { PUBLIC_DIR, referenceImages, resolveSrc } from './refImages';

/** Must match MODEL in src/lib/imageMatch.ts so vectors are comparable. */
const MODEL = 'Xenova/clip-vit-base-patch32';
const OUTPUT = join(PUBLIC_DIR, 'embeddings.json');

function l2normalize(v: number[]): number[] {
  let sum = 0;
  for (const x of v) sum += x * x;
  const norm = Math.sqrt(sum) || 1;
  return v.map((x) => x / norm);
}

async function main() {
  const refs = referenceImages();
  if (refs.length === 0) {
    console.error('No reference images found in the dataset. Nothing to embed.');
    process.exit(1);
  }

  console.log(`Loading model ${MODEL} (first run downloads weights)…`);
  const extractor = await pipeline('image-feature-extraction', MODEL);

  const items: {
    implantId: string;
    view: string;
    src: string;
    vector: number[];
  }[] = [];
  let dim = 0;

  for (let i = 0; i < refs.length; i++) {
    const r = refs[i];
    try {
      const image = await RawImage.read(resolveSrc(r.src));
      const out = await extractor(image);
      const vector = l2normalize(Array.from(out.data as Float32Array));
      dim = vector.length;
      items.push({ implantId: r.implantId, view: r.view, src: r.src, vector });
      console.log(`  [${i + 1}/${refs.length}] ${r.implantId} (${r.view})`);
    } catch (err) {
      console.error(`  skip ${r.implantId} (${r.view}): ${(err as Error).message}`);
    }
  }

  const payload = {
    model: MODEL,
    dim,
    count: items.length,
    builtAt: new Date().toISOString(),
    items,
  };
  await writeFile(OUTPUT, JSON.stringify(payload));
  console.log(`\nWrote ${items.length} embedding(s) (dim ${dim}) to ${OUTPUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
