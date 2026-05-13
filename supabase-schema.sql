-- Run this entire file in the Supabase SQL Editor (once, when setting up the project)

-- Rooms table
create table if not exists public.rooms (
  id          text        primary key,
  status      text        not null default 'waiting',  -- waiting | active | revealed
  word_a      jsonb,
  word_b      jsonb,
  timer_end   timestamptz,
  timer_duration integer  not null default 180,
  round       integer     not null default 1,
  created_at  timestamptz default now()
);

-- Players table
create table if not exists public.players (
  id          uuid        primary key default gen_random_uuid(),
  room_id     text        not null references public.rooms(id) on delete cascade,
  name        text        not null,
  joined_at   timestamptz default now()
);

-- Submissions table
create table if not exists public.submissions (
  id           uuid        primary key default gen_random_uuid(),
  room_id      text        not null,
  player_id    uuid        not null,
  player_name  text        not null,
  chain        jsonb       not null default '[]',
  chain_length integer     not null default 0,
  round        integer     not null default 1,
  submitted_at timestamptz default now(),
  unique(room_id, player_id, round)
);

-- Row Level Security (permissive — no student accounts needed)
alter table public.rooms       enable row level security;
alter table public.players     enable row level security;
alter table public.submissions enable row level security;

create policy "rooms_all"       on public.rooms       for all using (true) with check (true);
create policy "players_all"     on public.players     for all using (true) with check (true);
create policy "submissions_all" on public.submissions for all using (true) with check (true);

-- Enable Realtime for all three tables
alter publication supabase_realtime add table public.rooms;
alter publication supabase_realtime add table public.players;
alter publication supabase_realtime add table public.submissions;
