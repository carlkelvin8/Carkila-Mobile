import type { RealtimeChannel } from "@supabase/supabase-js";
import { getSupabase } from "../lib/supabase";

function db() {
  return getSupabase() as any;
}

function result<T = any>(response: any): T {
  if (response.error) throw new Error(response.error.message);
  return response.data as T;
}

function authRedirectUrl() {
  const appUrl = process.env.EXPO_PUBLIC_APP_URL?.replace(/\/$/, "") || "carkila://auth/callback";
  return appUrl.startsWith("http") ? `${appUrl}/auth/callback` : appUrl;
}

export const authService = {
  async signIn(identifier: string, password: string) {
    const value = identifier.trim();
    const credentials = value.includes("@") ? { email: value, password } : { phone: value, password };
    return result(await getSupabase().auth.signInWithPassword(credentials));
  },

  async signUp(email: string, password: string, name: string) {
    return result(await getSupabase().auth.signUp({
      email: email.trim(),
      password,
      options: { data: { name, display_name: name }, emailRedirectTo: authRedirectUrl() },
    }));
  },

  async resetPassword(email: string) {
    return result(await getSupabase().auth.resetPasswordForEmail(email.trim(), {
      redirectTo: authRedirectUrl(),
    }));
  },

  async signOut() {
    const response = await getSupabase().auth.signOut();
    if (response.error) throw new Error(response.error.message);
  },

  async session() {
    const response = await getSupabase().auth.getSession();
    if (response.error) throw new Error(response.error.message);
    return response.data.session;
  },

  async user() {
    const response = await getSupabase().auth.getUser();
    if (response.error) throw new Error(response.error.message);
    return response.data.user;
  },
};

export const profileService = {
  async mine() {
    return result(await db().rpc("get_my_profile"));
  },

  async byId(id: string) {
    return result(await db().from("profiles").select("id,name,display_name,role,is_verified,based_location,bio,website,profile_photo_path,show_reviews,show_active_status,created_at,locations(city,province,region)").eq("id", id).single());
  },

  async updateMine(changes: Record<string, unknown>) {
    return result(await db().rpc("update_my_profile", { p_changes: changes }));
  },

  async stats() {
    const user = await authService.user();
    if (!user) throw new Error("You must be signed in.");
    const [followers, following] = await Promise.all([
      db().from("user_follows").select("id", { count: "exact", head: true }).eq("following_id", user.id),
      db().from("user_follows").select("id", { count: "exact", head: true }).eq("follower_id", user.id),
    ]);
    if (followers.error || following.error) throw new Error(followers.error?.message || following.error?.message);
    return { followers: followers.count ?? 0, following: following.count ?? 0 };
  },
};

const listingSelect = `
  *,
  listing_likes(count),
  vehicles!inner(
    *, profiles!vehicles_vendor_id_fkey(id,name,display_name,role,is_verified,based_location,bio,website,profile_photo_path,show_reviews,show_active_status,created_at), locations(*), vehicle_brands(*), vehicle_types(*),
    subcategories(*, categories(*)), photos(*)
  )
`;

