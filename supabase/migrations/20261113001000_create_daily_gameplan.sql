create table public.crm_gameplan_targets (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  plan_date date not null,
  lead_id uuid references public.leads(id) on delete cascade,
  contact_id uuid references public.contacts(id) on delete cascade,
  company_id uuid references public.companies(id) on delete cascade,
  position integer not null check (position >= 0),
  method text not null check (method in ('Visit', 'Call', 'Email', 'Other')),
  outcome text not null default '',
  check (num_nonnulls(lead_id, contact_id, company_id) = 1),
  unique nulls not distinct (owner_id, plan_date, lead_id, contact_id, company_id, method)
);

create index on public.crm_gameplan_targets (owner_id, plan_date, position, id);

alter table public.crm_gameplan_targets enable row level security;
revoke all on public.crm_gameplan_targets from anon, authenticated;
grant select, insert, update, delete on public.crm_gameplan_targets to authenticated;

create policy "Read own gameplan" on public.crm_gameplan_targets
  for select to authenticated using (owner_id = (select auth.uid()));
create policy "Remove own gameplan targets" on public.crm_gameplan_targets
  for delete to authenticated using (owner_id = (select auth.uid()));
create policy "Add visible targets to own gameplan" on public.crm_gameplan_targets
  for insert to authenticated with check (
    owner_id = (select auth.uid()) and (
      exists (select 1 from public.leads where id = lead_id) or
      exists (select 1 from public.contacts where id = contact_id) or
      exists (select 1 from public.companies where id = company_id)
    )
  );
create policy "Update own gameplan targets" on public.crm_gameplan_targets
  for update to authenticated using (owner_id = (select auth.uid()))
  with check (
    owner_id = (select auth.uid()) and (
      exists (select 1 from public.leads where id = lead_id) or
      exists (select 1 from public.contacts where id = contact_id) or
      exists (select 1 from public.companies where id = company_id)
    )
  );

create function public.reorder_crm_gameplan(target_date date, ordered_ids uuid[])
returns void language sql security invoker set search_path = '' as $$
  update public.crm_gameplan_targets as target
  set position = ordered.ordinality - 1
  from unnest(ordered_ids) with ordinality as ordered(id, ordinality)
  where target.id = ordered.id and target.plan_date = target_date
    and target.owner_id = (select auth.uid());
$$;
revoke execute on function public.reorder_crm_gameplan(date, uuid[]) from public;
grant execute on function public.reorder_crm_gameplan(date, uuid[]) to authenticated;
