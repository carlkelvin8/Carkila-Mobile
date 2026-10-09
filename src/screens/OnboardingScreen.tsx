import React, { useRef, useState } from "react";
import {
  FlatList,
  Image,
  ImageSourcePropType,
  ListRenderItemInfo,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { colors, fonts, images } from "../theme/colors";

type OnboardingItem = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  image: ImageSourcePropType;
};

const SLIDES: OnboardingItem[] = [
  {
    id: "discover",
    eyebrow: "DISCOVER",
    title: "Find the right vehicle for every trip",
    description:
      "Browse buses, vans, cars, and transport services from trusted operators across the Philippines.",
    image: images.bus1,
  },
  {
    id: "manage",
    eyebrow: "MANAGE",
    title: "Keep your listings moving",
    description:
      "Publish vehicles, update availability, manage listing credits, and connect with customers in one place.",
    image: images.van,
  },
  {
    id: "connect",
    eyebrow: "CONNECT",
    title: "Grow your transport business",
    description:
      "Receive inquiries, reply to renters, and build lasting customer relationships with Carkila Operators.",
    image: images.universe,
  },
];

export default function OnboardingScreen({ navigation }: any) {
  const { width, height } = useWindowDimensions();
  const pageWidth = Math.min(width, 412);
  const compact = height < 700;
  const listRef = useRef<FlatList<OnboardingItem>>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const finish = () => {
    navigation.reset({ index: 0, routes: [{ name: "Login" }] });
  };

  const next = () => {
    if (activeIndex === SLIDES.length - 1) {
      finish();
      return;
    }

    const nextIndex = activeIndex + 1;
    listRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    setActiveIndex(nextIndex);
  };

  const renderSlide = ({ item }: ListRenderItemInfo<OnboardingItem>) => (
    <View style={[styles.slide, { width: pageWidth }]}> 
      <View style={[styles.imageCard, compact && styles.imageCardCompact]}>
        <Image source={item.image} style={styles.image} resizeMode="cover" />
        <View style={styles.imageShade} />
        <View style={styles.logoBadge}>
          <Image source={images.logoDgb} style={styles.logo} />
        </View>
      </View>

      <View style={[styles.copy, compact && styles.copyCompact]}>
        <Text style={styles.eyebrow}>{item.eyebrow}</Text>
        <Text style={[styles.title, compact && styles.titleCompact]}>{item.title}</Text>
        <Text style={[styles.description, compact && styles.descriptionCompact]}>{item.description}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.shell, { width: pageWidth }]}>
        <View style={styles.topBar}>
          <Text style={styles.brand}>Carkila</Text>
          <TouchableOpacity accessibilityRole="button" onPress={finish} hitSlop={12}>
            <Text style={styles.skip}>Skip</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          ref={listRef}
          data={SLIDES}
          horizontal
          pagingEnabled
          bounces={false}
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={renderSlide}
          getItemLayout={(_, index) => ({ length: pageWidth, offset: pageWidth * index, index })}
          onMomentumScrollEnd={(event) => {
            setActiveIndex(Math.round(event.nativeEvent.contentOffset.x / pageWidth));
          }}
        />

        <View style={[styles.footer, compact && styles.footerCompact]}>
          <View style={styles.dots}>
            {SLIDES.map((slide, index) => (
              <View
                key={slide.id}
                style={[styles.dot, index === activeIndex && styles.dotActive]}
              />
            ))}
          </View>

          <TouchableOpacity
            accessibilityRole="button"
            activeOpacity={0.86}
            onPress={next}
            style={styles.nextButton}
          >
            <Text style={styles.nextText}>
              {activeIndex === SLIDES.length - 1 ? "Get started" : "Next"}
            </Text>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.white, alignItems: "center" },
  shell: { flex: 1, maxWidth: 412, backgroundColor: colors.white, overflow: "hidden" },
  topBar: { height: 68, paddingHorizontal: 22, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  brand: { fontFamily: fonts.bold, fontSize: 21, color: colors.textDark, letterSpacing: -0.4 },
  skip: { fontFamily: fonts.medium, fontSize: 13, color: colors.grayText },
  slide: { flex: 1, paddingHorizontal: 22 },
  imageCard: { flex: 1, maxHeight: 410, minHeight: 280, borderRadius: 28, overflow: "hidden", backgroundColor: colors.grayBg },
  imageCardCompact: { minHeight: 190, borderRadius: 22 },
  image: { width: "100%", height: "100%" },
  imageShade: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, backgroundColor: "rgba(0,0,0,0.08)" },
  logoBadge: { position: "absolute", top: 17, right: 17, width: 53, height: 53, borderRadius: 27, padding: 3, backgroundColor: colors.white, ...Platform.select({ web: { boxShadow: "0 3px 8px rgba(0,0,0,0.14)" } as any, default: { shadowColor: colors.black, shadowOpacity: 0.14, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 4 } }) },
  logo: { width: "100%", height: "100%", borderRadius: 24 },
  copy: { paddingTop: 31, paddingHorizontal: 2 },
  copyCompact: { paddingTop: 18 },
  eyebrow: { fontFamily: fonts.bold, fontSize: 12, letterSpacing: 2.2, color: colors.primary },
  title: { marginTop: 10, fontFamily: fonts.bold, fontSize: 29, lineHeight: 35, letterSpacing: -0.7, color: colors.textDark },
  titleCompact: { marginTop: 6, fontSize: 24, lineHeight: 29 },
  description: { marginTop: 13, fontFamily: fonts.regular, fontSize: 14, lineHeight: 21, color: colors.grayText },
  descriptionCompact: { marginTop: 8, fontSize: 13, lineHeight: 18 },
  footer: { paddingHorizontal: 24, paddingTop: 18, paddingBottom: 22, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  footerCompact: { paddingTop: 10, paddingBottom: 10 },
  dots: { flexDirection: "row", alignItems: "center", gap: 7 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#D9D9D9" },
  dotActive: { width: 24, backgroundColor: colors.primary },
  nextButton: { minWidth: 126, height: 50, borderRadius: 25, paddingHorizontal: 21, backgroundColor: colors.primary, flexDirection: "row", alignItems: "center", justifyContent: "center", ...Platform.select({ web: { boxShadow: "0 4px 9px rgba(222,45,54,0.20)" } as any, default: { shadowColor: colors.primary, shadowOpacity: 0.2, shadowRadius: 9, shadowOffset: { width: 0, height: 4 }, elevation: 3 } }) },
  nextText: { color: colors.white, fontFamily: fonts.semiBold, fontSize: 14 },
  arrow: { marginLeft: 9, color: colors.white, fontFamily: fonts.regular, fontSize: 20, lineHeight: 22 },
});
