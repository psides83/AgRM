alter table public.deals
add column if not exists margin numeric(12, 2);
