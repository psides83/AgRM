create or replace function public.get_contact_social_security_number(
  p_contact_id uuid,
  p_encryption_key text
)
returns text
language sql
security invoker
set search_path = public
as $$
  select pgp_sym_decrypt(ssn_ciphertext, p_encryption_key)
  from public.contacts
  where id = p_contact_id
    and owner_id = auth.uid()
    and ssn_ciphertext is not null;
$$;

create or replace function public.get_contact_ag_tax_exempt_number(
  p_contact_id uuid,
  p_encryption_key text
)
returns text
language sql
security invoker
set search_path = public
as $$
  select pgp_sym_decrypt(ag_tax_exempt_ciphertext, p_encryption_key)
  from public.contacts
  where id = p_contact_id
    and owner_id = auth.uid()
    and ag_tax_exempt_ciphertext is not null;
$$;

create or replace function public.get_company_ein(
  p_company_id uuid,
  p_encryption_key text
)
returns text
language sql
security invoker
set search_path = public
as $$
  select pgp_sym_decrypt(ein_ciphertext, p_encryption_key)
  from public.companies
  where id = p_company_id
    and owner_id = auth.uid()
    and ein_ciphertext is not null;
$$;

create or replace function public.get_company_ag_tax_exempt_number(
  p_company_id uuid,
  p_encryption_key text
)
returns text
language sql
security invoker
set search_path = public
as $$
  select pgp_sym_decrypt(ag_tax_exempt_ciphertext, p_encryption_key)
  from public.companies
  where id = p_company_id
    and owner_id = auth.uid()
    and ag_tax_exempt_ciphertext is not null;
$$;
