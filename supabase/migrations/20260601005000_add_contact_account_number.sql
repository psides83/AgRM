alter table public.contacts
add column if not exists account_number text;

create index if not exists contacts_owner_account_number_idx
on public.contacts (owner_id, account_number)
where account_number is not null;
