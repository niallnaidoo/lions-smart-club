# Lions Smart Club — Claude project notes

## What this is

A clickable front-end prototype of the DP World Lions Smart Club Integration
Platform: club affiliation, compliance documents, the Club Quality Index (CQI),
fixture automation, and travel-cost modelling for the KZNCU & EMCU leagues.

No backend, no database, no payment processing. Every piece of state lives in
memory and resets on page refresh. Sample data is in `src/data.jsx`.

## Stack

- **Vite 5** (bundler + dev server)
- **React 18** (JSX, not TypeScript)
- **Leaflet** for the ground-locator map in the affiliation form
- **SST v3** for AWS infra (S3 + CloudFront)

## Commands

```bash
npm install            # one time
npm run dev            # local dev on http://localhost:3201
npm run build          # production build to dist/
npm run preview        # preview the build on http://localhost:3201
npm run lint           # ESLint
npm run format         # Prettier write
npm run format:check   # Prettier check (no writes)
npm run deploy         # SST deploy --stage dev (AWS S3 + CloudFront)
npm run remove         # SST teardown of dev stage (≈ 20 min)
npm run console        # SST console for live logs/state
```

## Layout

```
src/
  main.jsx          App shell, routing, role/profile state, task modals
  data.jsx          Sample data + helpers (cohortStats, docCompletion, ...)
  atoms.jsx         Design-system primitives (Icon, Pill, Btn, Card, ...)
  club.jsx          Club-side views (Home, Affiliation, Documents, CQI, Fixtures)
  admin.jsx         Admin views (Dashboard, Clubs, Filtered, Fixtures)
  onboarding.jsx    3-step cinematic welcome modal
public/
  lions-logo.svg
  players/lions-hero.jpg
  fixture-automation-engine.html   Placeholder for iframe (Phase 02)
index.html          Vite entrypoint at repo root (embeds the global CSS)
vite.config.js      Vite config (dev + preview both bind port 3201)
vercel.json         Explicit Vite preset + cache headers for static assets
```

## Conventions

- 2-space indent, single quotes, semicolons, trailing commas (es5), 100-col width.
- JSX, not TypeScript. No PropTypes.
- Named exports everywhere (no default exports).
- Hooks are imported by name (`import { useState } from 'react'`) — no aliases.
- Tests: none yet. Add Vitest + React Testing Library when needed.

## Known cruft

- `scoreCQI` lives in `src/atoms.jsx` (out of place — it's a pure scoring
  function, not a component). Historical, from when files shared a global
  namespace. Leave it unless you have a reason to move it.
- `LionMark` and `FixtureEngineEmbed` in `src/main.jsx` are unused symbols
  carried over from earlier prototypes.

## Leaflet gotcha

Default markers (`L.marker([...])` without an explicit `icon`) do **not** work
out of the box with Vite asset hashing. The current code uses `L.divIcon`
exclusively, so it sidesteps the issue. If you add a default marker, apply the
standard fix:

```js
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';
L.Icon.Default.mergeOptions({ iconUrl, iconRetinaUrl, shadowUrl });
```

## Iframe dependency

`src/main.jsx` embeds an iframe pointing at `/fixture-automation-engine.html`
(served from `public/`). The current file is a stub "work in progress" page.
Replace it with the real engine when ready — keep the filename and root path.

## Deploys

- **Infra-as-code:** `sst.config.ts` (orchestrator) + `infra/web.ts` (the
  `sst.aws.StaticSite`). SST v3 with AWS provider; region `af-south-1`,
  profile `medicoach`.
- **Stage:** `dev` for now. Add `prod` later by extending `infra/web.ts` with
  stage branches (`const isProd = $app.stage === "prod"`) and a `domain: {}`
  block. See `medicoach/infra/web.ts` for the pattern.
- **CloudFront URL:** printed by `sst deploy`. SST also writes outputs to
  `.sst/outputs.json` (gitignored).
- **State:** SST state lives in S3 + DynamoDB in the medicoach AWS account
  (the `sst-state-*` bootstrap bucket). Do not delete those resources —
  medicoach uses them too.
- **Removing a stage:** `npm run remove` takes **15–30 minutes** for the
  CloudFront teardown. Do not interrupt — Pulumi state ends up half-removed
  and recovery is manual.
- **Cache busting:** do NOT add `?v=1`-style query strings to asset URLs.
  CloudFront strips query strings from the cache key by default, so they
  silently stop busting. `sst deploy` invalidates the distribution on every
  deploy; rename the file if you need a hard bust.

### AWS account hygiene

This project deploys into the **medicoach AWS account** for convenience
(same `medicoach` AWS profile). Consequences:
- Lions cost commingles with Medicoach in the AWS bill (no separate
  cost-allocation tags set).
- Anyone with `medicoach` profile credentials can teardown Lions infra.
- If Medicoach ever migrates to AWS Organizations / SSO, Lions migrates
  with it.

Acceptable for a prototype. To split out: create a dedicated AWS account,
run `aws configure --profile lions`, and update `sst.config.ts` to use the
new profile.

## Out of scope

Backend, database, authentication, payments. If anyone asks to add these,
flag it as a scope shift before starting.
