import React, { useCallback, useState } from "react";
import { ActivityIndicator, View, Text, Image, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, fonts } from "../theme/colors";
import { useScale } from "../theme/scale";
import { images } from "../theme/colors";

import BackIcon from "../assets/icons/ic_baseline-arrow-back.svg";
import ArrowDrop from "../assets/icons/ic_baseline-arrow-drop-down.svg";
import { listingService } from "../services/carkila";

type Status = "Active" | "Inactive" | "Draft";

interface Row {
  id: string;
  status: Status;
  likes: string;
  views: string;
  date: string;
  expiry: string;
  primaryAction: string;
}

const ROWS: Row[] = [
  { id: "m1", status: "Active", likes: "12", views: "1,342", date: "21 Jan 2026", expiry: "21 Jan 2027", primaryAction: "Renewal" },
  { id: "m2", status: "Inactive", likes: "12", views: "1,342", date: "21 Jan 2026", expiry: "21 Jan 2027", primaryAction: "Publish" },
  { id: "m3", status: "Draft", likes: "N/A", views: "N/A", date: "N/A", expiry: "N/A", primaryAction: "Publish" },
  { id: "m4", status: "Active", likes: "12", views: "1,342", date: "21 Jan 2026", expiry: "21 Jan 2027", primaryAction: "Renewal" },
  { id: "m5", status: "Active", likes: "12", views: "1,342", date: "21 Jan 2026", expiry: "21 Jan 2027", primaryAction: "Renewal" },
  { id: "m6", status: "Active", likes: "12", views: "1,342", date: "21 Jan 2026", expiry: "21 Jan 2027", primaryAction: "Renewal" },
  { id: "m7", status: "Active", likes: "12", views: "1,342", date: "21 Jan 2026", expiry: "21 Jan 2027", primaryAction: "Renewal" },
  { id: "m8", status: "Active", likes: "12", views: "1,342", date: "21 Jan 2026", expiry: "21 Jan 2027", primaryAction: "Renewal" },
];

function StatBox({ label, value, style }: { label: string; value: string; style?: any }) {
  const s = useScale();
  return (
    <View
      style={[
        {
          width: s(164),
          height: s(53),
          borderRadius: s(8),
          borderWidth: 1,
          borderColor: colors.black,
          backgroundColor: colors.white,
          paddingHorizontal: s(10),
          justifyContent: "center",
        },
        style,
      ]}
    >
      <Text style={{ fontFamily: fonts.regular, fontSize: s(12), color: colors.black }}>{label}</Text>
      <Text style={{ fontFamily: fonts.bold, fontSize: s(15), marginTop: s(2) }}>{value}</Text>
    </View>
  );
}

