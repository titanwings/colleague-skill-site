# PR 02 — hero + quick start (`site/02-hero-quickstart`)

Scope: three components only — `Hero.astro`, `QuickStart.astro` and the new
`AgentSwitcher.astro`. `BaseLayout`, `global.css`, `tailwind.config.mjs`,
`data/*`, the navbar/footer/features/gallery components and
`docs/REFACTOR-EVIDENCE.md` are owned by other PRs in this stack and are **not**
modified here.

Goal: move the top of the home page onto an editorial idiom (paper + ink,
one burnt-orange accent, Fraunces headline, restrained motion), and replace the
hand-written install snippets with a per-host switcher that prints the exact
command, the exact directory and an honest capability note for all eight hosts.

## What changed

| File | Change |
| --- | --- |
| `website/src/components/AgentSwitcher.astro` | **New (506 lines).** Tablist of all eight coding agents + panel with the install routes, the documented directory and the host's own caveat. Every string comes from `src/data/agents.ts`; nothing is typed twice. |
| `website/src/components/Hero.astro` | Rewritten (153 lines). Kicker → Fraunces headline (one line per language) → two sentences → shared `.btn-primary` / `.btn-secondary` CTAs → hairline fact bar. Removed: grid/gradient backgrounds, glow blobs, `gradient-text`, terminal window, bouncing chevron, the hard-coded `10,000+` star claim, and the JS-reveal dependency. |
| `website/src/components/QuickStart.astro` | Rewritten (186 lines). Three numbered steps (`01/02/03`); step 01 embeds the switcher, steps 02/03 keep the previous copy (distill → SKILL.md → summon) in plate panels. Removed the two hard-coded clone commands (they still pointed at `titanwings/colleague-skill`) and the per-card copy script. |
| `docs/evidence/pr-02-hero-quickstart.md`, `docs/evidence/images/pr-02-hero-quickstart-*.jpg`, `docs/evidence/captures/pr-02-hero-quickstart.json` | Evidence for this PR. |

### The switcher (data wiring)

* Hosts: `AGENTS` (Claude Code, Codex CLI, opencode, OpenClaw, Hermes, DeepSeek
  Harness, Grok Build, Pi); `DEFAULT_AGENT` is preselected.
* Routes: `skillsCliCommand(id, scope, { requireVerified: true })` for the
  AgentSkills CLI, `cloneCommand(id, scope)` for the direct clone, and
  `globalPath` / `projectPath` for the directory — all generated at build time,
  so the page cannot drift from the support matrix.
* `skillsCliSupported(id)` decides whether the CLI route is shown at all. Pi has
  no confirmed `--agent` target, so its panel shows the clone route only
  (numbered 01/02) plus an explicit note — **an unverified one-liner is never
  printed as if it worked**.
* Scope: hosts with a documented `projectPath` get a Global/Project switch; Pi
  renders "global install only — no documented project-local path" instead of an
  invented directory. Project scope changes *both* commands (the CLI one drops
  `--global --copy --yes`) and the directory row.
* Capability badge (`full` / `prompt-only`) and each host's `note.{zh,en}` are
  rendered verbatim.
* Bilingual: every string exists as a `lang-zh` / `lang-en` pair, flipped by the
  site-wide rules in `global.css` (see “Post-review cleanup”).
* Accessibility: real `<button role="tab">` + `role="tabpanel"` with
  `aria-selected` / `aria-controls` / roving `tabindex`, Arrow/Home/End support,
  scope toggle as `aria-pressed` buttons, copy buttons with `aria-label`, a
  `role="status" aria-live="polite"` region for copy feedback, and focusable
  scrollable plate blocks (`tabindex="0" role="group" aria-label`).
* Copy: `navigator.clipboard` when the context is secure; otherwise the command
  text is selected and the status region says so (`已选中 … 请按 Ctrl / ⌘ + C`);
  a hard failure is announced too — nothing fails silently.
* Progressive enhancement: without JS the default host's panel is still rendered
  with its commands and directory, so the page answers "how do I install this?".

