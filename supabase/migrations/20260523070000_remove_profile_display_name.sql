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
    new.email,
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

alter table public.profiles
drop column if exists display_name;
