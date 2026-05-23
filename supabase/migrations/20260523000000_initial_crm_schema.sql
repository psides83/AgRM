create extension if not exists "pgcrypto";

create type public.lead_status as enum (
  'new',
  'working',
  'qualified',
  'unqualified',
  'converted'
);

create type public.deal_stage as enum (
  'lead',
  'quoted',
  'negotiation',
  'won',
  'lost'
);

create type public.activity_type as enum (
  'call',
  'text',
  'email',
  'visit',
  'demo',
  'quote',
  'task',
  'note'
);

create type public.activity_direction as enum (
  'inbound',
  'outbound'
);

create type public.equipment_category as enum (
  'tractor',
  'combine',
  'planter',
  'sprayer',
  'hay',
  'tillage',
  'utility_vehicle',
  'attachment',
  'other'
);

create type public.equipment_condition as enum (
  'new',
  'used',
  'either'
);

create type public.purchase_timeline as enum (
  'now',
  'this_month',
  'this_quarter',
  'this_year',
  'next_year',
  'unknown'
);

create type public.financing_preference as enum (
  'cash',
  'finance',
  'lease',
  'manufacturer_program',
  'unknown'
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  phone text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  company_type text,
  website text,
  phone text,
  email text,
  address_line1 text,
  address_line2 text,
  city text,
  region text,
  postal_code text,
  country text not null default 'US',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id, name)
);

