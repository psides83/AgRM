# AgRM Supabase

This folder keeps the database schema and local Supabase project settings in the repo.

Common commands:

```sh
supabase login
supabase link --project-ref <project-ref>
supabase db push
supabase migration new <migration-name>
```

The initial CRM schema is in `migrations/20260523000000_initial_crm_schema.sql`.

Realtime for the CRM tables is enabled in
`migrations/20260523020000_enable_crm_realtime.sql`.

Sample CRM data is available in `seeds/sample_crm_data.sql`. Replace the
placeholder owner UUID with your Supabase auth user id before running it in the
SQL editor or with `psql`.