export const listingService = {
  async options() {
    const [subcategories, types] = await Promise.all([
      db().from("subcategories").select("id,name,categories(id,name)").order("name"),
      db().from("vehicle_types").select("id,name").order("name"),
    ]);
    if (subcategories.error || types.error) {
      throw new Error(subcategories.error?.message || types.error?.message || "Unable to load listing options.");
    }
    return { subcategories: subcategories.data ?? [], types: types.data ?? [] };
  },

  async publicFeed(options: { location?: string; limit?: number; order?: "recent" | "views"; followingOnly?: boolean } = {}) {
    let query = db().from("listings").select(listingSelect).eq("status", "active")
      .is("deleted_at", null).order(options.order === "views" ? "views_count" : "published_at", { ascending: false }).limit(options.limit ?? 50);
    if (options.location) query = query.ilike("vehicles.full_address", `%${options.location}%`);
    if (options.followingOnly) {
      const user = await authService.user();
      if (!user) throw new Error("You must be signed in.");
      const follows = result<any[]>(await db().from("user_follows").select("following_id").eq("follower_id", user.id));
      const ids = follows.map(item => item.following_id);
      if (!ids.length) return [];
      query = query.in("vehicles.vendor_id", ids);
    }
    return result(await query);
  },

  async details(id: number) {
    return result(await db().from("listings").select(listingSelect).eq("id", id).single());
  },

  async search(keyword: string, location: string) {
    let query = db().from("listings").select(listingSelect).eq("status", "active")
      .is("deleted_at", null).order("published_at", { ascending: false }).limit(50);
    const term = keyword.trim();
    const place = location.trim();
    if (term) query = query.or(`title.ilike.%${term}%,description.ilike.%${term}%`, { referencedTable: "vehicles" });
    if (place) query = query.ilike("vehicles.full_address", `%${place}%`);
    return result(await query);
  },

  async mine() {
    const user = (await getSupabase().auth.getUser()).data.user;
    if (!user) throw new Error("You must be signed in.");
    return result(await db().from("listings").select(listingSelect)
      .eq("vehicles.vendor_id", user.id).order("created_at", { ascending: false }));
  },

  async create(input: {
    title: string;
    description: string;
    price: number;
    priceUnit: "day" | "km" | "hr";
    location: string;
    status: "draft" | "active";
    seatingCapacity?: number | null;
    fuelIncluded?: boolean;
    parkingFeeIncluded?: boolean;
    tollFeeIncluded?: boolean;
    selfDrivingAllowed?: boolean;
    subcategoryId?: number | null;
    typeId?: number | null;
  }) {
    return result(await db().rpc("create_listing", {
      p_title: input.title,
      p_description: input.description,
      p_price: input.price,
      p_price_unit: input.priceUnit,
      p_location: input.location,
      p_status: input.status,
      p_seating_capacity: input.seatingCapacity ?? null,
      p_fuel_included: input.fuelIncluded ?? false,
      p_parking_fee_included: input.parkingFeeIncluded ?? false,
      p_toll_fee_included: input.tollFeeIncluded ?? false,
      p_self_driving_allowed: input.selfDrivingAllowed ?? false,
      p_subcategory_id: input.subcategoryId ?? null,
      p_type_id: input.typeId ?? null,
    }));
  },

  async update(id: number, changes: Record<string, unknown>) {
    return result(await db().from("listings").update(changes).eq("id", id).select().single());
  },

  async updateDetails(vehicleId: number, input: {
    title: string;
    description: string;
    price: number;
    priceUnit: "day" | "km" | "hr";
    location: string;
    seatingCapacity?: number | null;
    fuelIncluded?: boolean;
    parkingFeeIncluded?: boolean;
    tollFeeIncluded?: boolean;
    selfDrivingAllowed?: boolean;
    subcategoryId?: number | null;
    typeId?: number | null;
  }) {
    const city = input.location.trim();
    const existingLocation = await db().from("locations").select("id").eq("location_key", `${city.toLowerCase()}|`).maybeSingle();
    if (existingLocation.error) throw new Error(existingLocation.error.message);
    const location = existingLocation.data ?? result<any>(await db().from("locations").insert({ city }).select("id").single());
    return result(await db().from("vehicles").update({
      title: input.title.trim(),
      description: input.description.trim(),
      price_per_day: input.price,
      price_unit: input.priceUnit,
      location_id: location.id,
      full_address: city,
      seating_capacity: input.seatingCapacity ?? null,
      fuel_included: input.fuelIncluded ?? false,
      parking_fee_included: input.parkingFeeIncluded ?? false,
      toll_fee_included: input.tollFeeIncluded ?? false,
      self_driving_allowed: input.selfDrivingAllowed ?? false,
      subcategory_id: input.subcategoryId ?? null,
      type_id: input.typeId ?? null,
    }).eq("id", vehicleId).select().single());
  },

  async remove(id: number) {
    return result(await db().from("listings").update({ deleted_at: new Date().toISOString() }).eq("id", id).select().single());
  },

  async publish(id: number) {
    return result(await db().rpc("publish_listing", { p_listing_id: id }));
  },

  async renew(id: number, days = 365) {
    return result(await db().rpc("renew_listing", { p_listing_id: id, p_days: days }));
  },

  async addPhoto(vehicleId: number, url: string, sortOrder: number) {
    return result(await db().from("photos").insert({ vehicle_id: vehicleId, url, sort_order: sortOrder }).select().single());
  },

  async reorderPhotos(photos: Array<{ id: number; sort_order: number }>) {
    await Promise.all(photos.map(async (photo) => {
      result(await db().from("photos").update({ sort_order: photo.sort_order }).eq("id", photo.id));
    }));
  },

  async removePhoto(photo: { id: number; url?: string | null; webp_url?: string | null }) {
    result(await db().from("photos").update({ deleted_at: new Date().toISOString() }).eq("id", photo.id).select().single());
    const paths = [photo.url, photo.webp_url]
      .map((url) => storageService.publicObjectPath("vehicle-photos", url || ""))
      .filter((path): path is string => Boolean(path));
    if (paths.length) await Promise.all([...new Set(paths)].map((path) => storageService.remove("vehicle-photos", path).catch(() => undefined)));
  },
};

