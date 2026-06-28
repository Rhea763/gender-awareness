-- Pre/post Likert survey (scheme A) for index.html
-- Run in Supabase Dashboard → SQL Editor after the first migration

alter table public.research_responses
  alter column survey_answer drop not null;

alter table public.research_responses
  drop constraint if exists research_responses_survey_answer_check;

alter table public.research_responses
  add column if not exists studied_gender boolean,
  add column if not exists pre_q1 smallint check (pre_q1 between 1 and 5),
  add column if not exists pre_q2 smallint check (pre_q2 between 1 and 5),
  add column if not exists pre_q3 smallint check (pre_q3 between 1 and 5),
  add column if not exists pre_q4 smallint check (pre_q4 between 1 and 5),
  add column if not exists pre_q5 smallint check (pre_q5 between 1 and 5),
  add column if not exists post_q1 smallint check (post_q1 between 1 and 5),
  add column if not exists post_q2 smallint check (post_q2 between 1 and 5),
  add column if not exists post_q3 smallint check (post_q3 between 1 and 5),
  add column if not exists post_q4 smallint check (post_q4 between 1 and 5),
  add column if not exists post_q5 smallint check (post_q5 between 1 and 5);

comment on column public.research_responses.studied_gender is 'Pre-only: has studied gender-related courses';
comment on column public.research_responses.pre_q1 is 'Pre Likert Q1: same choice, different gender feedback is unfair';
comment on column public.research_responses.post_q1 is 'Post Likert Q1 (same wording as pre)';
