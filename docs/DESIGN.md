# Design system — paper & ink

The marketplace uses a paper-and-ink editorial visual language: warm paper
surfaces, near-black ink, **one** burnt-orange accent, and colour reserved for
meaning. Colour names are semantic; a page should not need to know whether it
is light or dark.

## Tokens

All colours are CSS variables holding an `R G B` triplet, consumed through
Tailwind as `rgb(var(--token) / <alpha-value>)`. That keeps opacity modifiers
(`bg-accent/12`) working while a single `[data-theme]` flip re-themes the site.

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `--paper` | `#eff2f1` | `#0f1216` | page background |
| `--paper-raised` | `#f8faf9` | `#161b21` | cards, popovers |
| `--paper-sunk` | `#e6eae9` | `#0b0d10` | wells, inputs, code headers |
| `--ink` | `#15181b` | `#ebf0f4` | body text |
| `--ink-soft` | `#363c41` | `#c8d0d6` | strong secondary text |
| `--ink-muted` | `#60686d` | `#96a0a8` | secondary text |
| `--ink-dim` | `#929a9e` | `#6e7880` | decorative only — never body text |
| `--line` | `#d6dddb` | `#2a3038` | hairlines, borders |
| `--accent` | `#c73e0c` | `#fb923c` | brand mark, links, fills |
| `--accent-ink` | `#ffffff` | `#15181b` | text **on** an accent fill |
| `--accent-soft` / `--accent-deep` | darker / darkest | lighter / mid | hover, borders |
| `--accent-wash` | `#fdf0ea` | `#29180c` | tinted backgrounds |
| `--plate` / `--plate-ink` / `--plate-line` | dark plate, always | dark plate, always | terminals, code blocks |
| `--ok` `--warn` `--info` `--violet` `--rose` | semantic | semantic | status, categories |

Legacy `brand-*` and `surface-*` utility names remain as aliases onto these
tokens so older markup re-skins automatically: `surface-100/50 → ink`,
`surface-200 → ink-soft`, `surface-300/400/500 → ink-muted`, `surface-600/700 → line`,
`surface-800 → paper-raised`, `surface-900 → paper`, `brand-400/500 → accent`.

**Rules**

1. Never hard-code a colour (`#rrggbb`, `rgba(...)`) in a component — use a token.
2. Use Tailwind's default palette classes (`text-purple-300`, `bg-amber-500/10`) only for
   the semantic tokens above (`text-violet`, `bg-warn/10`), never raw Tailwind colours.
3. Decorative tone (`ink-dim`) never carries body text.
4. Text on an accent fill uses `text-accent-ink`, not `text-white`.

## Typography

| Role | Family | Where |
| --- | --- | --- |
| Display | Fraunces → `Songti SC`/`Georgia` | page and section headlines, numerals |
| UI | Space Grotesk → system sans | labels, buttons, nav, meta |
| Body | Inter → system sans → `PingFang SC`/`Microsoft YaHei` | paragraphs |
| Mono | JetBrains Mono → `ui-monospace` | commands, code, counters |

Section headers follow one shape: a small uppercase `.section-label`
(`Agent Skill · Open Standard`), a Fraunces headline, one short paragraph of
supporting text. Chinese and English are written as sibling elements
(`.lang-zh` / `.lang-en`) rather than translated at runtime.

## Themes and language

- Theme: `<html data-theme="auto|light|dark">`. `auto` follows
  `prefers-color-scheme`. A pre-paint inline script applies the stored choice, and
  `window.__setTheme(t)` / `window.__getTheme()` drive the navbar toggle.
- Language: `<html data-lang="zh|en">` toggles which of the paired `.lang-zh` /
  `.lang-en` elements is visible; the choice is persisted and applied before first
  paint.
- Both switches are keyboard reachable and announce state via `aria-label` /
  `aria-pressed`.

## Components

`.btn-primary` (accent fill), `.btn-secondary` (hairline), `.card-base` +
`.card-hover`, `.tag-pill` / `.tag-pill-brand`, `.code-block` / `.terminal-window`
(the `plate` family), `.section-label` / `.section-heading` / `.section-sub`,
`.hairline`, `.reveal` / `.stagger-children` (scroll-in motion, disabled under
`prefers-reduced-motion`).

## Accessibility baseline

- `:focus-visible` ring on every interactive element; no `outline: none` without a replacement.
- WCAG AA contrast in both themes (verified by `npm run check:a11y`); accent and
  legacy-alias values were tuned specifically to clear 4.5:1 for body text and
  white-on-accent fills.
- Motion respects `prefers-reduced-motion`; colour is never the only signal.
- One `h1` per page and no skipped heading levels.

## Adding a section

1. Pick tokens, not colours; compose existing component classes first.
2. Write both languages as sibling elements.
3. Check light + dark, 1440 px and 390 px.
4. `npm run check` and `npm run capture`, then add a section to
   [`REFACTOR-EVIDENCE.md`](REFACTOR-EVIDENCE.md) with the before/after images.
