alter table public.profiles
add column if not exists commission_rate numeric(5, 2)
check (commission_rate is null or commission_rate between 0 and 100);
