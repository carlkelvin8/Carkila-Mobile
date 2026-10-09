begin;

create or replace function public.create_listing(
  p_title text,
  p_description text,
  p_price numeric,
  p_price_unit text,
  p_location text,
  p_status text default 'draft',
  p_start_date date default current_date,
  p_end_date date default (current_date + 365),
  p_subcategory_id bigint default null,
  p_brand_id bigint default null,
  p_type_id bigint default null,
  p_fuel_included boolean default false,
  p_parking_fee_included boolean default false,
  p_toll_fee_included boolean default false,
  p_self_driving_allowed boolean default false,
  p_seating_capacity smallint default null
)
returns public.listings
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_location_id bigint;
  v_vehicle_id bigint;
  v_listing public.listings;
  v_city text := nullif(btrim(p_location), '');
begin
  if v_user_id is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  if nullif(btrim(p_title), '') is null then raise exception 'Title is required'; end if;
  if nullif(btrim(p_description), '') is null then raise exception 'Description is required'; end if;
  if p_price is null or p_price < 0 then raise exception 'Price must be zero or greater'; end if;
  if p_price_unit not in ('day','km','hr') then raise exception 'Invalid price unit'; end if;
  if v_city is null then raise exception 'Location is required'; end if;
  if p_status not in ('draft','active') then raise exception 'Invalid initial status'; end if;
  if p_end_date < p_start_date then raise exception 'End date must not be before start date'; end if;

  select id into v_location_id from public.locations
  where location_key = lower(v_city) || '|' limit 1;

  if v_location_id is null then
    insert into public.locations(city) values (v_city) returning id into v_location_id;
  end if;

  insert into public.vehicles(
    vendor_id, title, description, brand_id, type_id, subcategory_id,
    price_per_day, price_unit, location_id, full_address,
    fuel_included, parking_fee_included, toll_fee_included,
    self_driving_allowed, seating_capacity
  ) values (
    v_user_id, btrim(p_title), btrim(p_description), p_brand_id, p_type_id, p_subcategory_id,
    p_price, p_price_unit, v_location_id, v_city,
    p_fuel_included, p_parking_fee_included, p_toll_fee_included,
    p_self_driving_allowed, p_seating_capacity
  ) returning id into v_vehicle_id;

  insert into public.listings(vehicle_id, start_date, end_date, status, published_at)
  values (v_vehicle_id, p_start_date, p_end_date, p_status,
    case when p_status = 'active' then timezone('utc', now()) else null end)
  returning * into v_listing;

  return v_listing;
end;
$$;

create policy locations_authenticated_insert
on public.locations for insert
to authenticated
with check (char_length(btrim(city)) between 2 and 100);

revoke all on function public.create_listing(
  text,text,numeric,text,text,text,date,date,bigint,bigint,bigint,boolean,boolean,boolean,boolean,smallint
) from public, anon;
grant execute on function public.create_listing(
  text,text,numeric,text,text,text,date,date,bigint,bigint,bigint,boolean,boolean,boolean,boolean,smallint
) to authenticated;

create or replace function public.publish_listing(p_listing_id bigint)
returns public.listings
language plpgsql
security invoker
set search_path = ''
as $$
declare v_listing public.listings;
begin
  update public.listings
  set status = 'active', published_at = coalesce(published_at, timezone('utc', now())), deleted_at = null
  where id = p_listing_id
  returning * into v_listing;
  if v_listing.id is null then raise exception 'Listing not found or not permitted' using errcode = '42501'; end if;
  return v_listing;
end;
$$;
revoke all on function public.publish_listing(bigint) from public, anon;
grant execute on function public.publish_listing(bigint) to authenticated;

create or replace function public.renew_listing(p_listing_id bigint, p_days integer default 365)
returns public.listings
language plpgsql
security invoker
set search_path = ''
as $$
declare v_listing public.listings;
begin
  if p_days < 1 or p_days > 730 then raise exception 'Renewal days must be between 1 and 730'; end if;
  update public.listings
  set status = 'active', start_date = current_date, end_date = current_date + p_days,
      renewed_at = timezone('utc', now()), published_at = coalesce(published_at, timezone('utc', now()))
  where id = p_listing_id
  returning * into v_listing;
  if v_listing.id is null then raise exception 'Listing not found or not permitted' using errcode = '42501'; end if;
  return v_listing;
end;
$$;
revoke all on function public.renew_listing(bigint, integer) from public, anon;
grant execute on function public.renew_listing(bigint, integer) to authenticated;

commit;
