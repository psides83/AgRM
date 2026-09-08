alter type public.equipment_availability add value if not exists 'in_stock';

create table if not exists public.equipment_locations (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  address_line1 text not null,
  city text not null,
  region text not null,
  postal_code text not null,
  country text not null default 'US',
  phone text,
  latitude double precision,
  longitude double precision,
  notes text,
  source_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.equipment_locations enable row level security;

drop policy if exists "Equipment locations are viewable by authenticated users"
on public.equipment_locations;

create policy "Equipment locations are viewable by authenticated users"
on public.equipment_locations for select
to authenticated
using (true);

drop trigger if exists set_equipment_locations_updated_at
on public.equipment_locations;

create trigger set_equipment_locations_updated_at
before update on public.equipment_locations
for each row execute function public.set_updated_at();

alter table public.equipment_interests
add column if not exists equipment_location_id uuid references public.equipment_locations(id) on delete set null;

create index if not exists equipment_interests_location_idx
on public.equipment_interests(owner_id, equipment_location_id);

insert into public.equipment_locations (slug, name, address_line1, city, region, postal_code, phone, notes, source_url)
values
  ('abilene-tx', 'Abilene, TX', '4017 Loop 322', 'Abilene', 'TX', '79602', '325-692-2255', null, 'https://www.unitedagandturf.com/about-us/locations'),
  ('ardmore-ok', 'Ardmore, OK', '6010 West Broadway', 'Ardmore', 'OK', '73401', '580-223-7722', null, 'https://www.unitedagandturf.com/about-us/locations'),
  ('athens-tx', 'Athens, TX', '2001 NE Loop 7', 'Athens', 'TX', '75751', '903-675-8502', null, 'https://www.unitedagandturf.com/about-us/locations'),
  ('bernalillo-nm', 'Bernalillo, NM', '1429 South Camino Del Pueblo', 'Bernalillo', 'NM', '87004', '830-693-6477', 'Golf & Sports Turf Machinery - Commercial Only', 'https://www.unitedagandturf.com/about-us/locations'),
  ('brady-tx', 'Brady, TX', '800 San Angelo Highway', 'Brady', 'TX', '76825', '325-597-2952', null, 'https://www.unitedagandturf.com/about-us/locations'),
  ('bryan-tx', 'Bryan, TX', '3110 Hwy 21 W', 'Bryan', 'TX', '77803', '979-822-7684', null, 'https://www.unitedagandturf.com/about-us/locations'),
  ('burkburnett-tx', 'Burkburnett, TX', '2112 S. Red River Expressway', 'Burkburnett', 'TX', '76354', '940-569-1483', null, 'https://www.unitedagandturf.com/about-us/locations'),
  ('cameron-tx', 'Cameron, TX', '2401 N. Travis Ave.', 'Cameron', 'TX', '76520', '254-534-6005', null, 'https://www.unitedagandturf.com/about-us/locations'),
  ('cleburne-tx', 'Cleburne, TX', '3319 North Main', 'Cleburne', 'TX', '76031', '817-641-7861', null, 'https://www.unitedagandturf.com/about-us/locations'),
  ('coleman-tx', 'Coleman, TX', '511 Santa Anna Ave', 'Coleman', 'TX', '76834', '325-625-2126', null, 'https://www.unitedagandturf.com/about-us/locations'),
  ('crockett-tx', 'Crockett, TX', '1220 E Loop 304', 'Crockett', 'TX', '75835', '936-544-2011', null, 'https://www.unitedagandturf.com/about-us/locations'),
  ('denver-co', 'Denver, CO', '5353 Sherman St.', 'Denver', 'CO', '80216', '720-699-6655', 'Golf & Sports Turf Machinery - Commercial Only', 'https://www.unitedagandturf.com/about-us/locations'),
  ('de-queen-ar', 'De Queen, AR', '961 Hwy 70 East', 'De Queen', 'AR', '71832', '870-584-7222', null, 'https://www.unitedagandturf.com/about-us/locations'),
  ('durant-ok', 'Durant, OK', '3610 North 1st Street', 'Durant', 'OK', '74701', '580-924-4698', null, 'https://www.unitedagandturf.com/about-us/locations'),
  ('ennis-tx', 'Ennis, TX', '4839 N. I-45', 'Ennis', 'TX', '75119', '972-878-9691', null, 'https://www.unitedagandturf.com/about-us/locations'),
  ('farmers-branch-tx', 'Farmers Branch, TX', '2098 Valley View Lane', 'Farmers Branch', 'TX', '75234', '214-630-3300', 'Commercial Mowing & Golf & Sports Turf Machinery - Commercial Only', 'https://www.unitedagandturf.com/about-us/locations'),
  ('frederick-ok', 'Frederick, OK', '1801 East Gladstone Ave', 'Frederick', 'OK', '73542', '580-335-5541', null, 'https://www.unitedagandturf.com/about-us/locations'),
  ('gainesville-tx', 'Gainesville, TX', '1710 US-82', 'Gainesville', 'TX', '76240', '940-668-6042', null, 'https://www.unitedagandturf.com/about-us/locations'),
  ('goldthwaite-tx', 'Goldthwaite, TX', '190 HWY 84 West', 'Goldthwaite', 'TX', '76844', '325-248-6440', null, 'https://www.unitedagandturf.com/about-us/locations'),
  ('haltom-city-tx', 'Haltom City, TX', '5709 Airport Freeway', 'Haltom City', 'TX', '76117', '817-532-9800', 'Commercial Mowing & Golf & Sports Turf Machinery - Commercial Only', 'https://www.unitedagandturf.com/about-us/locations'),
  ('hamilton-tx', 'Hamilton, TX', '1130 S HWY 281', 'Hamilton', 'TX', '76531', '254-386-8103', null, 'https://www.unitedagandturf.com/about-us/locations'),
  ('henderson-tx', 'Henderson, TX', '520 Highway 79', 'Henderson', 'TX', '75654', '903-657-9549', null, 'https://www.unitedagandturf.com/about-us/locations'),
  ('hillsboro-tx', 'Hillsboro, TX', '1520 S. Abbott Ave.', 'Hillsboro', 'TX', '76645', '254-582-2572', null, 'https://www.unitedagandturf.com/about-us/locations'),
  ('hope-ar', 'Hope, AR', '3562 Hwy 278 West', 'Hope', 'AR', '71801', '870-777-6796', null, 'https://www.unitedagandturf.com/about-us/locations'),
  ('hugo-ok', 'Hugo, OK', '1700 West Jackson Street', 'Hugo', 'OK', '74743', '580-326-7556', null, 'https://www.unitedagandturf.com/about-us/locations'),
  ('lufkin-tx', 'Lufkin, TX', '900 South Medford Drive', 'Lufkin', 'TX', '75901', '936-899-7160', null, 'https://www.unitedagandturf.com/about-us/locations'),
  ('magnolia-ar', 'Magnolia, AR', '921 Hwy 82 East', 'Magnolia', 'AR', '71753', '870-234-5003', null, 'https://www.unitedagandturf.com/about-us/locations'),
  ('marble-falls-tx', 'Marble Falls, TX', '809 Steve Hawkins Pkwy', 'Marble Falls', 'TX', '78654', '830-693-6477', 'Golf & Sports Turf Machinery - Commercial Only', 'https://www.unitedagandturf.com/about-us/locations'),
  ('marshall-tx', 'Marshall, TX', '6005 E. End Blvd. S.', 'Marshall', 'TX', '75672', '903-938-8891', null, 'https://www.unitedagandturf.com/about-us/locations'),
  ('mineola-tx', 'Mineola, TX', '1409 West Broad Street', 'Mineola', 'TX', '75773', '903-569-3845', null, 'https://www.unitedagandturf.com/about-us/locations'),
  ('mt-pleasant-tx', 'Mt. Pleasant, TX', '2601 S. Jefferson Ave.', 'Mt. Pleasant', 'TX', '75455', '903-572-7961', null, 'https://www.unitedagandturf.com/about-us/locations'),
  ('munday-tx', 'Munday, TX', '10576 Hwy 277 South', 'Munday', 'TX', '76371', '940-422-4534', null, 'https://www.unitedagandturf.com/about-us/locations'),
  ('nacogdoches-tx', 'Nacogdoches, TX', '3927 Northwest Stallings Drive', 'Nacogdoches', 'TX', '75964', '936-564-7303', null, 'https://www.unitedagandturf.com/about-us/locations'),
  ('navasota-tx', 'Navasota, TX', '9819 N Hwy 6', 'Navasota', 'TX', '77868', '936-825-6575', null, 'https://www.unitedagandturf.com/about-us/locations'),
  ('paris-tx', 'Paris, TX', '2195 NE Loop 286', 'Paris', 'TX', '75460', '903-784-6673', null, 'https://www.unitedagandturf.com/about-us/locations'),
  ('pauls-valley-ok', 'Pauls Valley, OK', '1300 North Ballard Rd', 'Pauls Valley', 'OK', '73075', '405-238-3339', null, 'https://www.unitedagandturf.com/about-us/locations'),
  ('rhome-tx', 'Rhome, TX', '9769 S. U.S. Hwy 287', 'Rhome', 'TX', '76078', '817-769-1482', null, 'https://www.unitedagandturf.com/about-us/locations'),
  ('rotan-tx', 'Rotan, TX', '309 S. Cleveland', 'Rotan', 'TX', '79546', '325-735-2252', null, 'https://www.unitedagandturf.com/about-us/locations'),
  ('seymour-tx', 'Seymour, TX', '2080 US-277 B', 'Seymour', 'TX', '76380', '940-355-0520', null, 'https://www.unitedagandturf.com/about-us/locations'),
  ('stamford-tx', 'Stamford, TX', '6469 S. Hwy 277', 'Stamford', 'TX', '79553', '325-773-2788', null, 'https://www.unitedagandturf.com/about-us/locations'),
  ('sulphur-springs-tx', 'Sulphur Springs, TX', '3454 I-30 W', 'Sulphur Springs', 'TX', '75482', '903-885-2050', null, 'https://www.unitedagandturf.com/about-us/locations'),
  ('taylor-tx', 'Taylor, TX', '4000 West 2nd Street', 'Taylor', 'TX', '76574', '512-352-5296', null, 'https://www.unitedagandturf.com/about-us/locations'),
  ('temple-tx', 'Temple, TX', '2308 Barnhardt Road', 'Temple', 'TX', '76501', '254-773-9916', null, 'https://www.unitedagandturf.com/about-us/locations'),
  ('terrell-tx', 'Terrell, TX', '2402 West Moore Ave', 'Terrell', 'TX', '75160', '972-524-3000', null, 'https://www.unitedagandturf.com/about-us/locations'),
  ('texarkana-tx', 'Texarkana, TX', '900 East Loop Dr.', 'Texarkana', 'TX', '75501', '870-772-6904', null, 'https://www.unitedagandturf.com/about-us/locations'),
  ('tyler-tx', 'Tyler, TX', '14630 Hwy 155', 'Tyler', 'TX', '75703', '903-581-6621', null, 'https://www.unitedagandturf.com/about-us/locations'),
  ('van-alstyne-tx', 'Van Alstyne, TX', '875 S Henry Hynds Expy.', 'Van Alstyne', 'TX', '75495', '903-705-0444', null, 'https://www.unitedagandturf.com/about-us/locations'),
  ('waco-tx', 'Waco, TX', '6229 S I-35', 'Waco', 'TX', '76706', '254-756-5467', null, 'https://www.unitedagandturf.com/about-us/locations'),
  ('weatherford-tx', 'Weatherford, TX', '3404 E. I-20', 'Weatherford', 'TX', '76087', '817-458-3330', null, 'https://www.unitedagandturf.com/about-us/locations')
on conflict (slug) do update set
  name = excluded.name,
  address_line1 = excluded.address_line1,
  city = excluded.city,
  region = excluded.region,
  postal_code = excluded.postal_code,
  phone = excluded.phone,
  notes = excluded.notes,
  source_url = excluded.source_url;
