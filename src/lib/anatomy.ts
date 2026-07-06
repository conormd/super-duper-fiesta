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
