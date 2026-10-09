import { useCallback, useState } from "react";
import { AppState } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { profileService } from "../services/carkila";

const REFRESH_INTERVAL_MS = 5_000;

export function useLiveCredits() {
  const [credits, setCredits] = useState<number | null>(null);
  const [creditsError, setCreditsError] = useState("");

  const refreshCredits = useCallback(async () => {
    try {
      const profile: any = await profileService.mine();
      setCredits(Number(profile?.credits_balance ?? 0));
      setCreditsError("");
    } catch (caught) {
      setCreditsError(caught instanceof Error ? caught.message : "Unable to refresh credits.");
    }
  }, []);

  useFocusEffect(useCallback(() => {
    let active = true;
    const refresh = () => { if (active) void refreshCredits(); };

    refresh();
    const interval = setInterval(refresh, REFRESH_INTERVAL_MS);
    const appState = AppState.addEventListener("change", (state) => {
      if (state === "active") refresh();
    });

    return () => {
      active = false;
      clearInterval(interval);
      appState.remove();
    };
  }, [refreshCredits]));

  return { credits, creditsError, refreshCredits };
}
