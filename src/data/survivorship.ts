import type { ProcedureType, Reference, SurvivorshipImplant } from '../types';

/**
 * Quick-reference survivorship aid for commonly used hip and knee implants in
 * the Canadian market, from Zimmer Biomet, Stryker, Smith & Nephew, and DePuy
 * Synthes. It surfaces published cumulative-percent-revision (CPR) /
 * Kaplan–Meier survival data from the two registries clinicians most often
 * consult for these products:
 *
 *   • AOANJRR  — Australian Orthopaedic Association National Joint Replacement
 *                Registry (annual + "Comparative Prostheses Performance"
 *                supplementary reports; per-prosthesis "investigation" PDFs).
 *   • NAR      — Norwegian Arthroplasty Register (English annual reports).
 *
 * IMPORTANT — DATA PROVENANCE
 * The registries publish their per-prosthesis CPR in detailed report tables.
 * Those figures are versioned (each annual report adds a year of follow-up) and
 * must be read from the primary source. Numeric values are embedded here ONLY
 * where they have been verified against the cited source (`verified: true`);
 * everything else links directly to the exact registry report so the current
 * table can be read in one click. No figure is estimated or fabricated.
 */

// ─────────────────────────── Primary source links ──────────────────────────

/** Canonical AOANJRR report destinations (latest annual + supplementary). */
const AOANJRR = {
  annual: 'https://aoanjrr.sahmri.com/annual-reports-2024',
  supplementary: 'https://aoanjrr.sahmri.com/annual-reports-2024/supplementary',
};

/** Norwegian Arthroplasty Register — landing page (lists all English reports). */
const NAR = {
  reports: 'https://www.helse-bergen.no/nrl',
  report2024:
    'https://www.helse-bergen.no/48d1eb/contentassets/9f19d57711ee4e60815d6b89e8e8472b/report2024.pdf',
};

/**
 * Standard registry deep-links for an implant. AOANJRR breaks results down by
 * named prosthesis in the "Comparative Prostheses Performance" supplementary
 * report; NAR reports brand/fixation survival in its annual report.
 */
function registryLinks(_procedure: ProcedureType): { label: string; url: string }[] {
  return [
    { label: 'AOANJRR Annual Report 2024', url: AOANJRR.annual },
    { label: 'AOANJRR Comparative Prostheses Performance', url: AOANJRR.supplementary },
    { label: 'Norwegian Register (NAR) Report 2024', url: NAR.report2024 },
  ];
}

// ─────────────────────────── Supporting literature ─────────────────────────
// Registry-based or registry-comparison studies located via PubMed. These
// support, but do not replace, the registry report tables linked per implant.

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

