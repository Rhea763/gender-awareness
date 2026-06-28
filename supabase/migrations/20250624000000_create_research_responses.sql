-- Research feedback from index.html (Random Identity experience)
-- Run once in Supabase Dashboard → SQL Editor

create table if not exists public.research_responses (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  choice smallint not null check (choice in (1, 2)),
  survey_answer text not null check (survey_answer in ('A', 'B', 'C')),
  open_text text,
  source text not null default 'index_experience'
);

comment on table public.research_responses is 'Post-play survey responses from the index.html dual-path experience.';
comment on column public.research_responses.choice is '1 = buy clothes, 2 = revise and rehearse';
comment on column public.research_responses.survey_answer is 'A = strange/unfair, B = normal, C = not sure';
comment on column public.research_responses.open_text is 'Optional open-ended response';
comment on column public.research_responses.source is 'Page or flow that submitted this row';

alter table public.research_responses enable row level security;

drop policy if exists "anon_can_insert_research_responses" on public.research_responses;

create policy "anon_can_insert_research_responses"
  on public.research_responses
  for insert
  to anon
  with check (true);
