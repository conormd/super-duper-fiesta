# OrthoID

A web-based **reference aid for radiographic identification of orthopaedic
implants**, focused on manufacturers active in the Canadian market: Zimmer
Biomet, Stryker, Smith & Nephew, Arthrex, and DePuy Synthes.

> ⚠️ **Educational aid — not a medical device.** OrthoID helps narrow down
> candidate implants from radiographic cues. It does not diagnose or
> definitively identify any implant. Always confirm against the operative
> record, the patient's implant card, manufacturer documentation, or expert
> radiologic review before any clinical decision. Coverage is a curated,
> non-exhaustive selection of product families.

## Features

- **Guided identification** — narrow candidates step by step: anatomical region
  → manufacturer (if known) → fixation type (hip/knee) → free-text description
  of distinguishing features. Candidates are ranked by how many of your terms
  match their known identifying features.
- **Browse catalogue** — search and filter the full reference set by
  manufacturer, anatomical region, and keyword.
- **Implant detail** — overview, paired AP and lateral (mediolateral) reference
  radiograph slots, radiographic identifying features, notable variants, market
  period, supporting references, and entry-specific caveats.

## Adding implants from the app

An **Add implant** tab lets you add your own products and photos (AP/lateral
radiographs and product photos) directly through the interface — no code
editing. Entries are stored **on your device only** (in the browser's
IndexedDB); nothing is uploaded, which keeps clinical images private. Your
entries are merged into the catalogue and the guided flow alongside the
built-in data and tagged "Added by you".

Use **Export all (JSON)** to back up your entries or to share them so they can
be reviewed and folded into the shared built-in catalogue
(`src/data/implants.ts`). Only upload images you have the right to use, and
ensure any clinical images are de-identified.

## Anatomical regions covered

Hip, Knee, Shoulder, Trauma / Fracture fixation, and Sports medicine / Soft
tissue.

## Tech stack

- [Vite](https://vitejs.dev/) + [React](https://react.dev/) + TypeScript
- No backend — fully client-side; implant data lives in `src/data/implants.ts`

## Getting started

```bash
npm install      # install dependencies
npm run dev      # start the dev server (http://localhost:5173)
npm run build    # type-check and produce a production build in dist/
npm run preview  # serve the production build locally
npm run lint     # type-check only (tsc --noEmit)
```

## Project structure

```
src/
├── main.tsx              app entry point
├── App.tsx               tab shell (Identify / Browse) + detail modal
├── types.ts              Implant / Manufacturer / Anatomy types
├── index.css             styling
├── data/
│   └── implants.ts       the implant reference dataset
├── lib/
│   └── search.ts         tokenization and feature-match scoring
└── components/
    ├── Disclaimer.tsx
    ├── IdentifyView.tsx   guided identification flow
    ├── BrowseView.tsx     search + filter catalogue
    ├── ImplantCard.tsx    summary card
    └── ImplantDetail.tsx  detail modal
```

## Extending the dataset

Add entries to the `implants` array in `src/data/implants.ts`. Each entry
follows the `Implant` interface in `src/types.ts`. Keep `identifyingFeatures`
focused on cues that are visible or inferable from imaging, and use the `notes`
field for any entry-specific caveats. Entries may include an optional
`references` array of `Reference` objects (title, source, `pmid`, `doi`); these
render as PubMed/DOI links in the detail view. The guided flow and catalogue
update automatically from the data — no other code changes are needed.

### Reference radiographs

Each implant detail view shows two slots — **AP** and **lateral (mediolateral)**
— since documenting both planes improves recognition. There are three ways to
populate them, and all are supported:

1. **Host an image** (open-access CC BY figure or institution-owned/permissioned
   file): add a `views` entry (`view`, `src`, `caption`, `credit`, `license`,
   `sourceUrl`). Drop local files in `public/radiographs/` — see
   [`public/radiographs/README.md`](public/radiographs/README.md) for the
   convention and licensing rules. `src` may be a URL or a `/radiographs/…` path.
2. **Curated external links**: add an `imageLinks` array (`{ label, url }`) to
   point at specific atlases or manufacturer technique guides.
3. **Automatic atlas search**: every implant detail view links out to a
   Radiopaedia search for that product — no data entry required.

> **Do not embed copyrighted radiographs.** Only host images you have the right
> to display, always fill in `credit` and `license`, and ensure any clinical
> images are de-identified. Slots with no hosted image show a placeholder while
> still offering the external links above.

## Disclaimer & data provenance

Implant data is compiled from publicly available manufacturer product
information and is non-exhaustive. Where entries cite supporting literature,
references are sourced from PubMed and link out via DOI/PMID. OrthoID is not
affiliated with or endorsed by any manufacturer.
