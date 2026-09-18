alter table public.contacts
  add column if not exists ssn_ciphertext bytea,
  add column if not exists ssn_last4 text,
  add column if not exists ssn_updated_at timestamptz;

alter table public.files
  add column if not exists file_category text not null default 'general',
  add column if not exists is_encrypted boolean not null default false,
  add column if not exists encryption_version text;

create table if not exists public.contact_companies (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  contact_id uuid not null references public.contacts(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  is_primary boolean not null default false,
  relationship_type text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (contact_id, company_id)
);

insert into public.contact_companies (owner_id, contact_id, company_id, is_primary)
select owner_id, id, company_id, true
from public.contacts
where company_id is not null
on conflict (contact_id, company_id) do update
set is_primary = true;

create or replace function public.set_contact_social_security_number(
  p_contact_id uuid,
  p_ssn text,
  p_encryption_key text
)
returns table (contact_id uuid, ssn_last4 text, ssn_updated_at timestamptz)
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_clean_ssn text;
begin
  if p_encryption_key is null or length(p_encryption_key) < 16 then
    raise exception 'A field encryption key of at least 16 characters is required.';
  end if;

  v_clean_ssn := regexp_replace(coalesce(p_ssn, ''), '\D', '', 'g');

  if v_clean_ssn = '' then
    update public.contacts
    set ssn_ciphertext = null,
        ssn_last4 = null,
        ssn_updated_at = null
    where id = p_contact_id
      and owner_id = auth.uid()
    returning id, contacts.ssn_last4, contacts.ssn_updated_at
    into contact_id, ssn_last4, ssn_updated_at;
  else
    if length(v_clean_ssn) <> 9 then
      raise exception 'Social Security number must have 9 digits.';
    end if;

    update public.contacts
    set ssn_ciphertext = pgp_sym_encrypt(v_clean_ssn, p_encryption_key, 'compress-algo=1, cipher-algo=aes256'),
        ssn_last4 = right(v_clean_ssn, 4),
        ssn_updated_at = now()
    where id = p_contact_id
      and owner_id = auth.uid()
    returning id, contacts.ssn_last4, contacts.ssn_updated_at
    into contact_id, ssn_last4, ssn_updated_at;
  end if;

  if contact_id is null then
    raise exception 'Contact not found.';
  end if;

  return next;
end;
$$;

create trigger set_contact_companies_updated_at
before update on public.contact_companies
for each row execute function public.set_updated_at();

create index if not exists contact_companies_owner_id_idx on public.contact_companies(owner_id);
create index if not exists contact_companies_contact_id_idx on public.contact_companies(contact_id);
create index if not exists contact_companies_company_id_idx on public.contact_companies(company_id);
create index if not exists files_file_category_idx on public.files(owner_id, file_category);

alter table public.contact_companies enable row level security;

create policy "Contact company links are viewable by owner"
on public.contact_companies for select
using (auth.uid() = owner_id);

create policy "Contact company links are insertable by owner"
on public.contact_companies for insert
with check (auth.uid() = owner_id);

create policy "Contact company links are updatable by owner"
on public.contact_companies for update
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

create policy "Contact company links are deletable by owner"
on public.contact_companies for delete
using (auth.uid() = owner_id);
