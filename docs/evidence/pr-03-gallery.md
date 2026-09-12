# PR 03 — Skill Gallery & detail page (`site/03-gallery`)

Fourth slice of the marketplace refactor: the two catalog surfaces. Cards, the
gallery page chrome, the client-side search / filter / sort engine and the Skill
detail page — including an install block that only ships commands it can point
at a source for.

- Branch: `site/03-gallery` (worktree `/tmp/cs-03-gallery`)
- Base: `688ec35` (evidence log + baseline captures), synced with
  `site/01-design-system` in `f7b6138` after review
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
| `8954134` | `docs(evidence): record the PR 03 gallery refactor` |
| `f7b6138` | `Merge branch 'site/01-design-system' into site/03-gallery` |
| `e76d839` | `refactor(gallery): drop the workarounds the base branch has since fixed` |
| `80604eb` | `feat(gallery): flag unconfirmed AgentSkills CLI targets in the install block` |
| _this file_ | `docs(evidence): record the PR 03 post-review cleanup` |

Each code commit was built on its own (`npm run build`, 217 pages) before the
next one was made.

## Post-review cleanup

The review passed on `8954134`; the base branch then landed six commits
(`5758ec7`, `59f66e1`, `ac1ad0d`, `4b4b889`, `00a1db1`, `ac7ca3a`) that made two
PR 03 workarounds obsolete and added one API the detail page should use. Merged
with `git merge --no-edit site/01-design-system` (no conflicts: the base never
touches the four gallery files).

**Removed (`e76d839`)**

| Workaround | Why it existed | Why it is gone |
| --- | --- | --- |
| `.lang-scope .lang-en { display: none }` + 2 siblings, copied into `SkillGallery.astro` and `[slug].astro`, plus the `lang-scope` marker class on the page roots | PR 01 had dropped the site-wide `.lang-zh` / `.lang-en` rules, so both languages rendered at once | `5758ec7` restored them in `global.css`, which now states components must not ship scoped copies |
| `text-plate` on the gallery CTA | `.btn-primary` hard-coded `text-white` on the accent fill (4.05:1 light / 2.26:1 dark) | `00a1db1` added `--accent-ink` + `text-accent-ink`; `.btn-primary` now clears AA in both themes |

The two `<style is:global>` blocks stay — every remaining selector is namespaced
by `#gallery-root` / `#install-agents`, so nothing leaks and the blocks are
immune to Astro's scope rewriting.

**Adopted (`80604eb`)**

`ac1ad0d` split "has a documented install directory" from "is a confirmed
AgentSkills CLI target": `skillsCliSupported('pi')` is `false`, and
`skillsCliCommand(..., { requireVerified: true })` throws instead of printing an
unverified `--agent pi`. The install block now branches on that: the 7 verified
hosts keep both exact CLI commands (global + project scope, 14 commands), while
Pi shows a `CLI 未确认 / CLI unconfirmed` flag, a sentence naming the unverified
flag, and the `cloneCommand()` route
(`git clone https://github.com/titanwings/distilly ~/.pi/agent/skills/distilly`)
plus its documented directory — one copyable command, none invented. See
`images/pr-03-gallery-detail-light-pi-unverified.jpg`.

**Recaptured after the merge** — both columns are desktop heights read from the
two `docs/evidence/captures/pr-03-gallery.json` receipts (pre-merge: commit
`8954134`; post-merge: this branch tip), not hand-measured:

| Surface (desktop) | Pre-merge receipt | Post-merge receipt | Δ | Attribution |
| --- | --- | --- | --- | --- |
| `home` (not this PR) | 7488 px | **5997 px** | −1491 px | base language fix (`5758ec7`): the duplicated-language text is gone from every home section |
| `gallery` | 3133 px | **3095 px** | −38 px | same cause, limited to the shared chrome — PR 03's own `<main>` was already single-language |
| `detail` | 3227 px | **3189 px** | −38 px | same cause |
| `home` mobile | 14084 px | 10180 px | −3904 px | same cause |
| `gallery` mobile | 8735 px | 8613 px | −122 px | same cause |
| `detail` mobile | 5222 px | 5100 px | −122 px | same cause |

The numbers in the review request (5997 / 2463 / 1389 px) are the *base without
PR 03* figures — `home` 5997 px matches this branch exactly because the home page
is untouched here, but `gallery` 2463 px and `detail` 1389 px describe the old
pages PR 03 deliberately replaced: the gallery gained a five-row filter bar, a
live result count and 24-card pagination, the detail page gained the install
switcher, the example exchange and the related grid. The meaningful comparison
for those two pages is the live-site `before-*` capture, not those numbers.


