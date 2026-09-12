# PR 05 — quality gates (link integrity + accessibility)

Scope: tooling and CI only. No visual redesign here, plus one **token-level**
contrast fix that benefits every component.

## What changed

| File | Change |
| --- | --- |
| `website/scripts/check-links.mjs` | Walks all 217 built pages, resolves every internal `href`/`src` against `dist/` (accepts the `/colleague-skill-site` base, `.html` and directory-index forms), prints the set of external hosts referenced, fails on broken internal targets. |
| `website/scripts/check-a11y.mjs` | axe-core (WCAG 2.0/2.1/2.2 A+AA + best practice) over home/gallery/detail in both themes; fails on `serious`/`critical`; writes `docs/evidence/a11y-report.json`. |
| `website/package.json` | `check:links`, `check:a11y`, `check` scripts; devDependencies `axe-core`, `@axe-core/playwright`. |
| `website/scripts/check-a11y.mjs` (`--sample N`) | Samples N deterministic detail pages (every k-th slug) in addition to home/gallery/detail, so catalog-wide regressions surface without 217 × 2 axe runs. |
| `website/scripts/diff-captures.mjs` | **Quantitative before/after diff**: decodes two capture runs in a headless canvas (no image libraries), reports changed-pixel share, the busiest vertical band, and writes a difference image plus a markdown table. Example: home/light 74.9 %, gallery/light 94.2 %, detail/light 86.0 %. |
| `website/src/styles/global.css`, `website/tailwind.config.mjs` | The WCAG contrast fix (`--accent-ink`, darkened light accent, `surface-300…500 → ink-muted`) **now lives in the base branch** (commit `00a1db1` of `site/01-design-system`) so every component PR inherits it; this PR only measures it. |
| `.github/workflows/quality.yml` | New CI job: install → build → link gate → a11y gate → evidence capture, uploading images and reports as artifacts. Deploy workflow untouched. |

## Test results

| Check | Before this PR | After this PR |
| --- | --- | --- |
| `npm run build` | pass (217 pages) | pass (217 pages) |
| Internal links | not checked | **2819 links across 217 pages, 0 broken** |
| axe-core `serious`/`critical` violations (home/gallery/detail × light/dark) | **313 `color-contrast` nodes** (pre-fix base) | **79 nodes** on the rebased base (home 13+4, gallery 38+16, detail 6+2) — remaining ones are all in component files owned by the other branches |
| `link-in-text-block` | 6 | **0** |
| Console errors / overflow (`capture.mjs`) | 0 / 0 | 0 / 0 |

Remaining `color-contrast` nodes (94) are all in markup owned by the other
branches in this stack (`SkillCard`, `SkillGallery`, gallery detail, `Features`,
hero/quickstart) using legacy `text-surface-600` / raw Tailwind palette classes;
they are scheduled for the component PRs and re-checked here afterwards. Two
non-contrast findings remain and are listed as gaps below.

## Evidence

- `docs/evidence/a11y-report.json`, `docs/evidence/link-report.json`
- `docs/evidence/captures/pr-05-quality.json`
- Screenshots: `docs/evidence/images/pr-05-quality-*.jpg` (home/gallery/detail × light/dark × desktop/mobile)

## Known gaps (honest list)

1. `heading-order` (moderate) on home + gallery: an `h3` appears before an `h2`; owned by the component PRs.
2. `scrollable-region-focusable` (serious, 3 nodes on home): the terminal/code plate scrolls horizontally but is not focusable; the hero PR should add `tabindex="0"` + a label, otherwise this gate stays red.
3. The gate currently covers three representative pages, not all 217 detail pages.
4. `check-links.mjs` verifies internal targets only; external URLs are reported, not fetched (network flakiness must not gate a PR).
5. Both gate scripts used to trust whatever answered on port 4321; they now refuse a busy port and verify a per-run marker file from this `dist/` (a parallel worktree had captured a peer's build).

## Rollback

`git revert` the commits of this branch; the gates are additive and the only
runtime change is the contrast fix in `global.css` / `tailwind.config.mjs`.