export default function ManageListingsScreen({ navigation }: any) {
  const s = useScale();
  const insets = useSafeAreaInsets();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sort, setSort] = useState<"Recent" | "Views">("Recent");
  const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Draft">("All");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setRows(await listingService.mine() as any[]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load your listings.");
    } finally {
      setLoading(false);
    }
  }, []);
  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const activeCount = rows.filter((row) => row.status === "active").length;
  const inactiveCount = rows.filter((row) => row.status !== "active").length;
  const totalViews = rows.reduce((sum, row) => sum + Number(row.views_count || 0), 0);
  const averageViews = rows.length ? Math.round(totalViews / rows.length) : 0;
  const visibleRows = rows
    .filter((row) => statusFilter === "All" || String(row.status).toLowerCase() === statusFilter.toLowerCase())
    .sort((a, b) => sort === "Views"
      ? Number(b.views_count || 0) - Number(a.views_count || 0)
      : new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={[styles.header, { height: s(64) }]}> 
        <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.headerIcon}>
          <BackIcon width={s(30)} height={s(30)} />
        </TouchableOpacity>
        <Text style={{ fontFamily: fonts.bold, fontSize: s(20), color: colors.black, marginLeft: s(14) }}>
          Manage Listings
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: s(40) }}>
        {/* Stats panel */}
        <View
          style={{
            marginHorizontal: s(18),
            borderWidth: 1,
            borderColor: colors.black,
            borderRadius: s(11),
            backgroundColor: colors.white,
            paddingVertical: s(19),
            paddingHorizontal: s(16),
          }}
        >
          <View style={{ flexDirection: "row", gap: s(15) }}>
            <StatBox label="Active Listings" value={String(activeCount)} />
            <StatBox label="Inactive Listings" value={String(inactiveCount)} />
          </View>
          <View style={{ flexDirection: "row", gap: s(15), marginTop: s(15) }}>
            <StatBox label="Total Listings" value={String(rows.length)} />
            <StatBox label="Average Views" value={averageViews.toLocaleString()} />
          </View>
          <View style={{ flexDirection: "row", marginTop: s(15) }}>
            <StatBox label="Total Listing Views" value={totalViews.toLocaleString()} />
          </View>
        </View>

        {/* Filters */}
        <View style={{ flexDirection: "row", marginHorizontal: s(32), marginTop: s(22), justifyContent: "space-between" }}>
          <TouchableOpacity
            onPress={() => setSort((value) => value === "Recent" ? "Views" : "Recent")}
            style={{
              flexDirection: "row",
              alignItems: "center",
              width: s(95),
              height: s(36),
              borderRadius: s(8),
              borderWidth: 1,
              borderColor: colors.black,
              paddingLeft: s(12),
              backgroundColor: colors.white,
            }}
          >
            <Text style={{ fontFamily: fonts.bold, fontSize: s(12) }}>{sort}</Text>
            <ArrowDrop width={s(24)} height={s(24)} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setStatusFilter((value) => value === "All" ? "Active" : value === "Active" ? "Draft" : "All")}
            style={{
              flexDirection: "row",
              alignItems: "center",
              width: s(91),
              height: s(36),
              borderRadius: s(8),
              borderWidth: 1,
              borderColor: colors.black,
              paddingLeft: s(15),
              backgroundColor: colors.white,
            }}
          >
            <Text style={{ fontFamily: fonts.bold, fontSize: s(12) }}>{statusFilter}</Text>
            <ArrowDrop width={s(24)} height={s(24)} />
          </TouchableOpacity>
        </View>

        {loading && <ActivityIndicator color={colors.primary} style={{ marginTop: s(35) }} />}
        {!loading && !!error && <Text onPress={load} style={{ textAlign: "center", color: "#B42318", margin: s(30), fontFamily: fonts.regular }}>{error}{"\n"}Tap to retry</Text>}
        {!loading && !error && rows.length === 0 && <Text style={{ textAlign: "center", color: colors.grayText, margin: s(30), fontFamily: fonts.regular }}>No listings yet.</Text>}

        {/* Cards */}
        {visibleRows.map((r) => {
          const vehicle = r.vehicles;
          const active = r.status === "active";
          const status = String(r.status || "draft");
          const photoUrl = vehicle?.photos?.find((photo: any) => !photo.deleted_at)?.webp_url ?? vehicle?.photos?.find((photo: any) => !photo.deleted_at)?.url;
          const primaryAction = active ? "Renewal" : "Publish";
          return (
            <View
              key={r.id}
              style={{
                marginHorizontal: s(32),
                marginTop: s(26),
                borderWidth: 1,
                borderColor: colors.black,
                borderRadius: s(11),
                backgroundColor: colors.white,
                paddingBottom: s(13),
              }}
            >
              {/* Top row */}
              <View style={{ flexDirection: "row", marginTop: s(14), marginLeft: s(12), marginRight: s(11) }}>
                <Image source={photoUrl ? { uri: photoUrl } : images.bus1} style={{ width: s(70), height: s(70), borderRadius: s(8) }} />
                <View style={{ flex: 1, marginLeft: s(7), justifyContent: "center" }}>
                  <Text numberOfLines={1} style={{ fontFamily: fonts.bold, fontSize: s(14) }}>
                    {[vehicle?.locations?.city, vehicle?.locations?.province].filter(Boolean).join(", ") || "Philippines"}
                  </Text>
                  <Text
                    numberOfLines={1}
                    style={{ fontFamily: fonts.regular, fontSize: s(14), marginTop: s(3), color: colors.black }}
                  >
                    {vehicle?.title || "Vehicle listing"}
                  </Text>
                  <Text style={{ fontFamily: fonts.bold, fontSize: s(15), marginTop: s(5) }}>₱ {Number(vehicle?.price_per_day || 0).toLocaleString()}</Text>
                </View>
                <View
                  style={{
                    alignSelf: "flex-start",
                    height: s(22),
                    borderRadius: s(18),
                    borderWidth: 1,
                    borderColor: active ? "#067700" : "#E60023",
                    backgroundColor: active ? "#D2FFD5" : "rgba(242,19,65,0.05)",
                    paddingHorizontal: s(13),
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{
                      fontFamily: fonts.bold,
                      fontSize: s(10),
                      color: active ? "rgba(0,86,26,0.78)" : "#E60023",
                    }}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Text>
                </View>
              </View>

              {/* Metrics */}
              <View style={{ flexDirection: "row", gap: s(15), marginTop: s(9), marginHorizontal: s(11) }}>
                <View style={[styles.metricBox, { width: s(155), height: s(53), borderRadius: s(8), paddingHorizontal: s(10) }]}>
                  <Text style={{ fontFamily: fonts.bold, fontSize: s(12) }}>LIKES</Text>
                  <Text style={{ fontFamily: fonts.regular, fontSize: s(14), marginTop: s(2) }}>{r.listing_likes?.[0]?.count ?? 0}</Text>
                </View>
                <View style={[styles.metricBox, { width: s(156), height: s(53), borderRadius: s(8), paddingHorizontal: s(12) }]}>
                  <Text style={{ fontFamily: fonts.bold, fontSize: s(12) }}>VIEWS</Text>
                  <Text style={{ fontFamily: fonts.regular, fontSize: s(14), marginTop: s(2) }}>{Number(r.views_count || 0).toLocaleString()}</Text>
                </View>
              </View>
              <View style={{ flexDirection: "row", gap: s(15), marginTop: s(11), marginHorizontal: s(11) }}>
                <View style={[styles.metricBox, { width: s(155), height: s(53), borderRadius: s(8), paddingHorizontal: s(10) }]}>
                  <Text style={{ fontFamily: fonts.bold, fontSize: s(12) }}>LISTING DATE</Text>
                  <Text style={{ fontFamily: fonts.regular, fontSize: s(14), marginTop: s(2) }}>{r.published_at ? new Date(r.published_at).toLocaleDateString() : "N/A"}</Text>
                </View>
                <View style={[styles.metricBox, { width: s(156), height: s(53), borderRadius: s(8), paddingHorizontal: s(12) }]}>
                  <Text style={{ fontFamily: fonts.bold, fontSize: s(12) }}>EXPIRY</Text>
                  <Text style={{ fontFamily: fonts.regular, fontSize: s(14), marginTop: s(2) }}>{r.end_date ? new Date(r.end_date).toLocaleDateString() : "N/A"}</Text>
                </View>
              </View>

              {/* Actions */}
              <View style={{ flexDirection: "row", gap: s(9), marginTop: s(11), marginHorizontal: s(12) }}>
                <TouchableOpacity
                  style={[styles.actionBtn, { borderColor: colors.black, height: s(36), borderRadius: s(8) }]}
                  onPress={() =>
                    primaryAction === "Publish"
                      ? navigation?.navigate("PublishModal", { listingId: r.id })
                      : navigation?.navigate("RenewalManagement", { listingId: r.id })
                  }
                >
                  <Text style={{ fontFamily: fonts.bold, fontSize: s(14), color: colors.black }}>
                    {primaryAction}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, { borderColor: colors.black, height: s(36), borderRadius: s(8) }]}
                  onPress={() => navigation?.navigate("EditListing", { listingId: r.id })}
                >
                  <Text style={{ fontFamily: fonts.bold, fontSize: s(14), color: colors.black }}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, { borderColor: colors.primary, height: s(36), borderRadius: s(8) }]}
                  onPress={() => navigation?.navigate("DeleteModal", { listingId: r.id })}
                >
                  <Text style={{ fontFamily: fonts.bold, fontSize: s(14), color: colors.primary }}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        {!loading && !error && rows.length > 0 && visibleRows.length === 0 && (
          <Text style={{ textAlign: "center", color: colors.grayText, margin: s(30), fontFamily: fonts.regular }}>No listings match this filter.</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 21,
    paddingRight: 21,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  headerIcon: { width: 36, height: 40, alignItems: "flex-start", justifyContent: "center" },
  metricBox: {
    borderWidth: 1,
    borderColor: colors.black,
    backgroundColor: colors.white,
    justifyContent: "center",
  },
  actionBtn: {
    flex: 1,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
});