The chrome contrast debt also dropped with the base token fix: from 39 unique AA
text failures to **5** (3 light / 2 dark), listed in the contrast table below.


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
01:07:12 [build] 217 page(s) built in 4.06s
01:07:12 [build] Complete!
```

217 pages = 1 home + 1 gallery + 215 detail pages. Re-run after the merge and
after each of the two cleanup commits.

### Evidence capture

`capture.mjs` now refuses a preview server that is not this build and needs a
free port (base `59f66e1`), so the run passes one explicitly.

```console
$ cd /tmp/cs-03-gallery/website && node scripts/capture.mjs --label pr-03-gallery --port 4412
captured 12 screenshots for "pr-03-gallery" → docs/evidence/images
  home/light/desktop: 5997px     home/light/mobile: 10180px
  home/dark/desktop: 5997px      home/dark/mobile: 10180px
  gallery/light/desktop: 3095px  gallery/light/mobile: 8613px
  gallery/dark/desktop: 3095px   gallery/dark/mobile: 8613px
  detail/light/desktop: 3189px   detail/light/mobile: 5100px
  detail/dark/desktop: 3189px    detail/dark/mobile: 5100px
```

No `FAIL` line, exit code 0. Receipt: [`captures/pr-03-gallery.json`](captures/pr-03-gallery.json)
— 12 captures, `failures: []`, `consoleErrors: []` and `overflowX: false` for
every page/theme/viewport. The four `home` captures are byte-identical to
PR 01's: the home page is outside this PR. (Pre-merge heights were 7488 /
3133 / 3227 px; the drop is the base language fix, see "Post-review cleanup".)

### Interaction assertions (temporary Playwright script, not committed)

`/tmp/cs03/verify.mjs` starts/reuses `astro preview` and drives the real
Chromium build. 56/56 checks pass, exit code 0.

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
PASS  detail: every other host still gets a verified --agent command
PASS  detail: Pi is flagged as an unconfirmed CLI target and gets the clone route —
      ["git clone https://github.com/titanwings/distilly ~/.pi/agent/skills/distilly"]
PASS  detail: copy button reports success in a live region — 已复制
PASS  PR-03 gallery: main .btn-primary uses --accent-ink and clears AA — gallery/light — 1 element(s), expected colour rgb(255,255,255)
PASS  dark plate text uses plate-safe colours and clears AA — gallery/light — 0 plate text node(s), colours=[]
PASS  accent fills use accent-ink and clear AA — gallery/light — 3 accent-filled text node(s), colours=[rgb(239, 242, 241) | rgb(255, 255, 255)]
PASS  contrast AA gallery/light — PR-03 content only — no text below WCAG AA inside <main>
PASS  PR-03 gallery: main .btn-primary uses --accent-ink and clears AA — gallery/dark — 1 element(s), expected colour rgb(21,24,27)
PASS  dark plate text uses plate-safe colours and clears AA — gallery/dark — 0 plate text node(s), colours=[]
PASS  accent fills use accent-ink and clear AA — gallery/dark — 3 accent-filled text node(s), colours=[rgb(15, 18, 22) | rgb(21, 24, 27)]
PASS  contrast AA gallery/dark — PR-03 content only — no text below WCAG AA inside <main>
PASS  PR-03 detail: #install-agents pre, #install-agents pre code uses --plate-ink and clears AA — detail/light — 30 element(s), expected colour rgb(230,237,243)
PASS  dark plate text uses plate-safe colours and clears AA — detail/light — 15 plate text node(s), colours=[rgb(230, 237, 243)]
PASS  accent fills use accent-ink and clear AA — detail/light — 1 accent-filled text node(s), colours=[rgb(239, 242, 241)]
PASS  contrast AA detail/light — PR-03 content only — no text below WCAG AA inside <main>
PASS  PR-03 detail: #install-agents pre, #install-agents pre code uses --plate-ink and clears AA — detail/dark — 30 element(s), expected colour rgb(230,237,243)
PASS  dark plate text uses plate-safe colours and clears AA — detail/dark — 15 plate text node(s), colours=[rgb(230, 237, 243)]
PASS  accent fills use accent-ink and clear AA — detail/dark — 1 accent-filled text node(s), colours=[rgb(15, 18, 22)]
PASS  contrast AA detail/dark — PR-03 content only — no text below WCAG AA inside <main>
PASS  no console errors / page errors anywhere — none

full contrast report → /tmp/cs03/contrast-report.json

56/56 checks passed
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
| shared Navbar (not PR 03) | 1 | 0 |
| shared Footer (not PR 03) | 2 | 2 |

After the base merge only 5 unique chrome failures remain (down from 39 before
`00a1db1`/the `surface-500` remap):

| Where | Text | Ratio | Cause |
| --- | --- | --- | --- |
| Navbar, light | "Skill Gallery" (active link) | 3.93:1 | `text-brand-400` → `--accent` on `bg-accent/10` |
| Footer, light/dark | "MIT License · Made with ❤️ by" | 1.22 / 1.41:1 | `text-surface-600` → `--line` used as text |
| Footer, light/dark | `// 人会离开，dot-skill 不会` | 1.22 / 1.41:1 | `text-surface-600` → `--line` used as text |

