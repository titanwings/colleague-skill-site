# PR 04 — chrome, language and theme (`site/04-chrome-i18n`)

Scope: `Navbar`, `Footer`, `Features`, `HowItWorks`, `SubmitCTA`, the i18n
bootstrap in `BaseLayout`, and three new files (`lib/i18n.ts`,
`components/LangToggle.astro`, `components/ThemeToggle.astro`). Hero,
QuickStart, DemoPreview, AgentSwitcher, the gallery surfaces, `global.css`,
`tailwind.config.mjs`, `src/data/*` and `docs/REFACTOR-EVIDENCE.md` are
untouched.

## Changed

- **`website/src/lib/i18n.ts`** (new) — one contract for the language feature:
  storage key `dotskill-lang`, default `zh`, the `<html lang>` map
  (`zh-CN` / `en`), `normalizeLang()` and the bilingual copy for the toggle.
- **`website/src/components/LangToggle.astro`** (new) — the `中文 / EN` button.
  Both languages stay in the DOM and `html[data-lang]` picks one; those
  visibility rules are site-wide in `global.css` (see the cleanup section — the
  component briefly carried a temporary copy while the base was missing them).
  The active half is styled from `html[data-lang]` alone, so the button is
  correct on the first paint; JS only maintains the bilingual `aria-label` /
  `title`.
- **`website/src/layouts/BaseLayout.astro`** — `data-lang="zh"` on `<html>`, and
  an inline bootstrap next to the theme one that reads `dotskill-lang`, sets
  `html[data-lang]` and re-tags `<html lang>` **before first paint**, then
  exposes `window.__setLang()` / `window.__getLang()` and a `langchange` event.
  The theme bootstrap, meta tags and font links are byte-identical to before.
- **`website/src/components/ThemeToggle.astro`** (new) — `auto → light → dark`
  cycle through `window.__setTheme()`; icon **and** word follow `html[data-theme]`
  in CSS; `aria-label` + `title` name the current state and the next action in
  both languages. Three states are kept because "follow the system" is the
  default and a two-state button could never return to it.
- **`website/src/components/Navbar.astro`** — wordmark from `BRAND.name`,
  in-page anchors (Features / How it works / Gallery) centred on a 3-column
  grid, right cluster: GitHub, Discord, language toggle, theme toggle. Mobile
  disclosure with `aria-expanded` + `aria-controls`, focus moved into the panel
  on open, Escape closes and restores focus to the trigger, outside clicks and a
  resize to desktop also close it. Every outbound URL now comes from `BRAND`.
- **`website/src/components/Features.astro`** — section label, Fraunces heading
  with paired zh/en copy, hairline stat row and a 2×2 hairline grid: one claim
  plus one evidence line per card, mono numerals. No emoji, no gradients, no raw
  Tailwind palette classes. Stats are read at build time (`lib/skills.ts` for the
  catalog size, `data/github-stars.json` for tracked repos and combined stars).
- **`website/src/components/HowItWorks.astro`** — `<ol>` of three numbered
  steps on hairline rules with one detail line each, plus a `U·01…U·04`
  specimen row that replaces the emoji grid.
- **`website/src/components/SubmitCTA.astro`** — one `plate` band, numbered
  process lines, and the shared `.btn-primary` / a plate-ghost secondary.
- **`website/src/components/Footer.astro`** — brand block, three link groups
  (product / community / open standard) built from `BRAND` + the site base path,
  a state row that reuses both toggles and mirrors the values as
  `[data-state-lang]` / `[data-state-theme]`, and a copyright line whose owner
  is derived from `BRAND.siteRepo`. Group titles are real `<h2>`s.

## Base defect found by this PR (fixed upstream)

Commit `9497db4` ("replace the bespoke dark palette with paper-and-ink tokens")
had **deleted** the language-switching CSS from `global.css`, so both languages
rendered at once. PR-04 reported it instead of editing the base file and
temporarily re-shipped the rules from `LangToggle.astro`.

The design-system branch restored them site-wide in `5758ec7`, so that temporary
copy is gone again — see **Post-review cleanup** below. There is exactly one copy
of the rules now, in `global.css`.

## Post-review cleanup (base advanced to `site/01-design-system`)

