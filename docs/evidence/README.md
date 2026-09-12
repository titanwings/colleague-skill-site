# Evidence assets

- `images/` — screenshots referenced by [`../REFACTOR-EVIDENCE.md`](../REFACTOR-EVIDENCE.md).
  `before-*` files are the live site as it was before the refactor; the rest are
  produced by `cd website && npm run evidence` (or
  `node scripts/capture.mjs --label <label>`).
- `captures/` — JSON receipts from the same script: page height, overflow flag,
  computed body colours and every console error per capture.

Files here are review artefacts, not site assets: nothing under `docs/` is
published to GitHub Pages (the deploy workflow only publishes `website/dist`).
