import React, { useCallback, useState } from "react";
import { ActivityIndicator, Text, View, ScrollView, StyleSheet } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AppHeader from "../components/AppHeader";
import FeedTabs from "../components/FeedTabs";
import LocationChips from "../components/LocationChips";
import ListingCard, { Listing } from "../components/ListingCard";
import { colors, fonts, images } from "../theme/colors";
import { useScale } from "../theme/scale";
import { listingService } from "../services/carkila";

const LEFT_COLUMN: Listing[] = [
  {
    id: "l1",
    operatorName: "Ezi Transport Services Inc.",
    operatorAvatar: images.logoDgb,
    timeAgo: "1 mins ago",
    photo: images.van,
    tags: ["Bus", "Higer"],
    location: "Manila, Metro Manila",
    title: "Affordable Bus and Coaster for Rent",
    price: "PHP 9,000/day",
  },
  {
    id: "l2",
    operatorName: "Lance Transport Services",
    operatorAvatar: images.avatarCircle,
    avatarRound: true,
    timeAgo: "2 days ago",
    photo: images.almera,
    tags: ["Sedan", "Almera"],
    location: "Marikina City, Metro Manila",
    title: "Murang Car Rental sa Marikina",
    price: "PHP 2,500/hr",
  },
  {
    id: "l3",
    operatorName: "Ezi Transport Services Inc.",
    operatorAvatar: images.logoDgb,
    timeAgo: "2 weeks ago",
    photo: images.sunlong,
    tags: ["Bus", "Sunlong"],
    location: "Malolos, Bulacan",
    title: "Bus Rental for Rent",
    price: "PHP 12,000 / km",
  },
];

const RIGHT_COLUMN: Listing[] = [
  {
    id: "r1",
    operatorName: "Alvin Van Rentals",
    operatorAvatar: images.logoDgb,
    timeAgo: "2 hrs ago",
    photo: images.coaster,
    tags: ["Bus", "Urvan"],
    location: "Valenzuela City, Metro Manila",
    title: "Affordable Van for Rent",
    price: "PHP 3,000/day",
  },
  {
    id: "r2",
    operatorName: "Rein Bus Rentals",
    operatorAvatar: images.idPic,
    avatarRound: true,
    timeAgo: "5 days ago",
    photo: images.universe,
    tags: ["Bus", "Universe"],
    location: "Cabuyao, Laguna",
    title: "Tourist bus and coaster for rent",
    price: "PHP 10,000/hr",
  },
  {
    id: "r3",
    operatorName: "TravLink Travel Services",
    operatorAvatar: images.taxiLogo,
    avatarRound: true,
    timeAgo: "2 weeks ago",
    photo: images.montero,
    tags: ["SUV", "Montero"],
    location: "Talisay, Cebu",
    title: "Direct owner here PM for details",
    price: "PHP 3,000 / day",
  },
];

export default function HomeScreen({ navigation }: any) {
  const [tab, setTab] = useState("Most Recent");
  const [location, setLocation] = useState("All");
  const s = useScale();
  const insets = useSafeAreaInsets();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const rows = await listingService.publicFeed({ location: location === "All" ? undefined : location, order: tab === "Most Recent" ? "recent" : "views", followingOnly: tab === "Following" });
      setListings((rows as any[]).map((row) => {
        const vehicle = row.vehicles;
        const operator = vehicle?.profiles;
        const photo = vehicle?.photos?.find((item: any) => !item.deleted_at)?.webp_url
          ?? vehicle?.photos?.find((item: any) => !item.deleted_at)?.url;
        const locationText = [vehicle?.locations?.city, vehicle?.locations?.province].filter(Boolean).join(", ");
        return {
          id: String(row.id),
          operatorName: operator?.display_name || operator?.name || "Carkila Operator",
          operatorAvatar: operator?.profile_photo_path ? { uri: operator.profile_photo_path } : images.logoDgb,
          avatarRound: true,
          timeAgo: row.published_at ? new Date(row.published_at).toLocaleDateString() : "Draft",
          photo: photo ? { uri: photo } : images.van,
          tags: [vehicle?.subcategories?.categories?.name, vehicle?.vehicle_types?.name].filter(Boolean),
          location: locationText || vehicle?.full_address || "Philippines",
          title: vehicle?.title || "Vehicle listing",
          price: `PHP ${Number(vehicle?.price_per_day ?? 0).toLocaleString()}/${vehicle?.price_unit ?? "day"}`,
        } satisfies Listing;
      }));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load listings.");
    } finally {
      setLoading(false);
    }
  }, [location, tab]);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const leftColumn = listings.filter((_, index) => index % 2 === 0);
  const rightColumn = listings.filter((_, index) => index % 2 === 1);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <AppHeader
        onMenu={() => navigation?.navigate("AccountDrawer")}
        onSearchPress={() => navigation?.navigate("Search")}
      />

      <View style={{ marginTop: s(13) }}>
        <FeedTabs active={tab} onChange={setTab} />
      </View>

      <View style={{ marginTop: s(24) }}>
        <LocationChips active={location} onChange={setLocation} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.feed}
      >
        {loading && <ActivityIndicator color={colors.primary} style={{ marginTop: s(40) }} />}
        {!loading && !!error && (
          <Text onPress={load} style={{ fontFamily: fonts.regular, color: "#B42318", textAlign: "center", margin: s(28) }}>
            {error}{"\n"}Tap to retry
          </Text>
        )}
        {!loading && !error && listings.length === 0 && (
          <Text style={{ fontFamily: fonts.regular, color: colors.grayText, textAlign: "center", margin: s(40) }}>
            No active listings yet.
          </Text>
        )}
        <View style={styles.columns}>
          <View style={[styles.col, { marginRight: s(14) }]}> 
            {leftColumn.map((item) => (
              <ListingCard
                key={item.id}
                item={item}
                onPress={() => navigation?.navigate("ListingDetail", { listingId: Number(item.id) })}
              />
            ))}
          </View>
          <View style={styles.col}>
            {rightColumn.map((item) => (
              <ListingCard
                key={item.id}
                item={item}
                onPress={() => navigation?.navigate("ListingDetail", { listingId: Number(item.id) })}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  feed: {
    paddingBottom: 24,
  },
  columns: {
    flexDirection: "row",
    paddingHorizontal: 15,
    marginTop: 25,
    width: "100%",
  },
  col: { flex: 1, minWidth: 0 },
});
