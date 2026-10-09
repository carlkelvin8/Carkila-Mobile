import React, { useState } from "react";
import { ActivityIndicator, View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, fonts } from "../theme/colors";
import { useScale } from "../theme/scale";

import BackIcon from "../assets/icons/material-symbols_arrow-back.svg";
import SearchIcon from "../assets/icons/iconoir_search.svg";
import MapPinIcon from "../assets/icons/ph_map-pin.svg";
import ListingCard, { Listing } from "../components/ListingCard";
import { listingService } from "../services/carkila";
import { images } from "../theme/colors";

export default function SearchScreen({ navigation, route }: any) {
  const s = useScale();
  const insets = useSafeAreaInsets();
  const [vehicle, setVehicle] = useState(String(route?.params?.initialVehicle || ""));
  const [location, setLocation] = useState("");
  const [results, setResults] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const search = async () => {
    setLoading(true); setError("");
    try { const rows = await listingService.search(vehicle, location); setResults((rows as any[]).map(row => ({ id: String(row.id), operatorName: row.vehicles?.profiles?.display_name || row.vehicles?.profiles?.name || "Carkila Operator", operatorAvatar: images.logoDgb, timeAgo: "", photo: row.vehicles?.photos?.[0]?.url ? { uri: row.vehicles.photos[0].url } : images.van, tags: [row.vehicles?.vehicle_types?.name, row.vehicles?.vehicle_brands?.name].filter(Boolean), location: row.vehicles?.locations?.city || "Philippines", title: row.vehicles?.title || "Vehicle listing", price: `PHP ${Number(row.vehicles?.price_per_day || 0).toLocaleString()}/${row.vehicles?.price_unit || "day"}` })) as Listing[]); } catch (e) { setError(e instanceof Error ? e.message : "Search failed."); } finally { setLoading(false); }
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <TouchableOpacity
        onPress={() => navigation?.goBack()}
        style={{ marginTop: s(18), marginLeft: s(20), width: s(40), height: s(40), justifyContent: "center" }}
      >
        <BackIcon width={s(20)} height={s(20)} />
      </TouchableOpacity>

      <Text
        style={{
          fontFamily: fonts.bold,
          fontSize: s(19),
          color: colors.black,
          marginTop: s(28),
          marginHorizontal: s(23),
        }}
      >
        Find the Nearest Vehicle for Rent
      </Text>

      {/* Type of vehicle */}
      <View
        style={[
          styles.input,
          {
            height: s(48),
            borderRadius: s(8),
            marginHorizontal: s(16),
            marginTop: s(28),
          },
        ]}
      >
        <SearchIcon width={s(24)} height={s(24)} style={{ marginLeft: s(13) }} />
        <TextInput
          value={vehicle}
          onChangeText={setVehicle}
          placeholder="Type of vehicle"
          placeholderTextColor="rgba(0,0,0,0.5)"
          style={styles.inputText}
        />
      </View>

      {/* Location */}
      <View
        style={[
          styles.input,
          {
            height: s(48),
            borderRadius: s(8),
            marginHorizontal: s(16),
            marginTop: s(13),
          },
        ]}
      >
        <MapPinIcon width={s(27)} height={s(27)} style={{ marginLeft: s(11), opacity: 0.5 }} />
        <TextInput
          value={location}
          onChangeText={setLocation}
          placeholder="Pickup location or nearby"
          placeholderTextColor="rgba(0,0,0,0.5)"
          style={styles.inputText}
        />
      </View>

      {/* Search button */}
      <TouchableOpacity
        onPress={search}
        activeOpacity={0.85}
        style={[
          styles.searchBtn,
          {
            height: s(48),
            borderRadius: s(8),
            marginHorizontal: s(16),
            marginTop: s(13),
          },
        ]}
      >
        <Text style={{ fontFamily: fonts.bold, fontSize: s(18), color: colors.white }}>Search</Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator color={colors.primary} style={{ marginTop: s(28) }} />}
      {!!error && <Text style={{ color: colors.primary, margin: s(20), textAlign: "center" }}>{error}</Text>}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: s(16), paddingBottom: s(32), flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
        {results.map(item => <View key={item.id} style={styles.gridItem}><ListingCard item={item} onPress={() => navigation?.navigate("ListingDetail", { listingId: Number(item.id) })} /></View>)}
        {!loading && !error && results.length === 0 && <Text style={styles.empty}>Enter a vehicle or location, then tap Search.</Text>}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  input: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.black,
  },
  inputText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.black,
    marginLeft: 11,
    padding: 0,
  },
  searchBtn: {
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  empty: { width: "100%", textAlign: "center", color: "rgba(0,0,0,0.55)", marginTop: 20, fontFamily: fonts.regular },
  gridItem: { width: "48%", minWidth: 0 },
});
