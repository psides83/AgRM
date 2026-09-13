alter table public.leads
add column if not exists first_name text,
add column if not exists last_name text,
add column if not exists company_name text,
add column if not exists phone text,
add column if not exists mobile_phone text,
add column if not exists home_phone text,
add column if not exists email text,
add column if not exists address_line1 text,
add column if not exists address_line2 text,
add column if not exists city text,
add column if not exists county text,
add column if not exists region text,
add column if not exists postal_code text,
add column if not exists country text not null default 'US',
add column if not exists branch text,
add column if not exists import_source text,
add column if not exists source_details jsonb not null default '{}'::jsonb,
add column if not exists call_result text,
add column if not exists call_attempt_count integer not null default 0 check (call_attempt_count >= 0),
add column if not exists visited boolean not null default false,
add column if not exists last_visited_at timestamptz;

create index if not exists leads_owner_import_source_idx
on public.leads(owner_id, import_source);

create index if not exists leads_owner_phone_idx
on public.leads(owner_id, phone)
where phone is not null;

create index if not exists leads_owner_mobile_phone_idx
on public.leads(owner_id, mobile_phone)
where mobile_phone is not null;

create index if not exists leads_owner_email_idx
on public.leads(owner_id, lower(email))
where email is not null;