create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  company_id uuid references public.companies(id) on delete set null,
  first_name text not null,
  last_name text not null,
  title text,
  email text,
  phone text,
  mobile_phone text,
  address_line1 text,
  address_line2 text,
  city text,
  region text,
  postal_code text,
  country text not null default 'US',
  tags text[] not null default '{}',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  contact_id uuid references public.contacts(id) on delete set null,
  company_id uuid references public.companies(id) on delete set null,
  source text,
  status public.lead_status not null default 'new',
  priority smallint not null default 3 check (priority between 1 and 5),
  estimated_budget numeric(12, 2),
  target_purchase_date date,
  last_contacted_at timestamptz,
  next_follow_up_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.deals (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  lead_id uuid references public.leads(id) on delete set null,
  contact_id uuid references public.contacts(id) on delete set null,
  company_id uuid references public.companies(id) on delete set null,
  name text not null,
  stage public.deal_stage not null default 'lead',
  amount numeric(12, 2),
  probability smallint not null default 0 check (probability between 0 and 100),
  expected_close_date date,
  closed_at timestamptz,
  lost_reason text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.equipment_interests (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  contact_id uuid references public.contacts(id) on delete cascade,
  lead_id uuid references public.leads(id) on delete cascade,
  deal_id uuid references public.deals(id) on delete cascade,
  category public.equipment_category not null default 'other',
  stock_number text,
  serial_number text,
  make text,
  model text,
  model_year integer check (model_year is null or model_year between 1900 and 2200),
  condition public.equipment_condition not null default 'either',
  hours integer check (hours is null or hours >= 0),
  engine_hours integer check (engine_hours is null or engine_hours >= 0),
  separator_hours integer check (separator_hours is null or separator_hours >= 0),
  horsepower integer check (horsepower is null or horsepower >= 0),
  implement_width text,
  row_count integer check (row_count is null or row_count > 0),
  row_spacing text,
  drive_type text,
  transmission text,
  guidance_ready boolean,
  gps_receiver text,
  display_monitor text,
  loader_included boolean,
  attachments text[] not null default '{}',
  price_min numeric(12, 2),
  price_max numeric(12, 2),
  trade_in boolean not null default false,
  trade_make text,
  trade_model text,
  trade_year integer check (trade_year is null or trade_year between 1900 and 2200),
  trade_hours integer check (trade_hours is null or trade_hours >= 0),
  trade_notes text,
  purchase_timeline public.purchase_timeline not null default 'unknown',
  preferred_financing public.financing_preference not null default 'unknown',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (contact_id is not null or lead_id is not null or deal_id is not null),
  check (price_min is null or price_max is null or price_min <= price_max)
);

create table public.activities (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  contact_id uuid references public.contacts(id) on delete cascade,
  company_id uuid references public.companies(id) on delete cascade,
  lead_id uuid references public.leads(id) on delete cascade,
  deal_id uuid references public.deals(id) on delete cascade,
  type public.activity_type not null,
  direction public.activity_direction,
  subject text not null,
  body text,
  occurred_at timestamptz not null default now(),
  due_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (contact_id is not null or company_id is not null or lead_id is not null or deal_id is not null)
);

create table public.notes (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  contact_id uuid references public.contacts(id) on delete cascade,
  company_id uuid references public.companies(id) on delete cascade,
  lead_id uuid references public.leads(id) on delete cascade,
  deal_id uuid references public.deals(id) on delete cascade,
  body text not null,
  pinned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (contact_id is not null or company_id is not null or lead_id is not null or deal_id is not null)
);

create table public.files (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  contact_id uuid references public.contacts(id) on delete cascade,
  company_id uuid references public.companies(id) on delete cascade,
  lead_id uuid references public.leads(id) on delete cascade,
  deal_id uuid references public.deals(id) on delete cascade,
  storage_bucket text not null default 'crm-files',
  storage_path text not null,
  file_name text not null,
  mime_type text,
  size_bytes bigint check (size_bytes is null or size_bytes >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (storage_bucket, storage_path),
  check (contact_id is not null or company_id is not null or lead_id is not null or deal_id is not null)
);

create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger set_companies_updated_at
before update on public.companies
for each row execute function public.set_updated_at();

create trigger set_contacts_updated_at
before update on public.contacts
for each row execute function public.set_updated_at();

create trigger set_leads_updated_at
before update on public.leads
for each row execute function public.set_updated_at();

create trigger set_deals_updated_at
before update on public.deals
for each row execute function public.set_updated_at();

create trigger set_equipment_interests_updated_at
before update on public.equipment_interests
for each row execute function public.set_updated_at();

create trigger set_activities_updated_at
before update on public.activities
for each row execute function public.set_updated_at();

create trigger set_notes_updated_at
before update on public.notes
for each row execute function public.set_updated_at();

create trigger set_files_updated_at
before update on public.files
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data->>'display_name')
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create index companies_owner_id_idx on public.companies(owner_id);
create index contacts_owner_id_idx on public.contacts(owner_id);
create index contacts_company_id_idx on public.contacts(company_id);
create index leads_owner_status_idx on public.leads(owner_id, status);
create index leads_next_follow_up_at_idx on public.leads(owner_id, next_follow_up_at);
create index deals_owner_stage_idx on public.deals(owner_id, stage);
create index deals_expected_close_date_idx on public.deals(owner_id, expected_close_date);
create index equipment_interests_owner_id_idx on public.equipment_interests(owner_id);
create index activities_owner_due_at_idx on public.activities(owner_id, due_at);
create index activities_owner_occurred_at_idx on public.activities(owner_id, occurred_at desc);
create index notes_owner_id_idx on public.notes(owner_id);
create index files_owner_id_idx on public.files(owner_id);

alter table public.profiles enable row level security;
alter table public.companies enable row level security;
alter table public.contacts enable row level security;
alter table public.leads enable row level security;
alter table public.deals enable row level security;
alter table public.equipment_interests enable row level security;
alter table public.activities enable row level security;
alter table public.notes enable row level security;
alter table public.files enable row level security;

create policy "Profiles are viewable by owner"
on public.profiles for select
using (auth.uid() = id);

create policy "Profiles are insertable by owner"
on public.profiles for insert
with check (auth.uid() = id);

create policy "Profiles are updatable by owner"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "Companies are viewable by owner"
on public.companies for select
using (auth.uid() = owner_id);

create policy "Companies are insertable by owner"
on public.companies for insert
with check (auth.uid() = owner_id);

create policy "Companies are updatable by owner"
on public.companies for update
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

create policy "Companies are deletable by owner"
on public.companies for delete
using (auth.uid() = owner_id);

create policy "Contacts are viewable by owner"
on public.contacts for select
using (auth.uid() = owner_id);

create policy "Contacts are insertable by owner"
on public.contacts for insert
with check (auth.uid() = owner_id);

create policy "Contacts are updatable by owner"
on public.contacts for update
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

create policy "Contacts are deletable by owner"
on public.contacts for delete
using (auth.uid() = owner_id);

create policy "Leads are viewable by owner"
on public.leads for select
using (auth.uid() = owner_id);

create policy "Leads are insertable by owner"
on public.leads for insert
with check (auth.uid() = owner_id);

create policy "Leads are updatable by owner"
on public.leads for update
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

create policy "Leads are deletable by owner"
on public.leads for delete
using (auth.uid() = owner_id);

create policy "Deals are viewable by owner"
on public.deals for select
using (auth.uid() = owner_id);

create policy "Deals are insertable by owner"
on public.deals for insert
with check (auth.uid() = owner_id);

create policy "Deals are updatable by owner"
on public.deals for update
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

create policy "Deals are deletable by owner"
on public.deals for delete
using (auth.uid() = owner_id);

create policy "Equipment interests are viewable by owner"
on public.equipment_interests for select
using (auth.uid() = owner_id);

create policy "Equipment interests are insertable by owner"
on public.equipment_interests for insert
with check (auth.uid() = owner_id);

create policy "Equipment interests are updatable by owner"
on public.equipment_interests for update
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

create policy "Equipment interests are deletable by owner"
on public.equipment_interests for delete
using (auth.uid() = owner_id);

create policy "Activities are viewable by owner"
on public.activities for select
using (auth.uid() = owner_id);

create policy "Activities are insertable by owner"
on public.activities for insert
with check (auth.uid() = owner_id);

create policy "Activities are updatable by owner"
on public.activities for update
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

create policy "Activities are deletable by owner"
on public.activities for delete
using (auth.uid() = owner_id);

create policy "Notes are viewable by owner"
on public.notes for select
using (auth.uid() = owner_id);

create policy "Notes are insertable by owner"
on public.notes for insert
with check (auth.uid() = owner_id);

create policy "Notes are updatable by owner"
on public.notes for update
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

create policy "Notes are deletable by owner"
on public.notes for delete
using (auth.uid() = owner_id);

create policy "Files are viewable by owner"
on public.files for select
using (auth.uid() = owner_id);

create policy "Files are insertable by owner"
on public.files for insert
with check (auth.uid() = owner_id);

create policy "Files are updatable by owner"
on public.files for update
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

create policy "Files are deletable by owner"
on public.files for delete
using (auth.uid() = owner_id);

insert into storage.buckets (id, name, public)
values ('crm-files', 'crm-files', false)
on conflict (id) do nothing;

create policy "CRM files are viewable by owner folder"
on storage.objects for select
using (
  bucket_id = 'crm-files'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "CRM files are insertable by owner folder"
on storage.objects for insert
with check (
  bucket_id = 'crm-files'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "CRM files are updatable by owner folder"
on storage.objects for update
using (
  bucket_id = 'crm-files'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'crm-files'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "CRM files are deletable by owner folder"
on storage.objects for delete
using (
  bucket_id = 'crm-files'
  and (storage.foldername(name))[1] = auth.uid()::text
);
