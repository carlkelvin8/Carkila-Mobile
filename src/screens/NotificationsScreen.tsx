import React, { useCallback, useState } from "react";
import { ActivityIndicator, View, Text, Image, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, fonts } from "../theme/colors";
import { useScale } from "../theme/scale";

import BackIcon from "../assets/icons/material-symbols_arrow-back.svg";
import { notificationService } from "../services/carkila";

const IMG_LANCE = require("../assets/imgs/392781251_10223061110451496_8705330123165537788_n_1.png");
const IMG_REIN = require("../assets/imgs/ID_Pic_2_3.png");
const IMG_BRYNER = require("../assets/imgs/468521568_28181644871448939_5997034554240430052_n.png");
const IMG_EZI = require("../assets/imgs/Ellipse_44.png");
const IMG_THUMB = require("../assets/imgs/2.png");
const IMG_EXPIRED = require("../assets/imgs/photo_2024-05-16_14-05-52_4.png");

type Notif = {
  id: string;
  avatar: number;
  avatarRound: boolean;
  parts: { text: string; bold?: boolean }[];
  time: string;
  thumb?: number;
  highlight?: boolean;
};

const NOTIFS: Notif[] = [
  {
    id: "n1",
    avatar: IMG_EZI,
    avatarRound: true,
    parts: [
      { text: "Ezi Transport Services Inc. ", bold: true },
      { text: "marked the\n" },
      { text: "rental as complete. Leave a review." },
    ],
    time: "1 minute ago",
    highlight: true,
  },
  {
    id: "n2",
    avatar: IMG_LANCE,
    avatarRound: true,
    parts: [{ text: "Lance Villas like your listing." }],
    time: "2 minutes ago",
    thumb: IMG_THUMB,
  },
  {
    id: "n3",
    avatar: IMG_BRYNER,
    avatarRound: true,
    parts: [{ text: "Bryner Abarrientos followed you.", bold: true }],
    time: "1 day ago",
  },
  {
    id: "n4",
    avatar: IMG_EXPIRED,
    avatarRound: false,
    parts: [{ text: "Your listing has expired. Renew now." }],
    time: "2 days ago",
  },
  {
    id: "n5",
    avatar: IMG_REIN,
    avatarRound: true,
    parts: [{ text: "Rein Mikko Villaruel like your listing", bold: true }],
    time: "1 week ago",
    thumb: IMG_THUMB,
  },
];

export default function NotificationsScreen({ navigation }: any) {
  const s = useScale();
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setItems(await notificationService.mine() as any[]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load notifications.");
    } finally {
      setLoading(false);
    }
  }, []);
  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const openNotification = async (item: any) => {
    if (!item.is_read) {
      try {
        await notificationService.markRead(item.id);
        setItems((current) => current.map((value) => value.id === item.id ? { ...value, is_read: true } : value));
      } catch { /* refresh will retry */ }
    }
    if (item.listing_id) navigation?.navigate("ListingDetail", { listingId: item.listing_id });
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={[styles.header, { height: s(64) }]}> 
        <TouchableOpacity onPress={() => navigation?.navigate("Home")} style={styles.backButton}>
          <BackIcon width={s(28)} height={s(28)} />
        </TouchableOpacity>
        <Text
          style={{
            fontFamily: fonts.bold,
            fontSize: s(20),
            color: "rgba(0,0,0,0.9)",
            marginLeft: s(23),
          }}
        >
          Notification
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {loading && <ActivityIndicator color={colors.primary} style={{ marginTop: s(40) }} />}
        {!loading && !!error && <Text onPress={load} style={{ textAlign: "center", color: "#B42318", margin: s(30), fontFamily: fonts.regular }}>{error}{"\n"}Tap to retry</Text>}
        {!loading && !error && items.length === 0 && <Text style={{ textAlign: "center", color: colors.grayText, margin: s(35), fontFamily: fonts.regular }}>No notifications yet.</Text>}
        {items.map((n) => (
          <TouchableOpacity
            key={n.id}
            onPress={() => openNotification(n)}
            style={[
              styles.row,
              {
                backgroundColor: !n.is_read ? "rgba(238,238,238,0.7)" : colors.white,
                paddingHorizontal: s(19),
                paddingTop: s(12),
                paddingBottom: s(14),
              },
            ]}
          >
            <Image
              source={n.actor?.profile_photo_path ? { uri: n.actor.profile_photo_path } : IMG_EZI}
              style={{
                width: s(62),
                height: s(62),
                borderRadius: s(31),
              }}
            />
            <View style={{ flex: 1, marginLeft: s(10), justifyContent: "center" }}>
              <Text style={{ fontFamily: fonts.regular, fontSize: s(14), lineHeight: s(20), color: colors.black }}>
                {!!n.actor && <Text style={{ fontFamily: fonts.bold }}>{n.actor.display_name || n.actor.name} </Text>}
                {n.content}
              </Text>
              <Text
                style={{
                  fontFamily: fonts.regular,
                  fontSize: s(14),
                  color: "rgba(0,0,0,0.5)",
                  marginTop: s(3),
                }}
              >
                {new Date(n.created_at).toLocaleString()}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  header: {
    backgroundColor: colors.white,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 19,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  backButton: { width: 32, height: 40, alignItems: "flex-start", justifyContent: "center" },
  row: { flexDirection: "row", borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
});
