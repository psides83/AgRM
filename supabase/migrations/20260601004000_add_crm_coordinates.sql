alter table public.contacts
add column if not exists latitude double precision,
add column if not exists longitude double precision;

alter table public.companies
add column if not exists latitude double precision,
add column if not exists longitude double precision;

alter table public.leads
add column if not exists latitude double precision,
add column if not exists longitude double precision;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'contacts_latitude_range') then
    alter table public.contacts add constraint contacts_latitude_range check (latitude is null or latitude between -90 and 90);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'contacts_longitude_range') then
    alter table public.contacts add constraint contacts_longitude_range check (longitude is null or longitude between -180 and 180);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'companies_latitude_range') then
    alter table public.companies add constraint companies_latitude_range check (latitude is null or latitude between -90 and 90);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'companies_longitude_range') then
    alter table public.companies add constraint companies_longitude_range check (longitude is null or longitude between -180 and 180);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'leads_latitude_range') then
    alter table public.leads add constraint leads_latitude_range check (latitude is null or latitude between -90 and 90);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'leads_longitude_range') then
    alter table public.leads add constraint leads_longitude_range check (longitude is null or longitude between -180 and 180);
  end if;
end
$$;

create index if not exists contacts_coordinates_idx
on public.contacts(owner_id, latitude, longitude)
where latitude is not null and longitude is not null;

create index if not exists companies_coordinates_idx
on public.companies(owner_id, latitude, longitude)
where latitude is not null and longitude is not null;

create index if not exists leads_coordinates_idx
on public.leads(owner_id, latitude, longitude)
where latitude is not null and longitude is not null;
