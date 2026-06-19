import type {
  ProcedureType,
  Reference,
  SurvivorshipFigure,
  SurvivorshipFixation,
  SurvivorshipImplant,
} from '../types';

/**
 * Quick-reference survivorship aid for commonly used hip and knee implants in
 * the Canadian market, from Zimmer Biomet, Stryker, Smith & Nephew, and DePuy
 * Synthes. It surfaces published cumulative-percent-revision (CPR) /
 * Kaplan–Meier survival data from the two registries clinicians most often
 * consult for these products:
 *
 *   • AOANJRR  — Australian Orthopaedic Association National Joint Replacement
 *                Registry (annual report prosthesis-combination tables).
 *   • NAR      — Norwegian Arthroplasty Register (English annual reports).
 *
 * DATA PROVENANCE
 * Embedded numeric figures are transcribed from AOANJRR Annual Report
 * prosthesis-combination tables (Primary Diagnosis OA): Table BM5 (hip, 15-yr),
 * BM7 (hip, 20-yr), BM6 (knee, 15-yr), BM8 (knee, 20-yr). Each figure carries
 * its source table, follow-up interval, and 95% CI exactly as published; where
 * two tables report the same combination the intervals are merged (e.g. 5-yr
 * from BM5/BM6, 20-yr from BM7/BM8). Figures are only ever set `verified: true`
 * when checked against the source table — nothing is estimated. Implants with
 * no embedded figures link out to the registry report for the current table.
 */

// ─────────────────────────── Primary source links ──────────────────────────

/** Canonical AOANJRR report destinations (latest annual + supplementary). */
const AOANJRR = {
  annual: 'https://aoanjrr.sahmri.com/annual-reports-2024',
  supplementary: 'https://aoanjrr.sahmri.com/annual-reports-2024/supplementary',
};

/** Norwegian Arthroplasty Register — landing page + most recent report. */
const NAR = {
  reports: 'https://www.helse-bergen.no/nrl',
  report2024:
    'https://www.helse-bergen.no/48d1eb/contentassets/9f19d57711ee4e60815d6b89e8e8472b/report2024.pdf',
};

/** Standard registry deep-links for an implant. */
function registryLinks(_procedure: ProcedureType): { label: string; url: string }[] {
  return [
    { label: 'AOANJRR Annual Report 2024', url: AOANJRR.annual },
    { label: 'AOANJRR Comparative Prostheses Performance', url: AOANJRR.supplementary },
    { label: 'Norwegian Register (NAR) Report 2024', url: NAR.report2024 },
  ];
}

/**
 * Build a verified AOANJRR cumulative-percent-revision figure. All current
 * embedded figures come from the AOANJRR annual-report combination tables.
 */
function cpr(
  followUpYears: number,
  value: number,
  ci95: [number, number],
  source: string,
  opts: { fixation?: SurvivorshipFixation; note?: string } = {},
): SurvivorshipFigure {
  return {
    registry: 'AOANJRR',
    metric: 'CPR',
    followUpYears,
    value,
    ci95,
    source,
    sourceUrl: AOANJRR.annual,
    verified: true,
    ...opts,
  };
}

// ─────────────────────────── Supporting literature ─────────────────────────

const NEXGEN_TM_REF: Reference = {
  title:
    'Survivorship of Primary NexGen Knee Replacement: Comparing Cementless Trabecular Metal to Other Designs (AOANJRR data 1999–2020)',
  source: 'J Knee Surg, 2024',
  doi: '10.1055/a-2376-6889',
};

const RBK_AOANJRR_REF: Reference = {
  title:
    'Efficacy of a Second-Generation Rotating Bearing Tibial Platform in TKA: Prospective Cohort with AOANJRR Registry Analysis',
  source: 'J Knee Surg, 2019',
  pmid: '30836393',
  doi: '10.1055/s-0039-1678679',
};

const TRIATHLON_10YR_REF: Reference = {
  title:
    'Ten-Year Results of the Triathlon Knee Replacement: A Cohort Study (95.4% all-cause survivorship at 10 yr; single-centre)',
  source: 'Cureus, 2021',
  pmid: '34178530',
  doi: '10.7759/cureus.15211',
};

const ATTUNE_TRIATHLON_RLL_REF: Reference = {
  title:
    'Does radiolucency equate to revision? A comparison of the ATTUNE and Triathlon TKA (single-centre)',
  source: 'Knee Surg Sports Traumatol Arthrosc, 2023',
  pmid: '37516985',
  doi: '10.1007/s00167-023-07509-6',
};

// ──────────────────────────── Source-table labels ──────────────────────────

const T = {
  corailPinnacle: 'Tables BM5/BM7 — Corail/Pinnacle (primary THR, OA)',
  sromPinnacle: 'Tables BM5/BM7 — S-Rom/Pinnacle (primary THR, OA)',
  cstemPinnacle: 'Table BM5 — C-Stem AMT/Pinnacle (primary THR, OA)',
  exeterTrident: 'Tables BM5/BM7 — Exeter V40/Trident shell (primary THR, OA)',
  exeterContemporary: 'Tables BM5/BM7 — Exeter V40/Exeter Contemporary (primary THR, OA)',
  securfitTrident: 'Tables BM5/BM7 — Secur-Fit/Trident shell (primary THR, OA)',
  polarstemR3: 'Table BM5 — Polarstem/R3 (primary THR, OA)',
  anthologyR3: 'Table BM5 — Anthology/R3 (primary THR, OA)',
  synergyR3: 'Table BM5 — Synergy/R3 (primary THR, OA)',
  slplusR3: 'Table BM5 — SL-Plus/R3 (primary THR, OA)',
  triathlonCR: 'Table BM6 — Triathlon CR/Triathlon (primary TKR, OA)',
  triathlonPS: 'Table BM6 — Triathlon PS/Triathlon (primary TKR, OA)',
  vanguardCR: 'Table BM6 — Vanguard CR/Vanguard (primary TKR, OA)',
  genesisCR: 'Tables BM6/BM8 — Genesis II CR/Genesis II (primary TKR, OA)',
  genesisPS: 'Tables BM6/BM8 — Genesis II PS/Genesis II (primary TKR, OA)',
  legionCR: 'Table BM6 — Legion CR/Genesis II (primary TKR, OA)',
  legionPS: 'Table BM6 — Legion PS/Genesis II (primary TKR, OA)',
  lcsCR: 'Tables BM6/BM8 — LCS CR/LCS (primary TKR, OA)',
  nexgenLPSFlex: 'Tables BM6/BM8 — NexGen LPS-Flex/NexGen (primary TKR, OA)',
};