`git merge --no-edit site/01-design-system` (merge commit `7a60db7`) brought the
base forward by seven commits (`ac7ca3a`, `5758ec7`, `59f66e1`, `ac1ad0d`,
`4b4b889`, `00a1db1`, `bc5e68d`). Four follow-ups were needed inside PR-04 files:

1. **Dropped the duplicated language CSS.** `LangToggle.astro` no longer ships
   the `.lang-zh` / `.lang-en` visibility block; only the toggle's own
   `[data-lang-option]` colours remain. The base version uses `display: revert`
   for the visible side instead of `!important` hiding — safe here because no
   PR-04 `.lang-*` node carries a display utility, which the 27 interaction
   assertions and the recapture confirm.
2. **`SubmitCTA` reuses `.btn-primary`.** `00a1db1` added
   `--accent-ink` / `text-accent-ink` and darkened the light-mode accent, so the
   shared button is accent fill + accent-ink and passes AA in both themes; the
   local `bg-accent-deep text-paper` stopgap was deleted.
3. **Fixed the contrast the darkened light accent created on the plate.** With
   `--accent` = `#c73e0c` in light mode, accent-on-plate is 3.68:1; the CTA
   eyebrow and the three process numerals now use `text-plate-ink/70` (≈8:1),
   and the ghost button only changes its border on hover. The only accent on the
   plate is the filled button.
4. **Re-ran every gate on `--port 4413`**, the port the hardened `capture.mjs`
   (`59f66e1`) documents. It now refuses a port that already answers and proves
   the server serves this build through a marker file, so the
   `ERR_CONNECTION_REFUSED` failure recorded in the first version of this
   document cannot recur.

## Test results

All rows below were re-run after the merge and the cleanup.

| Check | Command | Result |
| --- | --- | --- |
| Build | `cd website && npm run build` | ✅ `217 page(s) built` |
| Evidence capture | `cd website && node scripts/capture.mjs --label pr-04-chrome-i18n --port 4413` | ✅ 12 captures, **0 FAIL lines**, 0 console errors, 0 horizontal overflow |
| Interaction assertions | `node scripts/tmp-i18n-verify.mjs --port 4477` (temp script, Appendix A) | ✅ 27/27 |
| Gallery smoke (both page types) | temp script, see below | ✅ zh→en on `/gallery/` and `/gallery/boss-skill/`, 0 console errors |
| axe-core, PR-04 scope, light + dark | temp script, see below | ✅ 0 violations in `header#navbar`, `footer`, `#features`, `#how-it-works`, `.bg-plate` |
| Grep: hard-coded hex in changed files | `grep -rn "#[0-9a-fA-F]\{6\}"` | ✅ empty for the 7 component/lib files (see the two `BaseLayout` meta exceptions below) |
| Grep: raw Tailwind palette classes | `grep -rnE "(bg\|text\|border\|from\|to\|via)-(purple\|orange\|…)-[0-9]{2,3}"` | ✅ empty in all PR-04 files |
| Grep: emoji / pictographs | python scan of `U+1F300-1FAFF`, `U+2600-27BF`, `U+FE0F` | ✅ 0 hits in all PR-04 files |

### Build

```
$ cd website && npm run build
01:00:55 [build] 217 page(s) built in 1.30s
01:00:55 [build] Complete!
```

### Evidence capture

```
$ cd website && node scripts/capture.mjs --label pr-04-chrome-i18n --port 4413
captured 12 screenshots for "pr-04-chrome-i18n" → docs/evidence/images
  home/light/desktop: 6387px
  home/light/mobile: 9970px
  home/dark/desktop: 6387px
  home/dark/mobile: 9970px
  gallery/light/desktop: 2572px
  gallery/light/mobile: 5941px
  gallery/dark/desktop: 2572px
  gallery/dark/mobile: 5941px
  detail/light/desktop: 1498px
  detail/light/mobile: 2619px
  detail/dark/desktop: 1498px
  detail/dark/mobile: 2619px
```

No `FAIL:` line, exit code 0. Receipt:
`docs/evidence/captures/pr-04-chrome-i18n.json` — `failures: 0`,
`consoleErrors: 0` in all 12 captures, `overflowX: false` in all 12, body
colours are the token values (`rgb(239,242,241)` / `rgb(21,24,27)` light,
`rgb(15,18,22)` / `rgb(235,240,244)` dark).

