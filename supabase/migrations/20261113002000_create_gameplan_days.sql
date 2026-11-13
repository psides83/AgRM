create table public.crm_gameplans (
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  plan_date date not null,
  primary key (owner_id, plan_date)
);

insert into public.crm_gameplans (owner_id, plan_date)
select distinct owner_id, plan_date from public.crm_gameplan_targets;

alter table public.crm_gameplans enable row level security;
revoke all on public.crm_gameplans from anon, authenticated;
grant select, insert on public.crm_gameplans to authenticated;

create policy "Read own gameplans" on public.crm_gameplans
  for select to authenticated using (owner_id = (select auth.uid()));
create policy "Create own gameplans" on public.crm_gameplans
  for insert to authenticated with check (owner_id = (select auth.uid()));

alter table public.crm_gameplan_targets add constraint crm_gameplan_target_day
  foreign key (owner_id, plan_date) references public.crm_gameplans (owner_id, plan_date) on delete cascade;
