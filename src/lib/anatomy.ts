import type { Anatomy } from '../types';

/** Canonical anatomical regions, shared by the guided-identification and
 *  image-matching flows so both stay in sync. */
export const ANATOMIES: Anatomy[] = [
  'Hip',
  'Knee',
  'Shoulder',
  'Ankle',
  'Elbow',
  'Trauma / Fracture fixation',
  'Sports medicine / Soft tissue',
];

const IMPLANT_IDENTIFIER_BASE = 'https://implantidentifier.app/implant-library';

/** Per-region sub-path on implantidentifier.app, where one is known. Regions
 *  without a confirmed sub-path fall back to the general library index. */
const IMPLANT_IDENTIFIER_PATHS: Partial<Record<Anatomy, string>> = {
  Hip: 'hip',
  Knee: 'knee',
};

/** External cross-reference link to implantidentifier.app for a given region
 *  (or the general library index if that region has no dedicated page). */
export function implantIdentifierUrl(anatomy: Anatomy): string {
  const path = IMPLANT_IDENTIFIER_PATHS[anatomy];
  return path ? `${IMPLANT_IDENTIFIER_BASE}/${path}` : IMPLANT_IDENTIFIER_BASE;
}

