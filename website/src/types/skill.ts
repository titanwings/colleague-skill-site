export interface SkillAuthor {
  name: string;
  github: string;
}

export interface SkillMeta {
  name: string;
  slug: string;
  author: SkillAuthor;
  description: string;
  description_en?: string;
  tags: string[];
  personality?: string[];
  company_culture?: string;
  level?: string;
  level_en?: string;
  created_at: string;
  skill_repo?: string;
}
