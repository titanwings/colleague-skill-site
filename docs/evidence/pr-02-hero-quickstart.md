# PR 02 — hero + quick start (`site/02-hero-quickstart`)

Scope: three components only — `Hero.astro`, `QuickStart.astro` and the new
`AgentSwitcher.astro`. `BaseLayout`, `global.css`, `tailwind.config.mjs`,
`data/*`, the navbar/footer/features/gallery components and
`docs/REFACTOR-EVIDENCE.md` belong to other PRs in this stack and are **not**
touched here.

Goal: move the top of the home page onto archify's editorial idiom (paper + ink,
one burnt-orange accent, Fraunces headline, restrained motion), and replace the
hand-written install snippets with a per-host switcher that prints the exact
command, the exact directory and an honest capability note for all eight hosts.

## What changed

| File | Change |
| --- | --- |
| `website/src/components/AgentSwitcher.astro` | **New (497 lines).** Tablist of all eight coding agents + panel with two install routes, the documented directory and the host's own caveat. Every string comes from `src/data/agents.ts`; nothing is typed twice. |
| `website/src/components/Hero.astro` | Rewritten. Kicker → Fraunces headline (one line per language) → two sentences → primary/secondary CTA → hairline fact bar. Removed: grid/gradient backgrounds, glow blobs, `gradient-text`, terminal window, bouncing chevron, `10,000+` hard-coded star claim. |
| `website/src/components/QuickStart.astro` | Rewritten. Three numbered steps (`01/02/03`); step 01 embeds the switcher, steps 02/03 keep the previous copy (distill → SKILL.md → summon) in plate panels. Removed the two hard-coded clone commands (they still pointed at `titanwings/colleague-skill`) and the per-card copy script. |
| `docs/evidence/pr-02-hero-quickstart.md`, `docs/evidence/images/pr-02-hero-quickstart-*.jpg`, `docs/evidence/captures/pr-02-hero-quickstart.json` | Evidence for this PR. |

### The switcher (data wiring)

* Hosts: `AGENTS` (Claude Code, Codex CLI, opencode, OpenClaw, Hermes, DeepSeek
  Harness, Grok Build, Pi); `DEFAULT_AGENT` is preselected.
* Route 01 = `skillsCliCommand(id, scope)`, route 02 = `cloneCommand(id, scope)`,
  route 03 = `globalPath` / `projectPath`. All three are generated at build time,
  so the page cannot drift from the support matrix.
* Scope: hosts with a documented `projectPath` get a Global/Project switch; Pi
  renders "global install only — no documented project-local path" instead of an
  invented directory. Project scope changes *both* commands (the CLI one drops
  `--global --copy --yes`) and the directory row.
* Capability badge (`full` / `prompt-only`) and the host's `note.{zh,en}` are
  rendered verbatim. `pi` has no `skillsCliId`, so its CLI route carries a visible
  warning that `--agent pi` is not a confirmed AgentSkills CLI target.
* Bilingual: every string exists as a `lang-zh` / `lang-en` pair; the pair is
  flipped by `html[data-lang]`.
* Accessibility: real `<button role="tab">` + `role="tabpanel"` with
  `aria-selected` / `aria-controls` / roving `tabindex`, Arrow/Home/End support,
  scope toggle as `aria-pressed` buttons, copy buttons with `aria-label`, a
  `role="status" aria-live="polite"` region for copy feedback, and focusable
  scrollable plate blocks (`tabindex="0" role="group" aria-label`).
* Copy: `navigator.clipboard` when the context is secure; otherwise the command
  text is selected and the status region says so (`已选中 … 请按 Ctrl / ⌘ + C`);
  a hard failure is announced too — nothing fails silently.
* Progressive enhancement: without JS the default host's panel is still rendered
  with both commands and the directory, so the page answers "how do I install?".

## Test results

