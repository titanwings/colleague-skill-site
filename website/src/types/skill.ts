export interface ConversationTurn {
  role: 'user' | 'skill';
  content: string;
}

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
  preview_conversation?: ConversationTurn[];
  created_at: string;
  skill_repo?: string;
}
