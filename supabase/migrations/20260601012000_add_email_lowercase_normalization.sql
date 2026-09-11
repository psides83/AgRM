create or replace function public.crm_email_lower(value text)
returns text
language plpgsql
immutable
as $$
declare
  normalized text;
begin
  if value is null then
    return null;
  end if;

  normalized := lower(btrim(value));

  if normalized = '' then
    return null;
  end if;

  return normalized;
end;
$$;

create or replace function public.normalize_profile_email()
returns trigger
language plpgsql
as $$
begin
  new.email := public.crm_email_lower(new.email);
  return new;
end;
$$;

create or replace function public.normalize_business_card_email()
returns trigger
language plpgsql
as $$
begin
  new.email := public.crm_email_lower(new.email);
  return new;
end;
$$;

create or replace function public.normalize_company_proper_case()
returns trigger
language plpgsql
as $$
begin
  new.name := public.crm_proper_case(new.name);
  new.company_type := public.crm_proper_case(new.company_type);
  new.email := public.crm_email_lower(new.email);
  new.address_line1 := public.crm_proper_case(new.address_line1);
  new.address_line2 := public.crm_proper_case(new.address_line2);
  new.city := public.crm_proper_case(new.city);
  new.county := public.crm_proper_case(new.county);
  new.region := public.crm_region_case(new.region);
  new.country := upper(coalesce(nullif(btrim(new.country), ''), 'US'));
  return new;
end;
$$;

create or replace function public.normalize_contact_proper_case()
returns trigger
language plpgsql
as $$
begin
  new.first_name := public.crm_proper_case(new.first_name);
  new.last_name := public.crm_proper_case(new.last_name);
  new.title := public.crm_proper_case(new.title);
  new.email := public.crm_email_lower(new.email);
  new.address_line1 := public.crm_proper_case(new.address_line1);
  new.address_line2 := public.crm_proper_case(new.address_line2);
  new.city := public.crm_proper_case(new.city);
  new.county := public.crm_proper_case(new.county);
  new.region := public.crm_region_case(new.region);
  new.country := upper(coalesce(nullif(btrim(new.country), ''), 'US'));
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  metadata_name text;
  fallback_first_name text;
  fallback_last_name text;
begin
  metadata_name := nullif(new.raw_user_meta_data->>'name', '');
  fallback_first_name := nullif(new.raw_user_meta_data->>'first_name', '');
  fallback_last_name := nullif(new.raw_user_meta_data->>'last_name', '');

  if fallback_first_name is null and metadata_name is not null then
    fallback_first_name := split_part(metadata_name, ' ', 1);
  end if;

  if fallback_last_name is null and metadata_name is not null then
    fallback_last_name := nullif(regexp_replace(metadata_name, '^\S+\s*', ''), '');
  end if;

  insert into public.profiles (
    id,
    first_name,
    last_name,
    email,
    phone,
    avatar_url,
    job_title,
    dealership_name,
    territory,
    timezone,
    locale
  )
  values (
    new.id,
    fallback_first_name,
    fallback_last_name,
    public.crm_email_lower(new.email),
    new.phone,
    nullif(new.raw_user_meta_data->>'avatar_url', ''),
    nullif(new.raw_user_meta_data->>'job_title', ''),
    nullif(new.raw_user_meta_data->>'dealership_name', ''),
    nullif(new.raw_user_meta_data->>'territory', ''),
    coalesce(nullif(new.raw_user_meta_data->>'timezone', ''), 'America/Chicago'),
    coalesce(nullif(new.raw_user_meta_data->>'locale', ''), 'en-US')
  )
  on conflict (id) do update set
    first_name = excluded.first_name,
    last_name = excluded.last_name,
    email = excluded.email,
    phone = excluded.phone,
    avatar_url = excluded.avatar_url,
    job_title = excluded.job_title,
    dealership_name = excluded.dealership_name,
    territory = excluded.territory,
    timezone = excluded.timezone,
    locale = excluded.locale;

  return new;
end;
$$;

update public.profiles
set email = public.crm_email_lower(email)
where public.crm_email_lower(email) is distinct from email;

update public.business_cards
set email = public.crm_email_lower(email)
where public.crm_email_lower(email) is distinct from email;

update public.companies
set email = public.crm_email_lower(email)
where public.crm_email_lower(email) is distinct from email;

update public.contacts
set email = public.crm_email_lower(email)
where public.crm_email_lower(email) is distinct from email;

drop trigger if exists normalize_profile_email_before_write
on public.profiles;

create trigger normalize_profile_email_before_write
before insert or update on public.profiles
for each row execute function public.normalize_profile_email();

drop trigger if exists normalize_business_card_email_before_write
on public.business_cards;

create trigger normalize_business_card_email_before_write
before insert or update on public.business_cards
for each row execute function public.normalize_business_card_email();
