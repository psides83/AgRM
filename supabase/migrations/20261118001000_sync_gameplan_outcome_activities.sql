-- Keep the outcome and the body of its logged activities in sync regardless
-- of which CRM screen performs the edit. Distinct checks stop trigger loops.
create function public.sync_gameplan_outcome_to_activities()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  update public.activities
  set body = new.outcome
  where gameplan_target_id = new.id
    and owner_id = new.owner_id
    and body is distinct from new.outcome;
  return new;
end;
$$;

create trigger sync_gameplan_outcome_to_activities
after update of outcome on public.crm_gameplan_targets
for each row when (old.outcome is distinct from new.outcome)
execute function public.sync_gameplan_outcome_to_activities();

create function public.sync_activity_to_gameplan_outcome()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  update public.crm_gameplan_targets
  set outcome = coalesce(new.body, '')
  where id = new.gameplan_target_id
    and owner_id = new.owner_id
    and outcome is distinct from coalesce(new.body, '');
  return new;
end;
$$;

create trigger sync_activity_to_gameplan_outcome
after update of body on public.activities
for each row when (new.gameplan_target_id is not null and old.body is distinct from new.body)
execute function public.sync_activity_to_gameplan_outcome();

revoke execute on function public.sync_gameplan_outcome_to_activities() from public;
revoke execute on function public.sync_activity_to_gameplan_outcome() from public;
