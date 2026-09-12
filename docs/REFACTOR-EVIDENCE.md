# Marketplace refactor — evidence log

Every non-trivial change to the marketplace ships with this file updated. One
section per PR: what changed, how it was tested, before/after screenshots, and
how to roll it back. Screenshots live in `docs/evidence/images/`, machine-readable
capture receipts in `docs/evidence/captures/`.

## The rules

1. **Atomic commits** — one logical change per commit; a commit that changes
   layout does not also change content, CI or copy.
2. **Evidence per PR** — `npm run evidence` (build + Playwright capture) must pass
   with **zero console errors and zero horizontal overflow**, and the PR section
   below must link the before/after images.
3. **No unverified claims** — if a behaviour was not exercised, say so in the
   section instead of implying it works.
4. **Rollback** — every PR branch is named `site/NN-<topic>`; `git revert <sha>`
   or checking out the previous branch tip restores the previous state (the
   baseline commit is tagged `site-refactor-baseline`).

## How to reproduce a capture

```bash
cd website
npm ci
npm run build
node scripts/capture.mjs --label <pr-label>        # serves dist/ itself on :4321
node scripts/capture.mjs --label <pr-label> --no-serve --port 4444   # capture an already-running preview
```

Output: `docs/evidence/images/<label>-<page>-<theme>[-mobile].jpg` plus
`docs/evidence/captures/<label>.json` (page height, overflow flag, computed
body colours, console errors).

## Baseline (live site, before any refactor)

Captured from <https://titanwings.github.io/colleague-skill-site/> on 2026-09-13.

| Page | Height (desktop) | Console errors | Overflow | Screenshot |
| --- | --- | --- | --- | --- |
| `/` | 5997 px | 0 | none | `images/before-home.jpg` (hero: `before-home-hero.jpg`) |
| `/gallery/` | 2463 px | 0 | none | `images/before-gallery.jpg` |
| `/gallery/boss-skill/` | 1389 px | 0 | none | `images/before-detail.jpg` |

Baseline design: near-black `#0d1117` surfaces, amber `#f59e0b` accent, Inter +
JetBrains Mono, Google-Fonts `@import`, dot-grid background, terminal windows,
Cloudflare beacon loading on every page.

## PR 01 — design system (`site/01-design-system`)

**Changed**

- `website/tailwind.config.mjs`: palette replaced by CSS-variable tokens
  (`paper` / `ink` / `accent` / `line` / `plate`, plus semantic `ok|warn|info|violet|rose`)
  modelled on a paper-and-ink system; legacy `brand-*` / `surface-*`
  names kept as aliases so untouched components re-skin automatically; added
  `display` (Fraunces) and `grotesk` (Space Grotesk) font families.
- `website/src/styles/global.css`: light + dark token sets, `data-theme`
  bootstrap support, keyboard focus ring, reduced-motion and print rules,
  editorial `.section-label` / `.hairline` helpers, plate styling for terminals.
- `website/src/layouts/BaseLayout.astro`: no-flash theme bootstrap
  (`window.__setTheme` / `window.__getTheme`), brand-driven meta tags, Fraunces +
  Space Grotesk + JetBrains Mono via preconnected `<link>`, `theme-color` per
  scheme, Cloudflare beacon made **opt-in** (`PUBLIC_CF_BEACON_TOKEN`).
- `website/src/data/brand.ts`, `website/src/data/agents.ts`: single sources of
  truth for brand strings/links and for the per-coding-agent support matrix
  (documented install paths only — no guessed directories).
- `website/scripts/capture.mjs` + `npm run capture` / `npm run evidence`:
  Playwright evidence capture with receipts.
- Light-text sweep (`text-white` → `text-ink`, plate contexts → `text-plate-ink`)
  so existing markup stays readable on paper.

**Tested**

| Check | Result |
| --- | --- |
| `npm run build` (217 pages) | pass, 1.4 s |
| `node scripts/capture.mjs --label pr-01-design-system` | 12/12 captures, **0 console errors, 0 overflow** |
| Computed body colours (light) | `rgb(239,242,241)` on `rgb(21,24,27)` = 15.6:1 |
| Computed body colours (dark) | `rgb(15,18,22)` on `rgb(235,240,244)` = 15.2:1 |
| Existing catalog rendering | 217 pages still built from the same 215 YAML entries |

**Before → after**

| Page | Before | After (this PR) |
| --- | --- | --- |
| Home (desktop, light) | `before-home.jpg` | `pr-01-design-system-home-light.jpg` |
| Home (desktop, dark) | — (site had no light/dark switch) | `pr-01-design-system-home-dark.jpg` |
| Gallery | `before-gallery.jpg` | `pr-01-design-system-gallery-light.jpg` |
| Detail | `before-detail.jpg` | `pr-01-design-system-detail-light.jpg` |

**Regression found by the parallel PRs and fixed here**

The `global.css` rewrite in this PR dropped the site-wide `.lang-zh` / `.lang-en`
rules, so both languages rendered at once and every page grew (home 5997 → 7488 px).
Restored as global rules, with a comment telling components not to ship scoped
copies. Re-captured after the fix — heights are back in line with the live baseline:

| Page | Live baseline | This PR (after the fix) |
| --- | --- | --- |
| `/` (desktop) | 5997 px | 5997 px |
| `/gallery/` | 2463 px | 2463 px |
| `/gallery/boss-skill/` | 1389 px | 1389 px |

Two further hardening changes came out of the same review round:

- `capture.mjs` now refuses to shoot a port that already answers, parses the URL
  astro actually printed, and verifies a per-run marker file served from *this*
  `dist/` before the first screenshot — parallel worktrees previously captured a
  peer's build.
- `agents.ts` gained `skillsCliSupported()` and a `{ requireVerified: true }`
  option, so the unconfirmed AgentSkills target for Pi can never be presented as
  verified.

**Verified against upstream, not assumed**

The coding-agent matrix was checked line by line against the product repo:
`INSTALL.md` for the documented per-host directories and
`tools/install_*_skill.py` for the defaults the installers actually use. That
check caught two wrong entries — Hermes installs into
`~/.hermes/skills/openclaw-imports/distilly`, and OpenClaw's project-local
directory is user-defined in the docs — both corrected rather than shipped.

**Known gaps left for the next PRs** (not defects introduced here): section
headers and feature cards still use the previous zh/en stacking and tinted
gradients, the terminal demos are still styled ad-hoc, there is no theme toggle
button in the navbar yet, and the install instructions are not yet per-agent.

**Rollback**: `git checkout site-refactor-baseline` (tag) restores the pre-refactor
site; `git revert` of the PR-01 commits restores it on top of the branch.
