create index leads_open_contact_idx
  on public.leads (contact_id)
  where contact_id is not null and status <> 'converted';

create function public.crm_dashboard_relationship_counts()
returns table (contacts bigint, open_leads bigint)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    (
      select count(*)
      from public.contacts as contact
      where not exists (
        select 1
        from public.leads as lead
        where lead.contact_id = contact.id
          and lead.status <> 'converted'
      )
    ),
    (
      select count(*)
      from public.leads as lead
      where lead.status <> 'converted'
    );
$$;

revoke execute on function public.crm_dashboard_relationship_counts() from public, anon;
grant execute on function public.crm_dashboard_relationship_counts() to authenticated;