Heights are byte-for-byte the same as the pre-merge PR-04 capture
(6387 / 2572 / 1498 px), so neither the merge nor the cleanup changed the
rendered page. They are **not** the 5997 / 2463 / 1389 px of the base: those are
what `docs/evidence/captures/pr-01-design-system.json` records for
`site/01-design-system` *without* PR-04 (regenerated 16:55:22Z), and PR-04's
rewritten chrome plus three sections add +390 px on the desktop home page and
+109 px on the two lower pages. Before the merge, the same command on `:4321`
aborted twice with `net::ERR_CONNECTION_REFUSED`: a stale `astro preview` from an
interrupted run squatted the port. That class of failure is now caught by the
hardened script (`59f66e1`), which refuses an occupied port and verifies a
per-run marker file before capturing; `--port 4413` was free and the run above
is the one the receipt describes.

### Interaction assertions (temp Playwright script, Appendix A)

Run against a preview of the same `dist/` (`npx astro preview --port 4477`):

```
$ node scripts/tmp-i18n-verify.mjs --port 4477
PASS  default language is zh  — data-lang=zh
PASS  zh: .lang-zh visible / .lang-en hidden  — zh=true en=false
PASS  click → data-lang=en  — data-lang=en
PASS  click → <html lang>=en  — lang=en
PASS  click → localStorage persisted  — dotskill-lang=en
PASS  en: .lang-en visible / .lang-zh hidden  — zh=false en=true
PASS  reload keeps en  — data-lang=en
PASS  reload keeps <html lang>=en  — lang=en
PASS  stored language applied before first frame (no zh flash)  — data-lang at first rAF=en
PASS  cold visit is zh at first frame  — data-lang at first rAF=zh
PASS  no console errors (language flow)
PASS  theme cycles auto → light → dark → auto  — auto → light → dark → auto
PASS  every theme state has a readable aria-label  — 主题：浅色，点击切换到深色 / Theme: light, click for dark | 主题：深色，点击切换到跟随系统 / Theme: dark, click for auto | 主题：跟随系统，点击切换到浅色 / Theme: auto, click for light
PASS  cycling back to auto clears the override  — {"theme":null,"attr":"auto"}
PASS  dark persisted to localStorage  — theme=dark
PASS  reload keeps dark  — data-theme=dark
PASS  theme applied before first frame  — data-theme at first rAF=dark
PASS  footer mirrors theme state  — [data-state-theme]=dark
PASS  no console errors (theme flow)
PASS  panel starts closed
PASS  trigger controls the panel
PASS  click opens the panel  — {"expanded":"true","visible":true,"focused":true}
PASS  focus moves into the panel  — focused=true
PASS  Escape closes the panel  — {"expanded":"false","visible":false,"focusBack":true}
PASS  Escape restores focus to the trigger  — focusBack=true
PASS  keyboard can reopen the panel
PASS  no console errors (mobile menu flow)

27/27 checks passed
```

The "no flash" checks use `page.addInitScript` to sample `data-lang` /
`data-theme` inside the first `requestAnimationFrame` callback, i.e. after the
inline bootstrap ran but before the first paint. Both are already correct there.
The reload assertions share the browser context with the earlier click, so they
prove the value came out of `localStorage`, not out of a default.

