import React from "react";
import { View, Image, TouchableOpacity, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useScale } from "../theme/scale";

import BackIcon from "../assets/icons/material-symbols_arrow-back.svg";

const PHOTO = require("../assets/imgs/photo_2025-05-09_11-24-09_1.png");

export default function ContactSampleScreen({ navigation }: any) {
  const s = useScale();
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.root}>
      <Image source={PHOTO} style={StyleSheet.absoluteFill} resizeMode="cover" />
      <TouchableOpacity
        onPress={() => navigation?.goBack()}
        style={{ position: "absolute", top: insets.top + s(60 - 20), left: s(20) }}
      >
        <BackIcon width={s(28)} height={s(28)} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#000" },
});
