alter table public.profiles
add column if not exists theme_mode text
check (theme_mode is null or theme_mode in ('light', 'dark', 'system')),
add column if not exists theme_preset text,
add column if not exists primary_color text;
