alter table public.companies replica identity full;
alter table public.contacts replica identity full;
alter table public.leads replica identity full;
alter table public.deals replica identity full;
alter table public.equipment_interests replica identity full;
alter table public.activities replica identity full;
alter table public.notes replica identity full;
alter table public.files replica identity full;

do $$
begin
  alter publication supabase_realtime add table public.companies;
exception
  when duplicate_object then null;
end;
$$;

do $$
begin
  alter publication supabase_realtime add table public.contacts;
exception
  when duplicate_object then null;
end;
$$;

do $$
begin
  alter publication supabase_realtime add table public.leads;
exception
  when duplicate_object then null;
end;
$$;

do $$
begin
  alter publication supabase_realtime add table public.deals;
exception
  when duplicate_object then null;
end;
$$;

do $$
begin
  alter publication supabase_realtime add table public.equipment_interests;
exception
  when duplicate_object then null;
end;
$$;

do $$
begin
  alter publication supabase_realtime add table public.activities;
exception
  when duplicate_object then null;
end;
$$;

do $$
begin
  alter publication supabase_realtime add table public.notes;
exception
  when duplicate_object then null;
end;
$$;

do $$
begin
  alter publication supabase_realtime add table public.files;
exception
  when duplicate_object then null;
end;
$$;
