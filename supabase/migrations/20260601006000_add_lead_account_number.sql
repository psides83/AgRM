alter table public.leads
add column if not exists account_number text;

create index if not exists leads_owner_account_number_idx
on public.leads (owner_id, account_number)
where account_number is not null;