## Post-review cleanup (after the base branch moved)

While this PR was under review the base branch gained six commits. They were
merged in with `git merge --no-edit site/01-design-system` (merge commit
`36feea5`), and this PR then dropped the three workarounds it had been carrying:

| Base change | What PR-02 dropped |
| --- | --- |
| `5758ec7` restored the site-wide `.lang-zh` / `.lang-en` rules in `global.css` | the three scoped copies of that rule (one in each of `Hero.astro`, `QuickStart.astro`, `AgentSwitcher.astro`). The components now rely on the global rules only — re-verified: `data-lang=en` hides `.lang-zh` and shows `.lang-en` in both the hero and the switcher. |
| `00a1db1` added `--accent-ink` + `text-accent-ink` so accent fills pass AA | the custom ink-filled buttons. The hero now uses the shared `.btn-primary` (accent fill) and `.btn-secondary`. Measured in the browser: **5.09:1** light (white on `#c73e0c`) and **7.87:1** dark (`#15181b` on `#fb923c`); the hover fills (`--accent-soft`) compute to ≈7.3:1 light and ≈10.4:1 dark by hand. |
| `ac1ad0d` added `skillsCliSupported(id)` and the `{ requireVerified: true }` option | the local `Boolean(agent.skillsCliId)` check and the printed-then-warned `--agent pi` command (see the switcher section above). |
| `59f66e1` made `capture.mjs` refuse a foreign preview and parse the URL it actually bound | the manual `lsof`/receipt-height workaround described in the first revision of this document. |

The language fix also changes the *measured* page heights: before the merge the
page rendered both languages at once, which inflated every section.

| Page | Live baseline (`before-*`) | PR-02 before the sync | PR-02 after the sync |
| --- | --- | --- | --- |
| `/` | 5997 px | 7182 px | **6145 px** |
| `/gallery/` | 2463 px | 2613 px | **2463 px** |
| `/gallery/boss-skill/` | 1389 px | 1623 px | **1389 px** |

Gallery and detail are back to the live baseline exactly. The home page is
**+148 px** versus the live baseline by design: PR-02 replaces the old hero
(terminal window, social-proof row) and the three install cards with the fact bar
and three stacked steps, one of which embeds an eight-host switcher.

## Test results (all commands re-run after the sync)

| Check | Command | Result |
| --- | --- | --- |
| Build | `cd website && npm run build` | **pass — 217 pages** |
| Build at every commit | `git archive <sha> \| tar -x -C /tmp/… ; ln -s …/node_modules ; npm run build` for each of the four PR-02 commits and the merge commit | **217 pages at each of them** |
| Evidence capture | `node scripts/capture.mjs --label pr-02-hero-quickstart --port 4411` | 12/12 captures, **0 console errors, 0 horizontal overflow, no `FAIL` line** — receipt `captures/pr-02-hero-quickstart.json` (origin `:4411`) |
| Switcher + a11y harness | Playwright against a preview of this branch | **72/72 checks pass** |
| Hero CTA contrast | same harness, computed from live styles | **5.09:1 light / 7.87:1 dark** (≥4.5:1) |
| Scoped axe-core (hero + `#quickstart`, light + dark, WCAG 2.0/2.1/2.2 A+AA + best practice) | PR-05 toolchain (`@axe-core/playwright`) | **0 violations** |
| No hard-coded colours | `grep -rn "#[0-9a-fA-F]\{6\}" website/src/components/{Hero,QuickStart,AgentSwitcher}.astro` | **empty** (exit 1) |
| No raw palette / `text-white` / legacy body colours | `grep -rnE "rgba?\(\|text-white\|text-(purple\|amber\|…)-[0-9]\|(text\|bg)-surface-[0-9]" …` | only `rgb(var(--token) / α)` token uses |
| Extra crops (hero viewport + switcher, 2×) | see “Screenshots” | 4 JPEGs refreshed from the post-sync build |

### Required self-test 1 — no hard-coded colour literals

