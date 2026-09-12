/**
 * Distilly marketplace design tokens.
 *
 * The palette is a paper-and-ink system: warm paper surfaces, near-black
 * ink, a single burnt-orange accent, and colour used only for semantics.
 *
 * Every colour is a CSS variable holding an `R G B` triplet, so a single
 * `[data-theme]` flip re-themes the whole site *and* opacity modifiers such as
 * `bg-accent/15` keep working. Legacy `brand-*` / `surface-*` names are kept as
 * aliases so existing components re-skin without a rewrite.
 *
 * @type {import('tailwindcss').Config}
 */
const rgb = (name) => `rgb(var(${name}) / <alpha-value>)`;

export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // --- semantic layer (new code should use these) ---
        paper: {
          DEFAULT: rgb('--paper'),
          raised: rgb('--paper-raised'),
          sunk: rgb('--paper-sunk'),
        },
        ink: {
          DEFAULT: rgb('--ink'),
          soft: rgb('--ink-soft'),
          muted: rgb('--ink-muted'),
          dim: rgb('--ink-dim'),
        },
        accent: {
          DEFAULT: rgb('--accent'),
          soft: rgb('--accent-soft'),
          deep: rgb('--accent-deep'),
          wash: rgb('--accent-wash'),
        },
        line: rgb('--line'),
        plate: {
          DEFAULT: rgb('--plate'),
          ink: rgb('--plate-ink'),
          line: rgb('--plate-line'),
        },
        ok: rgb('--ok'),
        warn: rgb('--warn'),
        info: rgb('--info'),
        violet: rgb('--violet'),
        rose: rgb('--rose'),

        // --- legacy aliases (kept so old markup re-skins automatically) ---
        brand: {
          50: rgb('--accent-wash'),
          100: rgb('--accent-wash'),
          200: rgb('--accent-wash'),
          300: rgb('--accent'),
          400: rgb('--accent'),
          500: rgb('--accent'),
          600: rgb('--accent-soft'),
          700: rgb('--accent-deep'),
          800: rgb('--accent-deep'),
          900: rgb('--accent-deep'),
        },
        surface: {
          50: rgb('--ink'),
          100: rgb('--ink'),
          200: rgb('--ink-soft'),
          300: rgb('--ink-muted'),
          400: rgb('--ink-muted'),
          500: rgb('--ink-dim'),
          600: rgb('--line'),
          700: rgb('--line'),
          800: rgb('--paper-raised'),
          900: rgb('--paper'),
        },
      },
      fontFamily: {
        display: ['Fraunces', 'Songti SC', 'STSong', 'Georgia', 'serif'],
        grotesk: ['"Space Grotesk"', 'Inter', '-apple-system', 'BlinkMacSystemFont', '"PingFang SC"', '"Hiragino Sans GB"', '"Microsoft YaHei"', 'sans-serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', '"PingFang SC"', '"Microsoft YaHei"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      borderRadius: {
        card: '14px',
        pill: '999px',
      },
      boxShadow: {
        card: '0 1px 2px rgb(var(--shadow) / 0.06), 0 8px 24px -16px rgb(var(--shadow) / 0.18)',
        'card-hover': '0 2px 6px rgb(var(--shadow) / 0.08), 0 18px 40px -20px rgb(var(--shadow) / 0.28)',
        plate: '0 20px 50px -30px rgb(var(--shadow) / 0.55)',
        // legacy names still referenced by components
        'glow-amber': '0 1px 2px rgb(var(--shadow) / 0.08), 0 12px 32px -18px rgb(var(--accent) / 0.45)',
        'glow-amber-lg': '0 2px 6px rgb(var(--shadow) / 0.1), 0 24px 60px -24px rgb(var(--accent) / 0.5)',
      },
      backgroundImage: {
        'grid-pattern': "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.025'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        'hero-gradient': 'radial-gradient(ellipse 80% 60% at 50% -10%, rgb(var(--accent) / 0.10) 0%, transparent 62%)',
        'card-glow': 'radial-gradient(ellipse at top, rgb(var(--accent) / 0.07) 0%, transparent 60%)',
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease forwards',
        'fade-in': 'fadeIn 0.4s ease forwards',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        'terminal-blink': 'blink 1s step-end infinite',
        float: 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgb(var(--accent) / 0.0)' },
          '50%': { boxShadow: '0 0 0 6px rgb(var(--accent) / 0.12)' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};
