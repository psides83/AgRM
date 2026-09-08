create or replace function public.crm_proper_case(value text)
returns text
language plpgsql
immutable
as $$
declare
  normalized text;
  formatted text;
begin
  if value is null then
    return null;
  end if;

  normalized := regexp_replace(btrim(value), '\s+', ' ', 'g');

  if normalized = '' then
    return null;
  end if;

  if normalized <> upper(normalized) and normalized <> lower(normalized) then
    return normalized;
  end if;

  formatted := initcap(lower(normalized));

  formatted := regexp_replace(formatted, '\mUs\M', 'US', 'g');
  formatted := regexp_replace(formatted, '\mUsa\M', 'USA', 'g');
  formatted := regexp_replace(formatted, '\mLlc\M', 'LLC', 'g');
  formatted := regexp_replace(formatted, '\mLlp\M', 'LLP', 'g');
  formatted := regexp_replace(formatted, '\mLp\M', 'LP', 'g');
  formatted := regexp_replace(formatted, '\mInc\M', 'Inc', 'g');
  formatted := regexp_replace(formatted, '\mDba\M', 'DBA', 'g');
  formatted := regexp_replace(formatted, '\mNe\M', 'NE', 'g');
  formatted := regexp_replace(formatted, '\mNw\M', 'NW', 'g');
  formatted := regexp_replace(formatted, '\mSe\M', 'SE', 'g');
  formatted := regexp_replace(formatted, '\mSw\M', 'SW', 'g');

  return formatted;
end;
$$;

create or replace function public.crm_region_case(value text)
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

  normalized := regexp_replace(btrim(value), '\s+', ' ', 'g');

  if normalized = '' then
    return null;
  end if;

  if length(normalized) <= 3 then
    return upper(normalized);
  end if;

  return public.crm_proper_case(normalized);
end;
$$;

create or replace function public.normalize_company_proper_case()
returns trigger
language plpgsql
as $$
begin
  new.name := public.crm_proper_case(new.name);
  new.company_type := public.crm_proper_case(new.company_type);
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
  new.address_line1 := public.crm_proper_case(new.address_line1);
  new.address_line2 := public.crm_proper_case(new.address_line2);
  new.city := public.crm_proper_case(new.city);
  new.county := public.crm_proper_case(new.county);
  new.region := public.crm_region_case(new.region);
  new.country := upper(coalesce(nullif(btrim(new.country), ''), 'US'));
  return new;
end;
$$;

create or replace function public.normalize_lead_proper_case()
returns trigger
language plpgsql
as $$
begin
  new.source := public.crm_proper_case(new.source);
  return new;
end;
$$;

create or replace function public.normalize_deal_proper_case()
returns trigger
language plpgsql
as $$
begin
  new.name := public.crm_proper_case(new.name);
  return new;
end;
$$;

create or replace function public.normalize_equipment_proper_case()
returns trigger
language plpgsql
as $$
begin
  new.make := public.crm_proper_case(new.make);

  new.trade_make := public.crm_proper_case(new.trade_make);
  return new;
end;
$$;

update public.companies as company
set
  company_type = public.crm_proper_case(company_type),
  address_line1 = public.crm_proper_case(address_line1),
  address_line2 = public.crm_proper_case(address_line2),
  city = public.crm_proper_case(city),
  county = public.crm_proper_case(county),
  region = public.crm_region_case(region),
  country = upper(coalesce(nullif(btrim(country), ''), 'US'));

update public.companies as company
set name = public.crm_proper_case(company.name)
where public.crm_proper_case(company.name) is distinct from company.name
  and not exists (
    select 1
    from public.companies as conflict
    where conflict.owner_id = company.owner_id
      and conflict.id <> company.id
      and public.crm_proper_case(conflict.name) = public.crm_proper_case(company.name)
  );

update public.contacts
set
  first_name = public.crm_proper_case(first_name),
  last_name = public.crm_proper_case(last_name),
  title = public.crm_proper_case(title),
  address_line1 = public.crm_proper_case(address_line1),
  address_line2 = public.crm_proper_case(address_line2),
  city = public.crm_proper_case(city),
  county = public.crm_proper_case(county),
  region = public.crm_region_case(region),
  country = upper(coalesce(nullif(btrim(country), ''), 'US'));

update public.leads
set source = public.crm_proper_case(source);

update public.deals as deal
set name = public.crm_proper_case(deal.name)
where public.crm_proper_case(deal.name) is distinct from deal.name;

update public.equipment_interests
set
  make = public.crm_proper_case(make),
  trade_make = public.crm_proper_case(trade_make);

drop trigger if exists normalize_company_proper_case_before_write
on public.companies;

create trigger normalize_company_proper_case_before_write
before insert or update on public.companies
for each row execute function public.normalize_company_proper_case();

drop trigger if exists normalize_contact_proper_case_before_write
on public.contacts;

create trigger normalize_contact_proper_case_before_write
before insert or update on public.contacts
for each row execute function public.normalize_contact_proper_case();

drop trigger if exists normalize_lead_proper_case_before_write
on public.leads;

create trigger normalize_lead_proper_case_before_write
before insert or update on public.leads
for each row execute function public.normalize_lead_proper_case();

drop trigger if exists normalize_deal_proper_case_before_write
on public.deals;

create trigger normalize_deal_proper_case_before_write
before insert or update on public.deals
for each row execute function public.normalize_deal_proper_case();

drop trigger if exists normalize_equipment_proper_case_before_write
on public.equipment_interests;

create trigger normalize_equipment_proper_case_before_write
before insert or update on public.equipment_interests
for each row execute function public.normalize_equipment_proper_case();
