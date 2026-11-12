-- Run with psql -v ON_ERROR_STOP=1 against a migrated local Supabase database.
begin;

insert into auth.users (id)
values ('10000000-0000-0000-0000-000000000001'),
       ('10000000-0000-0000-0000-000000000002');

insert into public.contacts (id, owner_id, first_name, last_name)
values
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Direct', 'Contact'),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'Linked', 'Contact'),
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000002', 'Other', 'Owner');

insert into public.leads (owner_id, contact_id, status)
values
  ('10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', 'converted'),
  ('10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', 'not_contacted'),
  ('10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', 'working'),
  ('10000000-0000-0000-0000-000000000001', null, 'new'),
  ('10000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 'new');

set local role authenticated;
set local request.jwt.claim.sub = '10000000-0000-0000-0000-000000000001';

do $$
declare
  totals record;
begin
  select * into strict totals from public.crm_dashboard_relationship_counts();
  if totals.contacts <> 1 or totals.open_leads <> 3 then
    raise exception 'Expected (1, 3) before conversion, got %', totals;
  end if;

  update public.leads set status = 'converted' where status = 'not_contacted';

  select * into strict totals from public.crm_dashboard_relationship_counts();
  if totals.contacts <> 1 or totals.open_leads <> 2 then
    raise exception 'Expected (1, 2) while another linked lead is open, got %', totals;
  end if;

  update public.leads set status = 'converted' where status = 'working';

  select * into strict totals from public.crm_dashboard_relationship_counts();
  if totals.contacts <> 2 or totals.open_leads <> 1 then
    raise exception 'Expected (2, 1) after converting the last linked lead, got %', totals;
  end if;
end;
$$;

rollback;
