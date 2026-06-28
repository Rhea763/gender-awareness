-- Game.html research fields (choice optional for full game flow)
alter table public.research_responses
  alter column choice drop not null;

alter table public.research_responses
  add column if not exists guide_meter_end smallint,
  add column if not exists autonomy_count smallint,
  add column if not exists female_career text,
  add column if not exists male_career text;

comment on column public.research_responses.guide_meter_end is 'Guide meter position (0-200) at end of game.html session';
comment on column public.research_responses.source is 'index_experience | game';