Gallery smoke (the third agent's pages get the chrome too):

```
$ node scripts/tmp-gallery-check.mjs
[{"path":"/gallery/","before":{"lang":"zh","zh":true,"en":false},
  "after":{"lang":"en","zh":false,"en":true},"errors":0},
 {"path":"/gallery/boss-skill/","before":{"lang":"zh","zh":true,"en":false},
  "after":{"lang":"en","zh":false,"en":true},"errors":0}]
```

### Contrast / a11y (axe-core, PR-04 scope)

`axe-core` is not installed in this worktree, so the scan injects
`/tmp/cs-05-quality/website/node_modules/axe-core/axe.min.js` (PR-05's copy)
into the page and filters violations to nodes inside PR-04's components.

```
$ node scripts/tmp-axe.mjs
=== light: PR-04 scope clean=true (page-wide violation nodes: 47)
=== dark: PR-04 scope clean=true (page-wide violation nodes: 6)
```

Issues found this way and fixed inside PR-04:

| Node | Before | Fix |
| --- | --- | --- |
| `.ds-lang-toggle [data-lang-option]` (inactive) | `--ink-dim` → ~2.4:1 on paper | `--ink-muted` |
| `.ds-lang-toggle [data-lang-option='zh']` (active, footer on `paper-sunk`) | `--accent-soft` → ~4.3:1 | `--accent-deep` (~7.7:1) |
| `.bg-plate h2` | inherited `text-ink` (dark on dark) | explicit `text-plate-ink` |
| `.bg-plate` eyebrow + process numerals | `text-accent` → 3.68:1 after the base darkened `--accent` | `text-plate-ink/70` (≈8:1) |

The remaining page-wide nodes are in components owned by other PRs: 47 light +
6 dark after the merge. Dark improved from 22 → 6 with the base's contrast pass.
In light mode the count rose from 34 → 47 because the base remapped
`surface-300…500` onto the ink shades and darkened `--accent`, which leaves the
old `text-surface-*` / `text-brand-*` markup **on the dark plate blocks**
(`#0f1216`: Hero's terminal, `DemoPreview`, `QuickStart`) at 3.3:1 / 3.68:1.
None of those nodes are in a PR-04 file — they need the same on-plate treatment
described above. On the home page the old `div:nth-child(2) > h4` heading-order
violation (the footer link titles) is gone — they are `<h2>`s now.

### Static checks

```
$ grep -rn "#[0-9a-fA-F]\{6\}" \
    src/components/Navbar.astro src/components/Footer.astro \
    src/components/Features.astro src/components/HowItWorks.astro \
    src/components/SubmitCTA.astro src/components/LangToggle.astro \
    src/components/ThemeToggle.astro src/lib/i18n.ts
$ echo $?
1                      # no match: no hard-coded colour in any PR-04 file
```

`BaseLayout.astro` is the one exception: lines 41–42 still contain
`content="#eff2f1"` / `content="#0f1216"` in the two `<meta name="theme-color">`
tags. Those are pre-existing values that this PR is explicitly not allowed to
touch — `git diff website/src/layouts/BaseLayout.astro` shows only the
`data-lang` attribute and the added bootstrap script, nothing else.

```
$ grep -rnE "(bg|text|border|from|to|via)-(purple|orange|red|green|teal|blue|yellow|indigo|amber|emerald|cyan|rose|slate|gray|zinc|neutral|stone)-[0-9]{2,3}" <PR-04 files>
$ echo $?
1                      # no raw palette class left in the rewritten sections
```

## Before / after

Baseline images are the live pre-refactor site (`docs/evidence/images/before-*.jpg`,
recorded in `docs/REFACTOR-EVIDENCE.md`); the `pr-04-chrome-i18n-*` images come
from the post-merge capture above. The middle column is the merged base without
this PR (`docs/evidence/captures/pr-01-design-system.json`, regenerated
16:55:22Z), so the last column isolates what PR-04 itself changed.

| Page | Before (live) | Base, no PR-04 | After (PR-04 build) | Notes |
| --- | --- | --- | --- | --- |
| `/` | 5997 px — `before-home.jpg` (hero: `before-home-hero.jpg`) | 5997 px | **6387 px** — `pr-04-chrome-i18n-home-light.jpg`, `-home-dark.jpg` | +390 px from the rewritten chrome and the three editorial sections |
| `/` (English) | — | — | 6571 px — `pr-04-chrome-i18n-home-en.jpg` | same page with `dotskill-lang=en` |
| `/gallery/` | 2463 px — `before-gallery.jpg` | 2463 px | **2572 px** — `pr-04-chrome-i18n-gallery-light.jpg`, `-gallery-dark.jpg` | +109 px from navbar + footer; gallery body untouched |
| `/gallery/boss-skill/` | 1389 px — `before-detail.jpg` | 1389 px | **1498 px** — `pr-04-chrome-i18n-detail-light.jpg`, `-detail-dark.jpg` | +109 px from navbar + footer; detail body untouched |

Chrome close-ups (element captures, 2× DPR):

| What | Image |
| --- | --- |
| Navbar, zh, light | `docs/evidence/images/pr-04-chrome-i18n-nav-light.jpg` |
| Navbar, dark (moon · 深色) | `docs/evidence/images/pr-04-chrome-i18n-nav-dark.jpg` |
| Navbar, `data-lang=en` | `docs/evidence/images/pr-04-chrome-i18n-nav-en.jpg` |
| Mobile disclosure open (390 px) | `docs/evidence/images/pr-04-chrome-i18n-menu-mobile.jpg` |
| Features / How it works spreads | `pr-04-chrome-i18n-features-editorial.jpg`, `pr-04-chrome-i18n-howitworks-editorial.jpg` |
| Closing CTA plate | `docs/evidence/images/pr-04-chrome-i18n-submit-cta.jpg` |
| Footer, light / dark | `pr-04-chrome-i18n-footer-light.jpg`, `pr-04-chrome-i18n-footer-dark.jpg` |

## Known gaps and unverified items

1. ~~**`text-accent-ink` does not exist at this revision.**~~ **Resolved by the
   base** (`00a1db1` added `--accent-ink` + `text-accent-ink` and darkened the
   light-mode accent). `SubmitCTA` is back on `.btn-primary` and the stopgap
   token pair is gone. PR-05's rule is now satisfied everywhere the shared button
   is used (Hero, QuickStart, DemoPreview, SubmitCTA) — axe reports no
   white-on-accent node in the PR-04 scope in either theme.
2. ~~**`.lang-*` CSS lives in a component, not in `global.css`.**~~ **Resolved by
   the base** (`5758ec7` restored the rules site-wide); the temporary copy in
   `LangToggle.astro` was deleted in the post-review cleanup.
3. **Nothing inside a `plate` block may use `text-accent`.** The base darkens
   `--accent` for light mode so accent-on-paper passes AA, which leaves it at
   3.68:1 on `#0f1216`. PR-04's plate uses `text-plate-ink/70` instead; the other
   components that paint accent or `surface-*` text on plate/terminal backgrounds
   still fail (see the axe note above) and need the same treatment.
4. **`--ink-dim` still fails AA as a text colour** (~2.4:1 on paper). PR-04 uses
   it nowhere; other components still do.
5. **Unverifiable claims were dropped, not restated.** The footer's
   "MIT License" line is gone (no `LICENSE` file and no licence statement
   anywhere in the repo) and the "通常 2–5 分钟" / "2 分钟填表" timings were
   replaced by the numbered process lines. If those claims are true upstream,
   they need a source before they come back.
6. **Nav link targets changed on purpose.** The old navbar and footer pointed at
   `github.com/titanwings/colleague-skill`; everything now comes from
   `BRAND.repoUrl` (`titanwings/distilly`). The old star CTA button was dropped
   with it.
7. **Not verified:** axe was run on `/` only (gallery/detail only got the
   language smoke test); no Safari/Firefox run (Chromium-only evidence, as in
   every PR so far); no screen-reader pass; **the mobile panel is still a
   disclosure and not a focus trap** — opening it moves focus to the first link
   and Escape returns focus to the trigger, but tabbing past the last item leaves
   the panel and continues into the page behind it (unchanged by this cleanup,
   and still untested for a full trap); JS-disabled rendering relies on the static
   `data-lang="zh"` + `data-theme="auto"` attributes and was not exercised; the
   reduced-motion path is what the capture harness uses, so the `.reveal`
   animations themselves are not covered by any screenshot.
8. **`docs/REFACTOR-EVIDENCE.md` was not touched** (explicitly out of scope), so
   this PR is not linked from the evidence log yet — the log owner needs to add
   the section pointing at this file.
9. Commits 1 and 2 of this branch add `LangToggle`/`ThemeToggle` before the
   navbar mounts them, so on those two intermediate commits the language CSS has
   no host component and both languages render. The branch tip is the verified
   state; the split is by logical change, not by bisectability.

## Rollback

The branch is `site/04-chrome-i18n` on top of the merged
`site/01-design-system` (`7a60db7`). PR-04 itself only owns
`website/src/components/{Navbar,Footer,Features,HowItWorks,SubmitCTA,LangToggle,ThemeToggle}.astro`,
`website/src/lib/i18n.ts`, `website/src/layouts/BaseLayout.astro` and
`docs/evidence/pr-04-chrome-i18n.*`; everything else on the branch arrived with
the merge.

```bash
# undo PR-04 but keep the merged base:
git revert --no-edit <sha>            # newest PR-04 commit first, repeat
# or drop the whole PR (also drops the merged base):
git reset --hard 688ec35
```

The language and theme keys are additive (`localStorage['dotskill-lang']`), and
the theme key (`theme`) is unchanged from the base, so a revert leaves no stale
state behind beyond an ignored `dotskill-lang` entry.

## Appendix A — interaction verification script

Written to `website/scripts/tmp-i18n-verify.mjs` (so `playwright` resolves from
`website/node_modules`), run, and deleted again before the commit. Run it with a
preview of the built site:

```bash
cd website && npm run build
npx astro preview --port 4477 --host 127.0.0.1 &
node scripts/tmp-i18n-verify.mjs --port 4477
```

```js
#!/usr/bin/env node
/** TEMPORARY verification script for PR-04 (chrome + i18n + theme). */
import { chromium } from 'playwright';

const port = (() => {
  const i = process.argv.indexOf('--port');
  return i === -1 ? 4399 : Number(process.argv[i + 1]);
})();
const BASE = '/colleague-skill-site';
const ORIGIN = `http://127.0.0.1:${port}`;
const HOME = `${ORIGIN}${BASE}/`;

const results = [];
function check(name, ok, detail = '') {
  results.push({ name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  — ${detail}` : ''}`);
}

const browser = await chromium.launch({ channel: 'chrome' }).catch(() => chromium.launch());

// ---------------------------------------------------------------- language --
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(String(e)));

  await page.goto(HOME, { waitUntil: 'networkidle' });

  const initial = await page.evaluate(() => document.documentElement.dataset.lang);
  check('default language is zh', initial === 'zh', `data-lang=${initial}`);

  const zhVisible = await page.locator('#features .lang-zh').first().isVisible();
  const enVisible = await page.locator('#features .lang-en').first().isVisible();
  check('zh: .lang-zh visible / .lang-en hidden', zhVisible && !enVisible, `zh=${zhVisible} en=${enVisible}`);

  await page.locator('[data-lang-toggle]:visible').first().click();
  await page.waitForTimeout(120);

  const after = await page.evaluate(() => ({
    lang: document.documentElement.dataset.lang,
    tag: document.documentElement.lang,
    stored: localStorage.getItem('dotskill-lang'),
  }));
  check('click → data-lang=en', after.lang === 'en', `data-lang=${after.lang}`);
  check('click → <html lang>=en', after.tag === 'en', `lang=${after.tag}`);
  check('click → localStorage persisted', after.stored === 'en', `dotskill-lang=${after.stored}`);

  const zhVisibleEn = await page.locator('#features .lang-zh').first().isVisible();
  const enVisibleEn = await page.locator('#features .lang-en').first().isVisible();
  check('en: .lang-en visible / .lang-zh hidden', enVisibleEn && !zhVisibleEn, `zh=${zhVisibleEn} en=${enVisibleEn}`);

  const page2 = await ctx.newPage();
  await page2.addInitScript(() => {
    window.__langAtFirstFrame = 'unset';
    requestAnimationFrame(() => {
      window.__langAtFirstFrame = document.documentElement.getAttribute('data-lang') || 'missing';
    });
  });
  await page2.goto(HOME, { waitUntil: 'networkidle' });
  const persisted = await page2.evaluate(() => ({
    lang: document.documentElement.dataset.lang,
    tag: document.documentElement.lang,
    firstFrame: window.__langAtFirstFrame,
  }));
  check('reload keeps en', persisted.lang === 'en', `data-lang=${persisted.lang}`);
  check('reload keeps <html lang>=en', persisted.tag === 'en', `lang=${persisted.tag}`);
  check(
    'stored language applied before first frame (no zh flash)',
    persisted.firstFrame === 'en',
    `data-lang at first rAF=${persisted.firstFrame}`
  );

  const cold = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page3 = await cold.newPage();
  await page3.addInitScript(() => {
    window.__langAtFirstFrame = 'unset';
    requestAnimationFrame(() => {
      window.__langAtFirstFrame = document.documentElement.getAttribute('data-lang') || 'missing';
    });
  });
  await page3.goto(HOME, { waitUntil: 'networkidle' });
  const coldLang = await page3.evaluate(() => window.__langAtFirstFrame);
  check('cold visit is zh at first frame', coldLang === 'zh', `data-lang at first rAF=${coldLang}`);
  await cold.close();

  check('no console errors (language flow)', errors.length === 0, errors.join(' | '));
  await ctx.close();
}

// ------------------------------------------------------------------- theme --
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'light' });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(HOME, { waitUntil: 'networkidle' });

  const seq = [await page.evaluate(() => document.documentElement.dataset.theme)];
  const labels = [];
  for (let i = 0; i < 3; i += 1) {
    await page.locator('[data-theme-toggle]:visible').first().click();
    await page.waitForTimeout(80);
    seq.push(await page.evaluate(() => document.documentElement.dataset.theme));
    labels.push(await page.locator('[data-theme-toggle]:visible').first().getAttribute('aria-label'));
  }
  check('theme cycles auto → light → dark → auto', seq.join(' → ') === 'auto → light → dark → auto', seq.join(' → '));
  check('every theme state has a readable aria-label', labels.every((l) => l && l.includes('/')), labels.join(' | '));

  const stored = await page.evaluate(() => ({ theme: localStorage.getItem('theme'), attr: document.documentElement.dataset.theme }));
  check(
    'cycling back to auto clears the override',
    stored.theme === null && stored.attr === 'auto',
    JSON.stringify(stored)
  );

  await page.locator('[data-theme-toggle]:visible').first().click();
  await page.locator('[data-theme-toggle]:visible').first().click();
  await page.waitForTimeout(80);
  const darkStored = await page.evaluate(() => localStorage.getItem('theme'));
  check('dark persisted to localStorage', darkStored === 'dark', `theme=${darkStored}`);

  const page2 = await ctx.newPage();
  await page2.addInitScript(() => {
    requestAnimationFrame(() => {
      window.__themeAtFirstFrame = document.documentElement.getAttribute('data-theme') || 'missing';
    });
  });
  await page2.goto(HOME, { waitUntil: 'networkidle' });
  const reload = await page2.evaluate(() => ({
    theme: document.documentElement.dataset.theme,
    firstFrame: window.__themeAtFirstFrame,
  }));
  check('reload keeps dark', reload.theme === 'dark', `data-theme=${reload.theme}`);
  check('theme applied before first frame', reload.firstFrame === 'dark', `data-theme at first rAF=${reload.firstFrame}`);

  const state = await page2.locator('[data-state-theme]').first().textContent();
  check('footer mirrors theme state', state?.trim() === 'dark', `[data-state-theme]=${state?.trim()}`);

  check('no console errors (theme flow)', errors.length === 0, errors.join(' | '));
  await ctx.close();
}

