-- PromptVault Database Migration
-- Run this in Supabase SQL Editor

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";

-- PROMPTS table
create table if not exists prompts (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  content text not null default '',
  type text not null default 'prompt' check (type in ('prompt', 'skill', 'workflow')),
  author_id uuid references auth.users(id) on delete set null,
  author_name text not null default 'anonymous',
  tags text[] not null default '{}',
  likes_count integer not null default 0,
  copies_count integer not null default 0,
  status text not null default 'draft' check (status in ('draft', 'published', 'rejected')),
  license text,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  search_vector tsvector
);

-- VOTES table (likes)
create table if not exists votes (
  user_id uuid references auth.users(id) on delete cascade,
  prompt_id uuid references prompts(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, prompt_id)
);

-- TAGS table (normalized)
create table if not exists tags (
  id uuid primary key default uuid_generate_v4(),
  name text unique not null,
  slug text unique not null,
  count integer not null default 0,
  created_at timestamptz not null default now()
);

-- Indexes for performance
create index if not exists idx_prompts_type on prompts(type);
create index idx_prompts_status on prompts(status);
create index idx_prompts_created_at on prompts(created_at desc);
create index idx_prompts_likes on prompts(likes_count desc);
create index idx_prompts_tags on prompts using gin(tags);
create index idx_votes_prompt on votes(prompt_id);
create index idx_votes_user on votes(user_id);

-- Full-text search index on generated column
create index idx_prompts_search on prompts using gin(search_vector);

-- Function to update search_vector
create or replace function update_search_vector()
returns trigger as $$
begin
  new.search_vector := to_tsvector('english', new.title || ' ' || new.content || ' ' || array_to_string(new.tags, ' '));
  return new;
end;
$$ language plpgsql;

-- Function to update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger for updated_at
drop trigger if exists prompts_updated_at on prompts;
create trigger prompts_updated_at
  before update on prompts
  for each row execute function update_updated_at();

-- Trigger for search_vector (maintains full-text search)
drop trigger if exists prompts_search_vector on prompts;
create trigger prompts_search_vector
  before insert or update on prompts
  for each row execute function update_search_vector();

-- Function to sync likes_count
create or replace function sync_likes_count()
returns trigger as $$
begin
  if (tg_op = 'INSERT') then
    update prompts set likes_count = likes_count + 1 where id = new.prompt_id;
    return new;
  elsif (tg_op = 'DELETE') then
    update prompts set likes_count = greatest(likes_count - 1, 0) where id = old.prompt_id;
    return old;
  end if;
end;
$$ language plpgsql;

-- Trigger for likes_count sync
drop trigger if exists votes_sync_count on votes;
create trigger votes_sync_count
  after insert or delete on votes
  for each row execute function sync_likes_count();

-- RLS Policies
alter table prompts enable row level security;
alter table votes enable row level security;
alter table tags enable row level security;

-- Prompts: anyone can read published
create policy "Public prompts are viewable"
  on prompts for select using (status = 'published');

-- Prompts: authenticated users can insert (defaults to draft)
create policy "Authenticated users can insert prompts"
  on prompts for insert with check (auth.role() = 'authenticated' and status = 'draft');

-- Prompts: users can update/delete their own drafts
create policy "Users can update own prompts"
  on prompts for update using (auth.uid() = author_id and status = 'draft');

create policy "Users can delete own prompts"
  on prompts for delete using (auth.uid() = author_id);

-- Admin function to check if current user is admin
create or replace function is_admin(user_id uuid)
returns boolean as $$
  select user_id IN ('0781fbc7-d038-4f6a-bb70-076e97238d3a'::uuid, 'cbe6cd44-728c-4e85-920a-3ac759a2eb9e'::uuid);
$$ language sql stable;

-- Admin policy: admin can update any prompt (approve/reject)
create policy "Admin can approve or reject prompts"
  on prompts for update using (
    is_admin(auth.uid())
  );

-- Admin policy: admin can delete any prompt
create policy "Admin can delete any prompt"
  on prompts for delete using (
    is_admin(auth.uid())
  );

-- Admin policy: admin can view all prompts (including drafts)
create policy "Admin can view all prompts"
  on prompts for select using (
    is_admin(auth.uid())
  );

-- Votes: authenticated users can vote
create policy "Authenticated users can vote"
  on votes for insert with check (auth.role() = 'authenticated');

create policy "Users can delete own votes"
  on votes for delete using (auth.uid() = user_id);

create policy "Votes are viewable"
  on votes for select using (true);

-- Tags: anyone can read
create policy "Tags are viewable"
  on tags for select using (true);

