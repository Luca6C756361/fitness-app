-- Aggiunge il flag esplicito di completamento onboarding (decisione 1 di
-- ONBOARDING_TASK.md): un booleano ispezionabile dal DB, non un'euristica
-- sui valori di profiles.

alter table public.profiles
  add column if not exists onboarding_completed boolean not null default false;

-- Backfill: chi ha già un profilo compilato non deve rifare l'onboarding.
update public.profiles
  set onboarding_completed = true
  where name is not null and age is not null and height is not null;