export const messagingService = {
  async start(vehicleId: number, vendorId: string) {
    const user = await authService.user();
    if (!user) throw new Error("You must be signed in.");
    if (user.id === vendorId) throw new Error("You cannot message your own listing.");
    return result(await db().from("conversations").upsert({
      buyer_id: user.id, vendor_id: vendorId, vehicle_id: vehicleId,
    }, { onConflict: "buyer_id,vendor_id,vehicle_id" }).select().single());
  },
  async conversations() {
    const user = (await getSupabase().auth.getUser()).data.user;
    if (!user) throw new Error("You must be signed in.");
    return result(await db().from("conversations").select(`
      *, buyer:profiles!conversations_buyer_id_fkey(id,name,display_name,profile_photo_path,is_verified), vendor:profiles!conversations_vendor_id_fkey(id,name,display_name,profile_photo_path,is_verified),
      vehicles(*, photos(*)), messages(*)
    `).or(`buyer_id.eq.${user.id},vendor_id.eq.${user.id}`).order("updated_at", { ascending: false }));
  },

  async messages(conversationId: number) {
    return result(await db().from("messages").select("*, sender:profiles!messages_sender_id_fkey(id,name,display_name,profile_photo_path,is_verified)")
      .eq("conversation_id", conversationId).is("deleted_at", null).order("sent_at"));
  },

  async send(conversationId: number, receiverId: string, message?: string, attachment?: { attachment_path?: string; attachment_name?: string; attachment_mime?: string; attachment_size?: number }) {
    const user = (await getSupabase().auth.getUser()).data.user;
    if (!user) throw new Error("You must be signed in.");
    if (!Number.isInteger(conversationId) || conversationId < 1 || !receiverId) throw new Error("Invalid conversation.");
    const value = message?.trim() || null;
    if (!value && !attachment?.attachment_path) throw new Error("A message or attachment is required.");
    if (value && value.length > 4000) throw new Error("Messages are limited to 4,000 characters.");
    return result(await db().from("messages").insert({
      conversation_id: conversationId, sender_id: user.id, receiver_id: receiverId,
      message: value,
      attachment_path: attachment?.attachment_path ?? null,
      attachment_name: attachment?.attachment_name ?? null,
      attachment_mime: attachment?.attachment_mime ?? null,
      attachment_size: attachment?.attachment_size ?? null,
    }).select().single());
  },

  async markRead(conversationId: number) {
    const user = (await getSupabase().auth.getUser()).data.user;
    if (!user) throw new Error("You must be signed in.");
    return result(await db().from("messages").update({ read_at: new Date().toISOString() })
      .eq("conversation_id", conversationId).eq("receiver_id", user.id).is("read_at", null).select());
  },

  subscribe(conversationId: number, onMessage: (message: unknown) => void): RealtimeChannel {
    if (!Number.isInteger(conversationId) || conversationId < 1) throw new Error("Invalid conversation.");
    return getSupabase().channel(`conversation:${conversationId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` },
        (payload) => onMessage(payload.new)).subscribe();
  },
};

