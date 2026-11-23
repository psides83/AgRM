-- Keep target IDs, order, outcomes, and activity references when a plan moves.
alter table public.crm_gameplan_targets drop constraint crm_gameplan_target_day;
alter table public.crm_gameplan_targets add constraint crm_gameplan_target_day
  foreign key (owner_id, plan_date) references public.crm_gameplans (owner_id, plan_date)
  on update cascade on delete cascade;

grant update (plan_date) on public.crm_gameplans to authenticated;
create policy "Reschedule own gameplans" on public.crm_gameplans
  for update to authenticated using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

create function public.reschedule_crm_gameplan(source_date date, destination_date date)
returns void language plpgsql security invoker set search_path = '' as $$
begin
  if source_date is null or destination_date is null or source_date = destination_date then
    raise exception 'Choose a different date for this gameplan.';
  end if;

  update public.crm_gameplans set plan_date = destination_date
  where owner_id = (select auth.uid()) and plan_date = source_date;
  if not found then
    raise exception 'This gameplan is no longer available. Refresh and try again.';
  end if;
exception when unique_violation then
  raise exception 'A gameplan already exists on that date. Choose another date.';
end;
$$;
revoke execute on function public.reschedule_crm_gameplan(date, date) from public;
grant execute on function public.reschedule_crm_gameplan(date, date) to authenticated;
