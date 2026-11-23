-- Run with psql -v ON_ERROR_STOP=1 against a migrated local Supabase database.
begin;
insert into auth.users (id) values ('12000000-0000-0000-0000-000000000001'), ('12000000-0000-0000-0000-000000000002');
insert into public.contacts (id, owner_id, first_name, last_name)
values ('22000000-0000-0000-0000-000000000001', '12000000-0000-0000-0000-000000000001', 'Move', 'Test');
insert into public.crm_gameplans (owner_id, plan_date)
values ('12000000-0000-0000-0000-000000000002', '2099-02-01');

set local role authenticated;
set local request.jwt.claim.sub = '12000000-0000-0000-0000-000000000001';
do $$
declare
  target_id uuid;
  activity_id uuid;
  rejected boolean;
begin
  insert into public.crm_gameplans (plan_date) values ('2099-01-01'), ('2099-01-03');
  insert into public.crm_gameplan_targets (plan_date, contact_id, position, method, outcome)
  values ('2099-01-01', '22000000-0000-0000-0000-000000000001', 2, 'Call', 'Keep notes') returning id into target_id;
  insert into public.activities (owner_id, contact_id, gameplan_target_id, type, subject, body)
  values (auth.uid(), '22000000-0000-0000-0000-000000000001', target_id, 'call', 'Saved activity', 'Keep notes') returning id into activity_id;

  perform public.reschedule_crm_gameplan('2099-01-01', '2099-01-02');
  if exists (select 1 from public.crm_gameplans where plan_date = '2099-01-01') or
    not exists (select 1 from public.crm_gameplans where plan_date = '2099-01-02') or
    not exists (select 1 from public.crm_gameplan_targets where id = target_id and plan_date = '2099-01-02' and position = 2 and outcome = 'Keep notes') or
    not exists (select 1 from public.activities where id = activity_id and gameplan_target_id = target_id) then
    raise exception 'Moving must preserve the whole plan and activity references';
  end if;

  rejected := false;
  begin
    perform public.reschedule_crm_gameplan('2099-01-02', '2099-01-03');
  exception when raise_exception then rejected := true;
  end;
  if not rejected or not exists (select 1 from public.crm_gameplan_targets where id = target_id and plan_date = '2099-01-02') then
    raise exception 'Occupied dates must be rejected without changing the source';
  end if;

  rejected := false;
  begin
    perform public.reschedule_crm_gameplan('2099-02-01', '2099-02-02');
  exception when raise_exception then rejected := true;
  end;
  if not rejected then raise exception 'Another user''s plan cannot be moved'; end if;

  perform public.reschedule_crm_gameplan('2099-01-03', '2099-01-04');
  if not exists (select 1 from public.crm_gameplans where plan_date = '2099-01-04') then
    raise exception 'Empty plans must move too';
  end if;
end;
$$;
rollback;