export const notificationService = {
  async mine() {
    const user = (await getSupabase().auth.getUser()).data.user;
    if (!user) throw new Error("You must be signed in.");
    return result(await db().from("notifications").select("*, actor:profiles!notifications_actor_id_fkey(id,name,display_name,profile_photo_path,is_verified), listings(*)")
      .eq("user_id", user.id).is("deleted_at", null).order("created_at", { ascending: false }));
  },

  async markRead(id: number) {
    return result(await db().from("notifications").update({ is_read: true }).eq("id", id).select().single());
  },
};

export const creditService = {
  async packages() {
    return result(await db().from("listing_credit_packages").select("*").eq("is_active", true).order("credits"));
  },
  async history() {
    const user = (await getSupabase().auth.getUser()).data.user;
    if (!user) throw new Error("You must be signed in.");
    return result(await db().from("listing_credit_transactions").select("*").eq("user_id", user.id)
      .order("occurred_at", { ascending: false }));
  },
};

export const interactionService = {
  async state(listingId: number, vehicleId: number, vendorId: string) {
    const me = await authService.user();
    if (!me) return { liked: false, favorited: false, following: false };
    const [like, favorite, follow] = await Promise.all([
      db().from("listing_likes").select("id").eq("listing_id", listingId).eq("user_id", me.id).maybeSingle(),
      db().from("favorites").select("id").eq("vehicle_id", vehicleId).eq("user_id", me.id).maybeSingle(),
      db().from("user_follows").select("id").eq("follower_id", me.id).eq("following_id", vendorId).maybeSingle(),
    ]);
    for (const response of [like, favorite, follow]) if (response.error) throw new Error(response.error.message);
    return { liked: Boolean(like.data), favorited: Boolean(favorite.data), following: Boolean(follow.data) };
  },
  async follow(userId: string) {
    const me = (await getSupabase().auth.getUser()).data.user;
    if (!me) throw new Error("You must be signed in.");
    return result(await db().from("user_follows").insert({ follower_id: me.id, following_id: userId }).select().single());
  },
  async unfollow(userId: string) {
    const me = (await getSupabase().auth.getUser()).data.user;
    if (!me) throw new Error("You must be signed in.");
    return result(await db().from("user_follows").delete().eq("follower_id", me.id).eq("following_id", userId));
  },
  async like(listingId: number) {
    const me = (await getSupabase().auth.getUser()).data.user;
    if (!me) throw new Error("You must be signed in.");
    return result(await db().from("listing_likes").insert({ listing_id: listingId, user_id: me.id }).select().single());
  },
  async unlike(listingId: number) {
    const me = await authService.user();
    if (!me) throw new Error("You must be signed in.");
    return result(await db().from("listing_likes").delete().eq("listing_id", listingId).eq("user_id", me.id));
  },
  async favorite(vehicleId: number) {
    const me = (await getSupabase().auth.getUser()).data.user;
    if (!me) throw new Error("You must be signed in.");
    return result(await db().from("favorites").insert({ vehicle_id: vehicleId, user_id: me.id }).select().single());
  },
  async unfavorite(vehicleId: number) {
    const me = await authService.user();
    if (!me) throw new Error("You must be signed in.");
    return result(await db().from("favorites").delete().eq("vehicle_id", vehicleId).eq("user_id", me.id));
  },
};

