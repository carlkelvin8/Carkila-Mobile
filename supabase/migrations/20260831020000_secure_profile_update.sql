begin;

create or replace function public.update_my_profile(p_changes jsonb)
returns public.profiles
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_profile public.profiles;
  v_invalid_key text;
begin
  if v_user_id is null then
    raise exception 'You must be signed in.' using errcode = '42501';
  end if;
  if p_changes is null or jsonb_typeof(p_changes) <> 'object' then
    raise exception 'Profile changes must be an object.' using errcode = '22023';
  end if;

  select key into v_invalid_key
  from jsonb_object_keys(p_changes) as key
  where key not in (
    'name', 'display_name', 'location_id', 'based_location', 'user_type',
    'birthday', 'gender', 'mobile_number', 'website', 'bio',
    'profile_photo_path', 'show_reviews', 'show_active_status', 'last_seen_at'
  )
  limit 1;
  if v_invalid_key is not null then
    raise exception 'Profile field is not editable: %', v_invalid_key using errcode = '42501';
  end if;

  update public.profiles p set
    name = case when p_changes ? 'name' then nullif(btrim(p_changes->>'name'), '') else p.name end,
    display_name = case when p_changes ? 'display_name' then nullif(btrim(p_changes->>'display_name'), '') else p.display_name end,
    location_id = case when p_changes ? 'location_id' then nullif(p_changes->>'location_id', '')::bigint else p.location_id end,
    based_location = case when p_changes ? 'based_location' then nullif(btrim(p_changes->>'based_location'), '') else p.based_location end,
    user_type = case when p_changes ? 'user_type' then nullif(btrim(p_changes->>'user_type'), '') else p.user_type end,
    birthday = case when p_changes ? 'birthday' then nullif(p_changes->>'birthday', '')::date else p.birthday end,
    gender = case when p_changes ? 'gender' then nullif(btrim(p_changes->>'gender'), '') else p.gender end,
    mobile_number = case when p_changes ? 'mobile_number' then nullif(btrim(p_changes->>'mobile_number'), '') else p.mobile_number end,
    website = case when p_changes ? 'website' then nullif(btrim(p_changes->>'website'), '') else p.website end,
    bio = case when p_changes ? 'bio' then nullif(btrim(p_changes->>'bio'), '') else p.bio end,
    profile_photo_path = case when p_changes ? 'profile_photo_path' then nullif(btrim(p_changes->>'profile_photo_path'), '') else p.profile_photo_path end,
    show_reviews = case when p_changes ? 'show_reviews' then (p_changes->>'show_reviews')::boolean else p.show_reviews end,
    show_active_status = case when p_changes ? 'show_active_status' then (p_changes->>'show_active_status')::boolean else p.show_active_status end,
    last_seen_at = case when p_changes ? 'last_seen_at' then nullif(p_changes->>'last_seen_at', '')::timestamptz else p.last_seen_at end,
    updated_at = timezone('utc', now())
  where p.id = v_user_id and p.deleted_at is null
  returning p.* into v_profile;

  if v_profile.id is null then
    raise exception 'Profile not found.' using errcode = 'P0002';
  end if;
  if v_profile.display_name is null or char_length(v_profile.display_name) not between 2 and 80 then
    raise exception 'Display name must contain 2 to 80 characters.' using errcode = '22023';
  end if;
  if v_profile.bio is not null and char_length(v_profile.bio) > 500 then
    raise exception 'Bio must not exceed 500 characters.' using errcode = '22023';
  end if;
  if v_profile.website is not null and v_profile.website !~* '^https?://' then
    raise exception 'Website must start with http:// or https://.' using errcode = '22023';
  end if;

  return v_profile;
end;
$$;

revoke all on function public.update_my_profile(jsonb) from public, anon;
grant execute on function public.update_my_profile(jsonb) to authenticated;

commit;
