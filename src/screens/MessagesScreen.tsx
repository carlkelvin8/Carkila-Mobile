import React, { useCallback, useState } from "react";
import { ActivityIndicator, View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, TextInput } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, fonts } from "../theme/colors";
import { useScale } from "../theme/scale";

import BackIcon from "../assets/icons/material-symbols_arrow-back.svg";
import SearchIcon from "../assets/icons/iconoir_search.svg";
import { authService, messagingService } from "../services/carkila";

const AVATAR_BRYNER = require("../assets/imgs/468521568_28181644871448939_5997034554240430052_n.png");
const AVATAR_LANCE = require("../assets/imgs/392781251_10223061110451496_8705330123165537788_n_1.png");
const AVATAR_KATIP = require("../assets/imgs/3-KATIPUNAN-12.png");
const AVATAR_REIN = require("../assets/imgs/ID_Pic_2_3.png");

type Chat = {
  id: string;
  name: string;
  preview: string;
  date: string;
  avatar: number;
  unread?: boolean;
};

const CHATS: Chat[] = [
  {
    id: "c1",
    name: "Alvin Van Rentals",
    preview: "How much pick up Sta. Mesa Manila to Iloc...",
    date: "05/01/2025",
    avatar: AVATAR_REIN,
    unread: true,
  },
  {
    id: "c2",
    name: "Bryner Abarrientos",
    preview: "Saan po grahe nyo?",
    date: "04/28/2025",
    avatar: AVATAR_BRYNER,
  },
  {
    id: "c3",
    name: "Lance Villas",
    preview: "Please call me 09091234550 ASAP",
    date: "04/27/2025",
    avatar: AVATAR_LANCE,
  },
  {
    id: "c4",
    name: "Honorato Zerrudo",
    preview: "Pa quote po Manila to Baguio 2D1N?",
    date: "04/19/2025",
    avatar: AVATAR_KATIP,
  },
  {
    id: "c5",
    name: "Alvin Angelo Calvo",
    preview: "Pls send me formal quotation alvin123@gm...",
    date: "04/09/2025",
    avatar: AVATAR_KATIP,
  },
];

const FILTERS = [
  { label: "All", width: 49 },
  { label: "Unread", width: 78 },
  { label: "Archive", width: 83 },
];

