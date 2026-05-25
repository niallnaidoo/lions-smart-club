# DP World Lions · Smart Club Platform

A clickable front-end prototype of the **Smart Club Integration Platform** for
the **DP World Lions**, covering club affiliation, compliance documents,
the Club Quality Index (CQI), fixture automation, and travel-cost modelling.

> ⚠️ **Prototype only.** No backend, no database, no payments — all state is
> in-memory React state and resets on page refresh.

---

## Quick start

```bash
npm install
npm run dev
# then open http://localhost:3201
```

To preview on your phone over Wi-Fi, the dev server already binds to `0.0.0.0`.
Find your LAN IP (`ipconfig getifaddr en0`) and open
`http://<your-ip>:3201` on the phone.

## Build & deploy

Local:

```bash
npm run build      # produces dist/
npm run preview    # serve the built bundle locally on :3201
```

Cloud (AWS S3 + CloudFront via SST):

```bash
npm run deploy     # deploys the `dev` stage; prints a *.cloudfront.net URL
npm run remove     # tears down the `dev` stage (CloudFront teardown ≈ 20 min)
npm run console    # opens the SST console for live logs/state
```

Region: `af-south-1`. AWS profile: `medicoach`.
First deploy in a new AWS account/region triggers SST bootstrap (~1 min).
CloudFront propagation after the first deploy takes 5–10 minutes; subsequent
deploys are cache invalidations and propagate in seconds.

## Quality

```bash
npm run lint           # ESLint
npm run format         # Prettier write
npm run format:check   # Prettier check (CI-friendly, no writes)
```

---

## Two profiles

- **Lions Admin** — cohort dashboard, all-clubs list with insights, fixture
  automation with human-in-the-loop editing, release-to-clubs workflow.
- **Club Portal** — three-phase integration journey: affiliation form (chair,
  exco, coaches, ground locator, leagues), compliance document uploads, CQI
  self-assessment, and a live fixtures view once the Lions office releases
  the schedule.

## File map

| Path                                    | Purpose                                                                                |
| --------------------------------------- | -------------------------------------------------------------------------------------- |
| `index.html`                            | Vite entrypoint at repo root — embeds global CSS, loads `src/main.jsx` as an ES module |
| `src/data.jsx`                          | Seed `SAMPLE_CLUBS`, `SERIES`, `CQI_STRUCTURE`, helpers                                |
| `src/atoms.jsx`                         | Design-system primitives                                                               |
| `src/main.jsx`                          | `App` + `Shell` — routing, role/profile state, task modals, nav                        |
| `src/club.jsx`                          | Club-side views (Leaflet ground locator lives here)                                    |
| `src/admin.jsx`                         | Admin views                                                                            |
| `src/onboarding.jsx`                    | 3-step cinematic welcome modal                                                         |
| `public/lions-logo.svg`                 | Placeholder Lions emblem — **replace with `lions-logo.png` for production**            |
| `public/players/lions-hero.jpg`         | Hero photo across club Home + Affiliation + Onboarding                                 |
| `public/fixture-automation-engine.html` | Placeholder page for the Phase 02 iframe                                               |
| `vite.config.js`                        | Vite config (dev + preview bind to port 3201)                                          |
| `vercel.json`                           | Explicit Vite preset + immutable cache headers for static assets                       |

See `CLAUDE.md` for conventions, known cruft, and a Leaflet gotcha note.

---

## Brand

DP World Lions yellow + navy, with the team emblem. Hero photography from the
2026/27 DP World Lions squad. Montserrat (300–900) throughout.

> **Note:** Seed data (sample clubs, sub-unions) still references the
> KZNCU/EMCU regional structure. Replacing with CGW / Easterns / Northerns
> clubs lands in a follow-up.
