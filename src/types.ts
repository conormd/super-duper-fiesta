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
  | 'Ankle'
  | 'Elbow'
  | 'Trauma / Fracture fixation'
  | 'Sports medicine / Soft tissue';

export type Fixation = 'Cemented' | 'Cementless' | 'Hybrid' | 'Either' | 'N/A';

/** Cemented femoral stem design philosophy. 'French paradox' = canal-filling,
 *  line-to-line cementing with a thin mantle (Charnley–Kerboull archetype),
 *  kept distinct from the broader taper-slip family. */
export type CementedStyle = 'Taper-slip' | 'Composite beam' | 'French paradox';

/** Cross-sectional geometry of a cementless (press-fit) femoral stem. */
export type StemShape =
  | 'Flat tapered wedge'
  | 'Fit-and-fill'
  | 'Quadrangular'
  | 'Triple taper';

/** Stem length class. Microplasty = short / neck-sparing variant. */
export type StemLength = 'Standard' | 'Microplasty';

/** Whether the femoral stem carries a medial collar. */
export type Collar = 'Collared' | 'Collarless';

/** Standard radiographic projections used for implant assessment, plus
 *  templating images (e.g. exported from hospital templating software). */
export type RadiographView = 'AP' | 'Lateral' | 'Templating';

/**
 * A reference image for an implant. Implants are ideally documented in both the
 * AP and lateral (mediolateral) planes for more reliable recognition, with an
 * optional templating image. Any real radiograph MUST carry attribution and a
 * license — do not embed copyrighted images. `src` may be a URL or a path under
 * `public/`.
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

/** A non-radiograph image (e.g. a photo of the physical implant). */
export interface ProductPhoto {
  src: string;
  caption?: string;
  credit?: string;
  license?: string;
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
  /** Cemented stem design philosophy (cemented femoral stems only). */
  cementedStyle?: CementedStyle;
  /** Cross-sectional geometry (cementless/press-fit femoral stems). */
  stemShape?: StemShape;
  /** Stem length class (femoral stems). */
  stemLength?: StemLength;
  /** Collar presence (femoral stems). */
  collar?: Collar;
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
  /** Curated external links to view radiographs (atlases, technique guides). */
  imageLinks?: { label: string; url: string }[];
  /** Photos of the physical implant or product imagery. */
  photos?: ProductPhoto[];
  /** 'user' for entries added through the in-app form; built-in entries omit this. */
  source?: 'user';
}

/** A yes/no/unsure answer used by the guided identification flow. */
export type Answer = 'yes' | 'no' | 'unsure';
