begin;

-- Do not expose private profile columns through PostgREST relationship queries.
revoke select,update on public.profiles from anon,authenticated;
grant select(id,name,display_name,role,is_verified,based_location,bio,website,profile_photo_path,show_reviews,show_active_status,created_at,updated_at,location_id)
on public.profiles to anon,authenticated;
grant update(name,display_name,location_id,based_location,user_type,birthday,gender,mobile_number,website,bio,profile_photo_path,show_reviews,show_active_status,last_seen_at)
on public.profiles to authenticated;

create or replace function public.get_my_profile()
returns public.profiles language sql stable security definer set search_path='' as $$
  select p from public.profiles p where p.id=auth.uid() and p.deleted_at is null;
$$;
revoke all on function public.get_my_profile() from public,anon;
grant execute on function public.get_my_profile() to authenticated;

-- Clients may edit public profile fields, but never authorization, moderation, or balances.
create or replace function public.protect_profile_system_fields()
returns trigger language plpgsql set search_path = '' as $$
begin
  if current_user not in ('postgres', 'supabase_admin') and (
    new.id is distinct from old.id or new.role is distinct from old.role or
    new.is_verified is distinct from old.is_verified or new.is_banned is distinct from old.is_banned or
    new.credits_balance is distinct from old.credits_balance or new.profile_views is distinct from old.profile_views or
    new.deleted_at is distinct from old.deleted_at
  ) then raise exception 'System-managed profile fields cannot be changed by clients' using errcode = '42501'; end if;
  return new;
end; $$;
drop trigger if exists protect_profile_system_fields on public.profiles;
create trigger protect_profile_system_fields before update on public.profiles
for each row execute function public.protect_profile_system_fields();

create or replace function public.protect_listing_lifecycle()
returns trigger language plpgsql set search_path='' as $$
begin
  if current_user not in ('postgres','supabase_admin') and
    (new.status,new.published_at,new.renewed_at,new.start_date,new.end_date) is distinct from
    (old.status,old.published_at,old.renewed_at,old.start_date,old.end_date)
  then raise exception 'Use the listing publish or renew operation' using errcode='42501'; end if;
  return new;
end; $$;
drop trigger if exists protect_listing_lifecycle on public.listings;
create trigger protect_listing_lifecycle before update on public.listings
for each row execute function public.protect_listing_lifecycle();

-- A conversation must be started by its buyer and must point to the vehicle owner.
drop policy if exists conversations_participant_all on public.conversations;
create policy conversations_participant_read on public.conversations for select to authenticated
using ((select auth.uid()) in (buyer_id, vendor_id));
create policy conversations_buyer_insert on public.conversations for insert to authenticated
with check (
  (select auth.uid()) = buyer_id and buyer_id <> vendor_id and
  exists (select 1 from public.vehicles v where v.id = vehicle_id and v.vendor_id = vendor_id and v.deleted_at is null)
);
create policy conversations_participant_update on public.conversations for update to authenticated
using ((select auth.uid()) in (buyer_id, vendor_id)) with check ((select auth.uid()) in (buyer_id, vendor_id));

create or replace function public.protect_conversation_identity()
returns trigger language plpgsql set search_path = '' as $$
begin
  if (new.buyer_id, new.vendor_id, new.vehicle_id) is distinct from (old.buyer_id, old.vendor_id, old.vehicle_id)
  then raise exception 'Conversation participants and vehicle are immutable' using errcode = '42501'; end if;
  return new;
end; $$;
create trigger protect_conversation_identity before update on public.conversations
for each row execute function public.protect_conversation_identity();

drop policy if exists messages_sender_insert on public.messages;
create policy messages_sender_insert on public.messages for insert to authenticated with check (
  (select auth.uid()) = sender_id and sender_id <> receiver_id and
  exists (select 1 from public.conversations c where c.id = conversation_id and
    sender_id in (c.buyer_id,c.vendor_id) and receiver_id in (c.buyer_id,c.vendor_id))
);
create or replace function public.protect_message_content()
returns trigger language plpgsql set search_path = '' as $$
begin
  if (new.conversation_id,new.sender_id,new.receiver_id,new.message,new.attachment_path,new.attachment_name,new.attachment_mime,new.attachment_size,new.sent_at)
    is distinct from
     (old.conversation_id,old.sender_id,old.receiver_id,old.message,old.attachment_path,old.attachment_name,old.attachment_mime,old.attachment_size,old.sent_at)
  then raise exception 'Message content and participants are immutable' using errcode = '42501'; end if;
  return new;
