# dot-skill marketplace

Website and community catalog for [dot-skill / Distilly](https://github.com/titanwings/distilly) —
a Skill that distills how a person thinks into a portable `SKILL.md` any coding agent can load.

| | |
| --- | --- |
| Live site | <https://titanwings.github.io/colleague-skill-site/> |
| Catalog | 215 community skills (`website/src/content/skills/*.yaml`) |
| Stack | Astro 4 · Tailwind 3 · TypeScript · static output, GitHub Pages |
| Product repo | <https://github.com/titanwings/distilly> |
| Marketing site | <https://github.com/titanwings/distilly-site> (consumes a snapshot of this catalog) |

## Repository layout

```
website/                     Astro site (the only published artifact: website/dist)
  src/components/            page sections (Hero, QuickStart, SkillGallery, …)
  src/content/skills/*.yaml  the catalog — one file per skill
  src/data/                  brand strings/links, coding-agent matrix, star snapshot
  src/styles/global.css      design tokens + themes
  scripts/                   capture, link and accessibility gates
docs/                        design system, evidence log, screenshots (not published)
.claude/skills/              helper skill used to add catalog entries
```

Nothing outside `website/dist` is published: the deploy workflow builds `website/`
and uploads that directory to GitHub Pages.

## Local development

```bash
cd website
npm ci
npm run dev        # http://localhost:4321/colleague-skill-site/
npm run build      # 217 pages into website/dist
npm run preview    # serve the built output
```

## Quality gates

```bash
cd website
npm run capture        # serve the build and write evidence screenshots + a JSON receipt
npm run evidence       # build + capture
```

- `capture` writes before/after screenshots plus a JSON receipt (page height, overflow, computed colours, console errors) under `docs/evidence/`. It refuses a busy port and verifies a per-run marker file, so parallel worktrees cannot capture each other's build.

The link and accessibility gates (`npm run check:links`, `npm run check:a11y`, `npm run check`)
arrive with the quality-gate PR of the current refactor stack
(`.github/workflows/quality.yml` runs them together with the capture on every PR
that touches `website/**`; the deploy workflow publishes `main`):

- `check:links` resolves every internal `href`/`src` in the built pages and fails on a broken target.
- `check:a11y` runs axe-core (WCAG 2.0/2.1/2.2 A+AA) on home/gallery/detail in **both themes** and fails on `serious`/`critical` impact.

## Adding a skill to the catalog

1. Open the [submission issue](https://github.com/titanwings/colleague-skill-site/issues/new?template=submit-skill.yml) **or** write the YAML directly.
2. One file per skill: `website/src/content/skills/<slug>.yaml` (slug: lowercase, hyphenated, unique).
3. Follow the schema and bilingual rules in [`.claude/skills/add-dot-skill.md`](.claude/skills/add-dot-skill.md) —
   `name` is Chinese and ends in `.skill`; `description` (zh) and `description_en` are both required and must read naturally.
4. `cd website && npm run build` must pass; CI additionally validates the YAML on every submission PR.

Required fields: `name`, `slug`, `author`, `description` (plus `description_en` by convention), `tags`, `created_at`.

## Design and evidence

- [`docs/DESIGN.md`](docs/DESIGN.md) — the paper-and-ink design system: tokens, typography, themes, accessibility rules.
- [`docs/REFACTOR-EVIDENCE.md`](docs/REFACTOR-EVIDENCE.md) — one section per refactor PR: what changed, how it was tested, before/after screenshots, rollback.

Every non-trivial change ships with evidence: a build, the quality gates, a
before/after screenshot pair, and a section in the evidence log linking both.
Commits are atomic — one logical change per commit.

## Related

- [titanwings/distilly](https://github.com/titanwings/distilly) — the Skill itself (formerly colleague-skill).
- [titanwings/distilly-site](https://github.com/titanwings/distilly-site) — marketing site + interactive demo, reads a snapshot of this catalog.
- [agentskills.io](https://agentskills.io) — the open Skill standard this catalog follows.

## License

Catalog entries belong to their authors; the site code follows the repository's
existing terms. Each skill's `skill_repo` links to its own license.
