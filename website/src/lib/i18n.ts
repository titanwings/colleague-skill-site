/**
 * Bilingual chrome — the language contract shared by the layout, the navbar
 * toggle and every component that renders a `lang-zh` / `lang-en` pair.
 *
 * How the mechanism works: both languages stay in the DOM and CSS decides which
 * one is visible (`.lang-en` is hidden unless `html[data-lang="en"]`). The
 * visibility rules live in `components/LangToggle.astro`; this module owns the
 * storage contract, the `<html lang>` mapping and the copy for the toggle.
 *
 * The first-paint bootstrap in `layouts/BaseLayout.astro` is an `is:inline`
 * script — it has to run before the bundle loads, so it cannot import from
 * here. `LANG_STORAGE_KEY`, `DEFAULT_LANG` and `LANG_TAG` are duplicated there
 * on purpose: change both places together.
 */

export const LANGS = ['zh', 'en'] as const;

export type Lang = (typeof LANGS)[number];

/** localStorage key holding the reader's language choice. */
export const LANG_STORAGE_KEY = 'dotskill-lang';

/** Chinese is the source language of the marketplace, so it is the default. */
export const DEFAULT_LANG: Lang = 'zh';

/** BCP-47 tag written to `<html lang>`. */
export const LANG_TAG: Record<Lang, string> = { zh: 'zh-CN', en: 'en' };

export function isLang(value: unknown): value is Lang {
  return value === 'zh' || value === 'en';
}

export function normalizeLang(value: unknown): Lang {
  return isLang(value) ? value : DEFAULT_LANG;
}

/** Short label of a language, written in that language. */
export const LANG_LABEL: Record<Lang, string> = { zh: '中文', en: 'EN' };

/**
 * Accessible name + tooltip for the toggle, describing the *action* (switch to
 * the other language) rather than the current state, which the visible
 * `中文 / EN` pair already shows.
 */
export const LANG_TOGGLE_COPY: Record<Lang, { label: string; title: string }> = {
  zh: {
    label: 'Switch to English / 切换到英文',
    title: 'Switch to English / 切换到英文',
  },
  en: {
    label: '切换到中文 / Switch to Chinese',
    title: '切换到中文 / Switch to Chinese',
  },
};

declare global {
  interface Window {
    /** Set by the BaseLayout bootstrap; persists the choice and re-tags <html>. */
    __setLang?: (lang: string) => Lang;
    /** Current `html[data-lang]` value, never undefined after boot. */
    __getLang?: () => Lang;
    /** Theme API from the BaseLayout bootstrap (auto | light | dark). */
    __setTheme?: (theme: string) => void;
    __getTheme?: () => string;
  }
}