```
$ grep -rn "#[0-9a-fA-F]\{6\}" website/src/components/Hero.astro website/src/components/QuickStart.astro website/src/components/AgentSwitcher.astro
$ echo $?
1
```

The wider sweep for the PR-05 rules returns only token-based CSS:

```
$ grep -rnE "rgba?\(|text-white|text-(purple|amber|indigo|green|red|yellow|blue|slate|zinc|gray|emerald|orange)-[0-9]|(text|bg)-surface-[0-9]" \
    website/src/components/Hero.astro website/src/components/QuickStart.astro website/src/components/AgentSwitcher.astro
website/src/components/AgentSwitcher.astro:319:    background: rgb(var(--accent) / 0.12);
website/src/components/AgentSwitcher.astro:320:    border-color: rgb(var(--accent) / 0.55);
website/src/components/AgentSwitcher.astro:321:    color: rgb(var(--ink));
website/src/components/AgentSwitcher.astro:325:    background: rgb(var(--accent) / 0.14);
website/src/components/AgentSwitcher.astro:326:    color: rgb(var(--ink));
website/src/components/AgentSwitcher.astro:335:    border-color: rgb(var(--ok) / 0.5);
website/src/components/AgentSwitcher.astro:336:    color: rgb(var(--ok));
```

### Required self-test 2 — command and directory change for all 8 hosts

Run against a preview of this branch (the assertion clicks every tab and reads
the values out of the visible scope block):

```bash
cd website && npx astro preview --port 4411 --host 127.0.0.1 &   # any free port
curl -s http://127.0.0.1:4411/colleague-skill-site/ | grep -q data-agent-switcher   # make sure it is *this* build
node -e "
const { chromium } = require('\$PWD/node_modules/playwright');
(async () => {
  const b = await chromium.launch({ channel: 'chrome' });
  const p = await b.newPage();
  await p.goto('http://127.0.0.1:4411/colleague-skill-site/', { waitUntil: 'networkidle' });
  const tabs = await p.\$\$('[data-agent-tab]');
  const seen = new Set();
  for (const t of tabs) {
    await t.click();
    const s = await p.evaluate(() => {
      const panel = document.querySelector('[data-agent-panel]:not([hidden])');
      const block = panel.querySelector('[data-scope-block]:not([hidden])');
      return [...block.querySelectorAll('[data-copy-source]')].map((e) => e.textContent.trim());
    });
    seen.add(s.join(' :: '));
    console.log(s.join('  |  '));
  }
  console.log('hosts=' + tabs.length, 'distinct command+directory sets=' + seen.size);
  await b.close();
})();
"
```

Output (verbatim; Pi prints two values because it has no confirmed CLI route):

```
npx -y skills add titanwings/distilly --skill distilly --agent claude-code --global --copy --yes  |  git clone https://github.com/titanwings/distilly ~/.claude/skills/distilly  |  ~/.claude/skills/distilly
npx -y skills add titanwings/distilly --skill distilly --agent codex --global --copy --yes  |  git clone https://github.com/titanwings/distilly ~/.agents/skills/distilly  |  ~/.agents/skills/distilly
npx -y skills add titanwings/distilly --skill distilly --agent opencode --global --copy --yes  |  git clone https://github.com/titanwings/distilly ~/.config/opencode/skills/distilly  |  ~/.config/opencode/skills/distilly
npx -y skills add titanwings/distilly --skill distilly --agent openclaw --global --copy --yes  |  git clone https://github.com/titanwings/distilly ~/.openclaw/workspace/skills/distilly  |  ~/.openclaw/workspace/skills/distilly
npx -y skills add titanwings/distilly --skill distilly --agent hermes --global --copy --yes  |  git clone https://github.com/titanwings/distilly ~/.hermes/skills/distilly  |  ~/.hermes/skills/distilly
npx -y skills add titanwings/distilly --skill distilly --agent deepseek-harness --global --copy --yes  |  git clone https://github.com/titanwings/distilly ~/.dsh/skills/distilly  |  ~/.dsh/skills/distilly
npx -y skills add titanwings/distilly --skill distilly --agent grok-build --global --copy --yes  |  git clone https://github.com/titanwings/distilly ~/.grok/skills/distilly  |  ~/.grok/skills/distilly
git clone https://github.com/titanwings/distilly ~/.pi/agent/skills/distilly  |  ~/.pi/agent/skills/distilly
hosts=8 distinct command+directory sets=8
```

