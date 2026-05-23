alter table public.profiles
add column if not exists first_name text,
add column if not exists last_name text,
add column if not exists email text,
add column if not exists job_title text,
add column if not exists dealership_name text,
add column if not exists territory text,
add column if not exists timezone text not null default 'America/Chicago',
add column if not exists locale text not null default 'en-US',
add column if not exists onboarding_completed boolean not null default false;

update public.profiles profile
set
  email = coalesce(profile.email, auth_user.email),
  phone = coalesce(profile.phone, auth_user.phone),
  first_name = coalesce(
    profile.first_name,
    auth_user.raw_user_meta_data->>'first_name',
    split_part(auth_user.raw_user_meta_data->>'display_name', ' ', 1),
    split_part(auth_user.raw_user_meta_data->>'name', ' ', 1)
  ),
  last_name = coalesce(
    profile.last_name,
    auth_user.raw_user_meta_data->>'last_name',
    nullif(regexp_replace(auth_user.raw_user_meta_data->>'display_name', '^\S+\s*', ''), ''),
    nullif(regexp_replace(auth_user.raw_user_meta_data->>'name', '^\S+\s*', ''), '')
  ),
  display_name = coalesce(
    profile.display_name,
    nullif(auth_user.raw_user_meta_data->>'display_name', ''),
    nullif(auth_user.raw_user_meta_data->>'name', ''),
    auth_user.email
  ),
  avatar_url = coalesce(profile.avatar_url, nullif(auth_user.raw_user_meta_data->>'avatar_url', '')),
  job_title = coalesce(profile.job_title, nullif(auth_user.raw_user_meta_data->>'job_title', '')),
  dealership_name = coalesce(
    profile.dealership_name,
    nullif(auth_user.raw_user_meta_data->>'dealership_name', '')
  ),
  territory = coalesce(profile.territory, nullif(auth_user.raw_user_meta_data->>'territory', '')),
  timezone = coalesce(
    nullif(profile.timezone, ''),
    nullif(auth_user.raw_user_meta_data->>'timezone', ''),
    'America/Chicago'
  ),
  locale = coalesce(
    nullif(profile.locale, ''),
    nullif(auth_user.raw_user_meta_data->>'locale', ''),
    'en-US'
  )
from auth.users auth_user
where profile.id = auth_user.id;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  metadata_display_name text;
  metadata_name text;
begin
  metadata_display_name := nullif(new.raw_user_meta_data->>'display_name', '');
  metadata_name := nullif(new.raw_user_meta_data->>'name', '');

  insert into public.profiles (
    id,
    first_name,
    last_name,
    email,
    display_name,
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
    coalesce(
      nullif(new.raw_user_meta_data->>'first_name', ''),
      split_part(coalesce(metadata_display_name, metadata_name, ''), ' ', 1)
    ),
    coalesce(
      nullif(new.raw_user_meta_data->>'last_name', ''),
      nullif(regexp_replace(coalesce(metadata_display_name, metadata_name, ''), '^\S+\s*', ''), '')
    ),
    new.email,
    coalesce(metadata_display_name, metadata_name, new.email),
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
    display_name = excluded.display_name,
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
