-- PromptVault 2.0: Categories + Tags System
-- Run this AFTER 001_init.sql

-- CATEGORIES table
create table if not exists categories (
  id uuid primary key default uuid_generate_v4(),
  name text unique not null,
  slug text unique not null,
  description text,
  icon text,
  parent_id uuid references categories(id) on delete set null,
  count integer not null default 0,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- Junction table: prompts <-> categories
create table if not exists prompt_categories (
  prompt_id uuid references prompts(id) on delete cascade,
  category_id uuid references categories(id) on delete cascade,
  primary key (prompt_id, category_id)
);

-- Junction table: prompts <-> tags (normalized)
create table if not exists prompt_tags (
  prompt_id uuid references prompts(id) on delete cascade,
  tag_id uuid references tags(id) on delete cascade,
  primary key (prompt_id, tag_id)
);

-- Indexes
create index if not exists idx_categories_parent on categories(parent_id);
create index if not exists idx_categories_slug on categories(slug);
create index if not exists idx_prompt_categories_prompt on prompt_categories(prompt_id);
create index if not exists idx_prompt_categories_category on prompt_categories(category_id);
create index if not exists idx_prompt_tags_prompt on prompt_tags(prompt_id);
create index if not exists idx_prompt_tags_tag on prompt_tags(tag_id);
create index if not exists idx_tags_slug on tags(slug);

-- Function to sync category count
create or replace function sync_category_count()
returns trigger as $$
begin
  if (tg_op = 'INSERT') then
    update categories set count = count + 1 where id = new.category_id;
    return new;
  elsif (tg_op = 'DELETE') then
    update categories set count = greatest(count - 1, 0) where id = old.category_id;
    return old;
  end if;
end;
$$ language plpgsql;

-- Trigger for category count sync
drop trigger if exists prompt_categories_sync_count on prompt_categories;
create trigger prompt_categories_sync_count
  after insert or delete on prompt_categories
  for each row execute function sync_category_count();

-- Function to sync tag count
create or replace function sync_tag_count()
returns trigger as $$
begin
  if (tg_op = 'INSERT') then
    update tags set count = count + 1 where id = new.tag_id;
    return new;
  elsif (tg_op = 'DELETE') then
    update tags set count = greatest(count - 1, 0) where id = old.tag_id;
    return old;
  end if;
end;
$$ language plpgsql;

-- Trigger for tag count sync
drop trigger if exists prompt_tags_sync_count on prompt_tags;
create trigger prompt_tags_sync_count
  after insert or delete on prompt_tags
  for each row execute function sync_tag_count();

-- RLS Policies
alter table categories enable row level security;
alter table prompt_categories enable row level security;
alter table prompt_tags enable row level security;

-- Categories: anyone can read
create policy "Categories are viewable"
  on categories for select using (true);

-- Categories: admin can manage
create policy "Admin can manage categories"
  on categories for all using (
    is_admin(auth.uid())
  );

-- Prompt categories: anyone can read
create policy "Prompt categories are viewable"
  on prompt_categories for select using (true);

-- Prompt categories: admin can manage
create policy "Admin can manage prompt categories"
  on prompt_categories for all using (
    is_admin(auth.uid())
  );

-- Prompt tags: anyone can read
create policy "Prompt tags are viewable"
  on prompt_tags for select using (true);

-- Prompt tags: admin can manage
create policy "Admin can manage prompt tags"
  on prompt_tags for all using (
    is_admin(auth.uid())
  );

-- Seed categories (8 parent categories from prompts.chat)
insert into categories (name, slug, description, icon, sort_order) values
('Coding', 'coding', 'Prompts for software development, debugging, and code review', '💻', 1),
('Writing', 'writing', 'Content creation, copywriting, and storytelling prompts', '✍️', 2),
('Business', 'business', 'Business strategy, marketing, and sales prompts', '📈', 3),
('Creative', 'creative', 'Design, art, music, and creative expression', '🎨', 4),
('Education', 'education', 'Teaching, learning, and academic prompts', '📚', 5),
('Productivity', 'productivity', 'Time management, organization, and workflow prompts', '⚡', 6),
('Self Improvement', 'self-improvement', 'Personal growth, habits, and wellness prompts', '🧘', 7),
('Business Strategy', 'business-strategy', 'Strategic planning and decision-making prompts', '🎯', 8);

-- Seed subcategories
insert into categories (name, slug, description, icon, parent_id, sort_order) values
('Web Development', 'web-development', 'Frontend, backend, and full-stack prompts', '🌐', (select id from categories where slug = 'coding'), 1),
('Mobile Development', 'mobile-development', 'iOS and Android development prompts', '📱', (select id from categories where slug = 'coding'), 2),
('DevOps', 'devops', 'CI/CD, deployment, and infrastructure prompts', '🔧', (select id from categories where slug = 'coding'), 3),
('Data Science', 'data-science', 'Data analysis, ML, and AI prompts', '📊', (select id from categories where slug = 'coding'), 4),
('Blog Writing', 'blog-writing', 'Blog post and article generation prompts', '📝', (select id from categories where slug = 'writing'), 1),
('Copywriting', 'copywriting', 'Sales copy and marketing content prompts', '📢', (select id from categories where slug = 'writing'), 2),
('Technical Writing', 'technical-writing', 'Documentation and technical content prompts', '📖', (select id from categories where slug = 'writing'), 3),
('Marketing', 'marketing', 'Digital marketing and social media prompts', '📣', (select id from categories where slug = 'business'), 1),
('Sales', 'sales', 'Sales scripts and negotiation prompts', '💰', (select id from categories where slug = 'business'), 2),
('HR & Recruiting', 'hr-recruiting', 'Human resources and hiring prompts', '👥', (select id from categories where slug = 'business'), 3),
('Design', 'design', 'UI/UX and graphic design prompts', '🎨', (select id from categories where slug = 'creative'), 1),
('Video Generation', 'video-generation', 'Video creation and editing prompts', '🎬', (select id from categories where slug = 'creative'), 2),
('Image Generation', 'image-generation', 'AI image generation prompts', '🖼️', (select id from categories where slug = 'creative'), 3),
('Music', 'music', 'Music creation and audio prompts', '🎵', (select id from categories where slug = 'creative'), 4),
('Teaching & Instruction', 'teaching-instruction', 'Lesson plans and teaching prompts', '👩‍🏫', (select id from categories where slug = 'education'), 1),
('Tutoring & Homework Help', 'tutoring-homework', 'Student support and tutoring prompts', '📖', (select id from categories where slug = 'education'), 2),
('Exam Preparation', 'exam-prep', 'Test study and review prompts', '📝', (select id from categories where slug = 'education'), 3),
('Language Learning', 'language-learning', 'Language practice and grammar prompts', '🗣️', (select id from categories where slug = 'education'), 4),
('Time Management', 'time-management', 'Scheduling and productivity prompts', '⏰', (select id from categories where slug = 'productivity'), 1),
('Note Taking', 'note-taking', 'Note organization and summarization prompts', '📝', (select id from categories where slug = 'productivity'), 2),
('Email & Communication', 'email-communication', 'Professional communication prompts', '📧', (select id from categories where slug = 'productivity'), 3),
('Meeting & Collaboration', 'meeting-collaboration', 'Team meeting and collaboration prompts', '👥', (select id from categories where slug = 'productivity'), 4),
('Habits & Routines', 'habits-routines', 'Habit building and routine prompts', '🔄', (select id from categories where slug = 'self-improvement'), 1),
('Mindset & Motivation', 'mindset-motivation', 'Motivation and mindset shift prompts', '💪', (select id from categories where slug = 'self-improvement'), 2),
('Health & Wellness', 'health-wellness', 'Physical and mental health prompts', '🧘', (select id from categories where slug = 'self-improvement'), 3),
('Goal Setting', 'goal-setting', 'Goal planning and achievement prompts', '🎯', (select id from categories where slug = 'self-improvement'), 4),
('Business Planning', 'business-planning', 'Business plan and strategy prompts', '📋', (select id from categories where slug = 'business-strategy'), 1),
('Market Analysis', 'market-analysis', 'Market research and analysis prompts', '📊', (select id from categories where slug = 'business-strategy'), 2),
('Finance & Budgeting', 'finance-budgeting', 'Financial planning and budgeting prompts', '💰', (select id from categories where slug = 'business-strategy'), 3),
('Leadership & Management', 'leadership-management', 'Leadership and team management prompts', '👑', (select id from categories where slug = 'business-strategy'), 4),
('Startup & Entrepreneurship', 'startup-entrepreneurship', 'Startup and entrepreneurship prompts', '🚀', (select id from categories where slug = 'business-strategy'), 5);

-- Enable realtime
alter publication supabase_realtime add table categories;
alter publication supabase_realtime add table prompt_categories;
alter publication supabase_realtime add table prompt_tags;
