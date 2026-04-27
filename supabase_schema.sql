-- ================================================================
-- FitTracker – Supabase Schema
-- Run this entire script in: Supabase Dashboard → SQL Editor
-- All tables use the "fit_" prefix to avoid conflicts with other apps
-- ================================================================

-- ── 1. Gym Logs ──────────────────────────────────────────────────
create table if not exists public.fit_gym_logs (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        references auth.users(id) on delete cascade not null,
  date        text        not null,
  exercise    text        not null,
  muscle      text,
  type        text,
  sets        integer,
  reps        integer,
  weight      numeric(8,2),
  is_success  boolean     default true,
  rir         integer,
  volume      numeric(10,2),
  notes       text,
  created_at  timestamptz default now()
);

alter table public.fit_gym_logs enable row level security;

create policy "Users manage own gym logs"
  on public.fit_gym_logs for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── 2. Run Logs ──────────────────────────────────────────────────
create table if not exists public.fit_run_logs (
  id            uuid        primary key default gen_random_uuid(),
  user_id       uuid        references auth.users(id) on delete cascade not null,
  date          text        not null,
  distance      numeric(8,2),
  duration      text,
  duration_secs integer,
  notes         text,
  created_at    timestamptz default now()
);

alter table public.fit_run_logs enable row level security;

create policy "Users manage own run logs"
  on public.fit_run_logs for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── 3. Exercise Library ──────────────────────────────────────────
create table if not exists public.fit_exercises (
  id          text        primary key,
  user_id     uuid        references auth.users(id) on delete cascade not null,
  name        text        not null,
  muscle      text,
  type        text,
  equipment   text,
  created_at  timestamptz default now()
);

alter table public.fit_exercises enable row level security;

create policy "Users manage own exercises"
  on public.fit_exercises for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── 4. Training Schedule / Calendar ─────────────────────────────
create table if not exists public.fit_schedule (
  id                   text        primary key,
  user_id              uuid        references auth.users(id) on delete cascade not null,
  date                 text        not null,
  type                 text,                        -- 'gym' | 'run' | 'rest'
  exercises            jsonb       not null default '[]',
  completed            boolean     default false,
  completed_exercises  jsonb       not null default '[]',
  notes                text,
  program_name         text,
  created_at           timestamptz default now()
);

alter table public.fit_schedule enable row level security;

create policy "Users manage own schedule"
  on public.fit_schedule for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ================================================================
-- Done! All 4 tables created with Row Level Security enabled.
-- Each table is scoped to the authenticated user only.
-- ================================================================
