export type Manufacturer =
  | 'Zimmer Biomet'
  | 'Stryker'
  | 'Smith & Nephew'
  | 'Arthrex'
  | 'DePuy Synthes';

export type Anatomy =
  | 'Hip'
  | 'Knee'
  | 'Shoulder'
  | 'Trauma / Fracture fixation'
  | 'Sports medicine / Soft tissue';

export type Fixation = 'Cemented' | 'Cementless' | 'Hybrid' | 'Either' | 'N/A';

/**
 * A single implant product family. Identifying features describe cues that are
 * commonly cited when reviewing radiographs; they are an educational aid, not a
 * definitive determination. See the disclaimer in the app for limitations.
 */
export interface Implant {
  id: string;
  name: string;
  manufacturer: Manufacturer;
  anatomy: Anatomy;
  /** e.g. "Total knee system", "Cementless femoral stem", "Suture anchor". */
  category: string;
  fixation: Fixation;
  /** One-line summary shown in cards. */
  summary: string;
  /** Cues that help distinguish this implant on imaging. */
  identifyingFeatures: string[];
  /** Notable variants, sizes, or generations within the family. */
  variants?: string[];
  /** Approximate market period, where well established. */
  era?: string;
  /** Free-text caveats specific to this entry. */
  notes?: string;
}

/** A yes/no/unsure answer used by the guided identification flow. */
export type Answer = 'yes' | 'no' | 'unsure';
