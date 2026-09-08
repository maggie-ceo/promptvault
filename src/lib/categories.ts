export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  parent_id: string | null;
  count: number;
  sort_order: number;
  created_at: string;
  children?: Category[];
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  count: number;
  created_at: string;
}
