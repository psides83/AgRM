update public.equipment_interests
set availability = 'in_stock'
where availability in ('in_stock_auburn', 'in_stock_transfer');