| Check | Command | Result |
| --- | --- | --- |
| Build | `cd website && npm run build` | **pass — 217 pages** in 1.3 s |
| Build at every commit | `git archive <sha> \| tar -x -C /tmp/… ; ln -s …/node_modules ; npm run build` for each of the four commits | **217 pages at each of them** |
| Evidence capture | `cd website && node scripts/capture.mjs --label pr-02-hero-quickstart` | **12/12 captures, 0 console errors, 0 horizontal overflow, no `FAIL` line** |
| Extra crops (hero viewport + switcher, 2×) | see “Screenshots” note | 4 JPEGs written |
| No hard-coded colours | `grep -rn "#[0-9a-fA-F]\{6\}" website/src/components/{Hero,QuickStart,AgentSwitcher}.astro` | **empty** (exit 1) |
| No raw palette / `text-white` / legacy body colours | `grep -rnE "rgba?\(\|text-white\|text-(purple\|amber\|…)-[0-9]\|(text\|bg)-surface-[0-9]" …` | only 7 hits, all `rgb(var(--token) / α)` token uses |
| Switcher behaviour (8 hosts, scope, clipboard, keyboard, language) | Playwright harness against `astro preview` | **62/62 checks pass** |
| axe-core (WCAG 2.0/2.1/2.2 A+AA + best practice) scoped to the hero and `#quickstart`, light + dark | `@axe-core/playwright` from the PR-05 toolchain | **0 violations**; 1 `incomplete` per context (alpha-blended decorative glyphs, see gaps) |

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
the command + directory out of the visible scope block):

```bash
cd website && npx astro preview --port 4523 --host 127.0.0.1 &   # any free port
curl -s http://127.0.0.1:4523/colleague-skill-site/ | grep -q data-agent-switcher   # make sure it is *this* build
node -e "
const { chromium } = require('$PWD/node_modules/playwright');
(async () => {
  const b = await chromium.launch({ channel: 'chrome' });
  const p = await b.newPage();
  await p.goto('http://127.0.0.1:4523/colleague-skill-site/', { waitUntil: 'networkidle' });
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
    console.log(s[2].padEnd(40), '|', s[0]);
  }
  console.log('hosts=' + tabs.length, 'distinct command+directory sets=' + seen.size);
  await b.close();
})();
"
```

Output (verbatim):

```
~/.claude/skills/distilly                | npx -y skills add titanwings/distilly --skill distilly --agent claude-code --global --copy --yes
~/.agents/skills/distilly                | npx -y skills add titanwings/distilly --skill distilly --agent codex --global --copy --yes
~/.config/opencode/skills/distilly       | npx -y skills add titanwings/distilly --skill distilly --agent opencode --global --copy --yes
~/.openclaw/workspace/skills/distilly    | npx -y skills add titanwings/distilly --skill distilly --agent openclaw --global --copy --yes
~/.hermes/skills/distilly                | npx -y skills add titanwings/distilly --skill distilly --agent hermes --global --copy --yes
~/.dsh/skills/distilly                   | npx -y skills add titanwings/distilly --skill distilly --agent deepseek-harness --global --copy --yes
~/.grok/skills/distilly                  | npx -y skills add titanwings/distilly --skill distilly --agent grok-build --global --copy --yes
~/.pi/agent/skills/distilly              | npx -y skills add titanwings/distilly --skill distilly --agent pi --global --copy --yes
hosts=8 distinct command+directory sets=8
```

Full matrix the component renders (also the clone route, and the project-scope
directory for every host that documents one):

| Host (`id`) | Scope | AgentSkills CLI (global) | Clone target (global) | Directory (global) | Directory (project) |
| --- | --- | --- | --- | --- | --- |
| `claude-code` | global + project | `npx -y skills add titanwings/distilly --skill distilly --agent claude-code --global --copy --yes` | `git clone https://github.com/titanwings/distilly ~/.claude/skills/distilly` | `~/.claude/skills/distilly` | `.claude/skills/distilly` |
| `codex` | global + project | `… --agent codex --global --copy --yes` | `git clone … ~/.agents/skills/distilly` | `~/.agents/skills/distilly` | `.agents/skills/distilly` |
| `opencode` | global + project | `… --agent opencode --global --copy --yes` | `git clone … ~/.config/opencode/skills/distilly` | `~/.config/opencode/skills/distilly` | `.opencode/skills/distilly` |
| `openclaw` | global + project | `… --agent openclaw --global --copy --yes` | `git clone … ~/.openclaw/workspace/skills/distilly` | `~/.openclaw/workspace/skills/distilly` | `.openclaw/skills/distilly` |
| `hermes` | global + project | `… --agent hermes --global --copy --yes` | `git clone … ~/.hermes/skills/distilly` | `~/.hermes/skills/distilly` | `.hermes/skills/distilly` |
| `deepseek-harness` | global + project | `… --agent deepseek-harness --global --copy --yes` | `git clone … ~/.dsh/skills/distilly` | `~/.dsh/skills/distilly` | `.dsh/skills/distilly` |
| `grok-build` | global + project | `… --agent grok-build --global --copy --yes` | `git clone … ~/.grok/skills/distilly` | `~/.grok/skills/distilly` | `.grok/skills/distilly` |
| `pi` | global only | `… --agent pi --global --copy --yes` (flagged unconfirmed) | `git clone … ~/.pi/agent/skills/distilly` | `~/.pi/agent/skills/distilly` | — (not documented) |

