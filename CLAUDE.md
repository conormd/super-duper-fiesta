# CLAUDE.md

This file provides guidance for AI assistants (Claude and others) working in this repository.

## Repository Overview

**super-duper-fiesta** is a starter repository currently in early initialization. It contains no application code yet — only a README. This file will evolve as the project grows.

- **Remote:** conormd/super-duper-fiesta
- **Default branch:** main
- **Active feature branch convention:** `claude/<description>-<ID>`

## Current Repository State

The repository is minimal:

```
super-duper-fiesta/
├── CLAUDE.md       ← this file
└── README.md       ← project description
```

No language, framework, build system, test runner, or CI/CD has been configured yet. When these are added, update this file accordingly.

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