export const reviewService = {
  async forVehicle(vehicleId: number) {
    return result(await db().from("reviews").select("*, customer:profiles!reviews_customer_id_fkey(id,name,display_name,profile_photo_path,is_verified), review_photos(*)")
      .eq("vehicle_id", vehicleId).is("deleted_at", null).order("created_at", { ascending: false }));
  },
  async create(input: { vehicleId: number; vendorId: string; rating: number; comment: string }) {
    const user = await authService.user();
    if (!user) throw new Error("You must be signed in.");
    return result(await db().from("reviews").insert({ customer_id: user.id, vendor_id: input.vendorId, vehicle_id: input.vehicleId, rating: input.rating, comment: input.comment.trim() || null }).select().single());
  },
};

export const communityService = {
  async feed() { return result(await db().from("community_posts").select("*,author:profiles!community_posts_author_id_fkey(id,name,display_name,profile_photo_path,is_verified)").order("created_at", { ascending: false }).limit(100)); },
  async create(body: string, category = "General", quoteRequested = false) {
    const user = await authService.user(); if (!user) throw new Error("You must be signed in.");
    return result(await db().from("community_posts").insert({ author_id: user.id, body: body.trim(), category, quote_requested: quoteRequested }).select().single());
  },
};

export const rentalService = {
  async conversation(id: number) { return result(await db().from("conversations").select("*,buyer:profiles!conversations_buyer_id_fkey(id,name,display_name),vendor:profiles!conversations_vendor_id_fkey(id,name,display_name),vehicles(*,photos(*),listings(*))").eq("id", id).single()); },
  async complete(id: number) { return result(await db().rpc("complete_conversation", { p_conversation_id: id })); },
};

export const contactService = {
  async profile(id: string) { return result(await db().rpc("get_profile_contact", { p_profile_id: id })); },
};

export const storageService = {
  publicObjectPath(bucket: string, url: string) {
    const marker = `/storage/v1/object/public/${bucket}/`;
    const index = url.indexOf(marker);
    return index < 0 ? null : decodeURIComponent(url.slice(index + marker.length));
  },
  async upload(bucket: "avatars" | "vehicle-photos" | "message-attachments" | "review-photos", path: string, uri: string, contentType: string) {
    const user = await authService.user();
    if (!user) throw new Error("You must be signed in.");
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (bucket !== "message-attachments" && !allowed.includes(contentType)) throw new Error("Only JPEG, PNG, and WebP images are allowed.");
    const body = await (await fetch(uri)).arrayBuffer();
    const max = bucket === "avatars" ? 5 * 1024 * 1024 : bucket === "message-attachments" ? 20 * 1024 * 1024 : 10 * 1024 * 1024;
    if (!body.byteLength || body.byteLength > max) throw new Error(`File must be smaller than ${Math.round(max / 1024 / 1024)} MB.`);
    const safeName = path.split("/").pop()?.replace(/[^a-zA-Z0-9._-]/g, "_") || `${Date.now()}`;
    const objectPath = `${user.id}/${Date.now()}-${safeName}`;
    const uploaded = result<any>(await getSupabase().storage.from(bucket).upload(objectPath, body, { contentType, upsert: false }));
    const publicUrl = bucket === "message-attachments" ? null : getSupabase().storage.from(bucket).getPublicUrl(uploaded.path).data.publicUrl;
    return { ...uploaded, publicUrl, size: body.byteLength };
  },
  async signedAttachmentUrl(path: string) {
    const response = await getSupabase().storage.from("message-attachments").createSignedUrl(path, 300);
    return result<{ signedUrl: string }>(response).signedUrl;
  },
  async remove(bucket: "avatars" | "vehicle-photos" | "message-attachments" | "review-photos", path: string) {
    return result(await getSupabase().storage.from(bucket).remove([path]));
  },
};
