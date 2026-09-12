# Integrated-state verification

This is the gate run on the **merged stack** (all four sibling PRs on top of the
design-system base), not on an individual branch. A branch can be green alone and
still regress the whole page once combined — this run is what rules that out.

## Merged state

| Branch | Tip |
| --- | --- |
| `site/01-design-system` (base) | `8a05eca` |
| `site/02-hero-quickstart` | `4ae0fd0` |
| `site/03-gallery` | `e919de3` |
| `site/04-chrome-i18n` | `ac30ca0` |
| `site/05-quality` (this branch, before this commit) | `ac30ca0` → gates |
| merge result (`site/99-integration`) | `d887e48` |

Merges were clean: the branches touch disjoint files by construction (each agent
was given an explicit file list and told not to edit base files).

## Results

| Check | Command | Result |
| --- | --- | --- |
| Build | `npm run build` | ✅ **217 pages** |
| Internal links | `npm run check:links` | ✅ **3887 links across 217 pages, 0 broken** |
| Accessibility | `node scripts/check-a11y.mjs --sample 8` | ✅ **0 violations** (home, gallery, detail + 8 sampled catalog pages × light/dark = 22 combinations, no serious/critical/moderate) |
| Evidence capture | `node scripts/capture.mjs --label integration` | ✅ 12 screenshots, **0 console errors, 0 horizontal overflow** |
| Pixel diff vs live baseline | `node scripts/diff-captures.mjs --before before --after integration` | see below |

Page heights (desktop, light = dark):

| Page | Live baseline | Integrated |
| --- | --- | --- |
| `/` | 5997 px | **6534 px** |
| `/gallery/` | 2463 px | **3204 px** |
| `/gallery/boss-skill/` | 1389 px | **3298 px** |

## Before → after, measured

| Page / theme | Changed pixels | Busiest band (y) |
| --- | --- | --- |
| home / light | 83.3 % | 2614–2940 px |
| home / dark | 15.3 % | 6207–6534 px |
| gallery / light | 90.6 % | 801–961 px |
| gallery / dark | 33.0 % | 2884–3044 px |
| detail / light | 57.6 % | 660–825 px |
| detail / dark | 61.5 % | 2968–3133 px |

(The `dark` rows measure the theme switch as well: the live baseline was captured
in the light theme only. Difference images are in `docs/evidence/diffs/`.)

## What the individual PRs could not have proven

- **Cross-PR contrast**: the base darkened `--accent` and re-pointed the legacy
  `surface-*` aliases, which pushed old markup on dark plates below AA. Each
  branch saw a different subset; only the merged run shows the whole page clean.
- **Link graph**: the merged state adds new anchors and per-agent install blocks;
  3887 internal links resolve (a branch-local run cannot see the other branches'
  links).
- **Layout interaction**: navbar/footer rewrites change every page's offsets, so
  the capture heights here (6534 / 3204 / 3298) are the numbers to compare against
  in future PRs — not any single branch's receipt.

## Honest gaps

1. axe ran on 22 of 217 × 2 page-theme combinations: home, gallery, one fixed
   detail page and 8 sampled detail pages. Catalog-wide coverage is sampled, not
   exhaustive.
2. Chromium only; no real screen-reader pass, no Firefox/Safari run (clipboard and
   `inert` behaviour differ there).
3. The mobile navbar panel is an ARIA disclosure, not a modal: focus moves in,
   Escape closes and restores focus, but Tab can leave the panel. That is the
   documented choice in PR-04, not an oversight.
4. `--ink-dim` intentionally fails AA (it is the decorative tone); any text using
   it is caught by the gate rather than silently shipped.
5. Pixel diffs use a per-channel threshold of 16 to ignore JPEG artefacts; small
   (sub-threshold) shifts are not reported.

## Rollback

The stack is linear and merge-ordered: reverting the merge commit restores the
base state; each PR can also be reverted on its own (`git revert -m 1 <merge>` or
the individual commits). The live site is untouched until `main` is updated.
