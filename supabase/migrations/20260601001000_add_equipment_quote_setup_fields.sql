alter table public.equipment_interests
add column if not exists quote_price numeric(12, 2) check (quote_price is null or quote_price >= 0);

create index if not exists equipment_interests_quote_price_idx
  on public.equipment_interests(owner_id, quote_price);
