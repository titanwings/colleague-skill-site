import type { SkillMeta } from '../types/skill';
import starsData from '../data/github-stars.json';

// Use Astro's glob import for YAML files
// This is called at build time

const STARS_MAP = starsData as Record<string, { stars: number; synced_at: string }>;
const REPO_URL_RE = /^https?:\/\/github\.com\/([^/\s]+)\/([^/\s#?]+?)(?:\.git)?\/?$/i;

function repoKey(skillRepo: string | undefined): string | null {
  if (!skillRepo) return null;
  const m = skillRepo.match(REPO_URL_RE);
  return m ? `${m[1]}/${m[2]}` : null;
}

let _cache: SkillMeta[] | null = null;

export async function getAllSkills(): Promise<SkillMeta[]> {
  if (_cache) return _cache;

  // Astro glob — returns modules
  const modules = import.meta.glob('../content/skills/*.yaml', { eager: true });

  const skills: SkillMeta[] = [];
  for (const [path, mod] of Object.entries(modules)) {
    if (path.includes('_template')) continue;
    const raw = (mod as { default: SkillMeta }).default;
    if (raw && raw.slug && raw.name) {
      const key = repoKey(raw.skill_repo);
      const starEntry = key ? STARS_MAP[key] : undefined;
      if (starEntry) {
        raw.stars = starEntry.stars;
        raw.stars_synced_at = starEntry.synced_at;
      }
      skills.push(raw);
    }
  }

  // Pinned first, then by stars desc, then by created_at desc
  skills.sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    const sa = a.stars ?? 0;
    const sb = b.stars ?? 0;
    if (sa !== sb) return sb - sa;
    return b.created_at.localeCompare(a.created_at);
  });
  _cache = skills;
  return skills;
}

export async function getSkillBySlug(slug: string): Promise<SkillMeta | undefined> {
  const skills = await getAllSkills();
  return skills.find((s) => s.slug === slug);
}

export const ALL_TAGS = [
  'frontend', 'backend', 'security', 'devops',
  'data', 'design', 'product', 'hr', 'management', 'other',
] as const;

export const ALL_CULTURES = [
  '字节风', '阿里风', '腾讯风', '华为风', '创业风', '外企风', '国企风', '其他',
] as const;
