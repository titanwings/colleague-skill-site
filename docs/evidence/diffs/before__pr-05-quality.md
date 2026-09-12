# Capture diff — `before` → `pr-05-quality`

Generated 2026-09-12T16:59:03.428Z by `scripts/diff-captures.mjs`. Ratios are changed pixels over the union canvas area (0% = pixel-identical, 100% = every pixel differs).

| Page / theme | Changed pixels | Height before → after | Busiest band (y) | Diff image |
| --- | --- | --- | --- | --- |
| home/light | 89.6% | 5997 → 5997 px | 2699–2999 px | `docs/evidence/diffs/before__pr-05-quality-home-light-diff.jpg` |
| home/dark | 10.1% | 5997 → 5997 px | 1799–2099 px | —（基线只有浅色主题） |
| gallery/light | 99.6% | 2463 → 2463 px | 0–123 px | `docs/evidence/diffs/before__pr-05-quality-gallery-light-diff.jpg` |
| gallery/dark | 4.8% | 2463 → 2463 px | 985–1108 px | —（基线只有浅色主题） |
| detail/light | 97.5% | 1389 → 1389 px | 417–486 px | `docs/evidence/diffs/before__pr-05-quality-detail-light-diff.jpg` |
| detail/dark | 2.9% | 1389 → 1389 px | 903–972 px | —（基线只有浅色主题） |

Caveats: the live-site baseline was captured in the light theme only, so `dark` rows measure the *theme* change rather than a layout change; mobile rows only exist once both runs include mobile captures. JPEG artefacts are filtered by a per-channel threshold of 16.
