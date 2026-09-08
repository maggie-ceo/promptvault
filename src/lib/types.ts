export type PromptType = 'prompt' | 'skill' | 'workflow';
export type PromptStatus = 'draft' | 'published';

export interface Prompt {
  id: string;
  title: string;
  content: string;
  type: PromptType;
  author_id: string | null;
  author_name: string;
  tags: string[];
  likes_count: number;
  copies_count: number;
  status: PromptStatus;
  license: string | null;
  created_at: string;
  updated_at: string;
}

export interface Vote {
  user_id: string;
  prompt_id: string;
  created_at: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  count: number;
  created_at: string;
}

export interface PromptFilters {
  type?: PromptType;
  tag?: string;
  search?: string;
  sort?: 'latest' | 'popular' | 'contributed';
  limit?: number;
  offset?: number;
}
