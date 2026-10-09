import React from "react";
import { ScrollView, Text, TouchableOpacity, StyleSheet } from "react-native";
import { colors, fonts } from "../theme/colors";
import { useScale } from "../theme/scale";

export const FEED_TABS = ["Most Recent", "Recent Views", "Following", "Trending"];

interface Props {
  active: string;
  onChange: (t: string) => void;
}

const TAB_WIDTHS: Record<string, number> = {
  "Most Recent": 109,
  "Recent Views": 109,
  Following: 90,
  Trending: 90,
};

export default function FeedTabs({ active, onChange }: Props) {
  const s = useScale();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ flexGrow: 0 }}
      contentContainerStyle={{
        paddingHorizontal: s(15),
        gap: s(8),
      }}
    >
      {FEED_TABS.map((tab) => {
        const isActive = tab === active;
        return (
          <TouchableOpacity
            key={tab}
            activeOpacity={0.8}
            onPress={() => onChange(tab)}
            style={[
              styles.pill,
              {
                height: s(36),
                borderRadius: s(18),
                width: s(TAB_WIDTHS[tab] ?? 100),
                backgroundColor: isActive ? colors.primary : colors.grayBg,
              },
            ]}
          >
            <Text
              style={{
                fontFamily: fonts.regular,
                fontSize: s(13),
                color: isActive ? colors.white : colors.black,
              }}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignItems: "center",
    justifyContent: "center",
  },
});
