import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { implants } from '../src/data/implants';
import type { RadiographView } from '../src/types';

/**
 * A single reference image extracted from the implant dataset, used by the
 * image-matching tooling (validation + embedding build). Each implant view
 * becomes one labelled reference: the `implantId` is the label.
 */
export interface RefImage {
  implantId: string;
  implantName: string;
  view: RadiographView;
  /** As referenced in the dataset, e.g. "radiographs/zb-taperloc-tmpl.jpg". */
  src: string;
  /** True when `src` is a remote URL rather than a file under public/. */
  remote: boolean;
  credit?: string;
  license?: string;
}

const __dirname = dirname(fileURLToPath(import.meta.url));
export const ROOT = resolve(__dirname, '..');
export const PUBLIC_DIR = join(ROOT, 'public');

/** Resolve a reference image's `src` to an absolute local path (or the URL). */
export function resolveSrc(src: string): string {
  return /^https?:\/\//.test(src) ? src : join(PUBLIC_DIR, src);
}

/** Flatten every implant view in the dataset into a labelled reference list. */
export function referenceImages(): RefImage[] {
  const out: RefImage[] = [];
  for (const implant of implants) {
    for (const v of implant.views ?? []) {
      out.push({
        implantId: implant.id,
        implantName: implant.name,
        view: v.view,
        src: v.src,
        remote: /^https?:\/\//.test(v.src),
        credit: v.credit,
        license: v.license,
      });
    }
  }
  return out;
}
