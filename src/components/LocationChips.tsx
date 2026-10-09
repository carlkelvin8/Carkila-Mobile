import React from "react";
import { ScrollView, Text, TouchableOpacity, StyleSheet } from "react-native";
import { colors, fonts } from "../theme/colors";
import { useScale } from "../theme/scale";

export const LOCATIONS = [
  { label: "All", width: 48 },
  { label: "Metro Manila", width: 95 },
  { label: "Cavite", width: 60 },
  { label: "Batangas", width: 76 },
  { label: "Bulacan", width: 66 },
  { label: "Pampanga", width: 79 },
  { label: "Cebu", width: 54 },
  { label: "Davao", width: 57 },
];

interface Props {
  active: string;
  onChange: (l: string) => void;
}

export default function LocationChips({ active, onChange }: Props) {
  const s = useScale();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ flexGrow: 0 }}
      contentContainerStyle={{
        paddingHorizontal: s(15),
        gap: s(6),
      }}
    >
      {LOCATIONS.map(({ label, width }) => {
        const isActive = label === active;
        return (
          <TouchableOpacity
            key={label}
            activeOpacity={0.8}
            onPress={() => onChange(label)}
            style={[
              styles.chip,
              {
                height: s(30),
                borderRadius: s(15),
                minWidth: s(width),
                borderColor: isActive ? colors.primary : "#CECECE",
              },
            ]}
          >
            <Text
              style={{
                fontFamily: fonts.regular,
                fontSize: s(12),
                color: isActive ? colors.primary : colors.textDark,
              }}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    backgroundColor: colors.white,
    paddingHorizontal: 12,
  },
});
