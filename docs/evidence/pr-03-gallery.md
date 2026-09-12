# PR 03 — Skill Gallery & detail page (`site/03-gallery`)

Fourth slice of the marketplace refactor: the two catalog surfaces. Cards, the
gallery page chrome, the client-side search / filter / sort engine and the Skill
detail page — including an install block that only ships commands it can point
at a source for.

- Branch: `site/03-gallery` (worktree `/tmp/cs-03-gallery`)
- Base: `688ec35` (evidence log + baseline captures)
- Touched files: `website/src/components/SkillCard.astro`,
  `website/src/components/SkillGallery.astro`,
  `website/src/pages/gallery/index.astro`,
  `website/src/pages/gallery/[slug].astro`
- Not touched: base layout, `global.css`, `tailwind.config.mjs`,
  `data/agents.ts`, `lib/skills.ts`, `types/skill.ts`, any content YAML,
  `docs/REFACTOR-EVIDENCE.md`.

## Commits

| SHA | Subject |
| --- | --- |
| `52cf3d9` | `refactor(gallery): rebuild the SkillCard on paper-and-ink tokens` |
| `b714a45` | `refactor(gallery): restyle the gallery index header and catalog stats` |
| `a45f892` | `feat(gallery): rebuild search, filters and sorting` |
| `b729837` | `feat(gallery): rebuild the detail page with a verified install block` |
| _this file_ | `docs(evidence): record the PR 03 gallery refactor` |

Each commit was built on its own (`npm run build`, 217 pages) before the next
one was made.

## What changed

### 1. `SkillCard.astro`

The card was still the old dark-marketplace object: gradient avatar tile, raw
Tailwind palette colours per tag (`text-red-400`, `text-purple-300`, …),
`ring`/glow hover, and a `text-surface-*` type hierarchy where `surface-500`
resolves to a *border* colour. Rebuilt on the semantic tokens:

- `bg-paper-raised` + hairline `border-line`, hover swaps the hairline for
  `border-accent/60` and lifts 2px — no glow, no gradient;
- Fraunces for the name, Space Grotesk for the `skill` / `meta-skill` label,
  mono for level, author, stars and date; uniform monochrome tag pills;
- the whole card stays **one anchor** — no nested links or buttons
  (asserted in the interaction suite);
- avatar is decorative (`alt=""`, `width`/`height` set, `loading="lazy"`,
  `onerror` removes it) so it is not announced twice;
- every text colour is `ink` / `ink-soft` / `ink-muted`; a "new" dot uses the
  semantic `ok` token.

### 2. `pages/gallery/index.astro`

Centred hero-style header (pill badge, gradient wordmark, card-grid stats) →
editorial masthead: kicker, Fraunces `h1`, left-aligned summary capped at
`max-w-2xl`, and a hairline-divided stat row (`dl` + `gap-px bg-line`) instead
of boxed cards. Copy is unchanged in meaning and still bilingual.

### 3. `SkillGallery.astro` — search, filters, sorting

