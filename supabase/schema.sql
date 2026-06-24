-- Supabase SQL Editor で実行してください

create table if not exists user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  notify_minutes integer not null default 15,
  updated_at timestamptz default now()
);

create table if not exists event_memos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  google_event_id text not null,
  memo text default '',
  color text not null default 'gray',
  updated_at timestamptz default now(),
  unique (user_id, google_event_id)
);

alter table user_settings enable row level security;
alter table event_memos enable row level security;

create policy "Users manage own settings"
  on user_settings for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage own memos"
  on event_memos for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