Project scope drops `--global --copy --yes`, e.g.
`npx -y skills add titanwings/distilly --skill distilly --agent claude-code`.

### Full switcher self-test (62 checks)

Harness: Playwright, `http://127.0.0.1:<port>/colleague-skill-site/`, Chromium.
It asserts per host: tab selected + panel visible, `--agent <id>` present, clone
target equals `globalPath`, directory row equals `globalPath`, scope buttons
present only when documented; then: 8 distinct command/directory sets, project
scope swaps command + directory + `aria-pressed`, Arrow/End roving focus, the
clipboard actually receives the exact command, the copied state + `aria-live`
message appear, the no-clipboard fallback selects the text, `data-lang=en`
hides `.lang-zh` and shows `.lang-en`, no horizontal overflow at 320/360/390/768
px, every sideways-scrollable code block is focusable, and zero console errors.

```
62/62 checks passed
```

Representative lines:

```
PASS  all 8 hosts produce distinct command/directory sets — 8/8 unique
PASS  project scope swaps CLI command — npx -y skills add … --agent claude-code --global --copy --yes  →  npx -y skills add … --agent claude-code
PASS  project scope swaps directory — ~/.claude/skills/distilly  →  .claude/skills/distilly
PASS  ArrowRight moves selection + focus (roving tabindex) — {"selected":"codex","focused":"codex"}
PASS  clipboard holds the exact command — npx -y skills add titanwings/distilly --skill distilly --agent claude-code --global --copy --yes
PASS  aria-live="polite" status is announced — 已复制到剪贴板。 / Copied to clipboard.
PASS  without clipboard API the command is selected instead of failing silently — 这个浏览器不允许自动复制，命令已选中 —— 请按 Ctrl / ⌘ + C。 | selected=npx -y skills add titanwings/distilly --…
PASS  data-lang=en shows English and hides Chinese — People leave. Skills don’t. | zh display=none
PASS  every sideways-scrollable code block at 390px is focusable — [{"tag":"PRE","tabindex":"0",…}]
PASS  no console errors — none
```

### axe-core, scoped to this PR's markup

The PR-05 toolchain (`@axe-core/playwright` from `site/05-quality`) run against
this branch, with `include('main > section:first-of-type')` (hero) and
`include('#quickstart')`:

```
light/hero: violations=0 passes=8 incomplete=1
light/quickstart: violations=0 passes=24 incomplete=1
dark/hero: violations=0 passes=8 incomplete=1
dark/quickstart: violations=0 passes=24 incomplete=1
AXE: 0 violations in the PR-02 contexts
```

The first run of this audit found a real `serious` violation —
`scrollable-region-focusable` on the command `<pre>` — which is fixed in
`AgentSwitcher.astro` (`tabindex="0" role="group" aria-label`), and the self-test
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

Recipe (the `capture.mjs` receipt is `docs/evidence/captures/pr-02-hero-quickstart.json`):

```bash
cd website && npm run build
node scripts/capture.mjs --label pr-02-hero-quickstart
```

The hero and switcher crops are the only images not produced by `capture.mjs`;
they were taken with `viewport 1440×900, deviceScaleFactor 2` (same shape as
`before-home-hero.jpg`) plus `locator('[data-agent-switcher]').screenshot()` over
a preview of this branch.

