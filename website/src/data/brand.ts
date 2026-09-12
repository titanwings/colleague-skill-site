/**
 * Single source of truth for brand strings, links and counts.
 *
 * Renaming the marketplace is a one-line change here: `name` drives the navbar,
 * hero, meta tags and footer. `repo` is the canonical product repository
 * (`titanwings/distilly`, formerly `colleague-skill`).
 */
export const BRAND = {
  /** Marketplace wordmark shown in nav / hero / footer. */
  name: 'dot-skill',
  /** Upstream product the marketplace catalog belongs to. */
  product: 'Distilly',
  tagline: {
    zh: '人会离开，.skill 不会',
    en: 'People leave. Skills don’t.',
  },
  shortDescription: {
    zh: '把任何人的智慧蒸馏成随时可召唤的 AI Skill。',
    en: 'Distill anyone into an AI Skill you can summon anytime.',
  },
  description: {
    zh: '把任何人的智慧蒸馏成可调用的 AI Skill：同事、老师、伴侣，或一位你再也见不到的人。一份 SKILL.md，任何 Agent 都能加载。',
    en: 'Distill how someone thinks into a portable AI Skill — a colleague, a teacher, a partner, or someone you will never meet again. One SKILL.md any agent can load.',
  },
  repo: 'titanwings/distilly',
  repoUrl: 'https://github.com/titanwings/distilly',
  siteRepo: 'titanwings/colleague-skill-site',
  siteRepoUrl: 'https://github.com/titanwings/colleague-skill-site',
  discordUrl: 'https://discord.gg/NVX66RxWZv',
  agentskillsUrl: 'https://agentskills.io',
  submitUrl: 'https://github.com/titanwings/colleague-skill-site/issues/new?template=submit-skill.yml',
  /** Fallback when the star snapshot is stale; refreshed by `npm run fetch-stars`. */
  starsFallback: 10000,
  keywords: ['dot-skill', 'AI Skill', 'AgentSkills', 'skill distillation', 'Claude Code', 'Codex', 'DeepSeek Harness'],
} as const;

export type Brand = typeof BRAND;
