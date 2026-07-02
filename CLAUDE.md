# CLAUDE.md

This file provides guidance for AI assistants (Claude and others) working in this repository.

## Repository Overview

**super-duper-fiesta** hosts **OrthoID**, a client-side web app that acts as a
reference aid for radiographic identification of orthopaedic implants from
manufacturers active in the Canadian market (Zimmer Biomet, Stryker, Smith &
Nephew, Arthrex, DePuy Synthes).

- **Remote:** conormd/super-duper-fiesta
- **Default branch:** main
- **Active feature branch convention:** `claude/<description>-<ID>`

## Tech Stack

- **Vite + React + TypeScript** (strict mode), no backend.
- Implant reference data is a static TypeScript module — no database.

## Commands

```bash
npm install            # install dependencies
npm run dev            # dev server (http://localhost:5173)
npm run build          # tsc -b && vite build → dist/
npm run preview        # serve the production build
npm run lint           # type-check only (tsc --noEmit)
npm run validate:images  # check every implant view has a licensed file on disk
npm run build:embeddings # encode reference images → public/embeddings.json
```

There is no test runner or CI configured yet. When one is added, document it here.

### Image-based identification

The "Identify by image" tab matches an uploaded radiograph against the
reference library by **visual similarity** (no model training). It is a
two-tier design:

- **Tier 1 (in-browser, free):** `scripts/build-embeddings.ts` encodes every
  implant view with a pretrained CLIP model into `public/embeddings.json` at
  build time. `src/lib/imageMatch.ts` encodes the uploaded image with the same
  model in the browser and ranks implants by cosine similarity. The upload
  never leaves the device. Re-run `npm run build:embeddings` whenever you add
  or change implant images — the model id must stay in sync between the script
  and `imageMatch.ts`.
- **Tier 2 (opt-in, serverless):** `api/identify.ts` (a Vercel function) sends
  the downscaled upload + the Tier-1 candidate ids to Claude vision
  (`claude-opus-4-8` via `@anthropic-ai/sdk`), which re-ranks the shortlist
  against each implant's documented `identifyingFeatures` and returns
  image-grounded reasoning (`src/lib/reRank.ts` is the client). The UI states
  clearly that this step sends the image to a server, and falls back to the
  Tier-1 ranking on any failure. Requires the `ANTHROPIC_API_KEY` environment
  variable on the deployment; without it the endpoint returns 503 and the app
  keeps working on Tier 1 alone.

To deploy: push the repo to Vercel (vercel.com → New Project → import the
GitHub repo; the Vite app and `api/` function are auto-detected), then add
`ANTHROPIC_API_KEY` under Project Settings → Environment Variables. `npm run
dev` alone does not serve `api/`; use `npx vercel dev` to exercise Tier 2
locally.

The CLIP weights are fetched from the Hugging Face CDN on first use (build and
runtime), so `build:embeddings` must run in an environment with network access
to `huggingface.co`. `embeddings.json` is a generated artifact; rebuild it
rather than editing by hand.

## Repository Structure

```
super-duper-fiesta/
├── CLAUDE.md            ← this file
├── README.md           ← project description
├── index.html
├── package.json, tsconfig*.json, vite.config.ts
├── scripts/             ← build/validation tooling (run with tsx)
│   ├── refImages.ts         ← derives the labelled reference-image list from data
│   ├── validate-images.ts   ← Phase 0: license/existence checks
│   └── build-embeddings.ts  ← Phase 1: writes public/embeddings.json
├── public/
│   ├── radiographs/         ← reference images (each MUST be licensed)
│   └── embeddings.json      ← generated CLIP vectors (do not edit by hand)
└── src/
    ├── main.tsx, App.tsx, index.css, types.ts
    ├── data/implants.ts     ← implant reference dataset
    ├── lib/search.ts        ← tokenization + feature-match scoring
    ├── lib/imageMatch.ts    ← in-browser image embedding + similarity ranking
    └── components/          ← Disclaimer, IdentifyView, IdentifyByImageView,
                               BrowseView, cards, detail
```

## Domain Notes

- **OrthoID is an educational aid, not a medical device.** Keep the in-app
  disclaimer prominent and never frame output as a definitive identification.
- Implant data must come from publicly available manufacturer information.
  Keep `identifyingFeatures` to cues visible or inferable from imaging, and put
  caveats in the entry's `notes` field. Do not fabricate precise specs.
- To add implants, append to the `implants` array in `src/data/implants.ts`
  following the `Implant` interface; the UI updates automatically.
- **Reference radiographs:** entries support an optional `views` array (AP and
  lateral). Never embed copyrighted radiographs — use only open-access (e.g.
  CC BY), institution-owned, or permissioned images, and always populate
  `credit` and `license`.

## Development Workflow

### Branching

- Work on feature branches, never directly on `main`
- Branch naming: `claude/<short-description>-<ID>` for AI-driven work; `<author>/<short-description>` for human-driven work
- Push with tracking: `git push -u origin <branch-name>`

### Commits

- Write clear, imperative commit messages (e.g. "Add CLAUDE.md with project conventions")
- Keep commits focused; one logical change per commit
- Do not skip pre-commit hooks (`--no-verify`) unless explicitly instructed

### Pull Requests

- Do not open a PR unless the user explicitly asks for one
- PR titles should be concise (under 70 characters)

## Conventions for AI Assistants

- **Read before editing.** Always read a file before modifying it.
- **Minimal changes.** Only change what is necessary for the task. Do not refactor surrounding code, add docstrings, or clean up unrelated areas.
- **No speculative additions.** Do not add error handling, helpers, or abstractions for scenarios not present in the task.
- **No new files without cause.** Prefer editing existing files; create new ones only when clearly required.
- **Security.** Never introduce command injection, XSS, SQL injection, or other OWASP vulnerabilities. Fix them immediately if spotted.
- **Confirm before destructive actions.** Force pushes, branch deletions, and hard resets require explicit user approval.

## Updating This File

When the project acquires structure (language, framework, tests, CI, etc.), update the relevant sections:

- Add language/framework and version requirements
- Document how to install dependencies
- Document how to run tests and linters
- Document environment variable setup
- Add any project-specific coding conventions
