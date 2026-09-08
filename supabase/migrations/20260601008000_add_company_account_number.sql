alter table public.companies
add column if not exists account_number text;

create index if not exists companies_owner_account_number_idx
on public.companies (owner_id, account_number)
where account_number is not null;
