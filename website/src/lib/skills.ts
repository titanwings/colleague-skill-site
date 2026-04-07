import type { SkillMeta } from '../types/skill';

// Use Astro's glob import for YAML files
// This is called at build time

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
      skills.push(raw);
    }
  }

  // Sort by created_at desc
  skills.sort((a, b) => b.created_at.localeCompare(a.created_at));
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
