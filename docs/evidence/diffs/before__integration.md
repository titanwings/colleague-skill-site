# Capture diff — `before` → `integration`

Generated 2026-09-12T17:21:00.801Z by `scripts/diff-captures.mjs`. Ratios are changed pixels over the union canvas area (0% = pixel-identical, 100% = every pixel differs).

| Page / theme | Changed pixels | Height before → after | Busiest band (y) | Diff image |
| --- | --- | --- | --- | --- |
| home/light | 83.3% | 5997 → 6534 px | 2614–2940 px | `docs/evidence/diffs/before__integration-home-light-diff.jpg` |
| home/dark | 15.3% | 5997 → 6534 px | 6207–6534 px | —（基线只有浅色主题） |
| gallery/light | 90.6% | 2463 → 3204 px | 801–961 px | `docs/evidence/diffs/before__integration-gallery-light-diff.jpg` |
| gallery/dark | 33.0% | 2463 → 3204 px | 2884–3044 px | —（基线只有浅色主题） |
| detail/light | 57.6% | 1389 → 3298 px | 660–825 px | `docs/evidence/diffs/before__integration-detail-light-diff.jpg` |
| detail/dark | 61.5% | 1389 → 3298 px | 2968–3133 px | —（基线只有浅色主题） |

Caveats: the live-site baseline was captured in the light theme only, so `dark` rows measure the *theme* change rather than a layout change; mobile rows only exist once both runs include mobile captures. JPEG artefacts are filtered by a per-channel threshold of 16.
