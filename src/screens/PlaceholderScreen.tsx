import React from "react";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AppHeader from "../components/AppHeader";
import { colors } from "../theme/colors";
import { fonts } from "../theme/colors";

export default function PlaceholderScreen({
  title,
  navigation,
}: {
  title: string;
  navigation?: any;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: colors.white, paddingTop: insets.top }}>
      <AppHeader />
      <View style={{ flex: 1, alignItems: "center", paddingTop: 40 }}>
        <Text style={{ fontFamily: fonts.semiBold, fontSize: 16, color: colors.black }}>
          {title}
        </Text>
      </View>
    </View>
  );
}
