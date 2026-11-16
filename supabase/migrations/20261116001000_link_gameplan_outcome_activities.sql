alter table public.activities
  add column gameplan_target_id uuid references public.crm_gameplan_targets(id) on delete set null;

create index activities_gameplan_target_id_idx
  on public.activities (gameplan_target_id)
  where gameplan_target_id is not null;
