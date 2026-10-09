import React, { useEffect, useState } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { colors, fonts, images } from "../theme/colors";
import { useScale } from "../theme/scale";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import BackIcon from "../assets/icons/ic_baseline-arrow-back.svg";
import ChevronDown from "../assets/icons/grommet-icons_down.svg";
import { authService, profileService } from "../services/carkila";

function DrawerShell({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  const s = useScale();
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.backdrop}>
      <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />
      <View style={[styles.drawer, { width: s(311), paddingTop: insets.top, paddingBottom: insets.bottom }]}>{children}</View>
    </View>
  );
}

const MENU_ITEMS = [
  "Profile",
  "Plans & Pricing",
  "Community Feed",
  "Manage Listings",
  "Settings",
  "About Us",
  "Logout",
] as const;

export function AccountDrawer({ navigation }: any) {
  const s = useScale();
  const [profile, setProfile] = useState<any>(null);
  useEffect(() => { profileService.mine().then(setProfile).catch(() => undefined); }, []);
  const close = () => navigation?.goBack();

  const handlePress = async (item: string) => {
    if (item === "Manage Listings") navigation?.navigate("ManageListings");
    else if (item === "Profile") navigation?.navigate("MainTabs");
    else if (item === "Plans & Pricing") navigation?.navigate("Subscription");
    else if (item === "Community Feed") navigation?.navigate("CommunityFeed");
    else if (item === "Settings") navigation?.navigate("Settings");
    else if (item === "About Us") navigation?.navigate("About");
    else if (item === "Logout") {
      await authService.signOut();
    }
    else close();
  };

  return (
    <DrawerShell onClose={close}>
      <Image
        source={profile?.profile_photo_path ? { uri: profile.profile_photo_path } : images.logoDgb}
        style={{ width: s(61), height: s(60), borderRadius: s(41.5), marginLeft: s(25), marginTop: s(44) }}
      />
      <Text style={{ fontFamily: fonts.bold, fontSize: s(15), color: "rgba(0,0,0,0.9)", marginLeft: s(25), marginTop: s(11) }}>
        {profile?.display_name || profile?.name || "Carkila operator"}
      </Text>
      <Text style={{ fontFamily: fonts.regular, fontSize: s(13), color: colors.black, marginLeft: s(25), marginTop: s(4) }}>
        {profile?.based_location || "Location not set"}
      </Text>

      <View style={{ marginTop: s(52) }}>
        {MENU_ITEMS.map((item) => (
          <TouchableOpacity key={item} onPress={() => handlePress(item)}>
            <View style={{ flexDirection: "row", alignItems: "center", paddingLeft: s(25) }}>
              <Text
                style={{
                  fontFamily: fonts.regular,
                  fontSize: s(17),
                  color: "rgba(0,0,0,0.8)",
                  paddingVertical: s(21),
                  flex: 1,
                }}
              >
                {item}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </DrawerShell>
  );
}

const CATEGORIES = [
  "Bus",
  "Coaster",
  "Van",
  "Car",
  "Truck",
  "Motorcycle",
  "Logistics",
  "Heavy Equipment",
];

export function CategoriesDrawer({ navigation }: any) {
  const s = useScale();
  const close = () => navigation?.goBack();

  return (
    <DrawerShell onClose={close}>
      <TouchableOpacity accessibilityLabel="Close categories" onPress={close} style={{ marginLeft: s(16), marginTop: s(20), width: 44, height: 44, justifyContent: "center" }}>
        <BackIcon width={s(20)} height={s(20)} />
      </TouchableOpacity>
      <Text
        style={{
          fontFamily: fonts.bold,
          fontSize: s(18),
          color: "rgba(0,0,0,0.9)",
          marginLeft: s(26),
          marginTop: s(46),
        }}
      >
        Browse by categories
      </Text>

      <View style={{ marginTop: s(51) }}>
        {CATEGORIES.map((cat) => (
          <View key={cat} style={{ borderTopWidth: 1, borderTopColor: colors.black }}>
            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingRight: s(22),
                paddingLeft: s(27),
              }}
              onPress={() => navigation?.navigate("Search", { initialVehicle: cat })}
            >
              <Text style={{ fontFamily: fonts.regular, fontSize: s(15), color: colors.black, paddingVertical: s(16.5) }}>
                {cat}
              </Text>
              <ChevronDown width={s(15)} height={s(15)} />
            </TouchableOpacity>
          </View>
        ))}
        <View style={{ borderTopWidth: 1, borderTopColor: colors.black }} />
      </View>
    </DrawerShell>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    flexDirection: "row",
  },
  drawer: {
    backgroundColor: colors.white,
    flex: 1,
  },
});