export default function MessagesScreen({ navigation }: any) {
  const s = useScale();
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [rows, me] = await Promise.all([messagingService.conversations(), authService.user()]);
      setChats((rows as any[]).map((conversation) => {
        const other = conversation.buyer_id === me?.id ? conversation.vendor : conversation.buyer;
        const ordered = [...(conversation.messages || [])].sort((a, b) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime());
        const last = ordered[0];
        const archived = conversation.buyer_id === me?.id ? conversation.buyer_archived_at : conversation.vendor_archived_at;
        return {
          id: String(conversation.id),
          receiverId: other?.id,
          name: other?.display_name || other?.name || "Carkila user",
          preview: last?.message || last?.attachment_name || "Start a conversation",
          date: last?.sent_at ? new Date(last.sent_at).toLocaleDateString() : new Date(conversation.created_at).toLocaleDateString(),
          avatar: other?.profile_photo_path ? { uri: other.profile_photo_path } : AVATAR_REIN,
          unread: last?.receiver_id === me?.id && !last?.read_at,
          archived: Boolean(archived),
        };
      }));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load conversations.");
    } finally {
      setLoading(false);
    }
  }, []);
  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const filtered = chats.filter(
    (c) =>
      (filter === "All" || (filter === "Unread" && c.unread) || (filter === "Archive" && c.archived)) &&
      (query === "" ||
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.preview.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={[styles.header, { height: s(64), borderBottomWidth: StyleSheet.hairlineWidth }]}> 
        <TouchableOpacity onPress={() => navigation?.navigate("Home")} style={styles.headerIcon}>
          <BackIcon width={s(28)} height={s(28)} />
        </TouchableOpacity>
        <Text
          style={{
            fontFamily: fonts.bold,
            fontSize: s(20),
            color: "#212121",
            marginLeft: s(25),
            flex: 1,
          }}
        >
          Messages
        </Text>
      </View>

      {/* Search */}
      <View
        style={[
          styles.searchPill,
          {
            height: s(41),
            borderRadius: s(20.5),
            marginHorizontal: s(19),
            marginTop: s(24),
          },
        ]}
      >
        <SearchIcon width={s(24)} height={s(24)} style={{ marginLeft: s(14) }} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search"
          placeholderTextColor="rgba(0,0,0,0.4)"
          style={{
            flex: 1,
            fontFamily: fonts.regular,
            fontSize: s(15),
            color: colors.black,
            marginLeft: s(11),
            padding: 0,
          }}
        />
      </View>

      {/* Filter chips */}
      <View style={{ flexDirection: "row", marginTop: s(12), paddingLeft: s(19), gap: s(9) }}>
        {FILTERS.map((f) => {
          const active = filter === f.label;
          return (
            <TouchableOpacity
              key={f.label}
              onPress={() => setFilter(f.label)}
              style={[
                styles.filterChip,
                {
                  height: s(29),
                  borderRadius: s(14.5),
                  minWidth: s(f.width),
                  backgroundColor: active ? "#4E4E4E" : colors.white,
                },
              ]}
            >
              <Text
                style={{
                  fontFamily: fonts.regular,
                  fontSize: s(15),
                  color: active ? colors.white : "rgba(0,0,0,0.8)",
                }}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Chat list */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: s(100) }}>
        {loading && <ActivityIndicator color={colors.primary} style={{ marginTop: s(35) }} />}
        {!loading && !!error && <Text onPress={load} style={{ textAlign: "center", color: "#B42318", margin: s(30), fontFamily: fonts.regular }}>{error}{"\n"}Tap to retry</Text>}
        {!loading && !error && filtered.length === 0 && <Text style={{ textAlign: "center", color: colors.grayText, margin: s(35), fontFamily: fonts.regular }}>No conversations found.</Text>}
        {filtered.map((c, idx) => (
          <TouchableOpacity
            key={c.id}
            activeOpacity={0.7}
            style={[
              styles.chatRow,
              {
                backgroundColor: idx === 0 && filter === "All" ? "rgba(238,238,238,0.7)" : colors.white,
                paddingHorizontal: s(21),
                paddingTop: s(12),
                paddingBottom: s(12),
              },
            ]}
            onPress={() => navigation?.navigate("Chat", { conversationId: Number(c.id), receiverId: c.receiverId, name: c.name })}
          >
            <Image source={c.avatar} style={{ width: s(62), height: s(62), borderRadius: s(31) }} />
            <View style={{ flex: 1, marginLeft: s(10) }}>
              <Text style={{ fontFamily: fonts.bold, fontSize: s(15), color: colors.black }}>{c.name}</Text>
              <Text
                numberOfLines={1}
                style={{
                  fontFamily: fonts.regular,
                  fontSize: s(14),
                  color: "rgba(0,0,0,0.5)",
                  marginTop: s(4),
                }}
              >
                {c.preview}
              </Text>
            </View>
            <Text
              style={{
                fontFamily: fonts.regular,
                fontSize: s(11),
                color: "rgba(0,0,0,0.7)",
                alignSelf: "flex-start",
                marginTop: s(3),
              }}
            >
              {c.date}
            </Text>
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
    paddingLeft: 19,
    paddingRight: 18,
    borderColor: colors.black,
  },
  headerIcon: { width: 36, height: 40, alignItems: "center", justifyContent: "center" },
  searchPill: {
    backgroundColor: "rgba(238,238,238,0.8)",
    flexDirection: "row",
    alignItems: "center",
  },
  filterChip: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.black,
    paddingHorizontal: 17,
  },
  chatRow: { flexDirection: "row", borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
});
