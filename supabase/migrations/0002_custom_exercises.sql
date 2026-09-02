-- 2026-09-02 — Esercizi custom: tabella, indice di deduplica, RLS.
-- user_id NULL = esercizio globale di catalogo (immutabile da qualsiasi client
-- via RLS: nessuna policy di insert/update/delete ammette user_id IS NULL).
-- I 36 esercizi di app/today/_lib/exerciseData.ts NON vengono seedati qui:
-- restano nel file TypeScript, sono referenziati da defaultWeeklyPlan e non
-- devono dipendere dalla rete.

create table if not exists public.custom_exercises (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid references auth.users(id) on delete cascade,
  name              text not null check (char_length(trim(name)) between 2 and 60),
  primary_muscle    text not null check (primary_muscle in ('petto','schiena','spalle','bicipiti','tricipiti','quadricipiti','femorali','glutei','polpacci','core','cardio')),
  secondary_muscles text[] not null default '{}',
  equipment         text not null check (equipment in ('bilanciere','manubri','cavi','macchina','corpo-libero','kettlebell','elastici')),
  created_at        timestamptz not null default now()
);

-- user_id NULL = esercizio globale. "nulls not distinct" richiede PG15+ (Supabase è PG15+).
create unique index if not exists custom_exercises_user_name_uniq
  on public.custom_exercises (user_id, lower(trim(name))) nulls not distinct;

create index if not exists custom_exercises_user_idx on public.custom_exercises (user_id);

alter table public.custom_exercises enable row level security;

-- Lettura: i miei + quelli globali (user_id IS NULL)
create policy "custom_exercises_select" on public.custom_exercises
  for select using (user_id is null or auth.uid() = user_id);

-- Scrittura: solo i miei. Le righe globali diventano così IMMUTABILI da qualsiasi client.
create policy "custom_exercises_insert" on public.custom_exercises
  for insert with check (auth.uid() = user_id);
create policy "custom_exercises_update" on public.custom_exercises
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "custom_exercises_delete" on public.custom_exercises
  for delete using (auth.uid() = user_id);

-- rollback: drop table public.custom_exercises cascade;
