-- Run with psql -v ON_ERROR_STOP=1 against a migrated local Supabase database.
begin;

insert into auth.users (id) values ('11000000-0000-0000-0000-000000000001');
insert into public.contacts (id, owner_id, first_name, last_name)
values ('21000000-0000-0000-0000-000000000001', '11000000-0000-0000-0000-000000000001', 'Sync', 'Test');

set local role authenticated;
set local request.jwt.claim.sub = '11000000-0000-0000-0000-000000000001';

do $$
declare
  target_id uuid;
  activity_id uuid;
  sibling_id uuid;
  unlinked_id uuid;
begin
  insert into public.crm_gameplans (plan_date) values ('2099-01-01');
  insert into public.crm_gameplan_targets (plan_date, contact_id, position, method, outcome)
  values ('2099-01-01', '21000000-0000-0000-0000-000000000001', 0, 'Call', 'Original')
  returning id into target_id;

  insert into public.activities (owner_id, contact_id, gameplan_target_id, type, subject, body)
  values (auth.uid(), '21000000-0000-0000-0000-000000000001', target_id, 'call', 'Logged outcome', 'Original')
  returning id into activity_id;
  -- Existing data can contain multiple logged activities for one target.
  insert into public.activities (owner_id, contact_id, gameplan_target_id, type, subject, body)
  values (auth.uid(), '21000000-0000-0000-0000-000000000001', target_id, 'call', 'Another log', 'Original')
  returning id into sibling_id;
  insert into public.activities (owner_id, contact_id, type, subject, body)
  values (auth.uid(), '21000000-0000-0000-0000-000000000001', 'note', 'Unlinked', 'Original')
  returning id into unlinked_id;

  update public.crm_gameplan_targets set outcome = 'Edited outcome' where id = target_id;
  if (select count(*) from public.activities where gameplan_target_id = target_id and body = 'Edited outcome') <> 2 then
    raise exception 'Outcome edits must update all linked activities';
  end if;
  if (select body from public.activities where id = unlinked_id) <> 'Original' then
    raise exception 'Unlinked activities must stay unchanged';
  end if;

  update public.activities set body = 'Edited activity' where id = activity_id;
  if (select outcome from public.crm_gameplan_targets where id = target_id) <> 'Edited activity'
    or (select body from public.activities where id = sibling_id) <> 'Edited activity' then
    raise exception 'Activity edits must update the outcome and other linked logs';
  end if;

  update public.activities set subject = 'New subject' where id = activity_id;
  if (select outcome from public.crm_gameplan_targets where id = target_id) <> 'Edited activity' then
    raise exception 'Unrelated activity fields must not change the outcome';
  end if;

  update public.activities set body = null where id = activity_id;
  if (select outcome from public.crm_gameplan_targets where id = target_id) <> '' then
    raise exception 'Clearing activity notes must clear the outcome';
  end if;
  update public.crm_gameplan_targets set outcome = 'Restored' where id = target_id;
  update public.crm_gameplan_targets set outcome = '' where id = target_id;
  if exists (select 1 from public.activities where gameplan_target_id = target_id and body is distinct from '') then
    raise exception 'Clearing an outcome must clear linked activity notes';
  end if;

  delete from public.crm_gameplan_targets where id = target_id;
  if (select gameplan_target_id from public.activities where id = activity_id) is not null then
    raise exception 'Removing a target must detach its activity';
  end if;
  update public.activities set body = 'Detached edit' where id = activity_id;
end;
$$;

rollback;
