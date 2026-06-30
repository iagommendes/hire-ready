# Contributing to hire-ready

Thanks for your interest in improving hire-ready! This project is built so the
community can extend it easily without touching the core.

## Ways to contribute

- **PDF templates** — add a new look for the generated resume.
  See [docs/CONTRIBUTING_TEMPLATES.md](docs/CONTRIBUTING_TEMPLATES.md).
- **Match quality** — expand the skills dictionary or tune the scoring.
  See [docs/CONTRIBUTING_MATCH.md](docs/CONTRIBUTING_MATCH.md).
- **Bug fixes & features** — open an issue first for larger changes.

## Development setup

```bash
npm install
npm run dev
```

## Before opening a PR

Run all checks locally (these also run in CI):

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

## Guidelines

- Keep the match module (`src/lib/match/`) **pure and deterministic**; add a
  test for any behavior change.
- Don't introduce paid services or required API keys; the app must remain fully
  functional for free, offline-first.
- Keep new dependencies minimal and justified.
- Match the existing code style (Prettier-compatible defaults, TypeScript
  strict mode).

## Code of conduct

Be kind and constructive. We're all here to help people land jobs.
