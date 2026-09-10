-- PromptVault 2.0: Analytics + Final Schema
-- Run this AFTER 004_community.sql

-- ANALYTICS TABLE (daily aggregated stats)
create table if not exists analytics_daily (
  id uuid primary key default uuid_generate_v4(),
  date date not null unique,
  total_prompts integer not null default 0,
  published_prompts integer not null default 0,
  total_copies integer not null default 0,
  total_saves integer not null default 0,
  total_views integer not null default 0,
  total_likes integer not null default 0,
  new_users integer not null default 0,
  created_at timestamptz not null default now()
);

-- PROMPT VIEWS TABLE (for analytics)
create table if not exists prompt_views (
  id uuid primary key default uuid_generate_v4(),
  prompt_id uuid references prompts(id) on delete cascade,
  viewer_id uuid references auth.users(id) on delete set null,
  ip_hash text,
  viewed_at timestamptz not null default now()
);

-- PROMPT COPIES TABLE (for analytics)
create table if not exists prompt_copies (
  id uuid primary key default uuid_generate_v4(),
  prompt_id uuid references prompts(id) on delete cascade,
  copier_id uuid references auth.users(id) on delete set null,
  copied_at timestamptz not null default now()
);

-- Indexes for analytics
create index if not exists idx_analytics_daily_date on analytics_daily(date);
create index if not exists idx_prompt_views_prompt on prompt_views(prompt_id);
create index if not exists idx_prompt_views_viewed_at on prompt_views(viewed_at);
create index if not exists idx_prompt_copies_prompt on prompt_copies(prompt_id);
create index if not exists idx_prompt_copies_copied_at on prompt_copies(copied_at);

-- RLS for analytics tables
alter table analytics_daily enable row level security;
alter table prompt_views enable row level security;
alter table prompt_copies enable row level security;

-- Analytics: anyone can read
create policy "Analytics are viewable"
  on analytics_daily for select using (true);

-- Analytics: admin can manage
create policy "Admin can manage analytics"
  on analytics_daily for all using (is_admin(auth.uid()));

-- Prompt views: anyone can insert
create policy "Anyone can track views"
  on prompt_views for insert with check (true);

-- Prompt views: anyone can read
create policy "Prompt views are viewable"
  on prompt_views for select using (true);

-- Prompt copies: anyone can insert
create policy "Anyone can track copies"
  on prompt_copies for insert with check (true);

-- Prompt copies: anyone can read
create policy "Prompt copies are viewable"
  on prompt_copies for select using (true);

-- Function to increment views_count atomically
create or replace function increment_views(prompt_uuid uuid)
returns void as $$
begin
  update prompts set views_count = views_count + 1 where id = prompt_uuid;
end;
$$ language plpgsql;

-- Function to increment copies_count atomically
create or replace function increment_copies(prompt_uuid uuid)
returns void as $$
begin
  update prompts set copies_count = copies_count + 1 where id = prompt_uuid;
end;
$$ language plpgsql;

-- Enable realtime
alter publication supabase_realtime add table analytics_daily;
alter publication supabase_realtime add table prompt_views;
alter publication supabase_realtime add table prompt_copies;

-- Insert initial analytics record
insert into analytics_daily (date, total_prompts, published_prompts, total_copies, total_saves, total_views, total_likes)
values (current_date, 0, 0, 0, 0, 0, 0)
on conflict (date) do nothing;
