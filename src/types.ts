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
  /** Curated external links to view radiographs (atlases, technique guides). */
  imageLinks?: { label: string; url: string }[];
}

/** A yes/no/unsure answer used by the guided identification flow. */
export type Answer = 'yes' | 'no' | 'unsure';

// ──────────────────────────── Survivorship data ────────────────────────────

/** Arthroplasty procedure type covered by the survivorship reference. */
export type ProcedureType = 'Total hip' | 'Total knee' | 'Partial knee';

/** Fixation method, as the registries stratify their survival analyses. */
export type SurvivorshipFixation = 'Cemented' | 'Cementless' | 'Hybrid';

/** A national joint replacement registry that publishes survivorship data. */
export type Registry =
  | 'AOANJRR'
  | 'Norwegian (NAR)'
  | 'NJR (UK)'
  | 'NZJR (NZ)';

/**
 * A single published survivorship data point for an implant, taken from a
 * registry report or a peer-reviewed registry analysis. Numeric values are only
 * populated (`verified: true`) when transcribed and checked against the cited
 * primary source — never estimated. When a value has not been verified, the
 * entry still records where to read it (`sourceUrl`).
 */
export interface SurvivorshipFigure {
  registry: Registry;
  /** Metric as published, e.g. 'Cumulative percent revision' or 'KM survival'. */
  metric: string;
  /** Follow-up interval in years (e.g. 5, 10, 15). */
  followUpYears: number;
  /** Fixation cohort this figure applies to, where the registry stratifies it. */
  fixation?: SurvivorshipFixation;
  /** Published value as a percentage. Omitted until verified against source. */
  value?: number;
  /** 95% confidence interval as [low, high] percentages, where published. */
  ci95?: [number, number];
  /** Source document, e.g. 'AOANJRR 2024 Annual Report'. */
  source: string;
  /** Direct link to the primary source document. */
  sourceUrl: string;
  /** True only when `value` was transcribed and checked against the source. */
  verified: boolean;
  /** Cohort caveat, bearing/variant note, etc. */
  note?: string;
}

/**
 * An implant family with quick links to its published registry survivorship.
 * This is a reference aid: where a numeric figure has not been verified against
 * a primary source in this build, the entry links out to the exact registry
 * report so the current cumulative-percent-revision table can be read directly.
 */
export interface SurvivorshipImplant {
  id: string;
  name: string;
  manufacturer: Manufacturer;
  procedure: ProcedureType;
  /** e.g. 'Femoral stem', 'Acetabular cup', 'Total knee system'. */
  component: string;
  /** Fixation option(s) the family is offered in. */
  fixation: SurvivorshipFixation[];
  /** One-line descriptor shown in the card. */
  descriptor: string;
  /** Verified registry figures; may be empty pending source transcription. */
  figures: SurvivorshipFigure[];
  /** Deep links to the primary registry reports where the CPR table is found. */
  registryLinks: { label: string; url: string }[];
  /** Supporting registry-based literature (via PubMed), where available. */
  literature?: Reference[];
  /** Free-text caveats specific to this entry. */
  notes?: string;
}