end; $$;
create trigger protect_message_content before update on public.messages
for each row execute function public.protect_message_content();
alter table public.messages add constraint messages_text_length check (message is null or char_length(message) between 1 and 4000) not valid;
alter table public.messages add constraint messages_attachment_size check (attachment_size is null or attachment_size between 1 and 20971520) not valid;

-- Private message attachments are readable by either conversation participant.
drop policy if exists users_read_own_private_attachments on storage.objects;
create policy conversation_participants_read_attachments on storage.objects for select to authenticated using (
  bucket_id = 'message-attachments' and exists (
    select 1 from public.messages m join public.conversations c on c.id = m.conversation_id
    where m.attachment_path = name and (select auth.uid()) in (c.buyer_id,c.vendor_id)
  )
);

-- Prevent duplicate reviews and self-reviews at the database boundary.
update public.reviews r set vendor_id=v.vendor_id from public.vehicles v where v.id=r.vehicle_id and r.vendor_id is distinct from v.vendor_id;
update public.reviews set deleted_at=coalesce(deleted_at,timezone('utc',now())) where customer_id=vendor_id;
with ranked as (select id,row_number() over(partition by customer_id,vehicle_id order by created_at,id) n from public.reviews where deleted_at is null)
update public.reviews r set deleted_at=timezone('utc',now()) from ranked x where r.id=x.id and x.n>1;
create unique index if not exists reviews_customer_vehicle_unique
on public.reviews(customer_id,vehicle_id) where deleted_at is null;
alter table public.reviews drop constraint if exists reviews_no_self_review;
alter table public.reviews add constraint reviews_no_self_review check (customer_id <> vendor_id);
create or replace function public.set_review_vendor()
returns trigger language plpgsql set search_path='' as $$
begin
  select vendor_id into new.vendor_id from public.vehicles where id=new.vehicle_id and deleted_at is null;
  if new.vendor_id is null then raise exception 'Vehicle not found'; end if;
  return new;
end; $$;
drop trigger if exists set_review_vendor on public.reviews;
create trigger set_review_vendor before insert or update of vehicle_id,vendor_id on public.reviews
for each row execute function public.set_review_vendor();

drop policy if exists transactions_buyer_insert on public.transactions;
create policy transactions_buyer_insert on public.transactions for insert to authenticated
with check ((select auth.uid())=buyer_id and status='pending');

-- Publishing consumes one credit atomically. Only narrow, ownership-checked RPCs run as owner.
create or replace function public.consume_listing_credit(p_user_id uuid, p_listing_id bigint, p_reason text)
returns void language plpgsql security definer set search_path = '' as $$
declare v_balance integer;
begin
  select credits_balance into v_balance from public.profiles where id=p_user_id for update;
  if coalesce(v_balance,0) < 1 then raise exception 'A listing credit is required' using errcode='P0001'; end if;
  update public.profiles set credits_balance=credits_balance-1 where id=p_user_id;
  insert into public.listing_credit_transactions(user_id,type,delta,listing_id,title,meta)
  values(p_user_id,'consume',-1,p_listing_id,'Listing credit used',p_reason);
end; $$;
revoke all on function public.consume_listing_credit(uuid,bigint,text) from public,anon,authenticated;

create or replace function public.publish_listing(p_listing_id bigint)
returns public.listings language plpgsql security definer set search_path = '' as $$
declare v_user uuid:=auth.uid(); v_listing public.listings; v_status text;
begin
  if v_user is null then raise exception 'Authentication required' using errcode='42501'; end if;
  select l.status into v_status from public.listings l join public.vehicles v on v.id=l.vehicle_id
  where l.id=p_listing_id and v.vendor_id=v_user and l.deleted_at is null for update;
  if v_status is null then raise exception 'Listing not found or not permitted' using errcode='42501'; end if;
  if v_status <> 'active' then perform public.consume_listing_credit(v_user,p_listing_id,'publish'); end if;
  update public.listings set status='active',published_at=coalesce(published_at,timezone('utc',now())),deleted_at=null
  where id=p_listing_id returning * into v_listing; return v_listing;
