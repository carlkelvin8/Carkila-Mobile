import { useWindowDimensions } from "react-native";
import { DESIGN_WIDTH } from "./colors";

export function useScale() {
  const { width } = useWindowDimensions();
  // The Figma source uses a 412px canvas. Never enlarge the UI on tablet/web;
  // only scale it down for narrower phones.
  const canvasWidth = Math.min(width, DESIGN_WIDTH);
  return (v: number) => Math.round((v * canvasWidth) / DESIGN_WIDTH * 100) / 100;
}
