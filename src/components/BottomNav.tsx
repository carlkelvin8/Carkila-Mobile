import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { colors, fonts } from "../theme/colors";
import { useScale } from "../theme/scale";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import HomeIcon from "../assets/icons/7_136.svg";
import BellIcon from "../assets/icons/7_47.svg";
import CreateIcon from "../assets/icons/7_52.svg";
import MessagesIcon from "../assets/icons/7_54.svg";
import ProfileIcon from "../assets/icons/7_142.svg";

export type TabName = "Home" | "Notifications" | "Create" | "Messages" | "Profile";

const ICON_SIZE: Record<TabName, { w: number; h: number }> = {
  Home: { w: 20, h: 22 },
  Notifications: { w: 20, h: 18 },
  Create: { w: 29, h: 29 },
  Messages: { w: 23, h: 22 },
  Profile: { w: 20, h: 22 },
};

const LABELS: Record<TabName, string> = {
  Home: "Home",
  Notifications: "Notification",
  Create: "Create Listing",
  Messages: "Messages",
  Profile: "Profile",
};

interface Props {
  active: TabName;
  onChange: (t: TabName) => void;
}

export default function BottomNav({ active, onChange }: Props) {
  const s = useScale();
  const insets = useSafeAreaInsets();
  const tabs: TabName[] = ["Home", "Notifications", "Create", "Messages", "Profile"];

  return (
    <View
      style={[
        styles.bar,
        {
          minHeight: 64 + insets.bottom,
          paddingBottom: insets.bottom,
          borderTopWidth: StyleSheet.hairlineWidth,
        },
      ]}
    >
      {tabs.map((tab) => {
        const isActive = tab === active;
        const size = ICON_SIZE[tab];
        const iconColor = isActive ? colors.navActive : colors.black;
        return (
          <TouchableOpacity
            key={tab}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={LABELS[tab]}
            accessibilityState={{ selected: isActive }}
            onPress={() => onChange(tab)}
            style={[styles.item, { minHeight: 56 }]}
          >
            <View style={{ height: s(29), justifyContent: "center", marginTop: s(5) }}>
              {tab === "Create" ? (
                <CreateIcon width={s(size.w)} height={s(size.h)} />
              ) : tab === "Home" ? (
                <HomeIcon width={s(size.w)} height={s(size.h)} color={iconColor} />
              ) : tab === "Notifications" ? (
                <BellIcon width={s(size.w)} height={s(size.h)} color={iconColor} />
              ) : tab === "Messages" ? (
                <MessagesIcon width={s(size.w)} height={s(size.h)} color={iconColor} />
              ) : (
                <ProfileIcon width={s(size.w)} height={s(size.h)} color={iconColor} />
              )}
            </View>
            <Text
              style={{
                fontFamily: fonts.regular,
                fontSize: Math.max(9, s(9)),
                color: isActive ? colors.navActive : colors.black,
                marginTop: s(1),
              }}
            >
              {LABELS[tab]}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    backgroundColor: colors.white,
    borderColor: "rgba(0,0,0,0.15)",
  },
  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: 2,
  },
});
