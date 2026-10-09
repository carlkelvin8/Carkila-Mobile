import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { colors, fonts, images } from "../theme/colors";
import { useScale } from "../theme/scale";

import MenuIcon from "../assets/icons/ooui_menu.svg";
import SearchIcon from "../assets/icons/iconoir_search.svg";

interface Props {
  onMenu?: () => void;
  onSearchPress?: () => void;
  searchPlaceholder?: string;
}

export default function AppHeader({
  onMenu,
  onSearchPress,
  searchPlaceholder = "Search Rental Vehicles",
}: Props) {
  const s = useScale();
  return (
    <View style={[styles.header, { minHeight: Math.max(56, s(64)), paddingHorizontal: s(14) }]}> 
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onMenu}
        accessibilityLabel="Open menu"
        style={[styles.iconButton, { width: Math.max(44, s(44)), height: Math.max(44, s(44)) }]}
      >
        <MenuIcon width={s(23)} height={s(23)} />
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={1}
        onPress={onSearchPress}
        style={[
          styles.searchBar,
          {
            height: s(40),
            borderRadius: s(6),
            marginLeft: s(4),
            marginRight: s(6),
          },
        ]}
      >
        <SearchIcon width={s(24)} height={s(24)} style={{ marginLeft: s(10) }} />
        <Text
          style={{
            fontFamily: fonts.regular,
            fontSize: s(15),
            color: colors.black,
            marginLeft: s(7),
          }}
          numberOfLines={1}
        >
          {searchPlaceholder}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity accessibilityLabel="Open account menu" activeOpacity={0.8} onPress={onMenu} style={[styles.avatarButton, { width: Math.max(44, s(44)), height: Math.max(44, s(44)) }]}>
        <Image
          source={images.logoDgb}
          style={{ width: s(41), height: s(41), borderRadius: s(22) }}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.white,
    flexDirection: "row",
    alignItems: "center",
  },
  searchBar: {
    flex: 1,
    backgroundColor: colors.grayBg,
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: { alignItems: "flex-start", justifyContent: "center" },
  avatarButton: { alignItems: "center", justifyContent: "center" },
});