Page height moved from 5997 px to 7182 px on the light desktop home page: the
hero is shorter, the quick start is taller (three stacked steps + a
three-route panel).

## Known gaps (found, deliberately not fixed here)

1. **`lang-zh` / `lang-en` rules are not in `global.css`.** No rule switches the
   pairs today (`html[data-lang]` is set by the navbar script, but nothing reads
   it), so this PR ships a scoped twin of the rule inside each of its three
   components. The duplication should move into `global.css` (or a shared
   component) once the base PR owns it; deleting the three scoped blocks is a
   two-line change per file.
2. **`text-accent-ink` does not exist in this worktree's `tailwind.config.mjs`**
   (PR-05 adds it). To satisfy "never put `text-white` on an accent fill", this
   PR simply uses no accent-filled buttons: the hero primary CTA is
   `bg-ink text-paper` (≈15:1 in both themes) and the secondary is an outline.
   If the token lands first, the primary could become an accent fill.
3. **`--ink-dim` fails 4.5:1 in both themes** (light `#929a9e` on paper ≈2.5:1,
   dark `#6e7880` ≈4.2:1). It is not used for text in these components; the base
   palette should either darken/lighten it or restrict it to decoration.
4. **Accent and semantic tokens are tuned for paper, not for `plate`.** On the
   dark plate panel, light-theme `--accent-soft` is ≈3.6:1 and `--ok` ≈3.4:1, so
   plate content uses only `text-plate-ink` (≈14:1) with `/70` (≈8:1) and `/60`
   (≈6:1) shades; the `/50` shade (≈4.7:1) is used only on `aria-hidden`
   decorative glyphs. A future PR could add plate-specific semantic tokens.
5. **`pi` has no `skillsCliId` yet `skillsCliCommand('pi')` still emits
   `--agent pi`.** The switcher surfaces this as an "unconfirmed target" warning
   rather than hiding it; the data fix belongs to `website/src/data/agents.ts`
   (out of scope here).
6. **`scripts/capture.mjs` can silently capture the wrong build.** Its
   `startPreview()` resolves as soon as stdout contains the port string, which
   also matches `Port 4321 is in use, trying another one…`; with parallel
   worktrees running previews on the default port the script then captures
   whatever else is listening on 4321. Observed three times while producing this
   evidence (two `ERR_CONNECTION_REFUSED` runs and one crop taken from a peer's
   server, which was discarded). Workaround used: confirm `lsof -iTCP:4321` is
   empty, run the capture, then verify the receipt's page heights and a
   screenshot against this branch. Suggested fix for a tooling PR: parse the
   `Local  http://…` line, or fail when the port is busy.

## Not verified

* Clipboard behaviour in Firefox/Safari — only Chromium was exercised (headless
  Chrome, permissions granted), plus a synthetic context with
  `navigator.clipboard` removed to hit the selection fallback. A real
  insecure-context (plain `http://` on a LAN address) was **not** tested.
* Screen-reader announcement — the `role="status" aria-live="polite"` region and
  its text were asserted in the DOM, but no screen reader was run.
* Keyboard walkthrough of the whole page — the tablist's Arrow/Home/End and the
  natural tab order of the buttons/links were exercised; a full manual
  tab-through (including the untouched navbar and gallery) was not.
* axe `incomplete` colour-contrast nodes (the alpha-blended `aria-hidden`
  glyphs) were not reviewed by a human.
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
| *(this commit)* | `docs(site): add PR-02 evidence, captures and rollback notes` |

Each commit builds on its own (see the table above); nothing is pushed and no
other branch is touched.

## Rollback

* Per-commit: `git revert <sha>` — each commit is self-contained and the branch
  builds at every step, so any single one can be reverted alone (reverting
  `4c89375` restores the previous quick start while keeping the hero).
* Whole PR: `git checkout 688ec35` restores the branch tip before this work
  (`docs(site): record baseline captures and the refactor evidence log`), or
  `git branch -f site/02-hero-quickstart 688ec35` to move the branch back.
* Nothing outside the three components is affected, so reverting restores the
  previous hero, the previous three-method quick start and removes
  `AgentSwitcher.astro`; `data/*`, the tokens and every other component are
  untouched by this PR.
