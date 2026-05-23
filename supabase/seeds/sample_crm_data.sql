-- Replace this UUID with your Supabase auth user id before running.
-- Find it in Supabase Dashboard > Authentication > Users.
with seed_owner as (
  select 'd61cfb5f-d4ea-4fdc-bf2e-11ffad664288'::uuid as owner_id
),
inserted_companies as (
  insert into public.companies (
    owner_id,
    name,
    company_type,
    phone,
    email,
    address_line1,
    city,
    region,
    postal_code,
    country,
    notes
  )
  select
    owner_id,
    company.name,
    company.company_type,
    company.phone,
    company.email,
    company.address_line1,
    company.city,
    company.region,
    company.postal_code,
    'US',
    company.notes
  from seed_owner
  cross join (
    values
      (
        'Prairie View Farms',
        'Row crop farm',
        '(515) 555-0134',
        'office@prairieview.example',
        '2148 County Road 18',
        'Ames',
        'IA',
        '50010',
        'Corn and soybean operation. Interested in planter upgrades before spring.'
      ),
      (
        'Riverbend Custom Ag',
        'Custom operator',
        '(785) 555-0198',
        'dispatch@riverbend.example',
        '8899 Highway 24',
        'Manhattan',
        'KS',
        '66502',
        'Runs hay, spraying, and custom tillage work across three counties.'
      ),
      (
        'North Ridge Dairy',
        'Dairy farm',
        '(920) 555-0167',
        'barn@northridge.example',
        '402 Milkhouse Lane',
        'Fond du Lac',
        'WI',
        '54935',
        'Looking at compact utility tractors and loader attachments.'
      )
  ) as company(name, company_type, phone, email, address_line1, city, region, postal_code, notes)
  on conflict (owner_id, name) do update set
    company_type = excluded.company_type,
    phone = excluded.phone,
    email = excluded.email,
    address_line1 = excluded.address_line1,
    city = excluded.city,
    region = excluded.region,
    postal_code = excluded.postal_code,
    notes = excluded.notes
  returning id, name, owner_id
),
inserted_contacts as (
  insert into public.contacts (
    owner_id,
    company_id,
    first_name,
    last_name,
    title,
    email,
    phone,
    mobile_phone,
    city,
    region,
    tags,
    notes
  )
  select
    company.owner_id,
    company.id,
    contact.first_name,
    contact.last_name,
    contact.title,
    contact.email,
    contact.phone,
    contact.mobile_phone,
    contact.city,
    contact.region,
    contact.tags,
    contact.notes
  from inserted_companies company
  join (
    values
      (
        'Prairie View Farms',
        'Ethan',
        'Miller',
        'Owner',
        'ethan@prairieview.example',
        '(515) 555-0140',
        '(515) 555-0141',
        'Ames',
        'IA',
        array['Prospect', 'Planter'],
        'Prefers text. Wants numbers before the winter farm show.'
      ),
      (
        'Riverbend Custom Ag',
        'Maria',
        'Lopez',
        'Operations Manager',
        'maria@riverbend.example',
        '(785) 555-0112',
        '(785) 555-0113',
        'Manhattan',
        'KS',
        array['Customer', 'Sprayer'],
        'Runs long hours during application season. Ask about service window.'
      ),
      (
        'North Ridge Dairy',
        'Caleb',
        'Schneider',
        'Herd Manager',
        'caleb@northridge.example',
        '(920) 555-0120',
        '(920) 555-0121',
        'Fond du Lac',
        'WI',
        array['Prospect', 'Loader'],
        'Needs easy cab access and loader visibility.'
      )
  ) as contact(company_name, first_name, last_name, title, email, phone, mobile_phone, city, region, tags, notes)
    on contact.company_name = company.name
  returning id, owner_id, company_id, first_name, last_name
),
inserted_leads as (
  insert into public.leads (
    owner_id,
    contact_id,
    company_id,
    source,
    status,
    priority,
    estimated_budget,
    target_purchase_date,
    last_contacted_at,
    next_follow_up_at,
    notes
  )
  select
    contact.owner_id,
    contact.id,
    contact.company_id,
    lead.source,
    lead.status::public.lead_status,
    lead.priority,
    lead.estimated_budget,
    lead.target_purchase_date,
    lead.last_contacted_at,
    lead.next_follow_up_at,
    lead.notes
  from inserted_contacts contact
  join (
    values
      (
        'Ethan',
        'Miller',
        'Referral',
        'working',
        2,
        185000.00,
        current_date + interval '90 days',
        now() - interval '2 days',
        now() + interval '3 days',
        'Compare high-speed planter options and financing programs.'
      ),
      (
        'Maria',
        'Lopez',
        'Service department',
        'qualified',
        1,
        325000.00,
        current_date + interval '45 days',
        now() - interval '1 day',
        now() + interval '1 day',
        'Needs sprayer availability before pre-emerge season.'
      ),
      (
        'Caleb',
        'Schneider',
        'Walk-in',
        'new',
        3,
        72000.00,
        current_date + interval '120 days',
        now() - interval '7 days',
        now() + interval '10 days',
        'Compact tractor with loader for dairy chores.'
      )
  ) as lead(first_name, last_name, source, status, priority, estimated_budget, target_purchase_date, last_contacted_at, next_follow_up_at, notes)
    on lead.first_name = contact.first_name and lead.last_name = contact.last_name
  returning id, owner_id, contact_id, company_id, source
)
insert into public.equipment_interests (
  owner_id,
  contact_id,
  lead_id,
  category,
  make,
  model,
  condition,
  horsepower,
  row_count,
  row_spacing,
  guidance_ready,
  loader_included,
  price_min,
  price_max,
  trade_in,
  purchase_timeline,
  preferred_financing,
  notes
)
select
  lead.owner_id,
  lead.contact_id,
  lead.id,
  equipment.category::public.equipment_category,
  equipment.make,
  equipment.model,
  equipment.condition::public.equipment_condition,
  equipment.horsepower,
  equipment.row_count,
  equipment.row_spacing,
  equipment.guidance_ready,
  equipment.loader_included,
  equipment.price_min,
  equipment.price_max,
  equipment.trade_in,
  equipment.purchase_timeline::public.purchase_timeline,
  equipment.preferred_financing::public.financing_preference,
  equipment.notes
from inserted_leads lead
join (
  values
    (
      'Referral',
      'planter',
      'John Deere',
      '1775NT',
      'either',
      null,
      16,
      '30 in',
      true,
      false,
      140000.00,
      210000.00,
      true,
      'this_quarter',
      'manufacturer_program',
      'Interested in ExactEmerge or comparable high-speed setup.'
    ),
    (
      'Service department',
      'sprayer',
      'John Deere',
      'R4045',
      'used',
      null,
      null,
      null,
      true,
      false,
      275000.00,
      360000.00,
      true,
      'this_month',
      'finance',
      'Needs 120 ft boom and section control.'
    ),
    (
      'Walk-in',
      'tractor',
      'John Deere',
      '5M',
      'new',
      75,
      null,
      null,
      false,
      true,
      62000.00,
      82000.00,
      false,
      'this_year',
      'lease',
      'Loader work around freestall barn and feed storage.'
    )
) as equipment(source, category, make, model, condition, horsepower, row_count, row_spacing, guidance_ready, loader_included, price_min, price_max, trade_in, purchase_timeline, preferred_financing, notes)
  on equipment.source = lead.source;