Full matrix the component renders:

| Host (`id`) | Scope | AgentSkills CLI (global) | Clone target (global) | Directory (global) | Directory (project) |
| --- | --- | --- | --- | --- | --- |
| `claude-code` | global + project | `npx -y skills add titanwings/distilly --skill distilly --agent claude-code --global --copy --yes` | `git clone … ~/.claude/skills/distilly` | `~/.claude/skills/distilly` | `.claude/skills/distilly` |
| `codex` | global + project | `… --agent codex --global --copy --yes` | `git clone … ~/.agents/skills/distilly` | `~/.agents/skills/distilly` | `.agents/skills/distilly` |
| `opencode` | global + project | `… --agent opencode --global --copy --yes` | `git clone … ~/.config/opencode/skills/distilly` | `~/.config/opencode/skills/distilly` | `.opencode/skills/distilly` |
| `openclaw` | global + project | `… --agent openclaw --global --copy --yes` | `git clone … ~/.openclaw/workspace/skills/distilly` | `~/.openclaw/workspace/skills/distilly` | `.openclaw/skills/distilly` |
| `hermes` | global + project | `… --agent hermes --global --copy --yes` | `git clone … ~/.hermes/skills/distilly` | `~/.hermes/skills/distilly` | `.hermes/skills/distilly` |
| `deepseek-harness` | global + project | `… --agent deepseek-harness --global --copy --yes` | `git clone … ~/.dsh/skills/distilly` | `~/.dsh/skills/distilly` | `.dsh/skills/distilly` |
| `grok-build` | global + project | `… --agent grok-build --global --copy --yes` | `git clone … ~/.grok/skills/distilly` | `~/.grok/skills/distilly` | `.grok/skills/distilly` |
| `pi` | global only | — (no unverified CLI command shown) | `git clone … ~/.pi/agent/skills/distilly` | `~/.pi/agent/skills/distilly` | — (not documented) |

Project scope drops `--global --copy --yes`, e.g.
`npx -y skills add titanwings/distilly --skill distilly --agent claude-code`.

### Full switcher harness (72 checks)

Playwright, Chromium, against `http://127.0.0.1:<port>/colleague-skill-site/`.
Per host it asserts: tab selected + panel visible, the AgentSkills CLI one-liner
(confirmed hosts) or **no** CLI command at all plus the explanatory note
(unconfirmed hosts), `--agent <id>` present, clone target and directory equal
`globalPath`, and the scope buttons present only when documented. Then: 8
distinct command/directory sets, project scope swaps command + directory +
`aria-pressed`, Arrow/End roving focus, the clipboard receives the exact
command, the copied state + `aria-live` message appear, the no-clipboard
fallback selects the text, `data-lang=en` flips hero and switcher pairs, the
hero CTA clears 4.5:1 in both themes, no horizontal overflow at 320/360/390/768
px, every sideways-scrollable code block is focusable, zero console errors.

```
72/72 checks passed
```

Representative lines:

```
PASS  [pi] prints NO unverified CLI command — sources=2
PASS  [pi] explains the missing CLI target
PASS  all 8 hosts produce distinct command/directory sets — 8/8 unique
PASS  project scope swaps CLI command — npx -y skills add … --agent claude-code --global --copy --yes  →  npx -y skills add … --agent claude-code
PASS  project scope swaps directory — ~/.claude/skills/distilly  →  .claude/skills/distilly
PASS  ArrowRight moves selection + focus (roving tabindex) — {"selected":"codex","focused":"codex"}
PASS  clipboard holds the exact command — npx -y skills add titanwings/distilly --skill distilly --agent claude-code --global --copy --yes
PASS  aria-live="polite" status is announced — 已复制到剪贴板。 / Copied to clipboard.
PASS  without clipboard API the command is selected instead of failing silently — … 命令已选中 —— 请按 Ctrl / ⌘ + C。
PASS  default language shows Chinese and hides the English pair — {"lang":"zh","zh":"inline","en":"none"}
PASS  data-lang=en shows English and hides Chinese (hero + switcher) — People leave. Skills don’t. | hero zh=none en=inline | tab zh=none en=inline
PASS  hero primary CTA (accent fill) clears 4.5:1 in light — 5.09:1 (rgb(255, 255, 255) on rgb(199, 62, 12))
PASS  hero primary CTA (accent fill) clears 4.5:1 in dark — 7.87:1 (rgb(21, 24, 27) on rgb(251, 146, 60))
PASS  no console errors — none
```

