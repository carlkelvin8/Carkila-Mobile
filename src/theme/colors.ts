import { ImageSourcePropType } from "react-native";

export const colors = {
  primary: "#E60023",
  navActive: "#F21341",
  black: "#000000",
  white: "#FFFFFF",
  grayBg: "#EEEEEE",
  textDark: "#292929",
  grayText: "#8A8A8A",
  border: "#E5E5E5",
};

// Design canvas width from Figma (px)
export const DESIGN_WIDTH = 412;

export const fonts = {
  regular: "Inter_400Regular",
  medium: "Inter_500Medium",
  semiBold: "Inter_600SemiBold",
  bold: "Inter_700Bold",
};

export const images = {
  bus1: require("../assets/imgs/IMG_20220610_052502.png"),
  van: require("../assets/imgs/photo_2024-08-14_14-25-28.png"),
  coaster: require("../assets/imgs/photo_2023-10-16_22-48-58_3.png"),
  almera: require("../assets/imgs/1A.png"),
  universe: require("../assets/imgs/photo_2024-05-16_14-05-53.png"),
  sunlong: require("../assets/imgs/photo_2023-10-22_12-11-30_2.png"),
  montero: require("../assets/imgs/2ba717ac010d3b9f8d26e9db4da291b8.png"),
  logoDgb: require("../assets/imgs/digibyte-dgb-logo_1.png"),
  avatarCircle: require("../assets/imgs/392781251_10223061110451496_8705330123165537788_n_1.png"),
  idPic: require("../assets/imgs/ID_Pic_2_3.png"),
  truckLogo: require("../assets/imgs/delivery-truck-icon-isolated-on-round-background-vector-3815.png"),
  taxiLogo: require("../assets/imgs/png-clipart-taxi-uber-graphics-transport-taxi-text-logo_1.png"),
  grandia: require("../assets/imgs/toyota_hiace_gl_grandia_28_aut_1684236081_ec96a30d_progressi.png"),
} as Record<string, ImageSourcePropType>;
