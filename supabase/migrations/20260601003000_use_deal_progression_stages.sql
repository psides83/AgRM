update public.deals
set stage = case stage
  when 'lead' then 'needs_discovery'::public.deal_stage
  when 'quoted' then 'options_presented'::public.deal_stage
  when 'negotiation' then 'agreement_reached'::public.deal_stage
  when 'won' then 'closed'::public.deal_stage
  else stage
end
where stage in ('lead', 'quoted', 'negotiation', 'won');

alter table public.deals
alter column stage set default 'needs_discovery';

update public.equipment_interests
set status = case status
  when 'equipment_added' then 'not_started'::public.equipment_status
  when 'setup_requested' then 'setup_required'::public.equipment_status
  when 'transfer_requested' then 'transfer_required'::public.equipment_status
  when 'order_required' then 'on_order'::public.equipment_status
  when 'order_placed' then 'on_order'::public.equipment_status
  when 'order_in_progress' then 'on_order'::public.equipment_status
  else status
end
where status in ('equipment_added', 'setup_requested', 'transfer_requested', 'order_required', 'order_placed', 'order_in_progress');

alter table public.equipment_interests
alter column status set default 'not_started';