// Single-centre cohort studies (NOT registry CPR) located via PubMed full text;
// useful clinical context alongside the registry report tables.
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
    figures: [],
    registryLinks: registryLinks('Total hip'),
    notes:
      'One of the most-used cementless stems in both registries; frequently paired with the Pinnacle cup. Read the Corail (and Corail/Pinnacle combination) CPR in the AOANJRR supplementary report.',
  },
  {
    id: 'sv-hip-pinnacle',
    name: 'Pinnacle',
    manufacturer: 'DePuy Synthes',
    procedure: 'Total hip',
    component: 'Acetabular cup',
    fixation: ['Cementless'],
    descriptor: 'Hemispherical press-fit shell; polyethylene, ceramic, or metal liners.',
    figures: [],
    registryLinks: registryLinks('Total hip'),
    notes:
      'CPR is strongly bearing-dependent (metal-on-metal Pinnacle cohorts perform markedly worse). Confirm the liner-specific cohort in the registry table.',
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
    figures: [],
    registryLinks: registryLinks('Total hip'),
  },
  {
    id: 'sv-hip-exeter',
    name: 'Exeter V40',
    manufacturer: 'Stryker',
    procedure: 'Total hip',
    component: 'Femoral stem',
    fixation: ['Cemented'],
    descriptor: 'Polished, collarless, double-tapered (taper-slip) cemented stem.',
    figures: [],
    registryLinks: registryLinks('Total hip'),
    notes:
      'The benchmark cemented stem in both registries, with very large numbers and long follow-up. CPR is reported by stem and by stem/cup combination.',
  },
  {
    id: 'sv-hip-accolade',
    name: 'Accolade II',
    manufacturer: 'Stryker',
    procedure: 'Total hip',
    component: 'Femoral stem',
    fixation: ['Cementless'],
    descriptor: 'Single-taper wedge cementless stem; usually paired with a Trident shell.',
    figures: [],
    registryLinks: registryLinks('Total hip'),
  },
  {
    id: 'sv-hip-trident',
    name: 'Trident / Trident II',
    manufacturer: 'Stryker',
    procedure: 'Total hip',
    component: 'Acetabular cup',
    fixation: ['Cementless'],
    descriptor: 'Press-fit shell; ceramic, polyethylene, or metal liners.',
    figures: [],
    registryLinks: registryLinks('Total hip'),
  },
  {
    id: 'sv-hip-taperloc',
    name: 'Taperloc Complete',
    manufacturer: 'Zimmer Biomet',
    procedure: 'Total hip',
    component: 'Femoral stem',
    fixation: ['Cementless'],
    descriptor: 'Flat dual-tapered proximally porous-coated cementless stem.',
    figures: [],
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
    figures: [],
    registryLinks: registryLinks('Total hip'),
  },
  {
    id: 'sv-hip-g7',
    name: 'G7',
    manufacturer: 'Zimmer Biomet',
    procedure: 'Total hip',
    component: 'Acetabular cup',
    fixation: ['Cementless'],
    descriptor: 'Hemispherical press-fit shell; multiple liner options incl. dual mobility.',
    figures: [],
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
    figures: [],
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
    figures: [],
    registryLinks: registryLinks('Total hip'),
  },
  {
    id: 'sv-hip-anthology',
    name: 'Anthology',
    manufacturer: 'Smith & Nephew',
    procedure: 'Total hip',
    component: 'Femoral stem',
    fixation: ['Cementless'],
    descriptor: 'Dual-tapered proximally porous/HA-coated cementless stem.',
    figures: [],
    registryLinks: registryLinks('Total hip'),
  },
  {
    id: 'sv-hip-sln',
    name: 'SL-PLUS / Synergy',
    manufacturer: 'Smith & Nephew',
    procedure: 'Total hip',
    component: 'Femoral stem',
    fixation: ['Cementless'],
    descriptor: 'Tapered proximally porous-coated cementless stems (SMITH & NEPHEW heritage).',
    figures: [],
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
    figures: [],
    registryLinks: registryLinks('Total knee'),
    literature: [TRIATHLON_10YR_REF, ATTUNE_TRIATHLON_RLL_REF],
    notes:
      'High-volume system in both registries. CPR is reported separately by bearing (CR/PS) and by cemented vs cementless Tritanium fixation — read the matching cohort.',
  },
  {
    id: 'sv-knee-attune',
    name: 'ATTUNE',
    manufacturer: 'DePuy Synthes',
    procedure: 'Total knee',
    component: 'Total knee system',
    fixation: ['Cemented', 'Cementless'],
    descriptor: 'Gradually-reducing-radius TKA; CR/PS/rotating-platform; cemented & S+ cementless.',
    figures: [],
    registryLinks: registryLinks('Total knee'),
    literature: [ATTUNE_TRIATHLON_RLL_REF],
    notes:
      'AOANJRR tracks ATTUNE base-plate variants closely; early vs later tibial baseplate cohorts differ. Confirm the variant in the registry table.',
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
      'One of the longest-follow-up knee systems in both registries — useful as a benchmark.',
  },
  {
    id: 'sv-knee-nexgen',
    name: 'NexGen',
    manufacturer: 'Zimmer Biomet',
    procedure: 'Total knee',
    component: 'Total knee system',
    fixation: ['Cemented', 'Cementless', 'Hybrid'],
    descriptor: 'CR/LPS bearings; routinely cemented, hybrid, and cementless (Trabecular Metal) cohorts.',
    figures: [],
    registryLinks: registryLinks('Total knee'),
    literature: [NEXGEN_TM_REF],
    notes:
      'AOANJRR reports NexGen by minimally- vs highly-stabilised and by cemented/hybrid/cementless fixation; the cementless Trabecular Metal cohort is analysed separately (see literature).',
  },
  {
    id: 'sv-knee-persona',
    name: 'Persona',
    manufacturer: 'Zimmer Biomet',
    procedure: 'Total knee',
    component: 'Total knee system',
    fixation: ['Cemented', 'Cementless'],
    descriptor: 'Anatomic successor to NexGen; CR/PS/UC bearings; cemented and cementless.',
    figures: [],
    registryLinks: registryLinks('Total knee'),
  },
  {
    id: 'sv-knee-vanguard',
    name: 'Vanguard',
    manufacturer: 'Zimmer Biomet',
    procedure: 'Total knee',
    component: 'Total knee system',
    fixation: ['Cemented', 'Cementless'],
    descriptor: 'Biomet-heritage TKA; CR/PS; some PS/Regenerex cohorts flagged by AOANJRR.',
    figures: [],
    registryLinks: [
      ...registryLinks('Total knee'),
      {
        label: 'AOANJRR — Vanguard PS investigation PDF',
        url: 'https://aoanjrr.sahmri.com/documents/d/guest/vanguard-ps-regenerex-combination-2025',
      },
    ],
    notes:
      'Specific Vanguard PS combinations have been the subject of AOANJRR prosthesis-specific investigation reports — review those for the flagged cohorts.',
  },
  {
    id: 'sv-knee-genesis',
    name: 'Genesis II',
    manufacturer: 'Smith & Nephew',
    procedure: 'Total knee',
    component: 'Total knee system',
    fixation: ['Cemented', 'Cementless'],
    descriptor: 'Established CR/PS TKA; Oxinium (oxidised-zirconium) femoral option.',
    figures: [],
    registryLinks: registryLinks('Total knee'),
  },
  {
    id: 'sv-knee-legion',
    name: 'Legion',
    manufacturer: 'Smith & Nephew',
    procedure: 'Total knee',
    component: 'Total / revision knee system',
    fixation: ['Cemented', 'Cementless'],
    descriptor: 'Primary and revision platform; Oxinium femoral option; some flagged cohorts.',
    figures: [],
    registryLinks: registryLinks('Total knee'),
    notes:
      'Certain Legion femoral combinations have AOANJRR investigation PDFs — check the prosthesis-specific report.',
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
    figures: [],
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
      'Reported separately from cemented Triathlon — use the cementless cohort when comparing fixation.',
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
    figures: [],
    registryLinks: registryLinks('Partial knee'),
    notes:
      'The most-used partial knee in both registries. AOANJRR stratifies UKA by mobile vs fixed bearing and by cement — read the matching Oxford cohort. UKA generally carries higher CPR than TKA, largely driven by revision to TKA.',
  },
  {
    id: 'sv-uka-oxford-cementless',
    name: 'Oxford Partial Knee (cementless)',
    manufacturer: 'Zimmer Biomet',
    procedure: 'Partial knee',
    component: 'Medial unicompartmental (mobile bearing)',
    fixation: ['Cementless'],
    descriptor: 'Cementless (Microplasty instrumentation) Oxford; reported as a distinct cohort.',
    figures: [],
    registryLinks: registryLinks('Partial knee'),
    notes:
      'AOANJRR reports the cementless Oxford separately from the cemented Oxford — compare like with like.',
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
    figures: [],
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
    figures: [],
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
    figures: [],
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
    figures: [],
    registryLinks: registryLinks('Partial knee'),
    notes:
      'Registries are beginning to report robotic-assisted UKA cohorts; numbers and follow-up are still maturing.',
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
    figures: [],
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
    figures: [],
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
    figures: [],
    registryLinks: registryLinks('Partial knee'),
    notes:
      'Patellofemoral replacements are a small, distinct partial-knee cohort with their own (generally higher) CPR — read the dedicated registry table.',
  },
];
