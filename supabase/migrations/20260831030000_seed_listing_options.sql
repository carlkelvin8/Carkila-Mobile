begin;

insert into public.categories (name, slug) values
  ('Bus', 'bus'),
  ('Coaster', 'coaster'),
  ('Van', 'van'),
  ('Car', 'car'),
  ('Truck', 'truck'),
  ('Motorcycle', 'motorcycle'),
  ('Logistics', 'logistics'),
  ('Heavy Equipment', 'heavy-equipment')
on conflict (slug) do update set name = excluded.name;

with seed(category_slug, name, slug) as (values
  ('bus', 'Tourist Bus', 'tourist-bus'),
  ('bus', 'Mini Bus', 'mini-bus'),
  ('coaster', 'Coaster', 'coaster'),
  ('van', 'Passenger Van', 'passenger-van'),
  ('van', 'Cargo Van', 'cargo-van'),
  ('car', 'Sedan', 'sedan'),
  ('car', 'SUV', 'suv'),
  ('car', 'MPV', 'mpv'),
  ('car', 'Bridal Car', 'bridal-car'),
  ('truck', '4 Wheeler', '4-wheeler'),
  ('truck', '6 Wheeler', '6-wheeler'),
  ('truck', '10 Wheeler', '10-wheeler'),
  ('motorcycle', 'Scooter', 'scooter'),
  ('motorcycle', 'Standard Motorcycle', 'standard-motorcycle'),
  ('logistics', 'Hauling Service', 'hauling-service'),
  ('logistics', 'Delivery Service', 'delivery-service'),
  ('logistics', 'Moving Service', 'moving-service'),
  ('heavy-equipment', 'Excavator', 'excavator'),
  ('heavy-equipment', 'Backhoe', 'backhoe'),
  ('heavy-equipment', 'Bulldozer', 'bulldozer'),
  ('heavy-equipment', 'Crane', 'crane')
)
insert into public.subcategories (category_id, name, slug)
select c.id, seed.name, seed.slug
from seed join public.categories c on c.slug = seed.category_slug
on conflict (slug) do update set category_id = excluded.category_id, name = excluded.name;

insert into public.vehicle_types (name) values
  ('Higer'), ('Universe'), ('Grandia'), ('Urvan'), ('Sedan'), ('SUV'),
  ('MPV'), ('4 Wheeler'), ('6 Wheeler'), ('10 Wheeler'), ('Scooter'),
  ('Bridal Car'), ('Backhoe'), ('Bulldozer'), ('Excavator'), ('Crane'),
  ('Boat / Yacht'), ('Other')
on conflict (name_norm) do nothing;

commit;
