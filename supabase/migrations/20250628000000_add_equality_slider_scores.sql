-- Gender equality slider (0 = inequality, 100 = equality), pre/post surveys
alter table public.research_responses
  add column if not exists pre_equality_score smallint check (pre_equality_score is null or pre_equality_score between 0 and 100),
  add column if not exists post_equality_score smallint check (post_equality_score is null or post_equality_score between 0 and 100);

comment on column public.research_responses.pre_equality_score is 'Pre survey: perceived gender equality 0-100 (left=inequality, right=equality)';
comment on column public.research_responses.post_equality_score is 'Post survey: same slider, after experience';
