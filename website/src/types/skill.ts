export interface SkillAuthor {
  name: string;
  github: string;
}

export interface SkillMeta {
  name: string;
  slug: string;
  author: SkillAuthor;
  description: string;
  tags: string[];
  personality?: string[];
  company_culture?: string;
  level?: string;
  created_at: string;
  skill_repo?: string;
}
