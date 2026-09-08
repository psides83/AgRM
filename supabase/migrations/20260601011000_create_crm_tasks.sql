create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  contact_id uuid references public.contacts(id) on delete cascade,
  company_id uuid references public.companies(id) on delete set null,
  lead_id uuid references public.leads(id) on delete cascade,
  title text not null,
  body text,
  due_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (contact_id is not null or lead_id is not null)
);

create trigger set_tasks_updated_at
before update on public.tasks
for each row execute function public.set_updated_at();

create index if not exists tasks_owner_completed_due_idx
on public.tasks(owner_id, completed_at, due_at);

create index if not exists tasks_contact_id_idx
on public.tasks(contact_id);

create index if not exists tasks_lead_id_idx
on public.tasks(lead_id);

alter table public.tasks enable row level security;

create policy "Tasks are viewable by owner"
on public.tasks for select
using (auth.uid() = owner_id);

create policy "Tasks are insertable by owner"
on public.tasks for insert
with check (auth.uid() = owner_id);

create policy "Tasks are updatable by owner"
on public.tasks for update
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

create policy "Tasks are deletable by owner"
on public.tasks for delete
using (auth.uid() = owner_id);

alter table public.tasks replica identity full;

do $$
begin
  alter publication supabase_realtime add table public.tasks;
exception
  when duplicate_object then null;
end;
$$;

insert into public.tasks (
  owner_id,
  contact_id,
  company_id,
  lead_id,
  title,
  body,
  due_at,
  completed_at,
  created_at,
  updated_at
)
select
  owner_id,
  contact_id,
  company_id,
  lead_id,
  subject,
  body,
  due_at,
  completed_at,
  created_at,
  updated_at
from public.activities
where type = 'task'
  and (contact_id is not null or lead_id is not null);

delete from public.activities
where type = 'task'
  and (contact_id is not null or lead_id is not null);