// ──────────────────────────────── Dataset ──────────────────────────────────

export const survivorshipImplants: SurvivorshipImplant[] = [
  // ═══════════════════════════════ TOTAL HIP ═══════════════════════════════
  {
    id: 'sv-hip-corail',
    name: 'Corail',
    manufacturer: 'DePuy Synthes',
    procedure: 'Total hip',
    component: 'Femoral stem',
    fixation: ['Cementless'],
    descriptor: 'Fully HA-coated straight tapered stem; collared and collarless options.',
    figures: [
      cpr(5, 3.0, [2.8, 3.1], T.corailPinnacle, { fixation: 'Cementless', note: 'Corail/Pinnacle combination; N=63,139 (2,488 revised).' }),
      cpr(10, 4.5, [4.3, 4.7], T.corailPinnacle, { fixation: 'Cementless' }),
      cpr(15, 7.0, [6.6, 7.4], T.corailPinnacle, { fixation: 'Cementless' }),
      cpr(20, 8.7, [7.5, 10.1], T.corailPinnacle, { fixation: 'Cementless' }),
    ],
    registryLinks: registryLinks('Total hip'),
    notes:
      'One of the most-used cementless stems in both registries; frequently paired with the Pinnacle cup. Embedded figures are the Corail/Pinnacle combination (primary OA). CPR is bearing-dependent — confirm the liner cohort in the registry.',
  },
  {
    id: 'sv-hip-pinnacle',
    name: 'Pinnacle',
    manufacturer: 'DePuy Synthes',
    procedure: 'Total hip',
    component: 'Acetabular cup',
    fixation: ['Cementless'],
    descriptor: 'Hemispherical press-fit shell; polyethylene, ceramic, or metal liners.',
    figures: [
      cpr(5, 3.0, [2.8, 3.1], T.corailPinnacle, { fixation: 'Cementless', note: 'Corail/Pinnacle combination; N=63,139.' }),
      cpr(10, 4.5, [4.3, 4.7], T.corailPinnacle, { fixation: 'Cementless' }),
      cpr(15, 7.0, [6.6, 7.4], T.corailPinnacle, { fixation: 'Cementless' }),
      cpr(20, 8.7, [7.5, 10.1], T.corailPinnacle, { fixation: 'Cementless' }),
      cpr(5, 4.4, [3.7, 5.3], T.sromPinnacle, { fixation: 'Cementless', note: 'S-Rom/Pinnacle combination; N=2,668.' }),
      cpr(10, 5.7, [4.8, 6.7], T.sromPinnacle, { fixation: 'Cementless' }),
      cpr(15, 6.8, [5.8, 8.0], T.sromPinnacle, { fixation: 'Cementless' }),
      cpr(20, 9.2, [6.8, 12.4], T.sromPinnacle, { fixation: 'Cementless' }),
    ],
    registryLinks: registryLinks('Total hip'),
    notes:
      'Figures are the Corail/Pinnacle and S-Rom/Pinnacle combinations (primary OA). CPR is strongly bearing-dependent — metal-on-metal Pinnacle cohorts perform markedly worse; confirm the liner-specific cohort in the registry table.',
  },
  {
    id: 'sv-hip-summit',
    name: 'Summit',
    manufacturer: 'DePuy Synthes',
    procedure: 'Total hip',
    component: 'Femoral stem',
    fixation: ['Cementless'],
    descriptor: 'Proximally porous/HA-coated tapered stem; often paired with Pinnacle.',
    figures: [],
    registryLinks: registryLinks('Total hip'),
  },
  {
    id: 'sv-hip-cstem',
    name: 'C-Stem',
    manufacturer: 'DePuy Synthes',
    procedure: 'Total hip',
    component: 'Femoral stem',
    fixation: ['Cemented'],
    descriptor: 'Polished triple-tapered (taper-slip) cemented stem.',
    figures: [
      cpr(5, 2.7, [2.3, 3.2], T.cstemPinnacle, { fixation: 'Hybrid', note: 'C-Stem AMT cemented stem + Pinnacle cementless cup (hybrid); N=5,347.' }),
      cpr(10, 4.2, [3.5, 5.0], T.cstemPinnacle, { fixation: 'Hybrid' }),
      cpr(15, 6.7, [4.5, 9.9], T.cstemPinnacle, { fixation: 'Hybrid' }),
    ],
    registryLinks: registryLinks('Total hip'),
    notes: 'Embedded figures are the C-Stem AMT/Pinnacle hybrid construct (cemented stem, cementless cup).',
  },
  {
    id: 'sv-hip-exeter',
    name: 'Exeter V40',
    manufacturer: 'Stryker',
    procedure: 'Total hip',
    component: 'Femoral stem',
    fixation: ['Cemented'],
    descriptor: 'Polished, collarless, double-tapered (taper-slip) cemented stem.',
    figures: [
      cpr(5, 2.3, [2.2, 2.4], T.exeterTrident, { fixation: 'Hybrid', note: 'Exeter V40 stem + Trident cementless shell (hybrid); N=82,676 — the largest THR combination cohort.' }),
      cpr(10, 3.5, [3.3, 3.6], T.exeterTrident, { fixation: 'Hybrid' }),
      cpr(15, 4.9, [4.7, 5.2], T.exeterTrident, { fixation: 'Hybrid' }),
      cpr(20, 6.3, [5.9, 6.7], T.exeterTrident, { fixation: 'Hybrid' }),
      cpr(5, 3.0, [2.4, 3.7], T.exeterContemporary, { fixation: 'Cemented', note: 'Exeter V40 stem + Exeter Contemporary cemented cup (fully cemented); N=2,978.' }),
      cpr(10, 4.5, [3.8, 5.4], T.exeterContemporary, { fixation: 'Cemented' }),
      cpr(15, 7.7, [6.6, 9.1], T.exeterContemporary, { fixation: 'Cemented' }),
      cpr(20, 11.5, [9.3, 14.1], T.exeterContemporary, { fixation: 'Cemented' }),
    ],
    registryLinks: registryLinks('Total hip'),
    notes:
      'The benchmark cemented stem in both registries. Figures show the hybrid Exeter/Trident construct (much the largest cohort) alongside the fully cemented Exeter/Exeter Contemporary construct, illustrating the fixation contrast at the same stem.',
  },
  {
    id: 'sv-hip-accolade',
    name: 'Accolade II',
    manufacturer: 'Stryker',
    procedure: 'Total hip',
    component: 'Femoral stem',
    fixation: ['Cementless'],
    descriptor: 'Single-taper wedge cementless stem; usually paired with a Trident shell.',
    figures: [
      cpr(2, 2.2, [2.0, 2.4], 'Table BM1 — Accolade II/Trident shell (primary THR, OA)', { fixation: 'Cementless', note: 'Accolade II/Trident shell; N=18,666.' }),
      cpr(5, 2.8, [2.6, 3.1], 'Table BM1 — Accolade II/Trident shell (primary THR, OA)', { fixation: 'Cementless' }),
      cpr(10, 3.9, [3.3, 4.6], 'Table BM1 — Accolade II/Trident shell (primary THR, OA)', { fixation: 'Cementless' }),
    ],
    registryLinks: registryLinks('Total hip'),
    notes: 'Figure is the Accolade II/Trident shell cementless combination (Table BM1, 2/5/10-yr, primary OA).',
  },
  {
    id: 'sv-hip-trident',
    name: 'Trident / Trident II',
    manufacturer: 'Stryker',
    procedure: 'Total hip',
    component: 'Acetabular cup',
    fixation: ['Cementless'],
    descriptor: 'Press-fit shell; ceramic, polyethylene, or metal liners.',
    figures: [
      cpr(5, 2.3, [2.2, 2.4], T.exeterTrident, { fixation: 'Hybrid', note: 'Exeter V40/Trident shell (hybrid); N=82,676.' }),
      cpr(10, 3.5, [3.3, 3.6], T.exeterTrident, { fixation: 'Hybrid' }),
      cpr(15, 4.9, [4.7, 5.2], T.exeterTrident, { fixation: 'Hybrid' }),
      cpr(20, 6.3, [5.9, 6.7], T.exeterTrident, { fixation: 'Hybrid' }),
      cpr(5, 3.6, [3.2, 4.0], T.securfitTrident, { fixation: 'Cementless', note: 'Secur-Fit/Trident shell (cementless); N=9,895.' }),
      cpr(10, 4.8, [4.4, 5.2], T.securfitTrident, { fixation: 'Cementless' }),
      cpr(15, 6.4, [5.9, 7.0], T.securfitTrident, { fixation: 'Cementless' }),
      cpr(20, 8.1, [7.2, 9.0], T.securfitTrident, { fixation: 'Cementless' }),
    ],
    registryLinks: registryLinks('Total hip'),
    notes:
      'Figures show the Trident shell with a cemented stem (Exeter, hybrid) and with a cementless stem (Secur-Fit), spanning the two fixation constructs.',
  },
  {
    id: 'sv-hip-taperloc',
    name: 'Taperloc Complete',
    manufacturer: 'Zimmer Biomet',
    procedure: 'Total hip',
    component: 'Femoral stem',
    fixation: ['Cementless'],
    descriptor: 'Flat dual-tapered proximally porous-coated cementless stem.',
    figures: [
      cpr(2, 2.2, [1.8, 2.6], 'Table BM1 — Taperloc/G7 (primary THR, OA)', { fixation: 'Cementless', note: 'Taperloc/G7 combination; N=6,580.' }),
      cpr(5, 2.6, [2.2, 3.1], 'Table BM1 — Taperloc/G7 (primary THR, OA)', { fixation: 'Cementless' }),
      cpr(10, 3.0, [2.5, 3.5], 'Table BM1 — Taperloc/G7 (primary THR, OA)', { fixation: 'Cementless' }),
    ],
    registryLinks: registryLinks('Total hip'),
  },
  {
    id: 'sv-hip-cls',
    name: 'CLS Spotorno',
    manufacturer: 'Zimmer Biomet',
    procedure: 'Total hip',
    component: 'Femoral stem',
    fixation: ['Cementless'],
    descriptor: 'Straight tapered collarless cementless stem with proximal ribs.',
    figures: [],
    registryLinks: registryLinks('Total hip'),
  },
  {
    id: 'sv-hip-continuum',
    name: 'Continuum',
    manufacturer: 'Zimmer Biomet',
    procedure: 'Total hip',
    component: 'Acetabular cup',
    fixation: ['Cementless'],
    descriptor: 'Trabecular Metal (tantalum) highly-porous press-fit shell.',
    figures: [
      cpr(2, 3.7, [2.8, 4.9], 'Table BM1 — Avenir/Continuum (primary THR, OA)', { fixation: 'Cementless', note: 'Avenir/Continuum combination; N=1,332.' }),
      cpr(5, 4.3, [3.3, 5.5], 'Table BM1 — Avenir/Continuum (primary THR, OA)', { fixation: 'Cementless' }),
      cpr(10, 5.3, [4.1, 6.9], 'Table BM1 — Avenir/Continuum (primary THR, OA)', { fixation: 'Cementless' }),
      cpr(2, 3.3, [2.7, 4.0], 'Table BM1 — CPT/Continuum (primary THR, OA)', { fixation: 'Hybrid', note: 'CPT cemented stem + Continuum cementless cup (hybrid); N=2,575.' }),
      cpr(5, 4.4, [3.7, 5.3], 'Table BM1 — CPT/Continuum (primary THR, OA)', { fixation: 'Hybrid' }),
      cpr(10, 6.2, [5.3, 7.3], 'Table BM1 — CPT/Continuum (primary THR, OA)', { fixation: 'Hybrid' }),
    ],
    registryLinks: registryLinks('Total hip'),
    notes:
      'Figures are the Continuum shell paired with the Avenir cementless stem and the CPT cemented stem (hybrid), from Table BM1 (primary OA).',
  },
  {
    id: 'sv-hip-g7',
    name: 'G7',
    manufacturer: 'Zimmer Biomet',
    procedure: 'Total hip',
    component: 'Acetabular cup',
    fixation: ['Cementless'],
    descriptor: 'Hemispherical press-fit shell; multiple liner options incl. dual mobility.',
    figures: [
      cpr(2, 2.2, [1.8, 2.6], 'Table BM1 — Taperloc/G7 (primary THR, OA)', { fixation: 'Cementless', note: 'Taperloc/G7 combination; N=6,580.' }),
      cpr(5, 2.6, [2.2, 3.1], 'Table BM1 — Taperloc/G7 (primary THR, OA)', { fixation: 'Cementless' }),
      cpr(10, 3.0, [2.5, 3.5], 'Table BM1 — Taperloc/G7 (primary THR, OA)', { fixation: 'Cementless' }),
    ],
    registryLinks: registryLinks('Total hip'),
  },
  {
    id: 'sv-hip-polarstem',
    name: 'POLARSTEM',
    manufacturer: 'Smith & Nephew',
    procedure: 'Total hip',
    component: 'Femoral stem',
    fixation: ['Cementless'],
    descriptor: 'Proximally HA-coated straight tapered collarless cementless stem.',
    figures: [
      cpr(5, 2.9, [2.6, 3.1], T.polarstemR3, { fixation: 'Cementless', note: 'Polarstem/R3 combination; N=22,165.' }),
      cpr(10, 3.8, [3.5, 4.2], T.polarstemR3, { fixation: 'Cementless' }),
      cpr(15, 4.6, [3.9, 5.5], T.polarstemR3, { fixation: 'Cementless' }),
    ],
    registryLinks: registryLinks('Total hip'),
  },
  {
    id: 'sv-hip-r3',
    name: 'R3',
    manufacturer: 'Smith & Nephew',
    procedure: 'Total hip',
    component: 'Acetabular cup',
    fixation: ['Cementless'],
    descriptor: 'Press-fit shell; polyethylene, ceramic, or dual-mobility liners.',
    figures: [
      cpr(5, 2.9, [2.6, 3.1], T.polarstemR3, { fixation: 'Cementless', note: 'Polarstem/R3 combination; N=22,165.' }),
      cpr(10, 3.8, [3.5, 4.2], T.polarstemR3, { fixation: 'Cementless' }),
      cpr(15, 4.6, [3.9, 5.5], T.polarstemR3, { fixation: 'Cementless' }),
      cpr(5, 2.9, [2.5, 3.3], T.anthologyR3, { fixation: 'Cementless', note: 'Anthology/R3 combination; N=8,388.' }),
      cpr(10, 3.7, [3.3, 4.2], T.anthologyR3, { fixation: 'Cementless' }),
      cpr(15, 4.3, [3.8, 5.0], T.anthologyR3, { fixation: 'Cementless' }),
    ],
    registryLinks: registryLinks('Total hip'),
    notes: 'Figures are the R3 shell paired with the Polarstem and Anthology cementless stems (primary OA).',
  },
  {
    id: 'sv-hip-anthology',
    name: 'Anthology',
    manufacturer: 'Smith & Nephew',
    procedure: 'Total hip',
    component: 'Femoral stem',
    fixation: ['Cementless'],
    descriptor: 'Dual-tapered proximally porous/HA-coated cementless stem.',
    figures: [
      cpr(5, 2.9, [2.5, 3.3], T.anthologyR3, { fixation: 'Cementless', note: 'Anthology/R3 combination; N=8,388.' }),
      cpr(10, 3.7, [3.3, 4.2], T.anthologyR3, { fixation: 'Cementless' }),
      cpr(15, 4.3, [3.8, 5.0], T.anthologyR3, { fixation: 'Cementless' }),
    ],
    registryLinks: registryLinks('Total hip'),
  },
  {
    id: 'sv-hip-sln',
    name: 'SL-PLUS / Synergy',
    manufacturer: 'Smith & Nephew',
    procedure: 'Total hip',
    component: 'Femoral stem',
    fixation: ['Cementless'],
    descriptor: 'Tapered proximally porous-coated cementless stems (Smith & Nephew heritage).',
    figures: [
      cpr(5, 2.8, [2.4, 3.3], T.synergyR3, { fixation: 'Cementless', note: 'Synergy/R3 combination; N=5,403.' }),
      cpr(10, 3.5, [3.0, 4.1], T.synergyR3, { fixation: 'Cementless' }),
      cpr(15, 5.0, [4.2, 5.8], T.synergyR3, { fixation: 'Cementless' }),
      cpr(5, 4.2, [3.3, 5.3], T.slplusR3, { fixation: 'Cementless', note: 'SL-Plus/R3 combination; N=1,695.' }),
      cpr(10, 6.0, [4.9, 7.3], T.slplusR3, { fixation: 'Cementless' }),
      cpr(15, 7.6, [6.2, 9.3], T.slplusR3, { fixation: 'Cementless' }),
    ],
    registryLinks: registryLinks('Total hip'),
  },

  // ═══════════════════════════════ TOTAL KNEE ══════════════════════════════
  {
    id: 'sv-knee-triathlon',
    name: 'Triathlon',
    manufacturer: 'Stryker',
    procedure: 'Total knee',
    component: 'Total knee system',
    fixation: ['Cemented', 'Cementless'],
    descriptor: 'Single-radius TKA; CR/PS/CS bearings; cemented and Tritanium cementless.',
    figures: [
      cpr(5, 2.3, [2.3, 2.4], T.triathlonCR, { note: 'Triathlon CR (minimally stabilised); N=187,428 — much the largest TKR cohort.' }),
      cpr(10, 3.5, [3.4, 3.6], T.triathlonCR),
      cpr(15, 4.7, [4.5, 4.9], T.triathlonCR),
      cpr(5, 3.7, [3.4, 4.0], T.triathlonPS, { note: 'Triathlon PS (posterior-stabilised); N=15,654.' }),
      cpr(10, 5.2, [4.8, 5.6], T.triathlonPS),
      cpr(15, 6.5, [5.9, 7.1], T.triathlonPS),
    ],
    registryLinks: registryLinks('Total knee'),
    literature: [TRIATHLON_10YR_REF, ATTUNE_TRIATHLON_RLL_REF],
    notes:
      'High-volume system in both registries. Figures are the CR (minimally stabilised) and PS combinations from Table BM6 (primary OA). The combination tables are not split by cemented vs cementless Tritanium fixation — read the fixation-stratified knee chapter for that.',
  },
  {
    id: 'sv-knee-attune',
    name: 'ATTUNE',
    manufacturer: 'DePuy Synthes',
    procedure: 'Total knee',
    component: 'Total knee system',
    fixation: ['Cemented', 'Cementless'],
    descriptor: 'Gradually-reducing-radius TKA; CR/PS/rotating-platform; cemented & S+ cementless.',
    figures: [
      cpr(2, 1.6, [1.4, 1.7], 'Table BM2 — Attune CR/Attune (primary TKR, OA)', { note: 'Attune CR; N=37,247.' }),
      cpr(5, 2.6, [2.5, 2.8], 'Table BM2 — Attune CR/Attune (primary TKR, OA)'),
      cpr(10, 3.5, [3.2, 3.8], 'Table BM2 — Attune CR/Attune (primary TKR, OA)'),
      cpr(2, 1.6, [1.4, 1.8], 'Table BM2 — Attune PS/Attune (primary TKR, OA)', { note: 'Attune PS; N=17,537.' }),
      cpr(5, 2.7, [2.4, 2.9], 'Table BM2 — Attune PS/Attune (primary TKR, OA)'),
      cpr(10, 4.7, [4.1, 5.5], 'Table BM2 — Attune PS/Attune (primary TKR, OA)'),
    ],
    registryLinks: registryLinks('Total knee'),
    literature: [ATTUNE_TRIATHLON_RLL_REF],
    notes:
      'Figures are the Attune CR and PS combinations (Table BM2, 2/5/10-yr, primary OA). The combination table is not split by cemented vs S+ cementless baseplate — read the fixation-stratified knee chapter for that.',
  },
  {
    id: 'sv-knee-pfc',
    name: 'P.F.C. Sigma',
    manufacturer: 'DePuy Synthes',
    procedure: 'Total knee',
    component: 'Total knee system',
    fixation: ['Cemented', 'Cementless'],
    descriptor: 'Long-running predecessor to ATTUNE; CR/PS/rotating-platform; mostly cemented.',
    figures: [],
    registryLinks: registryLinks('Total knee'),
    notes:
      'Not in the BM6/BM8 tables shown; AOANJRR publishes a dedicated PFC Sigma combination report. One of the longest-follow-up knee systems — useful as a benchmark.',
  },
  {
    id: 'sv-knee-nexgen',
    name: 'NexGen',
    manufacturer: 'Zimmer Biomet',
    procedure: 'Total knee',
    component: 'Total knee system',
    fixation: ['Cemented', 'Cementless', 'Hybrid'],
    descriptor: 'CR/LPS bearings; routinely cemented, hybrid, and cementless (Trabecular Metal) cohorts.',
    figures: [
      cpr(5, 3.2, [3.0, 3.4], T.nexgenLPSFlex, { note: 'NexGen LPS-Flex/NexGen (posterior-stabilised); N=31,636.' }),
      cpr(10, 4.9, [4.7, 5.2], T.nexgenLPSFlex),
      cpr(15, 6.5, [6.1, 6.8], T.nexgenLPSFlex),
      cpr(20, 8.3, [7.4, 9.3], T.nexgenLPSFlex),
    ],
    registryLinks: registryLinks('Total knee'),
    literature: [NEXGEN_TM_REF],
    notes:
      'Embedded figures are the NexGen LPS-Flex combination. AOANJRR also lists NexGen LCCK (constrained: 5/10/15-yr 4.6/5.9/9.2) and analyses the cementless Trabecular Metal cohort separately (see literature).',
  },
  {
    id: 'sv-knee-persona',
    name: 'Persona',
    manufacturer: 'Zimmer Biomet',
    procedure: 'Total knee',
    component: 'Total knee system',
    fixation: ['Cemented', 'Cementless'],
    descriptor: 'Anatomic successor to NexGen; CR/PS/UC bearings; cemented and cementless.',
    figures: [
      cpr(2, 1.5, [1.4, 1.6], 'Table BM2 — Persona CR/Persona (primary TKR, OA)', { note: 'Persona CR; N=76,213 — the single largest 10-year TKR cohort in the table.' }),
      cpr(5, 2.4, [2.3, 2.6], 'Table BM2 — Persona CR/Persona (primary TKR, OA)'),
      cpr(10, 2.8, [2.5, 3.1], 'Table BM2 — Persona CR/Persona (primary TKR, OA)'),
      cpr(2, 1.8, [1.5, 2.2], 'Table BM2 — Persona PS/Persona (primary TKR, OA)', { note: 'Persona PS; N=6,546.' }),
      cpr(5, 2.8, [2.4, 3.3], 'Table BM2 — Persona PS/Persona (primary TKR, OA)'),
      cpr(10, 3.4, [2.8, 4.0], 'Table BM2 — Persona PS/Persona (primary TKR, OA)'),
    ],
    registryLinks: registryLinks('Total knee'),
    notes: 'Figures are the Persona CR and PS combinations (Table BM2, 2/5/10-yr, primary OA).',
  },
  {
    id: 'sv-knee-vanguard',
    name: 'Vanguard',
    manufacturer: 'Zimmer Biomet',
    procedure: 'Total knee',
    component: 'Total knee system',
    fixation: ['Cemented', 'Cementless'],
    descriptor: 'Biomet-heritage TKA; CR/PS; some PS/Regenerex cohorts flagged by AOANJRR.',
    figures: [
      cpr(5, 2.9, [2.7, 3.1], T.vanguardCR, { note: 'Vanguard CR/Vanguard; N=27,180.' }),
      cpr(10, 4.6, [4.4, 4.9], T.vanguardCR),
      cpr(15, 6.9, [6.4, 7.5], T.vanguardCR),
    ],
    registryLinks: [
      ...registryLinks('Total knee'),
      {
        label: 'AOANJRR — Vanguard PS investigation PDF',
        url: 'https://aoanjrr.sahmri.com/documents/d/guest/vanguard-ps-regenerex-combination-2025',
      },
    ],
    notes:
      'Embedded figure is the Vanguard CR combination (Table BM6). Specific Vanguard PS/Regenerex combinations have been the subject of AOANJRR prosthesis-specific investigation reports — review those for the flagged cohorts.',
  },
  {
    id: 'sv-knee-genesis',
    name: 'Genesis II',
    manufacturer: 'Smith & Nephew',
    procedure: 'Total knee',
    component: 'Total knee system',
    fixation: ['Cemented', 'Cementless'],
    descriptor: 'Established CR/PS TKA; Oxinium (oxidised-zirconium) femoral option.',
    figures: [
      cpr(5, 3.4, [3.2, 3.7], T.genesisCR, { note: 'Genesis II CR (minimally stabilised); N=26,672.' }),
      cpr(10, 5.0, [4.7, 5.3], T.genesisCR),
      cpr(15, 6.1, [5.8, 6.5], T.genesisCR),
      cpr(20, 7.4, [6.9, 7.9], T.genesisCR),
      cpr(5, 3.6, [3.3, 3.8], T.genesisPS, { note: 'Genesis II PS; N=21,014.' }),
      cpr(10, 4.9, [4.6, 5.3], T.genesisPS),
      cpr(15, 6.2, [5.8, 6.7], T.genesisPS),
      cpr(20, 7.2, [6.7, 7.9], T.genesisPS),
    ],
    registryLinks: registryLinks('Total knee'),
    notes:
      'Figures are the standard (CoCr) Genesis II CR and PS combinations. The Oxinium femoral variants show higher CPR: Oxinium CR 5/10/15/20-yr 3.5/5.9/8.4/10.6; Oxinium PS 4.9/7.0/9.3/11.9 [Tables BM6/BM8].',
  },
  {
    id: 'sv-knee-legion',
    name: 'Legion',
    manufacturer: 'Smith & Nephew',
    procedure: 'Total knee',
    component: 'Total / revision knee system',
    fixation: ['Cemented', 'Cementless'],
    descriptor: 'Primary and revision platform (Legion femur on a Genesis II tibia); Oxinium option.',
    figures: [
      cpr(5, 3.8, [3.4, 4.2], T.legionCR, { note: 'Legion CR/Genesis II; N=10,342.' }),
      cpr(10, 5.4, [4.7, 6.1], T.legionCR),
      cpr(15, 7.2, [5.9, 8.7], T.legionCR),
      cpr(5, 3.1, [2.7, 3.6], T.legionPS, { note: 'Legion PS/Genesis II; N=6,434.' }),
      cpr(10, 4.2, [3.7, 4.8], T.legionPS),
      cpr(15, 6.3, [4.5, 8.7], T.legionPS),
    ],
    registryLinks: registryLinks('Total knee'),
    notes:
      'Figures are the standard Legion CR and PS combinations. The Oxinium variants: Legion Oxinium CR 5/10/15-yr 3.1/4.3/5.7; Legion Oxinium PS 3.8/5.2/7.9 [Table BM6].',
  },
  {
    id: 'sv-knee-journey',
    name: 'Journey II',
    manufacturer: 'Smith & Nephew',
    procedure: 'Total knee',
    component: 'Total knee system',
    fixation: ['Cemented'],
    descriptor: 'Bi-cruciate-stabilised / kinematic design; usually Oxinium femur.',
    figures: [],
    registryLinks: registryLinks('Total knee'),
  },
  {
    id: 'sv-knee-scorpio',
    name: 'Scorpio',
    manufacturer: 'Stryker',
    procedure: 'Total knee',
    component: 'Total knee system',
    fixation: ['Cemented'],
    descriptor: 'Earlier Stryker TKA; predecessor to Triathlon; long registry follow-up.',
    figures: [],
    registryLinks: registryLinks('Total knee'),
  },
  {
    id: 'sv-knee-lcs',
    name: 'LCS (Low Contact Stress)',
    manufacturer: 'DePuy Synthes',
    procedure: 'Total knee',
    component: 'Mobile-bearing total knee',
    fixation: ['Cemented', 'Cementless'],
    descriptor: 'Classic mobile-bearing / rotating-platform knee.',
    figures: [
      cpr(5, 4.5, [4.0, 4.9], T.lcsCR, { note: 'LCS CR/LCS (mobile bearing); N=8,346.' }),
      cpr(10, 6.4, [5.9, 7.0], T.lcsCR),
      cpr(15, 8.1, [7.5, 8.8], T.lcsCR),
      cpr(20, 9.3, [8.6, 10.0], T.lcsCR),
    ],
    registryLinks: registryLinks('Total knee'),
    literature: [RBK_AOANJRR_REF],
  },
  {
    id: 'sv-knee-profix',
    name: 'Profix',
    manufacturer: 'Smith & Nephew',
    procedure: 'Total knee',
    component: 'Total knee system',
    fixation: ['Cemented'],
    descriptor: 'Earlier S&N TKA; the long-standing reference brand in NAR knee analyses.',
    figures: [],
    registryLinks: registryLinks('Total knee'),
    notes:
      'Historically used as the reference brand in the Norwegian Register Cox models for cemented TKA.',
  },
  {
    id: 'sv-knee-triathlon-tritanium',
    name: 'Triathlon Tritanium',
    manufacturer: 'Stryker',
    procedure: 'Total knee',
    component: 'Cementless total knee',
    fixation: ['Cementless'],
    descriptor: 'Cementless (3D-printed Tritanium) variant of Triathlon; distinct CPR cohort.',
    figures: [],
    registryLinks: registryLinks('Total knee'),
    notes:
      'The BM6/BM8 combination tables do not separate cemented vs Tritanium fixation; read the fixation-stratified knee chapter for the cementless cohort.',
  },
  {
    id: 'sv-knee-attune-cementless',
    name: 'ATTUNE S+ (cementless)',
    manufacturer: 'DePuy Synthes',
    procedure: 'Total knee',
    component: 'Cementless total knee',
    fixation: ['Cementless'],
    descriptor: 'Cementless porous-coated baseplate variant of ATTUNE; distinct CPR cohort.',
    figures: [],
    registryLinks: registryLinks('Total knee'),
  },

  // ══════════════════════════════ PARTIAL KNEE ═════════════════════════════
  {
    id: 'sv-uka-oxford',
    name: 'Oxford Partial Knee (medial, mobile)',
    manufacturer: 'Zimmer Biomet',
    procedure: 'Partial knee',
    component: 'Medial unicompartmental (mobile bearing)',
    fixation: ['Cemented', 'Cementless'],
    descriptor: 'Medial mobile-bearing UKA; cemented and cementless (Oxford Microplasty) options.',
    figures: [
      cpr(5, 8.1, [7.6, 8.6], 'Table KP17 — Oxford (cemented)/Oxford (cemented) (primary UKA, OA)', { fixation: 'Cemented', note: 'Cemented Oxford; N=13,753. Note cementless Oxford revises less (see the cementless entry).' }),
      cpr(10, 14.5, [13.9, 15.2], 'Table KP17 — Oxford (cemented)/Oxford (cemented) (primary UKA, OA)', { fixation: 'Cemented' }),
      cpr(15, 22.0, [21.2, 22.8], 'Table KP17 — Oxford (cemented)/Oxford (cemented) (primary UKA, OA)', { fixation: 'Cemented' }),
      cpr(20, 30.3, [29.3, 31.5], 'Table KP17 — Oxford (cemented)/Oxford (cemented) (primary UKA, OA)', { fixation: 'Cemented' }),
    ],
    registryLinks: registryLinks('Partial knee'),
    notes:
      'The most-used partial knee in both registries. UKA carries higher CPR than TKA, largely driven by revision to TKA. Figures are the cemented Oxford cohort (Table KP17) — the cementless Oxford performs notably better.',
  },
  {
    id: 'sv-uka-oxford-cementless',
    name: 'Oxford Partial Knee (cementless)',
    manufacturer: 'Zimmer Biomet',
    procedure: 'Partial knee',
    component: 'Medial unicompartmental (mobile bearing)',
    fixation: ['Cementless'],
    descriptor: 'Cementless (Microplasty instrumentation) Oxford; reported as a distinct cohort.',
    figures: [
      cpr(5, 5.8, [5.3, 6.3], 'Table KP17 — Oxford (cementless)/Oxford (cementless) (primary UKA, OA)', { fixation: 'Cementless', note: 'Cementless Oxford; N=10,442 — lower CPR than the cemented Oxford at every interval.' }),
      cpr(10, 10.3, [9.6, 11.2], 'Table KP17 — Oxford (cementless)/Oxford (cementless) (primary UKA, OA)', { fixation: 'Cementless' }),
      cpr(15, 18.9, [17.0, 21.0], 'Table KP17 — Oxford (cementless)/Oxford (cementless) (primary UKA, OA)', { fixation: 'Cementless' }),
    ],
    registryLinks: registryLinks('Partial knee'),
    notes:
      'AOANJRR reports the cementless Oxford separately from the cemented Oxford; here the cementless cohort revises less (10.3% vs 14.5% at 10 yr).',
  },
  {
    id: 'sv-uka-oxford-lateral',
    name: 'Oxford Domed Lateral',
    manufacturer: 'Zimmer Biomet',
    procedure: 'Partial knee',
    component: 'Lateral unicompartmental (mobile bearing)',
    fixation: ['Cemented'],
    descriptor: 'Lateral mobile-bearing UKA (domed tibial component to reduce dislocation).',
    figures: [],
    registryLinks: registryLinks('Partial knee'),
  },
  {
    id: 'sv-uka-zuk',
    name: 'ZUK (Zimmer Unicompartmental Knee)',
    manufacturer: 'Zimmer Biomet',
    procedure: 'Partial knee',
    component: 'Unicompartmental (fixed bearing)',
    fixation: ['Cemented', 'Cementless'],
    descriptor: 'Fixed-bearing UKA (Zimmer/Unicompartmental High Flex heritage).',
    figures: [
      cpr(5, 4.6, [4.2, 5.1], 'Table KP17 — ZUK/ZUK (primary UKA, OA)', { note: 'ZUK fixed bearing; N=9,673. KP17 is not split by cement.' }),
      cpr(10, 8.0, [7.4, 8.7], 'Table KP17 — ZUK/ZUK (primary UKA, OA)'),
      cpr(15, 12.4, [11.5, 13.5], 'Table KP17 — ZUK/ZUK (primary UKA, OA)'),
    ],
    registryLinks: registryLinks('Partial knee'),
  },
  {
    id: 'sv-uka-persona',
    name: 'Persona Partial Knee',
    manufacturer: 'Zimmer Biomet',
    procedure: 'Partial knee',
    component: 'Unicompartmental (fixed bearing)',
    fixation: ['Cemented'],
    descriptor: 'Fixed-bearing UKA on the Persona platform; successor to ZUK.',
    figures: [
      cpr(1, 1.3, [0.9, 1.9], 'Table KP17 — Persona/Persona (primary UKA, OA)', { note: 'Persona Partial Knee; N=2,847. Short follow-up (table reports to 3 yr).' }),
      cpr(3, 3.6, [2.8, 4.8], 'Table KP17 — Persona/Persona (primary UKA, OA)'),
    ],
    registryLinks: registryLinks('Partial knee'),
  },
  {
    id: 'sv-uka-vanguard-m',
    name: 'Vanguard M',
    manufacturer: 'Zimmer Biomet',
    procedure: 'Partial knee',
    component: 'Unicompartmental (fixed bearing)',
    fixation: ['Cemented'],
    descriptor: 'Biomet-heritage fixed-bearing medial UKA.',
    figures: [],
    registryLinks: registryLinks('Partial knee'),
  },
  {
    id: 'sv-uka-triathlon-pkr',
    name: 'Triathlon PKR',
    manufacturer: 'Stryker',
    procedure: 'Partial knee',
    component: 'Unicompartmental (fixed bearing)',
    fixation: ['Cemented'],
    descriptor: 'Fixed-bearing partial knee on the Triathlon platform.',
    figures: [
      cpr(5, 8.2, [5.8, 11.5], 'Table KP17 — Triathlon PKR/Triathlon PKR (primary UKA, OA)', { note: 'Triathlon PKR; N=386 — small cohort, wide CI.' }),
      cpr(10, 11.8, [8.7, 16.0], 'Table KP17 — Triathlon PKR/Triathlon PKR (primary UKA, OA)'),
    ],
    registryLinks: registryLinks('Partial knee'),
  },
  {
    id: 'sv-uka-restoris',
    name: 'Restoris MCK (Mako)',
    manufacturer: 'Stryker',
    procedure: 'Partial knee',
    component: 'Unicompartmental (fixed bearing, robotic-assisted)',
    fixation: ['Cemented'],
    descriptor: 'Fixed-bearing UKA implanted with Mako robotic assistance; medial/lateral/PFJ.',
    figures: [
      cpr(3, 2.7, [2.3, 3.3], 'Table KP17 — Restoris MCK/Restoris MCK (primary UKA, OA)', { note: 'Restoris MCK (Mako); N=6,792.' }),
      cpr(5, 4.1, [3.4, 4.9], 'Table KP17 — Restoris MCK/Restoris MCK (primary UKA, OA)'),
    ],
    registryLinks: registryLinks('Partial knee'),
    notes:
      'Figures are the Restoris MCK combination (Table KP17). Robotic-assisted UKA follow-up is still maturing (table reports to 5 yr).',
  },
  {
    id: 'sv-uka-eius',
    name: 'EIUS',
    manufacturer: 'Stryker',
    procedure: 'Partial knee',
    component: 'Unicompartmental (mobile bearing)',
    fixation: ['Cemented'],
    descriptor: 'Earlier Stryker mobile-bearing UKA.',
    figures: [],
    registryLinks: registryLinks('Partial knee'),
  },
  {
    id: 'sv-uka-sigma-hp',
    name: 'Sigma HP Partial Knee',
    manufacturer: 'DePuy Synthes',
    procedure: 'Partial knee',
    component: 'Unicompartmental (fixed bearing)',
    fixation: ['Cemented'],
    descriptor: 'Fixed-bearing medial/lateral UKA on the Sigma platform.',
    figures: [
      cpr(5, 4.3, [3.5, 5.4], 'Table KP17 — Sigma HP/Sigma HP (primary UKA, OA)', { note: 'Sigma HP Partial Knee; N=2,015.' }),
      cpr(10, 7.3, [5.9, 9.0], 'Table KP17 — Sigma HP/Sigma HP (primary UKA, OA)'),
      cpr(15, 12.2, [9.6, 15.4], 'Table KP17 — Sigma HP/Sigma HP (primary UKA, OA)'),
    ],
    registryLinks: registryLinks('Partial knee'),
  },
  {
    id: 'sv-uka-preservation',
    name: 'Preservation',
    manufacturer: 'DePuy Synthes',
    procedure: 'Partial knee',
    component: 'Unicompartmental (fixed & mobile bearing)',
    fixation: ['Cemented'],
    descriptor: 'Earlier DePuy UKA; reported with long follow-up in both registries.',
    figures: [],
    registryLinks: registryLinks('Partial knee'),
  },
  {
    id: 'sv-uka-journey-uni',
    name: 'Journey UNI',
    manufacturer: 'Smith & Nephew',
    procedure: 'Partial knee',
    component: 'Unicompartmental (fixed bearing)',
    fixation: ['Cemented'],
    descriptor: 'Fixed-bearing medial UKA; Oxinium femoral option.',
    figures: [
      cpr(5, 6.9, [5.7, 8.4], 'Table KP17 — Journey Uni/Journey Uni v2 (primary UKA, OA)', { note: 'Journey Uni (v2); N=1,719.' }),
      cpr(10, 11.3, [9.0, 14.2], 'Table KP17 — Journey Uni/Journey Uni v2 (primary UKA, OA)'),
    ],
    registryLinks: registryLinks('Partial knee'),
  },
  {
    id: 'sv-uka-accuris',
    name: 'Accuris',
    manufacturer: 'Smith & Nephew',
    procedure: 'Partial knee',
    component: 'Unicompartmental (fixed bearing)',
    fixation: ['Cemented'],
    descriptor: 'Earlier S&N fixed-bearing UKA.',
    figures: [],
    registryLinks: registryLinks('Partial knee'),
  },
  {
    id: 'sv-uka-pfj',
    name: 'Patellofemoral (Gender Solutions PFJ)',
    manufacturer: 'Zimmer Biomet',
    procedure: 'Partial knee',
    component: 'Patellofemoral joint replacement',
    fixation: ['Cemented'],
    descriptor: 'Isolated patellofemoral arthroplasty; reported in the registry partial-knee section.',
    figures: [
      cpr(5, 9.2, [7.8, 10.8], 'Table KP5 — Gender Solutions/NexGen (primary patella/trochlea, OA)', { note: 'Gender Solutions trochlea + NexGen patella; N=1,554.' }),
      cpr(10, 20.5, [17.9, 23.4], 'Table KP5 — Gender Solutions/NexGen (primary patella/trochlea, OA)'),
    ],
    registryLinks: registryLinks('Partial knee'),
    notes:
      'Figures are the Gender Solutions/NexGen patellofemoral combination (Table KP5). Patellofemoral replacement is a small cohort with high CPR (20.5% at 10 yr) relative to tibiofemoral UKA.',
  },
];