// ------------------------------------------------------------ mobile menu --
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(HOME, { waitUntil: 'networkidle' });

  const trigger = page.locator('[data-menu-toggle]');
  const panel = page.locator('#site-menu');

  check('panel starts closed', (await trigger.getAttribute('aria-expanded')) === 'false' && !(await panel.isVisible()));
  check('trigger controls the panel', (await trigger.getAttribute('aria-controls')) === 'site-menu');

  await trigger.click();
  await page.waitForTimeout(100);
  const opened = {
    expanded: await trigger.getAttribute('aria-expanded'),
    visible: await panel.isVisible(),
    focused: await page.evaluate(() => document.activeElement?.closest('#site-menu') !== null),
  };
  check('click opens the panel', opened.expanded === 'true' && opened.visible, JSON.stringify(opened));
  check('focus moves into the panel', opened.focused, `focused=${opened.focused}`);

  await page.keyboard.press('Escape');
  await page.waitForTimeout(100);
  const closed = {
    expanded: await trigger.getAttribute('aria-expanded'),
    visible: await panel.isVisible(),
    focusBack: await page.evaluate(() => document.activeElement?.hasAttribute('data-menu-toggle') === true),
  };
  check('Escape closes the panel', closed.expanded === 'false' && !closed.visible, JSON.stringify(closed));
  check('Escape restores focus to the trigger', closed.focusBack, `focusBack=${closed.focusBack}`);

  await trigger.focus();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(100);
  check('keyboard can reopen the panel', await panel.isVisible());
  await page.keyboard.press('Escape');
  await page.waitForTimeout(80);

  check('no console errors (mobile menu flow)', errors.length === 0, errors.join(' | '));
  await ctx.close();
}

await browser.close();

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
if (failed.length) {
  console.error(`FAIL: ${failed.map((f) => f.name).join('; ')}`);
  process.exit(1);
}
```