### axe-core, scoped to this PR's markup

```
light/hero: violations=0 passes=8 incomplete=1
light/quickstart: violations=0 passes=24 incomplete=1
dark/hero: violations=0 passes=8 incomplete=1
dark/quickstart: violations=0 passes=24 incomplete=1
AXE: 0 violations in the PR-02 contexts
```

The first run of this audit (before the review) found a real `serious`
`scrollable-region-focusable` violation on the command `<pre>`; it is fixed in
`AgentSwitcher.astro` (`tabindex="0" role="group" aria-label`) and the harness
above now guards it. The remaining `incomplete` node in each context is
`color-contrast` on `aria-hidden` decorative glyphs (`→`, `❯`, `✓`, `⚡`) whose
alpha-blended colour axe refuses to compute; they carry no text content.

## Screenshots

| Page | Before (live site) | After (this PR) |
| --- | --- | --- |
| Home — hero, desktop 1440×900 @2× | `docs/evidence/images/before-home-hero.jpg` | `docs/evidence/images/pr-02-hero-quickstart-hero-light.jpg`, `…-hero-dark.jpg` |
| Home — desktop, full page (light) | `docs/evidence/images/before-home.jpg` | `docs/evidence/images/pr-02-hero-quickstart-home-light.jpg` |
| Home — desktop, full page (dark) | — (no light/dark switch before) | `docs/evidence/images/pr-02-hero-quickstart-home-dark.jpg` |
| Home — mobile 390 px (light / dark) | — | `docs/evidence/images/pr-02-hero-quickstart-home-light-mobile.jpg`, `…-home-dark-mobile.jpg` |
| Switcher close-up (light / dark) | — | `docs/evidence/images/pr-02-hero-quickstart-switcher-light.jpg`, `…-switcher-dark.jpg` |
| Gallery | `before-gallery.jpg` | `pr-02-hero-quickstart-gallery-light.jpg`, `…-gallery-dark.jpg` |
| Detail | `before-detail.jpg` | `pr-02-hero-quickstart-detail-light.jpg`, `…-detail-dark.jpg` |

Recipe:

```bash
cd website && npm run build
node scripts/capture.mjs --label pr-02-hero-quickstart --port 4411
```

In this shared multi-worktree environment the preview server that `capture.mjs`
spawns was killed by a neighbouring process twice (a `SIGTERM` mid-run, on the
gallery page). The stored artifacts therefore come from the same script in its
supported `--no-serve` mode, pointed at a supervised `astro preview` of this
branch's `dist/` (the served build was verified with the `data-agent-switcher`
marker before any screenshot):

```bash
cd website && node scripts/capture.mjs --label pr-02-hero-quickstart --no-serve --port 4411
```

The hero and switcher crops are the only images not produced by `capture.mjs`;
they were taken with `viewport 1440×900, deviceScaleFactor 2` (same shape as
`before-home-hero.jpg`) plus `locator('[data-agent-switcher]').screenshot()`.

## Known gaps (found, deliberately not fixed here)

1. **`--ink-dim` still fails 4.5:1 in both themes** (light ≈2.5:1, dark ≈4.2:1).
   It is not used for text in these components; the base palette should either
   adjust it or document it as decoration-only.