| Concern | Before | After |
| --- | --- | --- |
| Search | placeholder-only, no `<label>` | `<label for="gallery-search">`, `type="search"`, bilingual placeholder that follows `data-lang` |
| Type filter | 3 chips, `aria-pressed` absent | chips with `aria-pressed`, counts, `role="group"` + `aria-labelledby` |
| Tag filter | none | 10 data-derived chips with counts |
| Culture filter | none | data-derived chips (only cultures that exist) |
| Sort | none (fixed `pinned → stars → created`) | `推荐/pinned`, `Stars`, `最新/newest`, default reproduces the build order |
| Result count | static `<p>` | `role="status"` live region, count + page x/y |
| Empty state | emoji 🔍 + ad-hoc copy | hairline block, reset button, submit link |
| Pagination | 15/page | 24/page (divides the 1/2/3/4-column grid), `nav` + `aria-label`, disabled states |
| Grid | 1 / 2 / 3 columns | 1 / 2 / 3 / 4 columns (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`) |

Filtering stays client-side (the catalog is static), but the logic is now three
named pure functions — `skillMatches(record, state)`,
`compareSkills(a, b, sort)`, `selectSkills(records, state)` — and the DOM work is
confined to `render()`. `window.__gallery.getState()/visible()` exposes the same
visible set read-only, which is what the interaction suite asserts against.

### 4. `pages/gallery/[slug].astro`

The old page **invented** an install command: it printed `/<slug> 你的问题`
("Summon in Claude Code") for every catalog entry, and a hard-coded
`git clone … colleague-skill` card as "how to use this Skill". No YAML field
backs either. The rebuilt page separates what is verifiable from what is not:

- **Header** — name, bilingual summary, contributor, and a hairline meta strip
  with exactly the requested fields: type, tags, stars, updated, repository.
  The "updated" cell says whether the date is the star-sync date or the listing
  date instead of implying a freshness it cannot know.
- **Install (numbered steps, `ol` + `h3`)**
  - `01` links the author's repository and states plainly that the catalog has
    no per-Skill install command, so none is rendered.
  - `02` renders the *creator* Skill (distilly) route for all 8 hosts in
    `data/agents.ts`: `skillsCliCommand(id, 'global' | 'project')`,
    `globalPath`, `projectPath`, capability and the host's own caveat. It is a
    self-contained tablist (`role="tablist"`/`tab`, roving `tabindex`,
    Arrow/Home/End keys, panels server-rendered so the section still works
    without JS, per-command copy buttons that fall back to selectable text).
    It deliberately does **not** import the in-flight `AgentSwitcher.astro`.
  - `03` defers loading to the author's repository.
- **Body** — the `preview_conversation` sample (97 of 215 YAML files carry it,
  the submit template documents it, but `SkillMeta` does not declare it) plus a
  source/record block.
- **Related** — up to 4 entries sharing a tag, ranked so a shared specific tag
  outranks the catch-all `other`, and hidden when nothing shares a tag.

Readability: long text capped at `68ch`, body `15–18px` at `leading-7`/`8`,
headings never skip a level (asserted: `1,2,3,3,3,2,2,2,3,3,3,3`), terminal and
code blocks on the `plate` tokens.

## Test results

### Build

```console
$ cd /tmp/cs-03-gallery/website && npm run build
00:48:20 [build] 217 page(s) built in 1.49s
00:48:20 [build] Complete!
```

217 pages = 1 home + 1 gallery + 215 detail pages.

### Evidence capture

```console
$ cd /tmp/cs-03-gallery/website && node scripts/capture.mjs --label pr-03-gallery
captured 12 screenshots for "pr-03-gallery" → docs/evidence/images
  home/light/desktop: 7488px   home/light/mobile: 14084px
  home/dark/desktop: 7488px    home/dark/mobile: 14084px
  gallery/light/desktop: 3133px  gallery/light/mobile: 8735px
  gallery/dark/desktop: 3133px   gallery/dark/mobile: 8735px
  detail/light/desktop: 3227px   detail/light/mobile: 5222px
  detail/dark/desktop: 3227px    detail/dark/mobile: 5222px
```

No `FAIL` line, exit code 0. Receipt: [`captures/pr-03-gallery.json`](captures/pr-03-gallery.json)
— 12 captures, `failures: []`, `consoleErrors: []` and `overflowX: false` for
every page/theme/viewport. The four `home` captures are byte-identical to
PR 01's: the home page is outside this PR.

### Interaction assertions (temporary Playwright script, not committed)

`/tmp/cs03/verify.mjs` starts/reuses `astro preview` and drives the real
Chromium build. 42/42 checks pass, exit code 0.

```console
$ node /tmp/cs03/verify.mjs
PASS  baseline: 24 cards on page 1 — visible=24
PASS  baseline: catalog reports 215 Skills — reported=215
PASS  baseline: sort control defaults to pinned (aria-pressed)
PASS  search "安全" reduces the visible card count — visible 24 → 5, reported 215 → 5
PASS  search "安全" keeps only matching cards — reported=5, visible=5
PASS  type filter meta-skill: every visible card is a meta-skill — visible=24, types=meta-skill
PASS  type filter exposes aria-pressed="true" — aria-pressed=true
PASS  tag filter "design" changes the visible set and matches every card — visible 24 → 4 (reported 4)
PASS  culture filter 字节风 narrows to that culture — visible=1, cultures=字节风
PASS  sort by stars: first card stars ≥ last card stars — first=21112, last=239,
      page1=21112,18449,11680,7311,5302,3145,2804,2712,2635,2247,1978,1680,1535,961,960,847,815,787,767,724,319,276,267,239
PASS  sort by stars: page is monotonically non-increasing
PASS  sort by newest: first card is not older than the last — first=2026-05-19, last=2026-04-21
PASS  empty state shows and the grid is hidden
PASS  empty state reports 0 results
PASS  reset restores the full catalog — visible=24, reported=215
PASS  reset clears every chip back to 全部
PASS  pagination: page 2 shows the next 24 cards — visible=24
PASS  keyboard: filter chips are focusable
PASS  keyboard: Enter on a focused chip applies the filter
PASS  keyboard: the whole card is one focusable link
PASS  cards contain no nested interactive elements — nested=0
PASS  language: data-lang=en hides every .lang-zh pair and shows .lang-en — {"zhVisible":0,"enVisible":666,…}
PASS  language: search placeholder follows the document language — "Name, summary, tag, author…"
PASS  language: data-lang=zh hides every .lang-en pair — visibleEn=0
PASS  detail: one agent tab per entry in AGENTS — tabs=8
PASS  detail: first agent panel is the only visible one
PASS  detail: claude-code command matches skillsCliCommand() —
      npx -y skills add titanwings/distilly --skill distilly --agent claude-code --global --copy --yes
PASS  detail: global install path rendered — ~/.claude/skills/distilly
PASS  detail: clicking a tab switches the panel
PASS  detail: every rendered command is the creator Skill (distilly) route — 15 command(s)
PASS  detail: the old fabricated "/<slug> 你的问题" command is gone
PASS  detail: author repository is linked
PASS  detail: heading levels never skip (h1 → h2 → h3) — 1,2,3,3,3,2,2,2,3,3,3,3
PASS  detail: ArrowRight moves selection and focus to the next agent tab — {"focused":"agent-tab-codex","selected":"true"}
PASS  detail: End jumps to the last agent tab (Pi)
PASS  detail: copy button writes the exact command to the clipboard —
      npx -y skills add titanwings/distilly --skill distilly --agent claude-code --global --copy --yes
PASS  detail: copy button reports success in a live region — 已复制
PASS  contrast AA gallery/light — PR-03 content only — no text below WCAG AA inside <main>
PASS  contrast AA gallery/dark — PR-03 content only — no text below WCAG AA inside <main>
PASS  contrast AA detail/light — PR-03 content only — no text below WCAG AA inside <main>
PASS  contrast AA detail/dark — PR-03 content only — no text below WCAG AA inside <main>
PASS  no console errors / page errors anywhere — none

42/42 checks passed
```

### Contrast audit

`axe-core` is not installed in this worktree, so the same script walks every
visible text node in both themes, composites its real background (walking up
through alpha layers) and checks the WCAG AA ratio (4.5:1, or 3:1 for large
text) using the computed styles. Full dump: `/tmp/cs03/contrast-report.json`.

| Surface | light | dark |
| --- | --- | --- |
| gallery `<main>` (PR 03) | 0 offenders | 0 offenders |
| detail `<main>` (PR 03) | 0 offenders | 0 offenders |
| shared Navbar (not PR 03) | 3 | 0 |
| shared Footer (not PR 03) | 18 | 18 |

The 39 unique chrome failures are the ones the PR 05 axe report counts; they
come from `text-surface-500/600` used as body text in `Navbar.astro` /
`Footer.astro` and from `.btn-primary`'s `text-white` on the accent fill
(4.05:1 light, 2.26:1 dark). See "Known gaps".

### Hard-coded colours

```console
$ grep -rn "#[0-9a-fA-F]\{6\}" website/src/components/SkillCard.astro \
    website/src/components/SkillGallery.astro \
    website/src/pages/gallery/index.astro "website/src/pages/gallery/[slug].astro"
$ echo $?
1
```

Empty (exit 1 = no match). The same grep for legacy `brand-*` / `surface-*`
utilities and raw Tailwind palette classes in these four files is also empty —
all colour comes from the semantic tokens, including the `<style>` blocks
(`rgb(var(--accent) / 0.45)` etc.).

## Before / after

| Page | Before | After |
| --- | --- | --- |
| Gallery (light, desktop) | `images/before-gallery.jpg` | `images/pr-03-gallery-gallery-light.jpg` |
| Gallery (dark, desktop) | — | `images/pr-03-gallery-gallery-dark.jpg` |
| Gallery (mobile 390px) | — | `images/pr-03-gallery-gallery-light-mobile.jpg`, grid at 1 column: `images/pr-03-gallery-gallery-light-mobile-grid.jpg` |
| Gallery (tablet 768px, 2 columns) | — | `images/pr-03-gallery-gallery-light-tablet.jpg`, `images/pr-03-gallery-gallery-dark-tablet.jpg` |
| Gallery (empty state) | — | `images/pr-03-gallery-gallery-light-empty.jpg` |
| Detail (light, desktop) | `images/before-detail.jpg` | `images/pr-03-gallery-detail-light.jpg` |
| Detail (dark, desktop) | — | `images/pr-03-gallery-detail-dark.jpg` |
| Detail (mobile) | — | `images/pr-03-gallery-detail-light-mobile.jpg` |
| Detail install block | — | `images/pr-03-gallery-detail-light-install-tabs.jpg`, `images/pr-03-gallery-detail-light-mobile-install.jpg` |

The last six images are extra scrolled/viewport shots taken with a temporary
script, because `scripts/capture.mjs` only takes viewport-only mobile shots and
never scrolls — the responsive grid and the install tablist are below the fold
in its output.

## Known gaps and unverified items

### Base-layer (do not fix here — owned by PR 01 / PR 05)

1. **`.lang-zh` / `.lang-en` visibility was dropped by PR 01.** Commit `9497db4`
   replaced `global.css` and removed
   `html[data-lang="en"] .lang-zh { display: none }` and its two siblings, so
   **both languages render at once site-wide** (visible in the Navbar, Footer
   and every page). PR 03 does not edit base files; instead each of its entry
   points carries three `.lang-scope`-prefixed rules that reproduce the original
   behaviour inside its own subtree. Delete them once `global.css` has the rules
   back.
2. **`.btn-primary` uses `text-white` on the accent fill** — 4.05:1 in light,
   2.26:1 in dark. The gallery CTA overrides it locally with `text-plate`
   (4.6:1 light / 8.5:1 dark). When the fix lands in `global.css` (or a
   `text-accent-ink` token exists), that override can go — the class is applied
   in `pages/gallery/index.astro` with a comment saying so.
3. **39 unique AA text-contrast failures live in the shared Navbar/Footer**
   (`text-surface-500` = `--ink-dim`, `text-surface-600` = `--line` used as body
   text). Listed in `/tmp/cs03/contrast-report.json`; outside this PR's file
   scope, reported here for the PR 05 sweep.
4. **Astro 4 compiler quirk**: a `/\\.0$/` regex literal in a page frontmatter
   breaks export hoisting — the compiler keeps `export async function
   getStaticPaths` *inside* the component and esbuild then fails with
   `Unexpected "export"` (`[slug].astro:41:0`). `formatStars()` therefore uses
   string surgery; the comment in both files records why.

### Data layer (read-only for this PR)

5. **`SkillMeta` has no install-command field.** Nothing in the YAML describes
   how to install an individual Skill, which is why the detail page renders only
   the repository link plus the creator-Skill route. A follow-up could add e.g.
   `install: { claude-code: … }` to the submission template and the type.
6. **`preview_conversation` is undocumented in the type.** 97 of 215 YAML files
   and `_template.yaml` carry it, but `src/types/skill.ts` does not declare it;
   `[slug].astro` reads it through a local widening instead of editing a shared
   type.
7. **`description_en` is missing on 74 of 215 Skills** — the English view falls
   back to the Chinese text (documented behaviour, visible in the captures).
8. **`company_culture` exists on 7 of 215 Skills**, while `ALL_CULTURES` lists 8
   values. The culture filter renders only values present in the catalog, so 4
   of the 8 canonical options never appear instead of being permanent dead ends.
   `tags` are healthier but skewed: 186 of 215 entries carry the catch-all
   `other` and nothing else, which also makes "related Skills" weak for those
   pages (they still get 4 `other` neighbours, as the spec asks).
9. **Stars are a snapshot.** `github-stars.json` covers 197 of 215 repos, so 18
   detail pages show `—` for stars and sort to the bottom under `Stars`; a
   missing snapshot is displayed as missing, never as 0.

### Scope / verification gaps

10. **No screen-reader pass.** Keyboard reachability, focus visibility, roving
    tabindex, live regions and contrast were asserted programmatically; a real
    VoiceOver/NVDA run was not performed.
11. **No axe-core run in this worktree** (not installed, and installing is out
    of scope for the PR). The contrast audit above is a hand-rolled equivalent
    of axe's `color-contrast` rule only; rules like `landmark`, `aria-allowed-*`
    or `label` are covered by the PR 05 quality gate instead.
12. **Filters are not deep-linkable.** State is in memory only; `?tag=security`
    is not read or written. Deliberate scope cut — say the word and it is a
    small follow-up on `selectSkills`.
13. **Chromium-only.** Every assertion and screenshot above comes from Chrome
    (Playwright's bundled Chromium fallback); Safari/Firefox were not run.
14. **The gallery still ships all 215 cards in the HTML** — 793 KB raw / 88 KB
    gzipped, of which 68 KB is the `data-search` index. Pagination is
    client-side only. Server-side filtering or rendering fewer cards is the
    obvious follow-up if the catalog keeps growing.
15. **`scripts/capture.mjs` mobile shots are viewport-only**, so its
    `-mobile.jpg` files show the masthead only; the responsive grid evidence is
    in the extra shots listed above.

## Rollback

Nothing was pushed, merged or rebased; the branch is linear on top of `688ec35`.

```bash
cd /tmp/cs-03-gallery
git revert --no-commit b729837 a45f892 b714a45 52cf3d9   # detail, filters, chrome, card
git commit -m "revert: PR 03 gallery refactor"           # or drop the worktree entirely
```

The four commits are independent: `git revert <sha>` of any single one leaves
the others applying cleanly, because they touch four different files (the
evidence commit only adds `docs/evidence/*`). Deleting the worktree
(`git worktree remove /tmp/cs-03-gallery`) restores the base tip with no trace.