-- Seed data (published directly since we're admin)
insert into prompts (title, content, type, author_name, tags, license, status) values
('Write an Email', 'Write a professional email to [recipient] about [subject]. The tone should be [formal/casual]. Keep it concise and actionable.', 'prompt', 'community', '{writing,email,communication}', 'MIT', 'published'),
('Code Review Assistant', 'Review the following code for: 1) Bugs and errors, 2) Performance issues, 3) Security vulnerabilities, 4) Code style and readability. Provide specific line-by-line feedback with suggested fixes.\n\n```\n[Paste code here]\n```', 'skill', 'community', '{coding,review,best-practices}', 'MIT', 'published'),
('SEO Blog Post Generator', 'Write a comprehensive, SEO-optimized blog post about [topic]. Include: 1) Engaging introduction, 2) 5-7 H2/H3 subheadings, 3) Bullet points and lists, 4) FAQ section, 5) Call-to-action conclusion. Target keyword: [keyword]. Word count: 1500-2000 words.', 'prompt', 'community', '{seo,writing,marketing,content}', 'MIT', 'published'),
('Karpathy Coding Guidelines', 'You are a senior software engineer. Follow these strict guidelines:\n\n1. **Simplicity First** - No overengineering. If it can be 50 lines, don''t write 200.\n2. **Surgical Changes** - Don''t fix what isn''t broken.\n3. **Think First** - State assumptions before coding.\n4. **Evidence-Based** - Every claim needs test/verification.\n5. **No Hallucination** - Never claim something works without testing.', 'skill', 'community', '{coding,guidelines,best-practices}', 'MIT', 'published'),
('Midjourney Photorealistic Portrait', 'Create a photorealistic portrait with these specifications:\n\n- Subject: [description]\n- Lighting: Soft natural window light, golden hour\n- Camera: 85mm lens, f/1.8 aperture\n- Style: Magazine editorial quality\n- Details: Sharp eyes, natural skin texture, no plastic look\n- Background: [bokeh/plain/outdoor]\n\n--ar 3:4 --style raw --s 250', 'prompt', 'community', '{image-generation,midjourney,photography}', 'CC0', 'published'),
('ChatGPT Data Analysis', 'Analyze this dataset and provide:\n\n1. **Summary Statistics** - Mean, median, std dev for numeric columns\n2. **Patterns & Trends** - What stands out?\n3. **Anomalies** - Any outliers or unexpected values?\n4. **Recommendations** - Actionable insights based on the data\n5. **Visualization Suggestions** - Best chart types for this data\n\nDataset:\n[Paste or describe data]', 'prompt', 'community', '{data-analysis,chatgpt,productivity}', 'MIT', 'published'),
('Viral Twitter Thread', 'Write a viral Twitter/X thread about [topic] that:\n\n- Hook: First tweet stops the scroll (bold claim, surprising stat, or contrarian take)\n- Body: 5-8 tweets delivering massive value (tips, frameworks, stories)\n- CTA: Final tweet drives engagement (follow, RT, or comment)\n- Rules: One idea per tweet, line breaks every 1-2 sentences, no jargon\n\nThread:', 'prompt', 'community', '{social-media,writing,marketing}', 'MIT', 'published'),
('React Component Generator', 'Generate a modern, accessible React component with:\n\n- TypeScript interfaces\n- Tailwind CSS styling\n- Responsive design\n- ARIA attributes for accessibility\n- Error loading states\n- Unit test template (React Testing Library)\n\nComponent: [name]\nFunctionality: [description]\nProps: [list of props]', 'skill', 'community', '{coding,react,typescript}', 'MIT', 'published'),
('Multi-Agent Workflow', 'You are orchestrating a multi-agent workflow:\n\n**Agent 1 - Planner**: Break the user request into specific, ordered subtasks.\n**Agent 2 - Executor**: Complete each subtask sequentially with real verification.\n**Agent 3 - Reviewer**: Check output quality, completeness, and correctness.\n\nRequest: [user request]\n\nExecute step-by-step. Each agent must verify before passing to next.', 'workflow', 'community', '{automation,agents,productivity}', 'MIT', 'published'),
('Business Strategy Framework', 'Act as a top-tier strategy consultant (McKinsey/Bain level). Analyze:\n\n1. **Current State**: What''s the real situation? (Strip assumptions)\n2. **Core Problem**: What ONE thing, if solved, changes everything?\n3. **3 Possible Approaches**: With tradeoffs for each\n4. **Recommended Path**: Clear next 30-60-90 day plan\n5. **Success Metrics**: How do we know it''s working?\n\nBusiness: [describe]', 'prompt', 'community', '{business,strategy,consulting}', 'MIT', 'published');

-- Enable realtime for prompts
alter publication supabase_realtime add table prompts;
