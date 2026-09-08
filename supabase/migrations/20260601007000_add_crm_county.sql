alter table public.companies
add column if not exists county text;

alter table public.contacts
add column if not exists county text;
