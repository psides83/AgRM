alter table public.contacts
  add column if not exists ag_tax_exempt_ciphertext bytea,
  add column if not exists ag_tax_exempt_last4 text,
  add column if not exists ag_tax_exempt_updated_at timestamptz;

alter table public.companies
  add column if not exists ein_ciphertext bytea,
  add column if not exists ein_last4 text,
  add column if not exists ein_updated_at timestamptz,
  add column if not exists ag_tax_exempt_ciphertext bytea,
  add column if not exists ag_tax_exempt_last4 text,
  add column if not exists ag_tax_exempt_updated_at timestamptz;

create or replace function public.set_contact_ag_tax_exempt_number(
  p_contact_id uuid,
  p_ag_tax_exempt_number text,
  p_encryption_key text
)
returns table (contact_id uuid, ag_tax_exempt_last4 text, ag_tax_exempt_updated_at timestamptz)
language plpgsql
security invoker
set search_path = public, extensions
as $$
declare
  v_value text;
begin
  if p_encryption_key is null or length(p_encryption_key) < 16 then
    raise exception 'A field encryption key of at least 16 characters is required.';
  end if;

  v_value := nullif(trim(coalesce(p_ag_tax_exempt_number, '')), '');

  update public.contacts
  set ag_tax_exempt_ciphertext = case
        when v_value is null then null
        else extensions.pgp_sym_encrypt(v_value, p_encryption_key, 'compress-algo=1, cipher-algo=aes256')
      end,
      ag_tax_exempt_last4 = case when v_value is null then null else right(v_value, 4) end,
      ag_tax_exempt_updated_at = case when v_value is null then null else now() end
  where id = p_contact_id
    and owner_id = auth.uid()
  returning id, contacts.ag_tax_exempt_last4, contacts.ag_tax_exempt_updated_at
  into contact_id, ag_tax_exempt_last4, ag_tax_exempt_updated_at;

  if contact_id is null then
    raise exception 'Contact not found.';
  end if;

  return next;
end;
$$;

create or replace function public.set_company_tax_identifiers(
  p_company_id uuid,
  p_ein text,
  p_ag_tax_exempt_number text,
  p_update_ein boolean,
  p_update_ag_tax_exempt boolean,
  p_encryption_key text
)
returns table (
  company_id uuid,
  ein_last4 text,
  ag_tax_exempt_last4 text,
  sensitive_fields_updated_at timestamptz
)
language plpgsql
security invoker
set search_path = public, extensions
as $$
declare
  v_ein text;
  v_ag_tax_exempt text;
begin
  if p_encryption_key is null or length(p_encryption_key) < 16 then
    raise exception 'A field encryption key of at least 16 characters is required.';
  end if;

  v_ein := regexp_replace(coalesce(p_ein, ''), '\D', '', 'g');
  v_ag_tax_exempt := nullif(trim(coalesce(p_ag_tax_exempt_number, '')), '');

  if p_update_ein and v_ein <> '' and length(v_ein) <> 9 then
    raise exception 'Employer Identification Number must have 9 digits.';
  end if;

  update public.companies
  set ein_ciphertext = case
        when not p_update_ein then companies.ein_ciphertext
        when v_ein = '' then null
        else extensions.pgp_sym_encrypt(v_ein, p_encryption_key, 'compress-algo=1, cipher-algo=aes256')
      end,
      ein_last4 = case
        when not p_update_ein then companies.ein_last4
        when v_ein = '' then null
        else right(v_ein, 4)
      end,
      ein_updated_at = case
        when not p_update_ein then companies.ein_updated_at
        when v_ein = '' then null
        else now()
      end,
      ag_tax_exempt_ciphertext = case
        when not p_update_ag_tax_exempt then companies.ag_tax_exempt_ciphertext
        when v_ag_tax_exempt is null then null
        else extensions.pgp_sym_encrypt(v_ag_tax_exempt, p_encryption_key, 'compress-algo=1, cipher-algo=aes256')
      end,
      ag_tax_exempt_last4 = case
        when not p_update_ag_tax_exempt then companies.ag_tax_exempt_last4
        when v_ag_tax_exempt is null then null
        else right(v_ag_tax_exempt, 4)
      end,
      ag_tax_exempt_updated_at = case
        when not p_update_ag_tax_exempt then companies.ag_tax_exempt_updated_at
        when v_ag_tax_exempt is null then null
        else now()
      end
  where id = p_company_id
    and owner_id = auth.uid()
  returning id,
    companies.ein_last4,
    companies.ag_tax_exempt_last4,
    coalesce(
      greatest(companies.ein_updated_at, companies.ag_tax_exempt_updated_at),
      companies.ein_updated_at,
      companies.ag_tax_exempt_updated_at
    )
  into company_id, ein_last4, ag_tax_exempt_last4, sensitive_fields_updated_at;

  if company_id is null then
    raise exception 'Company not found.';
  end if;

  return next;
end;
$$;
