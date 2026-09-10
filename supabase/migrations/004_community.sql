-- PromptVault 2.0: Profiles, Bookmarks, Collections, Reports
-- Run this AFTER 003_seed_prompts_v2.sql

-- PROFILES TABLE
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  display_name text,
  bio text,
  avatar_url text,
  website_url text,
  prompt_count integer not null default 0,
  total_saves integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Create index on username
create index if not exists idx_profiles_username on profiles(username);

-- BOOKMARKS TABLE
create table if not exists bookmarks (
  user_id uuid references auth.users(id) on delete cascade,
  prompt_id uuid references prompts(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, prompt_id)
);

-- COLLECTIONS TABLE
create table if not exists collections (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  slug text not null,
  description text,
  is_public boolean not null default true,
  prompt_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, slug)
);

-- COLLECTION PROMPTS (junction)
create table if not exists collection_prompts (
  collection_id uuid references collections(id) on delete cascade,
  prompt_id uuid references prompts(id) on delete cascade,
  added_at timestamptz not null default now(),
  primary key (collection_id, prompt_id)
);

-- REPORTS TABLE
create table if not exists prompt_reports (
  id uuid primary key default uuid_generate_v4(),
  prompt_id uuid references prompts(id) on delete cascade,
  reporter_id uuid references auth.users(id) on delete set null,
  reason text not null check (reason in ('spam', 'copyright', 'unsafe', 'duplicate', 'low_quality', 'other')),
  details text,
  status text not null default 'open' check (status in ('open', 'reviewed', 'dismissed')),
  created_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_bookmarks_user on bookmarks(user_id);
create index if not exists idx_bookmarks_prompt on bookmarks(prompt_id);
create index if not exists idx_collections_user on collections(user_id);
create index if not exists idx_collections_slug on collections(slug);
create index if not exists idx_collection_prompts_collection on collection_prompts(collection_id);
create index if not exists idx_prompt_reports_prompt on prompt_reports(prompt_id);
create index if not exists idx_prompt_reports_status on prompt_reports(status);

-- Function to sync saves_count
create or replace function sync_saves_count()
returns trigger as $$
begin
  if (tg_op = 'INSERT') then
    update prompts set saves_count = saves_count + 1 where id = new.prompt_id;
    return new;
  elsif (tg_op = 'DELETE') then
    update prompts set saves_count = greatest(saves_count - 1, 0) where id = old.prompt_id;
    return old;
  end if;
end;
$$ language plpgsql;

-- Trigger for saves_count sync
drop trigger if exists bookmarks_sync_count on bookmarks;
create trigger bookmarks_sync_count
  after insert or delete on bookmarks
  for each row execute function sync_saves_count();

-- Function to sync collection prompt count
create or replace function sync_collection_prompt_count()
returns trigger as $$
begin
  if (tg_op = 'INSERT') then
    update collections set prompt_count = prompt_count + 1 where id = new.collection_id;
    return new;
  elsif (tg_op = 'DELETE') then
    update collections set prompt_count = greatest(prompt_count - 1, 0) where id = old.collection_id;
    return old;
  end if;
end;
$$ language plpgsql;

-- Trigger for collection prompt count
drop trigger if exists collection_prompts_sync_count on collection_prompts;
create trigger collection_prompts_sync_count
  after insert or delete on collection_prompts
  for each row execute function sync_collection_prompt_count();

-- RLS Policies
alter table profiles enable row level security;
alter table bookmarks enable row level security;
alter table collections enable row level security;
alter table collection_prompts enable row level security;
alter table prompt_reports enable row level security;

-- Profiles: anyone can read
create policy "Profiles are viewable"
  on profiles for select using (true);

-- Profiles: owner can update
create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

-- Profiles: owner can insert
create policy "Users can insert own profile"
  on profiles for insert with check (auth.uid() = id);

-- Bookmarks: owner can manage
create policy "Users can manage own bookmarks"
  on bookmarks for all using (auth.uid() = user_id);

-- Bookmarks: anyone can read (for count)
create policy "Bookmarks are viewable"
  on bookmarks for select using (true);

-- Collections: public can read
create policy "Public collections are viewable"
  on collections for select using (is_public = true OR auth.uid() = user_id);

-- Collections: owner can manage
create policy "Users can manage own collections"
  on collections for all using (auth.uid() = user_id);

-- Collection prompts: owner can manage
create policy "Users can manage own collection prompts"
  on collection_prompts for all using (
    auth.uid() = (select user_id from collections where id = collection_id)
  );

-- Reports: anyone can insert (anonymous allowed)
create policy "Anyone can create reports"
  on prompt_reports for insert with check (true);

-- Reports: admin can manage
create policy "Admin can manage reports"
  on prompt_reports for all using (
    is_admin(auth.uid())
  );

-- Enable realtime
alter publication supabase_realtime add table profiles;
alter publication supabase_realtime add table bookmarks;
alter publication supabase_realtime add table collections;
alter publication supabase_realtime add table collection_prompts;
alter publication supabase_realtime add table prompt_reports;

-- Create usernames from existing authors
insert into profiles (id, username, display_name)
select distinct author_id, lower(regexp_replace(author_name, '[^a-zA-Z0-9]', '', 'g')), author_name
from prompts
where author_id is not null
on conflict (id) do nothing;
