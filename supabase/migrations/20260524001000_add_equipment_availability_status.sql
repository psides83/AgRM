do $$
begin
  if not exists (select 1 from pg_type where typname = 'equipment_availability') then
    create type public.equipment_availability as enum (
      'availability_unknown',
      'in_stock_auburn',
      'in_stock_transfer',
      'pending',
      'unavailable'
    );
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'equipment_status') then
    create type public.equipment_status as enum (
      'equipment_added',
      'setup_required',
      'transfer_required',
      'order_required',
      'setup_requested',
      'transfer_requested',
      'order_placed',
      'transfer_in_progress',
      'order_in_progress',
      'setup_in_progress',
      'ready',
      'delivered'
    );
  end if;
end
$$;

alter type public.activity_type add value if not exists 'meeting';
alter type public.activity_type add value if not exists 'site_visit';
alter type public.activity_type add value if not exists 'other';
alter type public.activity_direction add value if not exists 'internal';

alter table public.equipment_interests
add column if not exists availability public.equipment_availability not null default 'availability_unknown',
add column if not exists status public.equipment_status not null default 'equipment_added';

create index if not exists equipment_interests_availability_idx
on public.equipment_interests(owner_id, availability);

create index if not exists equipment_interests_status_idx
on public.equipment_interests(owner_id, status);
