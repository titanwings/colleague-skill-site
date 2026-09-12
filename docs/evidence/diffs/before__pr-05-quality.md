# Capture diff — `before` → `pr-05-quality`

Generated 2026-09-12T16:40:30.891Z by `scripts/diff-captures.mjs`. Ratios are changed pixels over the union canvas area (0% = pixel-identical, 100% = every pixel differs).

| Page / theme | Changed pixels | Height before → after | Busiest band (y) | Diff image |
| --- | --- | --- | --- | --- |
| home/light | 74.9% | 5997 → 7488 px | 749–1123 px | `docs/evidence/diffs/before__pr-05-quality-home-light-diff.png` |
| home/dark | 32.6% | 5997 → 7488 px | 6739–7114 px | `docs/evidence/diffs/before__pr-05-quality-home-dark-diff.png` |
| gallery/light | 94.2% | 2463 → 2613 px | 392–523 px | `docs/evidence/diffs/before__pr-05-quality-gallery-light-diff.png` |
| gallery/dark | 18.2% | 2463 → 2613 px | 2482–2613 px | `docs/evidence/diffs/before__pr-05-quality-gallery-dark-diff.png` |
| detail/light | 86.0% | 1389 → 1623 px | 1055–1136 px | `docs/evidence/diffs/before__pr-05-quality-detail-light-diff.png` |
| detail/dark | 23.5% | 1389 → 1623 px | 1461–1542 px | `docs/evidence/diffs/before__pr-05-quality-detail-dark-diff.png` |

Caveats: the live-site baseline was captured in the light theme only, so `dark` rows measure the *theme* change rather than a layout change; mobile rows only exist once both runs include mobile captures. JPEG artefacts are filtered by a per-channel threshold of 16.
