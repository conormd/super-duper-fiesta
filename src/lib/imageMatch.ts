import type { RadiographView } from '../types';

/**
 * Client-side image matcher (Phase 1). Loads the precomputed reference
 * embeddings (public/embeddings.json, built by scripts/build-embeddings.ts),
 * embeds an uploaded image in the browser with the SAME CLIP model, and ranks
 * implants by cosine similarity. Everything here runs locally — the uploaded
 * image never leaves the device at this stage.
 */

/** Must match MODEL in scripts/build-embeddings.ts. */
const MODEL = 'Xenova/clip-vit-base-patch32';

interface EmbeddingItem {
  implantId: string;
  view: RadiographView;
  src: string;
  vector: number[];
}

interface EmbeddingIndex {
  model: string;
  dim: number;
  count: number;
  builtAt?: string;
  items: EmbeddingItem[];
}

/** One ranked candidate: best-matching implant with its similarity score. */
export interface ImageMatch {
  implantId: string;
  /** Cosine similarity of the best-matching view, in [-1, 1] (≈0–1 in practice). */
  score: number;
  bestView: RadiographView;
  bestSrc: string;
}

/** Minimal shape of the transformers.js feature-extraction pipeline we use. */
type ImageExtractor = (input: unknown) => Promise<{ data: Float32Array }>;

let indexPromise: Promise<EmbeddingIndex | null> | null = null;
let extractorPromise: Promise<ImageExtractor> | null = null;

/** Fetch and cache the prebuilt embedding index. Returns null if not built. */
export function loadIndex(): Promise<EmbeddingIndex | null> {
  if (!indexPromise) {
    indexPromise = fetch(`${import.meta.env.BASE_URL}embeddings.json`)
      .then((res) => (res.ok ? (res.json() as Promise<EmbeddingIndex>) : null))
      .catch(() => null);
  }
  return indexPromise;
}

/** True once an index with at least one reference vector is available. */
export async function isIndexReady(): Promise<boolean> {
  const index = await loadIndex();
  return !!index && index.count > 0;
}

/** Lazily load the CLIP image encoder (downloaded + cached on first use). */
async function getExtractor() {
  if (!extractorPromise) {
    extractorPromise = import('@huggingface/transformers').then(
      async ({ pipeline }) =>
        (await pipeline('image-feature-extraction', MODEL)) as unknown as ImageExtractor,
    );
  }
  return extractorPromise;
}

function l2normalize(v: Float32Array): Float32Array {
  let sum = 0;
  for (const x of v) sum += x * x;
  const norm = Math.sqrt(sum) || 1;
  const out = new Float32Array(v.length);
  for (let i = 0; i < v.length; i++) out[i] = v[i] / norm;
  return out;
}

function dot(a: Float32Array, b: number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += a[i] * b[i];
  return sum;
}

/** Embed a user-supplied image File into a normalized vector. */
export async function embedImage(file: File): Promise<Float32Array> {
  const { RawImage } = await import('@huggingface/transformers');
  const image = await RawImage.fromBlob(file);
  const extractor = await getExtractor();
  const out = await extractor(image);
  return l2normalize(out.data);
}

/**
 * Rank implants by visual similarity to the uploaded image. Each implant is
 * scored by its single best-matching reference view. Returns up to `topN`
 * candidates, highest similarity first.
 */
export async function matchImage(file: File, topN = 5): Promise<ImageMatch[]> {
  const index = await loadIndex();
  if (!index || index.count === 0) {
    throw new Error('Reference index not built. Run `npm run build:embeddings`.');
  }
  const query = await embedImage(file);

  const best = new Map<string, ImageMatch>();
  for (const item of index.items) {
    const score = dot(query, item.vector);
    const current = best.get(item.implantId);
    if (!current || score > current.score) {
      best.set(item.implantId, {
        implantId: item.implantId,
        score,
        bestView: item.view,
        bestSrc: item.src,
      });
    }
  }

  return [...best.values()].sort((a, b) => b.score - a.score).slice(0, topN);
}
