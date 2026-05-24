# DP World Lions · Smart Club Platform

A clickable front-end prototype of the **Smart Club Integration Platform** for
the **DP World Lions**, covering club affiliation, compliance documents,
the Club Quality Index (CQI), fixture automation, and travel-cost modelling.

> ⚠️ **Prototype only.** No backend, no database, no payments — all state is
> in-memory React state and resets on page refresh.

Sibling project: [`dolphins-smart-club`](https://github.com/niallnaidoo/dolphins-smart-club)
— same engine, Dolphins branding.

---

## Quick start

```bash
python3 -m http.server 3201
# then open http://localhost:3201
```

To preview on your phone over Wi-Fi:

```bash
python3 -m http.server 3201 --bind 0.0.0.0
# find your LAN IP with: ipconfig getifaddr en0
# then on phone: http://<your-ip>:3201
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

| File | Purpose |
|---|---|
| `index.html` | Shell — global CSS, Leaflet + React CDNs, Babel-standalone, mounts `<App/>` |
| `data.jsx` | Seed `SAMPLE_CLUBS`, `SERIES`, `CQI_STRUCTURE`, helpers |
| `atoms.jsx` | Design-system primitives |
| `main.jsx` | `App` + `Shell` — routing, role/profile state, task modals, nav |
| `club.jsx` | Club-side views |
| `admin.jsx` | Admin views |
| `onboarding.jsx` | 3-step cinematic welcome modal |
| `lions-logo.svg` | Placeholder Lions emblem — **replace with `lions-logo.png` for production** |
| `players/lions-hero.jpg` | Hero photo across club Home + Affiliation + Onboarding |

---

## Brand

DP World Lions yellow + navy, with the team emblem. Hero photography from the
2026/27 DP World Lions squad. Montserrat (300–900) throughout.

> **Note:** The seed data and copy still reference the Dolphins/KZNCU prototype
> structure — this branch ships the Lions visual identity first; copy and
> regional data updates land in a follow-up.