end; $$;
revoke all on function public.publish_listing(bigint) from public,anon;
grant execute on function public.publish_listing(bigint) to authenticated;

create or replace function public.renew_listing(p_listing_id bigint,p_days integer default 365)
returns public.listings language plpgsql security definer set search_path='' as $$
declare v_user uuid:=auth.uid();v_listing public.listings;
begin
  if v_user is null then raise exception 'Authentication required' using errcode='42501'; end if;
  if p_days not between 1 and 730 then raise exception 'Renewal days must be between 1 and 730'; end if;
  perform 1 from public.listings l join public.vehicles v on v.id=l.vehicle_id where l.id=p_listing_id and v.vendor_id=v_user and l.deleted_at is null for update;
  if not found then raise exception 'Listing not found or not permitted' using errcode='42501'; end if;
  perform public.consume_listing_credit(v_user,p_listing_id,'renew');
  update public.listings set status='active',start_date=current_date,end_date=current_date+p_days,renewed_at=timezone('utc',now()),published_at=coalesce(published_at,timezone('utc',now()))
  where id=p_listing_id returning * into v_listing;return v_listing;
end; $$;
revoke all on function public.renew_listing(bigint,integer) from public,anon;
grant execute on function public.renew_listing(bigint,integer) to authenticated;

-- Creating an active listing delegates credit enforcement to publish_listing.
create or replace function public.create_listing(
  p_title text,p_description text,p_price numeric,p_price_unit text,p_location text,p_status text default 'draft',
  p_start_date date default current_date,p_end_date date default (current_date+365),p_subcategory_id bigint default null,
  p_brand_id bigint default null,p_type_id bigint default null,p_fuel_included boolean default false,
  p_parking_fee_included boolean default false,p_toll_fee_included boolean default false,p_self_driving_allowed boolean default false,
  p_seating_capacity smallint default null
) returns public.listings language plpgsql security definer set search_path='' as $$
declare v_user uuid:=auth.uid();v_location bigint;v_vehicle bigint;v_listing public.listings;v_city text:=nullif(btrim(p_location),'');
begin
  if v_user is null then raise exception 'Authentication required' using errcode='42501'; end if;
  if char_length(btrim(p_title)) not between 3 and 120 then raise exception 'Title must be 3 to 120 characters'; end if;
  if char_length(btrim(p_description)) not between 20 and 5000 then raise exception 'Description must be 20 to 5000 characters'; end if;
  if p_price is null or p_price < 0 or p_price > 100000000 then raise exception 'Invalid price'; end if;
  if p_price_unit not in ('day','km','hr') or p_status not in ('draft','active') then raise exception 'Invalid listing option'; end if;
  if v_city is null or char_length(v_city) not between 2 and 100 then raise exception 'Invalid location'; end if;
  if p_seating_capacity is not null and p_seating_capacity not between 1 and 500 then raise exception 'Invalid seating capacity'; end if;
  insert into public.locations(city) values(v_city) on conflict(location_key) do update set city=excluded.city returning id into v_location;
  insert into public.vehicles(vendor_id,title,description,brand_id,type_id,subcategory_id,price_per_day,price_unit,location_id,full_address,fuel_included,parking_fee_included,toll_fee_included,self_driving_allowed,seating_capacity)
  values(v_user,btrim(p_title),btrim(p_description),p_brand_id,p_type_id,p_subcategory_id,p_price,p_price_unit,v_location,v_city,p_fuel_included,p_parking_fee_included,p_toll_fee_included,p_self_driving_allowed,p_seating_capacity) returning id into v_vehicle;
  insert into public.listings(vehicle_id,start_date,end_date,status,published_at) values(v_vehicle,p_start_date,p_end_date,'draft',null) returning * into v_listing;
  if p_status='active' then v_listing:=public.publish_listing(v_listing.id); end if;
  return v_listing;
end; $$;
revoke all on function public.create_listing(text,text,numeric,text,text,text,date,date,bigint,bigint,bigint,boolean,boolean,boolean,boolean,smallint) from public,anon;
grant execute on function public.create_listing(text,text,numeric,text,text,text,date,date,bigint,bigint,bigint,boolean,boolean,boolean,boolean,smallint) to authenticated;

commit;