All five live in `Navbar.astro` / `Footer.astro` (other agents' files, PR 04) —
reported here for the integration-branch axe pass, not fixed in PR 03.

### Dark plate / code-block audit

The base darkened the light-theme accent and remapped the legacy
`surface-300…500` aliases onto ink shades, which makes the old token habits
(`text-brand-*`, `text-surface-*`) unsafe **on a dark plate**. PR 03 owns three
plate blocks (the two install commands inside each agent panel) and no others,
so the check is explicit rather than implied:

- every element matching `#install-agents pre, #install-agents pre code` — 30
  elements across all 8 panels, not just the visible one — resolves to
  `rgb(230, 237, 243)` = `--plate-ink` in **both** themes;
- every text node whose composited background *is* `--plate` clears 4.5:1
  (15 nodes on the detail page, 0 on the gallery — it has no plate surface);
- the gallery's one accent fill (`main .btn-primary`) resolves to
  `--accent-ink` (white in light, `rgb(21, 24, 27)` in dark) and clears 4.5:1.

| Checked | light | dark |
| --- | --- | --- |
| `#install-agents pre` + `code` elements, colour must be `--plate-ink` | 30 / 30 pass | 30 / 30 pass |
| text nodes composited on `--plate` (detail) | 15, 0 violations | 15, 0 violations |
| text nodes composited on `--accent` (gallery, incl. shared chrome) | 3, 0 violations | 3, 0 violations |
| gallery `main .btn-primary`, colour must be `--accent-ink` | 1 / 1 pass | 1 / 1 pass |

Step numbers, eyebrows, path cells and the copy buttons all sit on paper
(`bg-paper`, `bg-paper-raised`, `bg-paper-sunk`) and therefore use `text-ink` /
`text-ink-muted`; nothing in these four files puts `text-brand-*`,
`text-surface-*`, `text-ink-*` or `text-accent-*` on a plate, and the only
accent-on-plate treatment anywhere is a fill with `text-accent-ink`.

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
| Detail install, unconfirmed host (Pi) | — | `images/pr-03-gallery-detail-light-pi-unverified.jpg` |

The seven extra scrolled/viewport shots (`*-tablet.jpg`, `*-mobile-grid.jpg`,
`*-empty.jpg`, `*-install-tabs.jpg`, `*-mobile-install.jpg`,
`*-pi-unverified.jpg`) were taken with a temporary script, because
`scripts/capture.mjs` only takes viewport-only mobile shots and never scrolls —
the responsive grid, the empty state and the install tablist are below the fold
in its output.

## Known gaps and unverified items

### Base-layer

1. ~~**`.lang-zh` / `.lang-en` visibility was dropped by PR 01**~~ — **resolved**
   by the base (`5758ec7`) and PR 03's `.lang-scope` workaround deleted in
   `e76d839`. Kept here as the record of what the merge fixed.
2. ~~**`.btn-primary` uses `text-white` on the accent fill** (4.05:1 light /
   2.26:1 dark)~~ — **resolved** by `00a1db1` (`--accent-ink`), and the local
   `text-plate` override deleted in `e76d839`.
3. **5 unique AA text-contrast failures remain in the shared Navbar/Footer**
   (down from 39 before the base token fixes) — the active nav link and two
   `text-surface-600` footer lines; full list and ratios in the contrast section
   above and in `/tmp/cs03/contrast-report.json`. Outside this PR's file scope,
   reported here for the integration-branch axe sweep.
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

Nothing was pushed; the branch is linear on top of `688ec35` apart from the
fast-forward-free merge `f7b6138` of `site/01-design-system`.

```bash
cd /tmp/cs-03-gallery
# whole PR (code + evidence), keeping the merged base:
git revert --no-commit 80604eb e76d839 b729837 a45f892 b714a45 52cf3d9
git commit -m "revert: PR 03 gallery refactor"
# or undo only the post-review sync, keeping the reviewed PR:
git revert --no-commit 80604eb e76d839 f7b6138
# or drop the worktree entirely (base tip, no trace):
git worktree remove /tmp/cs-03-gallery
```

The four original commits are independent — each touches a different file, so
`git revert <sha>` of any single one leaves the others applying cleanly. The two
cleanup commits are independent of each other too (`e76d839` touches
`SkillGallery.astro`, `index.astro` and the style block of `[slug].astro`;
`80604eb` touches only the install block of `[slug].astro`), but note that
reverting `f7b6138` alone restores the base regression it fixed and re-breaks
`text-accent-ink` — undo it together with the cleanup that depended on it.