2. **Accent and semantic tokens are tuned for paper, not for `plate`.** On the
   dark plate panel, `--ok` and the accent shades sit around 3.4–3.6:1, so plate
   content here uses only `text-plate-ink` (≈14:1) with `/70` (≈8:1) and `/60`
   (≈6:1) shades; `/50` (≈4.7:1) is used only on `aria-hidden` decorative
   glyphs. A plate-specific token set would let semantic colours into terminals.
3. **Pi requires the clone route.** `agents.ts` keeps `pi` without a
   `skillsCliId`, so the switcher intentionally shows no CLI command for it. If
   the AgentSkills CLI confirms `--agent pi`, the row appears automatically once
   the data gains the id (no component change needed).
4. **Preview lifetime in this environment.** Long-running `astro preview`
   processes are periodically `SIGTERM`'d while other worktrees are active, which
   is why the capture above needed the `--no-serve` + supervisor workaround. The
   script itself is now correct (it refuses foreign servers via a per-run marker);
   the instability is environmental, not a defect in `capture.mjs`.

Resolved by the base branch and dropped here: the missing site-wide
`lang-zh`/`lang-en` rules, the absent `--accent-ink` token, the hand-rolled
`skillsCliId` check, and the capture-script port race.

## Not verified

* Clipboard behaviour in Firefox/Safari — only Chromium was exercised (headless
  Chrome with clipboard permissions), plus a synthetic context with
  `navigator.clipboard` removed to hit the selection fallback. A real
  insecure-context (plain `http://` on a LAN address) was **not** tested.
* Screen-reader announcement — the `role="status" aria-live="polite"` region and
  its text were asserted in the DOM, but no screen reader was run.
* Keyboard walkthrough of the whole page — the tablist's Arrow/Home/End and the
  natural tab order of the buttons/links were exercised; a full manual
  tab-through (including the untouched navbar and gallery) was not.
* axe `incomplete` colour-contrast nodes (the alpha-blended `aria-hidden`
  glyphs) were not reviewed by a human.
* `.btn-primary` hover-state contrast is hand-computed (≈7.3:1 light, ≈10.4:1
  dark) rather than measured in the browser; only the resting state is asserted
  by the harness.
* No visual-regression diffing: before/after was compared by eye. Page heights
  are recorded in the receipt but pixel diffs are not produced.
* The in-host invocation `/distilly` in quick-start step 02 mirrors the folder
  name the switcher installs (`--skill distilly`) and is **not** verified against
  the upstream repository; the previous copy's `/create-colleague` and
  `/list-colleagues` commands were dropped rather than restated.
* Performance/Lighthouse was not measured; the only budget signals are the
  217-page build, zero console errors and the receipt metrics.

## Commits

| SHA | Subject |
| --- | --- |
| `7259aab` | `feat(site): add the coding-agent switcher component` |
| `8ace731` | `refactor(site): rebuild the hero as an editorial masthead` |
| `4c89375` | `refactor(site): restructure quick start into three numbered steps` |
| `9653826` | `docs(site): add PR-02 evidence, captures and rollback notes` |
| `36feea5` | `Merge branch 'site/01-design-system' into site/02-hero-quickstart` (base sync: 6 commits) |
| *(this commit)* | `chore(site): sync base fixes and drop the language workaround` |

Each PR-02 commit builds on its own (see the table above); the merge and the
cleanup commit keep the 217-page build green. Nothing is pushed and no other
branch is modified.

## Rollback

* Cleanup only: `git revert <cleanup sha>` restores the scoped `lang-zh`
  workaround and the hand-rolled `skillsCliId` check (the components still build,
  because the global language rules and `--accent-ink` are additive).
* Per-component: `git revert <sha>` for any of the four original commits — each
  is self-contained and the branch builds at every step.
* Whole PR: `git revert -m 1 36feea5` drops the base sync, or
  `git checkout 688ec35` restores the branch tip before this work
  (`docs(site): record baseline captures and the refactor evidence log`).
* Nothing outside the three components is modified by this PR, so reverting
  restores the previous hero, the previous three-method quick start and removes
  `AgentSwitcher.astro`.
