create function public.assign_deal_equipment(
  p_deal_id uuid,
  p_contact_id uuid,
  p_lead_id uuid,
  p_name text,
  p_stage public.deal_stage,
  p_equipment_ids uuid[]
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_owner uuid := auth.uid();
  v_deal uuid := p_deal_id;
  v_contact uuid := p_contact_id;
  v_lead_contact uuid;
  v_company uuid;
  v_contact_company uuid;
  v_count integer;
begin
  if v_owner is null then
    raise exception 'Sign in to manage deal equipment.';
  end if;

  if p_lead_id is not null then
    select contact_id, company_id into v_lead_contact, v_company
    from public.leads where id = p_lead_id and owner_id = v_owner;
    if not found or (v_contact is not null and v_lead_contact <> v_contact) then
      raise exception 'The originating lead is unavailable for this contact.';
    end if;
    v_contact := coalesce(v_contact, v_lead_contact);
  end if;

  if v_contact is not null then
    select company_id into v_contact_company
    from public.contacts where id = v_contact and owner_id = v_owner;
    if not found then
      raise exception 'The contact is unavailable.';
    end if;
  elsif p_lead_id is null then
    raise exception 'A contact or lead is required.';
  end if;

  if v_deal is null then
    if nullif(btrim(p_name), '') is null then
      raise exception 'Deal name is required.';
    end if;
    insert into public.deals (owner_id, name, stage, contact_id, lead_id, company_id)
    values (v_owner, btrim(p_name), p_stage, v_contact, p_lead_id,
      coalesce(v_company, v_contact_company))
    returning id into v_deal;
  else
    perform id from public.deals
    where id = v_deal and owner_id = v_owner and contact_id = v_contact
    for update;
    if not found then
      raise exception 'The deal is unavailable for this contact.';
    end if;
  end if;

  update public.equipment_interests as item
  set deal_id = v_deal
  where item.id = any(p_equipment_ids)
    and item.owner_id = v_owner
    and item.deal_id is null
    and (item.contact_id = v_contact or item.lead_id = p_lead_id)
    and (item.contact_id is null or item.contact_id = v_contact);

  get diagnostics v_count = row_count;
  if v_count <> coalesce(cardinality(p_equipment_ids), 0) then
    raise exception 'Some selected equipment interests are unavailable or already linked. Refresh and try again.';
  end if;

  return v_deal;
end;
$$;

revoke execute on function public.assign_deal_equipment(uuid, uuid, uuid, text, public.deal_stage, uuid[])
from public, anon;
grant execute on function public.assign_deal_equipment(uuid, uuid, uuid, text, public.deal_stage, uuid[])
to authenticated;

-- Keep interests that still belong to a contact or lead when their deal is deleted.
create function public.detach_related_equipment_before_deal_delete()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  update public.equipment_interests
  set deal_id = null
  where deal_id = old.id and (contact_id is not null or lead_id is not null);
  return old;
end;
$$;

create trigger detach_related_equipment_before_deal_delete
before delete on public.deals
for each row execute function public.detach_related_equipment_before_deal_delete();
