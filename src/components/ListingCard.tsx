import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ImageSourcePropType,
} from "react-native";
import { colors, fonts } from "../theme/colors";
import { useScale } from "../theme/scale";

export interface Listing {
  id: string;
  operatorName: string;
  operatorAvatar: ImageSourcePropType;
  avatarRound?: boolean;
  timeAgo: string;
  photo: ImageSourcePropType;
  tags: string[];
  location: string;
  title: string;
  price: string;
}

interface Props {
  item: Listing;
  onPress?: () => void;
}

export default function ListingCard({ item, onPress }: Props) {
  const s = useScale();
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={{ width: "100%", marginBottom: s(36) }}
    >
      {/* Operator row */}
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Image
          source={item.operatorAvatar}
          style={{
            width: s(32),
            height: s(32),
            borderRadius: item.avatarRound ? s(16) : 0,
          }}
        />
        <View style={{ marginLeft: s(4), flexShrink: 1 }}>
          <Text
            numberOfLines={1}
            style={{
              fontFamily: fonts.regular,
              fontSize: s(11),
              color: colors.black,
            }}
          >
            {item.operatorName}
          </Text>
          <Text
            style={{
              fontFamily: fonts.regular,
              fontSize: s(11),
              color: colors.black,
              marginTop: s(2),
            }}
          >
            {item.timeAgo}
          </Text>
        </View>
      </View>

      {/* Photo + tags */}
      <View style={{ marginTop: s(5) }}>
        <Image
          source={item.photo}
          style={{
            width: "100%",
            aspectRatio: 1,
            borderRadius: s(10),
          }}
        />
        <View
          style={{
            position: "absolute",
            top: s(7),
            right: s(8),
            flexDirection: "row",
            gap: s(4),
          }}
        >
          {item.tags.map((t) => (
            <View
              key={t}
              style={[
                styles.tag,
                { height: s(14), borderRadius: s(7), paddingHorizontal: s(10) },
              ]}
            >
              <Text
                style={{
                  fontFamily: fonts.regular,
                  fontSize: s(11),
                  lineHeight: s(13),
                  color: colors.white,
                }}
              >
                {t}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Info */}
      <Text
        numberOfLines={2}
        style={{
          fontFamily: fonts.semiBold,
          fontSize: s(14),
          lineHeight: s(17),
          color: colors.black,
          marginTop: s(5),
        }}
      >
        {item.location}
      </Text>
      <Text
        numberOfLines={1}
        style={{
          fontFamily: fonts.regular,
          fontSize: s(11),
          color: colors.black,
          marginTop: s(3),
        }}
      >
        {item.title}
      </Text>
      <Text
        style={{
          fontFamily: fonts.bold,
          fontSize: s(15),
          lineHeight: s(18),
          color: colors.black,
          marginTop: s(3),
        }}
      >
        {item.price}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tag: {
    backgroundColor: colors.black,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
});
