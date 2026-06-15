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

/** Standard radiographic projections used for implant assessment. */
export type RadiographView = 'AP' | 'Lateral';

/**
 * A reference radiograph for an implant. Implants are ideally documented in
 * both the AP and lateral (mediolateral) planes for more reliable recognition.
 * Any real radiograph MUST carry attribution and a license — do not embed
 * copyrighted images. `src` may be a URL or a path under `public/`.
 */
export interface ImplantImage {
  view: RadiographView;
  src: string;
  caption?: string;
  /** Attribution for the image source (required for real radiographs). */
  credit?: string;
  /** License terms, e.g. "CC BY 4.0". */
  license?: string;
  /** Link to the original, licensed source. */
  sourceUrl?: string;
}

/** A literature reference supporting an entry. Sourced from PubMed. */
export interface Reference {
  /** Article title. */
  title: string;
  /** Journal and year, e.g. "Semin Musculoskelet Radiol, 2015". */
  source: string;
  /** PubMed identifier, used to build a pubmed.ncbi.nlm.nih.gov link. */
  pmid?: string;
  /** Digital Object Identifier, used to build a doi.org link. */
  doi?: string;
}

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
  /** Supporting literature (PubMed). */
  references?: Reference[];
  /** Reference radiographs, ideally one AP and one lateral (mediolateral) view. */
  views?: ImplantImage[];
}

/** A yes/no/unsure answer used by the guided identification flow. */
export type Answer = 'yes' | 'no' | 'unsure';
