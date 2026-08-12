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
npm install      # install dependencies
npm run dev      # dev server (http://localhost:5173)
npm run build    # tsc -b && vite build → dist/
npm run preview  # serve the production build
npm run lint     # type-check only (tsc --noEmit)
```

There is no test runner or CI configured yet. When one is added, document it here.

## Repository Structure

```
super-duper-fiesta/
├── CLAUDE.md            ← this file
├── README.md           ← project description
├── index.html
├── package.json, tsconfig*.json, vite.config.ts
├── models/             ← generated STL reference geometry (see models/README.md)
├── tools/              ← Python SDF model generators for models/
└── src/
    ├── main.tsx, App.tsx, index.css, types.ts
    ├── data/implants.ts     ← implant reference dataset
    ├── lib/search.ts        ← tokenization + feature-match scoring
    └── components/          ← Disclaimer, IdentifyView, BrowseView, cards, detail
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
