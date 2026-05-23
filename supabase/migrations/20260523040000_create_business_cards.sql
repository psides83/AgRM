create table public.business_cards (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  slug text not null unique,
  enabled boolean not null default true,
  first_name text not null,
  last_name text not null,
  job_title text,
  dealership_name text,
  territory text,
  email text,
  phone text,
  website text,
  avatar_url text,
  bio text,
  brand_color text not null default '#367C2B',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id),
  check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  check (brand_color ~ '^#[0-9A-Fa-f]{6}$')
);

create trigger set_business_cards_updated_at
before update on public.business_cards
for each row execute function public.set_updated_at();

alter table public.business_cards enable row level security;

create policy "Business cards are viewable by owner"
on public.business_cards for select
using (auth.uid() = owner_id);

create policy "Published business cards are public"
on public.business_cards for select
using (enabled = true);

create policy "Business cards are insertable by owner"
on public.business_cards for insert
with check (auth.uid() = owner_id);

create policy "Business cards are updatable by owner"
on public.business_cards for update
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

create policy "Business cards are deletable by owner"
on public.business_cards for delete
using (auth.uid() = owner_id);

alter table public.business_cards replica identity full;

do $$
begin
  alter publication supabase_realtime add table public.business_cards;
exception
  when duplicate_object then null;
end;
$$;
